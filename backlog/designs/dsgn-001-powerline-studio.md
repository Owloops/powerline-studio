---
id: dsgn-001-powerline-studio
title: Powerline Studio — Visual Config Editor for claude-powerline
created_date: 2026-04-11
updated_date: 2026-04-11
---

# Problem

claude-powerline (a vim-style statusline for Claude Code) has a rich JSON config with 13 segments, 6 themes, 4 styles, responsive TUI grid layouts, and per-segment options. Users currently configure it by hand-editing JSON or using the interactive Claude Code setup wizard. There's no visual way to see how config changes affect the statusline before applying them. Users share configs in GitHub Discussions but can't easily try others' setups.

Powerline Studio is a public web app that lets users visually configure their claude-powerline statusline with a live terminal preview, then export the config.

# Approaches Considered

## 1. Fork and rewrite renderer in Vue (Rejected)

Copy the rendering code into the web app and rewrite it using Vue components and CSS for direct HTML output.

- Pros: Full control, native interactivity, no ANSI intermediary
- Cons: Diverges from source, must keep in sync manually, different visual output than real terminal

## 2. npm package with Vite Node polyfills (Rejected)

Use claude-powerline as a direct dependency with vite-plugin-node-polyfills to stub Node APIs.

- Pros: Uses real package, no modifications needed
- Cons: Fragile — new Node imports upstream break silently, polyfills can't cover fs/child_process meaningfully

## 3. Upstream browser entry point + local link (Chosen)

Add a browser-safe entry point to claude-powerline that exports only the pure rendering logic (no Node.js dependencies). Use as a local linked dependency during development, eventually merge upstream.

- Pros: Clean import path, pixel-perfect rendering via real engine, stays in sync with upstream, benefits the broader ecosystem
- Cons: Requires upstream changes (acceptable since the user is a maintainer)

# Decisions

1. **Browser integration**: Split Node-dependent code from pure rendering in claude-powerline, added `@owloops/claude-powerline/browser` entry point (merged to main). Zero Node imports in browser bundle (48KB). All 208 tests pass. Changes: split colors.ts (pure hex + color-support.ts), split terminal.ts (pure string utils + terminal-width.ts), inline path.basename, globalThis.process?.env for env segment, dynamic import for terminal width in TUI renderer.

2. **Rendering approach**: ANSI-to-HTML conversion using the real claude-powerline renderer. Config + mock data → SegmentRenderer/renderTuiPanel → ANSI escape codes → ansi_up library → styled HTML in a monospace `<pre>`. Pixel-perfect match to real terminal output.

3. **Interactivity**: Overlay invisible positioned hitbox elements on the ANSI preview. Each segment gets a `<div>` overlay at the correct character position. Click a segment in the preview to select it and open its config panel.

4. **Target audience**: Public tool for anyone using or considering claude-powerline.

5. **Export format**: JSON config file + one-click clipboard copy + installation instructions (where to save the file, how to update settings.json for the statusLine hook).

6. **Scope**: Full feature set, not phased MVP. Build it all.

# Chosen Approach

## Architecture

### Rendering Pipeline

```
User Config (reactive store)
    │
    ├─→ SegmentRenderer (for powerline/capsule/minimal styles)
    │   └─→ formatSegment() per segment → joined ANSI string
    │
    └─→ renderTuiPanel (for TUI style)
        └─→ resolveSegments() → renderGrid() → ANSI string

ANSI string
    │
    ansi_up.ansi_to_html()
    │
    Monospace <pre> with styled <span>s
    │
    Overlay hitbox <div>s for segment click interaction
```

### Mock Data System

The preview needs fake data for all segments. Source: preview.sh in claude-powerline already has sample ClaudeHookData. Additional mock data objects needed:

- GitInfo (branch, status, ahead/behind, working tree)
- UsageInfo (session cost, tokens, breakdown)
- ContextInfo (used percentage, total tokens, max tokens)
- MetricsInfo (response time, duration, message count, lines added/removed)
- BlockInfo (native utilization, time remaining)
- TodayInfo (cost, tokens, breakdown)

Users should be able to edit the mock data to preview their specific use case (e.g., change the git branch name, adjust the cost amount).

### UI Layout

