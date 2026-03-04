export interface UserStats {
  name: string;
  username: string;
  totalRepos: number;
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
}

export interface LanguageStat {
  name: string;
  color: string;
  size: number;
  percentage: number;
}

export interface GitHubStatsResponse {
  user: {
    name: string | null;
    repositories: {
      totalCount: number;
      nodes: { stargazerCount: number }[];
    };
    contributionsCollection: {
      totalCommitContributions: number;
      restrictedContributionsCount: number;
    };
    pullRequests: { totalCount: number };
    issues: { totalCount: number };
  };
}

export interface GitHubLanguagesResponse {
  user: {
    repositories: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: {
        languages: {
          edges: {
            size: number;
            node: { name: string; color: string | null };
          }[];
        };
      }[];
    };
  };
}
