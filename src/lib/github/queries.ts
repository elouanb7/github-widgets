export const USER_STATS_QUERY = `
  query UserStats($login: String!) {
    user(login: $login) {
      name
      repositories(
        first: 100
        ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        totalCount
        nodes {
          stargazerCount
        }
      }
      contributionsCollection {
        totalCommitContributions
        restrictedContributionsCount
      }
      pullRequests(first: 1) {
        totalCount
      }
      issues(first: 1) {
        totalCount
      }
    }
  }
`;

export const USER_LANGUAGES_QUERY = `
  query UserLanguages($login: String!, $after: String) {
    user(login: $login) {
      repositories(
        first: 100
        ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
        isFork: false
        after: $after
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;
