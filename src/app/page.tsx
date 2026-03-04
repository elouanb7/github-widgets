"use client";

import { useEffect, useState } from "react";

const THEMES = [
  "light", "dark", "github-dark", "radical", "tokyonight", "dracula",
  "nord", "gruvbox", "onedark", "cobalt", "synthwave", "highcontrast",
  "catppuccin-mocha", "catppuccin-latte", "monokai", "rose-pine",
  "aura", "sunset", "ocean", "contributions",
];

const THEME_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  light: { bg: "#ffffff", text: "#434d58", accent: "#2f80ed" },
  dark: { bg: "#0d1117", text: "#c9d1d9", accent: "#58a6ff" },
  "github-dark": { bg: "#161b22", text: "#8b949e", accent: "#58a6ff" },
  radical: { bg: "#141321", text: "#a9fef7", accent: "#fe428e" },
  tokyonight: { bg: "#1a1b27", text: "#38bdae", accent: "#70a5fd" },
  dracula: { bg: "#282a36", text: "#f8f8f2", accent: "#ff6e96" },
  nord: { bg: "#2e3440", text: "#d8dee9", accent: "#81a1c1" },
  gruvbox: { bg: "#282828", text: "#ebdbb2", accent: "#fabd2f" },
  onedark: { bg: "#282c34", text: "#abb2bf", accent: "#e4bf7a" },
  cobalt: { bg: "#193549", text: "#75eeb2", accent: "#e683d9" },
  synthwave: { bg: "#2b213a", text: "#e2e9ec", accent: "#ef8539" },
  highcontrast: { bg: "#000", text: "#fff", accent: "#e7f216" },
  "catppuccin-mocha": { bg: "#1e1e2e", text: "#cdd6f4", accent: "#cba6f7" },
  "catppuccin-latte": { bg: "#eff1f5", text: "#4c4f69", accent: "#8839ef" },
  monokai: { bg: "#272822", text: "#f8f8f2", accent: "#eb1f6a" },
  "rose-pine": { bg: "#191724", text: "#e0def4", accent: "#9ccfd8" },
  aura: { bg: "#15141b", text: "#edecee", accent: "#a277ff" },
  sunset: { bg: "#2d1b69", text: "#ffeaa7", accent: "#ff6b6b" },
  ocean: { bg: "#0c2461", text: "#dfe6e9", accent: "#00cec9" },
  contributions: { bg: "#0d1117", text: "#26a641", accent: "#da6dd8" },
};

