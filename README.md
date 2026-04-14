# Powerline Studio

Visual configuration editor for [claude-powerline](https://github.com/owloops/claude-powerline) — a vim-style statusline for Claude Code.

Build your statusline visually with a live terminal preview, configure themes, styles, segments, and TUI layouts, then export your config JSON.

## Features

- **Live Terminal Preview** — real claude-powerline rendering engine in the browser, pixel-perfect ANSI output
- **Theme Picker** — 6 built-in themes + custom theme editor with per-segment color overrides
- **Style Selector** — minimal, powerline, capsule, and TUI styles with live comparison
- **Segment Editor** — enable/disable, reorder, and configure all 13 segments with per-segment options
- **TUI Layout Editor** — visual grid editor for breakpoints, columns, areas, box styles, and templates
- **Mock Data Editor** — customize preview data with presets (minimal session, heavy session, rate limited, etc.)
- **Export** — JSON config with syntax highlighting, one-click copy, and installation instructions
- **Import** — paste an existing config to load it into the editor
- **Persistent** — config auto-saves to localStorage

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
vp dev
```

## Tech Stack

Vue 3.6, Vite 8, Tailwind CSS 4, shadcn-vue, Pinia, ansi_up, Shiki.

## License

MIT
