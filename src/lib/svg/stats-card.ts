import { UserStats } from "@/lib/github/types";
import { Theme } from "@/lib/themes";
import { renderCard } from "./card";
import { formatNumber, icons } from "./utils";

interface StatsCardOptions {
  theme: Theme;
  hideBorder?: boolean;
  hideTitle?: boolean;
  hide?: string[];
  borderRadius?: number;
  customWidth?: number;
  customHeight?: number;
}

interface StatItem {
  icon: string;
  label: string;
  value: number;
  key: string;
}

export function renderStatsCard(
  stats: UserStats,
  options: StatsCardOptions
): string {
  const { theme, hideBorder, hideTitle, hide = [], borderRadius, customWidth, customHeight } = options;

  const allStats: StatItem[] = [
    { icon: icons.star, label: "Total Stars", value: stats.totalStars, key: "stars" },
    { icon: icons.commit, label: "Total Commits", value: stats.totalCommits, key: "commits" },
    { icon: icons.pr, label: "Total PRs", value: stats.totalPRs, key: "prs" },
    { icon: icons.issue, label: "Total Issues", value: stats.totalIssues, key: "issues" },
    { icon: icons.repo, label: "Total Repos", value: stats.totalRepos, key: "repos" },
  ];

  const visibleStats = allStats.filter(
    (s) => !hide.includes(s.key)
  );

  const rowHeight = 30;
  const startY = 15;
  const titleSpace = hideTitle ? 10 : 45;
  const cardHeight = titleSpace + startY + visibleStats.length * rowHeight + 20;

  const rows = visibleStats
    .map((stat, i) => {
      const y = startY + i * rowHeight;
      return `
    <g transform="translate(25, ${y})" class="fade-in" style="animation-delay: ${i * 150}ms">
      <svg class="icon" viewBox="0 0 16 16" width="16" height="16">
        ${stat.icon}
      </svg>
      <text x="25" y="12.5" class="stat-label">${stat.label}:</text>
      <text x="190" y="12.5" class="stat-value">${formatNumber(stat.value)}</text>
    </g>`;
    })
    .join("");

  return renderCard(
    {
      width: customWidth ?? 390,
      height: customHeight ?? cardHeight,
      title: `${stats.username}'s GitHub Stats`,
      theme,
      hideBorder,
      hideTitle,
      borderRadius,
    },
    rows
  );
}
