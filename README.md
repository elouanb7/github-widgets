# GitHub Widgets

Self-hosted GitHub stats widgets for your README. Generate beautiful SVG cards showing your GitHub statistics and top programming languages.

## Preview

<p align="center">
  <img align="top" width="390px" src="https://github-widgets.elouanb7.com/api/stats?username=elouanb7&theme=dark" alt="elouanb7's GitHub Stats"/>
  <img align="top" width="400px" src="https://github-widgets.elouanb7.com/api/languages?username=elouanb7&theme=dark&layout=compact" alt="elouanb7's Top Languages"/>
</p>

## Features

- **Stats Card** — Total stars, commits, PRs, issues, and repos
- **Top Languages Card** — Most used languages with compact or normal layout
- **20 Themes** — light, dark, github-dark, radical, tokyonight, dracula, nord, gruvbox, onedark, cobalt, synthwave, highcontrast, catppuccin-mocha, catppuccin-latte, monokai, rose-pine, aura, sunset, ocean, contributions
- **Color overrides** — Customize any color via URL parameters
- **Private repo support** — Include private repos for a configured username
- **Built-in caching** — In-memory LRU + CDN caching to stay within GitHub rate limits
- **Self-hosted** — Deploy on your own Vercel account, no third-party dependency

## Usage

Replace `YOUR_DOMAIN` with your deployed URL and `YOUR_USERNAME` with your GitHub username:

```html
<img align="top" width="390px" src="https://YOUR_DOMAIN/api/stats?username=YOUR_USERNAME&theme=dark" alt="GitHub Stats"/>
<img align="top" width="400px" src="https://YOUR_DOMAIN/api/languages?username=YOUR_USERNAME&theme=dark&layout=compact" alt="Top Languages"/>
```

## Deploy Your Own

### 1. Prerequisites

- A [GitHub Personal Access Token](https://github.com/settings/tokens) (classic, no scopes needed for public data)
- A [Vercel](https://vercel.com) account (free tier works)

### 2. One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/elouanb7/github-widgets&env=GITHUB_TOKEN&envDescription=GitHub%20Personal%20Access%20Token%20(classic%2C%20no%20scopes%20needed))

### 3. Manual Deploy

```bash
# Clone the repo
git clone https://github.com/elouanb7/github-widgets.git
cd github-widgets

# Install dependencies
npm install

# Create .env.local with your GitHub token
echo "GITHUB_TOKEN=ghp_your_token_here" > .env.local

# Run locally
npm run dev
```

Then deploy to Vercel:

```bash
npx vercel
```

### 4. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token (classic, no scopes needed for public repos) |
| `GITHUB_TOKEN_PRIVATE` | No | Token with `repo` scope to include private repos |
| `PRIVATE_USERNAME` | No | GitHub username that should use the private token |

> **Note:** If you set `PRIVATE_USERNAME=your_username` and `GITHUB_TOKEN_PRIVATE`, your private repos will be included in your stats automatically. Other users querying your instance will only see their public data.

## API Reference

### Stats Card

```
GET /api/stats?username=octocat
```

### Languages Card

```
GET /api/languages?username=octocat
```

### Common Parameters

| Parameter | Default | Description |
|---|---|---|
| `username` | *(required)* | GitHub username |
| `theme` | `light` | Color theme (see list above) |
| `hide_border` | `false` | Hide the card border |
| `hide_title` | `false` | Hide the card title |
| `border_radius` | `4.5` | Corner radius in pixels (0-50) |
| `title_color` | — | Override title color (hex without #) |
| `text_color` | — | Override text color (hex without #) |
| `bg_color` | — | Override background color (hex without #) |
| `icon_color` | — | Override icon color (hex without #) |
| `border_color` | — | Override border color (hex without #) |
| `width` | `390`/`495` | Custom card width in pixels (100-1000) |
| `height` | *auto* | Custom card height in pixels (50-1000) |

### Languages-Specific Parameters

| Parameter | Default | Description |
|---|---|---|
| `langs_count` | `5` | Number of languages to show (1-10) |
| `layout` | `compact` | Layout: `compact` or `normal` |
| `hide` | — | Comma-separated languages to hide |

### Stats-Specific Parameters

| Parameter | Default | Description |
|---|---|---|
| `hide` | — | Comma-separated stats to hide (`stars`, `commits`, `prs`, `issues`, `repos`) |

## Themes

| | | | | |
|:---:|:---:|:---:|:---:|:---:|
| `light` | `dark` | `github-dark` | `radical` | `tokyonight` |
| `dracula` | `nord` | `gruvbox` | `onedark` | `cobalt` |
| `synthwave` | `highcontrast` | `catppuccin-mocha` | `catppuccin-latte` | `monokai` |
| `rose-pine` | `aura` | `sunset` | `ocean` | `contributions` |

## Tech Stack

- **Next.js** (App Router) + TypeScript
- **SVG** server-side rendering
- **GitHub GraphQL API**
- **Vercel** for deployment

## License

MIT
