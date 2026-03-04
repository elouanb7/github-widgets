import {
  UserStats,
  LanguageStat,
  GitHubStatsResponse,
  GitHubLanguagesResponse,
} from "./types";
import { USER_STATS_QUERY, USER_LANGUAGES_QUERY } from "./queries";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export function isPrivateUser(username: string): boolean {
  const privateUsername = process.env.PRIVATE_USERNAME;
  return !!privateUsername && username.toLowerCase() === privateUsername.toLowerCase();
}

async function graphql<T>(
  query: string,
  variables: Record<string, unknown>,
  usePrivateToken = false
): Promise<T> {
  const token = usePrivateToken && process.env.GITHUB_TOKEN_PRIVATE
    ? process.env.GITHUB_TOKEN_PRIVATE
    : process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "github-widgets",
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (json.errors) {
    throw new Error(
      json.errors.map((e: { message: string }) => e.message).join(", ")
    );
  }
  return json.data as T;
}

export async function fetchUserStats(username: string, usePrivateToken = false): Promise<UserStats> {
  const data = await graphql<GitHubStatsResponse>(USER_STATS_QUERY, {
    login: username,
  }, usePrivateToken);

  const { user } = data;
  const totalStars = user.repositories.nodes.reduce(
    (sum, repo) => sum + repo.stargazerCount,
    0
  );

  return {
    name: user.name || username,
    username,
    totalRepos: user.repositories.totalCount,
    totalStars,
    totalCommits:
      user.contributionsCollection.totalCommitContributions +
      user.contributionsCollection.restrictedContributionsCount,
    totalPRs: user.pullRequests.totalCount,
    totalIssues: user.issues.totalCount,
  };
}

export async function fetchTopLanguages(
  username: string,
  count: number = 5,
  exclude: string[] = [],
  usePrivateToken = false
): Promise<LanguageStat[]> {
  const langMap = new Map<string, { color: string; size: number }>();
  let cursor: string | null = null;
  let pages = 0;

  while (pages < 3) {
    const data: GitHubLanguagesResponse = await graphql<GitHubLanguagesResponse>(USER_LANGUAGES_QUERY, {
      login: username,
      after: cursor,
    }, usePrivateToken);

    const { repositories } = data.user;

    for (const repo of repositories.nodes) {
      for (const edge of repo.languages.edges) {
        const name = edge.node.name;
        if (exclude.includes(name.toLowerCase())) continue;

        const existing = langMap.get(name);
        if (existing) {
          existing.size += edge.size;
        } else {
          langMap.set(name, {
            color: edge.node.color || "#858585",
            size: edge.size,
          });
        }
      }
    }

    if (!repositories.pageInfo.hasNextPage) break;
    cursor = repositories.pageInfo.endCursor;
    pages++;
  }

  const sorted = [...langMap.entries()]
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, count);

  const totalSize = sorted.reduce((sum, [, lang]) => sum + lang.size, 0);

  return sorted.map(([name, lang]) => ({
    name,
    color: lang.color,
    size: lang.size,
    percentage: totalSize > 0 ? (lang.size / totalSize) * 100 : 0,
  }));
}