export default function Home() {
  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState("dark");
  const [langsCount, setLangsCount] = useState("5");
  const [layout, setLayout] = useState<"compact" | "normal">("compact");
  const [borderRadius, setBorderRadius] = useState(4.5);
  const [baseUrl, setBaseUrl] = useState("https://github-widgets.elouanb7.com");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const validUsername = username.trim();
  const langsCountNum = Math.min(10, Math.max(1, parseInt(langsCount, 10) || 5));

  const statsPath = validUsername
    ? `/api/stats?username=${validUsername}&theme=${theme}&border_radius=${borderRadius}`
    : "";
  const langsPath = validUsername
    ? `/api/languages?username=${validUsername}&theme=${theme}&langs_count=${langsCountNum}&layout=${layout}&border_radius=${borderRadius}`
    : "";

  const statsMarkdown = `<img align="top" width="390px" src="${baseUrl}${statsPath}" alt="GitHub Stats"/>`;
  const langsMarkdown = `<img align="top" width="400px" src="${baseUrl}${langsPath}" alt="Top Languages"/>`;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#c9d1d9", fontFamily: "'Segoe UI', Ubuntu, sans-serif" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: "#f0f6fc", margin: 0, letterSpacing: -1 }}>
            GitHub Widgets
          </h1>
          <p style={{ color: "#8b949e", fontSize: 16, marginTop: 8 }}>
            Self-hosted GitHub stats for your README
          </p>
        </div>

        {/* Controls */}
        <div style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0 16px" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#8b949e", paddingBottom: 8 }}>GitHub Username</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#8b949e", paddingBottom: 8 }}>Languages Layout</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#8b949e", paddingBottom: 8 }}>{`Languages Count: ${langsCount}`}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#8b949e", paddingBottom: 8 }}>{`Border Radius: ${borderRadius}px`}</span>

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 8 }}>
              {(["compact", "normal"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  style={{
                    ...pillStyle,
                    background: layout === l ? "#58a6ff" : "#21262d",
                    color: layout === l ? "#fff" : "#8b949e",
                    border: layout === l ? "1px solid #58a6ff" : "1px solid #30363d",
                    height: 42,
                    boxSizing: "border-box",
                  }}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", height: 42 }}>
              <input
                type="range"
                min={1}
                max={10}
                value={langsCount}
                onChange={(e) => setLangsCount(e.target.value)}
                style={{ width: "100%", accentColor: "#58a6ff" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", height: 42 }}>
              <input
                type="range"
                min={0}
                max={50}
                step={0.5}
                value={borderRadius}
                onChange={(e) => setBorderRadius(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#58a6ff" }}
              />
            </div>
          </div>
        </div>

        {/* Themes */}
        <div style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f0f6fc", margin: "0 0 16px 0" }}>Theme</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
            {THEMES.map((t) => {
              const colors = THEME_COLORS[t] || { bg: "#161b22", text: "#c9d1d9", accent: "#58a6ff" };
              const isSelected = theme === t;
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: isSelected ? "#21262d" : "transparent",
                    border: isSelected ? "2px solid #58a6ff" : "1px solid #30363d",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", gap: 3 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: colors.bg, border: "1px solid #484f58" }} />
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: colors.accent }} />
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: colors.text }} />
                  </div>
                  <span style={{ fontSize: 13, color: isSelected ? "#f0f6fc" : "#8b949e", fontWeight: isSelected ? 600 : 400 }}>
                    {t}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f0f6fc", margin: "0 0 20px 0" }}>Preview</h2>
          {!validUsername ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#484f58" }}>
              Enter a GitHub username above to see the preview
            </div>
          ) : (
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{ flex: "0 0 390px", maxWidth: 390 }}>
                <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 8, fontWeight: 500 }}>Stats Card</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={statsPath} alt="GitHub Stats" style={{ width: 390, borderRadius: 4 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 8, fontWeight: 500 }}>Top Languages</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={langsPath} alt="Top Languages" style={{ maxWidth: "100%", borderRadius: 4 }} />
              </div>
            </div>
          )}
        </div>

        {/* Markdown */}
        {validUsername && (
          <div style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f0f6fc", margin: "0 0 16px 0" }}>Copy for your README</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <CodeBlock label="Stats Card" code={statsMarkdown} />
              <CodeBlock label="Languages Card" code={langsMarkdown} />
            </div>
          </div>
        )}

        {/* Parameters table */}
        <div style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: 12,
          padding: 24,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f0f6fc", margin: "0 0 16px 0" }}>API Parameters</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #30363d" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "#f0f6fc", fontWeight: 600 }}>Parameter</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "#f0f6fc", fontWeight: 600 }}>Default</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "#f0f6fc", fontWeight: 600 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["username", "(required)", "GitHub username"],
                  ["theme", "light", "Color theme"],
                  ["hide_border", "false", "Hide the card border"],
                  ["hide_title", "false", "Hide the card title"],
                  ["hide", "", "Comma-separated stats or languages to hide"],
                  ["langs_count", "5", "Number of languages (1-10)"],
                  ["layout", "compact", "Languages layout: compact or normal"],
                  ["border_radius", "4.5", "Corner radius in pixels (0-50)"],
                  ["title_color", "", "Override title color (hex)"],
                  ["text_color", "", "Override text color (hex)"],
                  ["bg_color", "", "Override background color (hex)"],
                  ["icon_color", "", "Override icon color (hex)"],
                  ["border_color", "", "Override border color (hex)"],
                  ["width", "", "Override card width in pixels (100-1000)"],
                  ["height", "", "Override card height in pixels (50-1000)"],
                ].map(([param, def, desc]) => (
                  <tr key={param} style={{ borderBottom: "1px solid #21262d" }}>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", color: "#58a6ff" }}>{param}</td>
                    <td style={{ padding: "10px 12px", color: "#484f58" }}>{def}</td>
                    <td style={{ padding: "10px 12px", color: "#8b949e" }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 32, color: "#484f58", fontSize: 13 }}>
          GitHub Widgets — Self-hosted, open source
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 14px",
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: 8,
  fontSize: 14,
  color: "#c9d1d9",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const pillStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px 16px",
  borderRadius: 8,
  fontSize: 13,
  cursor: "pointer",
  fontWeight: 500,
  transition: "all 0.15s",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "#8b949e" }}>{label}</span>
      {children}
    </div>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#484f58", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <code
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "'SF Mono', Menlo, monospace",
            color: "#8b949e",
            overflow: "auto",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
          }}
        >
          {code}
        </code>
        <button
          onClick={copy}
          style={{
            padding: "0 20px",
            background: copied ? "#238636" : "#21262d",
            color: copied ? "#fff" : "#c9d1d9",
            border: "1px solid #30363d",
            borderRadius: 8,
            fontSize: 13,
            cursor: "pointer",
            fontWeight: 500,
            whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