```
┌─────────────────────────────────────────────────┐
│  Terminal Preview                          [⚙]  │
│  ┌─────────────────────────────────────────────┐│
│  │  ~/project  main ✓  ◆ Sonnet 4  $2.85  42% ││
│  └─────────────────────────────────────────────┘│
│  Terminal Width: [────●────] 100                 │
│  Color Mode: [Truecolor ▾]  Charset: [Unicode ▾]│
├─────────────┬───────────────────────────────────┤
│  Sidebar    │  Main Panel                       │
│             │                                   │
│  Theme      │  (changes based on sidebar        │
│  Style      │   selection — shows config for    │
│  Segments   │   the selected section)            │
│  TUI Layout │                                   │
│  Mock Data  │                                   │
│  Export     │                                   │
│             │                                   │
└─────────────┴───────────────────────────────────┘
```

### Feature Details

**1. Preview Controls**

- Terminal width slider (30-200 characters)
- Color mode: truecolor / ansi256 / ansi / none
- Charset: unicode / text (affects Nerd Font symbols)
- Dark/light terminal background toggle

**2. Theme Picker**

- Visual grid showing all 6 built-in themes with mini-previews
- Custom theme editor: color picker per segment (bg/fg)
- Theme preview updates live

**3. Style Picker**

- Visual comparison of all 4 styles: minimal, powerline, capsule, tui
- Padding control (0-3)
- Auto-wrap toggle

**4. Segment Editor**

- List of all 13 segments with enable/disable toggles
- Drag-to-reorder segments
- Click segment → expands per-segment options:
  - directory: style (full/fish/basename)
  - git: showSha, showWorkingTree, showOperation, showTag, showTimeSinceCommit, showStashCount, showUpstream, showRepoName
  - session: type (cost/tokens/both/breakdown), costSource (calculated/official)
  - context: displayStyle (text/bar/blocks/dots/etc), showPercentageOnly, percentageMode, autocompactBuffer
  - block: type, burnType, displayStyle
  - metrics: showResponseTime, showLastResponseTime, showDuration, showMessageCount, showLinesAdded, showLinesRemoved
  - today: type (cost/tokens/both/breakdown)
  - env: variable name, prefix
  - weekly: displayStyle
  - version, tmux, sessionId: basic options
- Multi-line support: add/remove lines, segments per line

**5. TUI Layout Editor** (when style=tui)

- Visual grid editor for breakpoints
- Column definition (auto/1fr/fixed)
- Area names drag-and-drop onto grid cells
- Separator config (column gap, divider character)
- Box style preset picker (rounded/square/heavy/double/dashed/ascii/invisible)
- Title bar template editor (left/right with {token} placeholders)
- Footer template editor
- fitContent toggle, minWidth/maxWidth
- Breakpoint management: add/remove breakpoints, set minWidth thresholds
- Segment template editor (items, gap, justify)

**6. Mock Data Editor**

- Editable form for all mock data fields
- Presets: "minimal session", "heavy session", "rate limited", etc.
- Live preview updates as data changes

**7. Export**

- Full JSON config output with syntax highlighting
- One-click copy to clipboard
- Installation instructions panel:
  - Where to save: `~/.claude/claude-powerline.json`
  - settings.json snippet for statusLine hook
  - npm install command
- localStorage auto-save (persist config across sessions)
- Import existing config (paste JSON)

### Tech Stack (from project template)

- Vue 3.6 + Composition API + script setup
- Vite 8 via VitePlus
- Tailwind CSS 4
- shadcn-vue components
- reka-ui headless primitives
- Motion for Vue animations
- Pinia for state management
- ansi_up for ANSI → HTML conversion
- @owloops/claude-powerline/browser for rendering

### State Management (Pinia stores)

- `useConfigStore` — the PowerlineConfig object, all mutations
- `usePreviewStore` — terminal width, color mode, charset, rendered output
- `useMockDataStore` — ClaudeHookData + provider data objects, presets
- `useEditorStore` — UI state: selected segment, active panel, etc.

# Open Questions

1. **Budget config UI** — Should we include budget configuration (session/today/block amounts and warning thresholds)? It affects the segment display but is more about personal limits than visual config. Leaning yes since it changes what users see.

2. **Custom theme sharing** — Should users be able to share configs via URL params (encode config in URL hash)? Would be a nice viral feature. Could also support sharing via a short code/gist.

3. **Responsive design** — The editor itself needs to work on different screen sizes. The terminal preview is inherently monospace/fixed-width. How small should we go? Mobile probably doesn't make sense for a config editor — maybe tablet minimum?

4. **Segment theme overrides** — claude-powerline supports per-segment color overrides in `colors.custom`. Should we expose a per-segment color picker? (Yes, this was in the original requirements.)

5. **Nerd Font handling** — The preview needs a Nerd Font to render powerline symbols correctly. We should embed one (or link to one) and document that the preview requires it. Consider using a web-compatible Nerd Font like "FiraCode Nerd Font" or similar.
