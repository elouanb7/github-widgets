# GitHub Widgets

Open-source GitHub stats widgets for your README. Generate beautiful SVG cards showing your GitHub statistics, top programming languages and profile views.

## Preview

<p align="center">
  <img align="top" width="353" src="https://github-widgets.elouanb7.com/api/stats?username=elouanb7&theme=dark" alt="elouanb7's GitHub Stats"/>
  <img align="top" width="466" src="https://github-widgets.elouanb7.com/api/languages?username=elouanb7&theme=dark&layout=compact" alt="elouanb7's Top Languages"/>
</p>

<p align="center">
  <img src="https://github-widgets.elouanb7.com/api/views?username=elouanb7&theme=dark" alt="elouanb7's profile views"/>
</p>

## Features

- **Stats Card** — Total stars, commits, PRs, issues, and repos
- **Top Languages Card** — Most used languages with compact or normal layout
- **Profile Views Counter** — Themed hit counter in 8 styles, from a discreet badge to a LED board, at any size
- **20 Themes** — light, dark, github-dark, radical, tokyonight, dracula, nord, gruvbox, onedark, cobalt, synthwave, highcontrast, catppuccin-mocha, catppuccin-latte, monokai, rose-pine, aura, sunset, ocean, contributions
- **Color overrides** — Customize any color via URL parameters
- **Private repo support** — Include private repos for a configured username
- **Built-in caching** — In-memory LRU + CDN caching to stay within GitHub rate limits (the counter is never cached, by design)
- **Deploy your own** — Run your own instance on Vercel, no third-party dependency

## Usage

Replace `YOUR_DOMAIN` with your deployed URL and `YOUR_USERNAME` with your GitHub username:

```html
<img align="top" width="363" src="https://YOUR_DOMAIN/api/stats?username=YOUR_USERNAME&theme=dark" alt="GitHub Stats"/>
<img align="top" width="477" src="https://YOUR_DOMAIN/api/languages?username=YOUR_USERNAME&theme=dark&layout=compact" alt="Top Languages"/>
<img src="https://YOUR_DOMAIN/api/views?username=YOUR_USERNAME&theme=dark" alt="Profile views"/>
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
| `KV_REST_API_URL` | No | Upstash Redis REST URL — required for the views counter |
| `KV_REST_API_TOKEN` | No | Upstash Redis REST token — required for the views counter |

> **Note:** If you set `PRIVATE_USERNAME=your_username` and `GITHUB_TOKEN_PRIVATE`, your private repos will be included in your stats automatically. Other users querying your instance will only see their public data.

### 5. Views Counter Storage (optional)

The stats and languages cards are stateless — the views counter is not, it needs somewhere to keep the number.

On Vercel: **Storage → Create Database → Upstash Redis**. The integration injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` into the project, and nothing else is needed. `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` work too if you create the database directly on [upstash.com](https://upstash.com).

Without those variables the counter still renders, but counts live in memory and reset on every deploy or cold start — fine for `npm run dev`, useless in production.

One view costs one Redis command (two when it is deduplicated), so Upstash's free tier covers a few hundred thousand views a month.

## API Reference

### Stats Card

```
GET /api/stats?username=octocat
```

### Languages Card

```
GET /api/languages?username=octocat
```

### Views Counter

```
GET /api/views?username=octocat&style=flap&theme=dark
```

Every request to this endpoint is a view: the response is sent with `no-store` so
GitHub's camo proxy, the CDN and the browser all have to come back to the function,
which is the only way the number can move.

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
| `theme_colors` | `false` | Use theme-derived colors instead of GitHub's language colors |

### Stats-Specific Parameters

| Parameter | Default | Description |
|---|---|---|
| `hide` | — | Comma-separated stats to hide (`stars`, `commits`, `prs`, `issues`, `repos`) |

### Views-Specific Parameters

| Parameter | Default | Description |
|---|---|---|
| `style` | `badge` | See the table below |
| `size` | `md` | `sm`, `md`, `lg` or `xl` |
| `scale` | `1` | Exact size multiplier (0.4-4) — overridden by `size` |
| `icon` | `eye` on `badge`, else `none` | `none`, `eye`, `user`, `pulse`, `bolt` or `dot` (`badge`, `card`, `minimal`) |
| `label` | `Profile views` | Text next to the number (empty string to drop it) |
| `pad` | `6` on digit displays, else `0` | Zero-pad the number to N digits (0-12) |
| `abbreviate` | `false` | Show `1.2k` instead of `1234` |
| `offset` | `0` | Added to the stored count — handy to carry over a previous counter |
| `dedupe` | `5` | Seconds before the same fetcher is counted again (`0` counts every request) |
| `increment` | `true` | `false` reads the counter without counting a view |

`width` and `height` also work here, but they change the layout rather than resizing
it — use `size` or `scale` to make a counter bigger.

### Views Styles

| Style | Looks like |
|---|---|
| `badge` | The classic README pill, with an icon |
| `flap` | One flat tile per digit, with a hinge line |
| `segment` | Seven-segment LCD, unlit segments left visible |
| `matrix` | LED dot-matrix board, 5x7 dots per digit |
| `cyber` | Terminal readout: monospace, glow, scanlines, blinking cursor |
| `neon` | Glowing pill with an oversized number |
| `minimal` | No frame, no background — just the number |
| `card` | Full-size card matching the stats and languages widgets |

### How Views Are Counted

README images are served through GitHub's camo proxy, which strips every trace of
the actual visitor — all requests arrive with camo's own IP and user agent. Real
"unique visitors" are therefore impossible to compute, so this counts **hits**, like
every other README counter:

- one view per image load — a refresh counts again;
- requests from the same fetcher within `dedupe` seconds count once, which absorbs
  double fetches from a single page load;
- obvious crawlers and link-preview bots are served the number without counting it.

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
- **Upstash Redis** for the views counter
- **Vercel** for deployment

## License

MIT
