---
id: task-010-rendering-service
title: Create rendering service integrating ansi_up and claude-powerline browser entry
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
  - task-009
---

## Description

<!-- DESCRIPTION:BEGIN -->

The rendering service is the core bridge between the claude-powerline engine and Vue's reactivity system. It takes the user's configuration and mock data from Pinia stores, runs them through the real claude-powerline rendering pipeline, converts the resulting ANSI escape-code output to styled HTML, and feeds the result back into the preview store for display.

The service handles two distinct rendering paths:
1. **Non-TUI styles** (minimal, powerline, capsule): Instantiates `SegmentRenderer`, renders each enabled segment individually, then assembles them into complete ANSI lines using the correct separator/formatting logic (powerline arrows, capsule rounded ends, or minimal plain separators).
2. **TUI style**: Calls `renderTuiPanel` directly with a `TuiData` object containing all segment data, producing a boxed grid-based ANSI panel.

The ANSI output is then converted to HTML using the `ansi_up` library, producing styled `<span>` elements inside a monospace container. Re-rendering is debounced and triggered reactively whenever config or mock data changes.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Dependencies
- Install `ansi_up` (v6.x) via `vp add ansi_up`
- `@owloops/claude-powerline` already linked locally — browser entry at `@owloops/claude-powerline/browser`

### Composable: `useRenderer`
- Located at `src/composables/useRenderer.ts`
- Auto-imported via `unplugin-auto-import` (composables directory convention)
- Reads reactive state from `useConfigStore` (PowerlineConfig) and `useMockDataStore` (ClaudeHookData + provider data)
- Reads terminal settings from `usePreviewStore` (width, colorMode, charset)
- Writes rendered output back to `usePreviewStore` (ANSI string + HTML string)

### Non-TUI rendering path (minimal / powerline / capsule)
- Instantiate `SegmentRenderer` from `@owloops/claude-powerline/browser` with config and resolved symbols
- Resolve theme colors using `getTheme()` + `hexToAnsi()` / `hexTo256Ansi()` / `hexToBasicAnsi()` color converters based on `previewStore.colorMode` (NOT `config.display.colorCompatibility` — the preview store's colorMode is the source of truth for rendering simulation; config's colorCompatibility is only relevant for export and is ignored during preview rendering)
- Initialize `PowerlineSymbols` based on config style (minimal/powerline/capsule) and charset (unicode/text), using `SYMBOLS`/`TEXT_SYMBOLS` constants
- For each line in `config.display.lines`:
  - Filter to enabled segments, iterate in order
  - Call the appropriate `SegmentRenderer.renderXxx()` method per segment type, passing mock data objects (GitInfo, UsageInfo, ContextInfo, MetricsInfo, BlockInfo, TodayInfo) from useMockDataStore
  - Collect `SegmentData` results (text + bgColor + fgColor)
- Format collected segments into ANSI string using `formatSegment` logic:
  - Powerline: `bg+fg+padding+text+padding` then arrow separator with fg derived from bg via `extractBgToFg()`
  - Capsule: rounded left cap + `bg+fg+padding+text+padding` + rounded right cap, space between segments
  - Minimal: same as powerline but empty right symbol (no arrow)
- If `autoWrap` is enabled, split segments across lines based on `previewStore.terminalWidth` using `visibleLength()` for width calculation
- Join lines with `\n`

### TUI rendering path
- Build `TuiData` object from mock data stores: `{ hookData, usageInfo, blockInfo, todayInfo, contextInfo, metricsInfo, gitInfo, tmuxSessionId, colors }`
- Resolve `BoxChars` from charset (unicode → `BOX_CHARS`, text → `BOX_CHARS_TEXT`)
- **IMPORTANT: TUI grid width handling** — when `config.display.tui` is present (grid path), `renderTuiPanel` ignores the `terminalWidth` parameter and reads `config.display.tui.terminalWidth` instead (defaulting to 120). Before calling, the composable must set `config.display.tui.terminalWidth = previewStore.terminalWidth` on a cloned config so the preview width slider controls the grid render. For the hardcoded (non-grid) TUI path, the `terminalWidth` parameter IS used correctly.
- Call `renderTuiPanel(tuiData, boxChars, colors.reset, terminalWidth, clonedConfig)` — pass a cloned config with `tui.terminalWidth` overridden
- `renderTuiPanel` is async (it dynamically imports terminal-width in Node, but in browser that import silently fails and the explicit `tui.terminalWidth` or function parameter is used)

### ANSI-to-HTML conversion
- Instantiate `AnsiUp` once (reuse across renders)
- Configure: `use_classes = false` (inline styles for portability), `escape_html = true` (default)
- Call `ansiUp.ansi_to_html(ansiString)` to produce HTML with `<span style="...">` elements
- Strip the TUI sync sequences (`\x1b[?2026h` / `\x1b[?2026l`) and whitespace guard (`\x1b[0m` at line starts) before conversion — these are terminal-only control sequences that would produce spurious empty spans

### Reactivity and performance
- Use `watch` with `{ deep: true }` on config and mock data store state
- **Watch all preview settings that affect rendering:** terminalWidth, colorMode, charset, AND `darkBackground` (needed because `getThemeColors` uses theme lightness to adjust TUI foreground colors via `hexColorDistance` against a terminal reference color)
- Debounce the render function (150ms) using `useDebounceFn` from VueUse
- The render function itself is synchronous for non-TUI (all data is pre-provided, no async providers), async for TUI path (renderTuiPanel is async)
- **Stale render protection:** Use a render token (incrementing counter). Before writing output, check that the current token matches the one at render start. If a newer render was triggered while an async TUI render was in flight, discard the stale result.
- Expose a `renderNow()` method that bypasses debounce for imperative re-render
- Track rendering state: `isRendering` ref for loading indicators
- Track errors: `renderError` ref (string | null) for error display
- **Singleton pattern:** The composable creates watchers and side effects. It should be called once (in the studio page root) and the returned refs passed down or consumed via provide/inject. Do NOT call `useRenderer()` from multiple components.

### Acceptance criteria
- Changing any config field triggers a debounced re-render within 150ms
- Non-TUI output matches what claude-powerline produces for the same config+data
- TUI output matches renderTuiPanel output for the same config+data
- ANSI escape codes are fully converted to styled HTML spans
- No Node.js imports — composable is fully browser-safe
- Errors during rendering are caught and surfaced via `renderError`, not swallowed

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

### Architecture Approach

Single composable `useRenderer` that encapsulates the full rendering pipeline. The composable follows Vue best practices: minimal state (only derived output + error/loading flags), side-effect logic in a watcher, and clean separation from the stores it reads/writes.

The composable does NOT re-export or wrap the `PowerlineRenderer` class from claude-powerline — that class is tightly coupled to Node.js providers (GitService, UsageProvider, etc. that read the filesystem). Instead, the composable replicates the pure rendering logic using the browser-safe exports: `SegmentRenderer` (for individual segment rendering) and the formatting/assembly functions (symbols, color converters, formatSegment logic). For TUI, it uses `renderTuiPanel` directly since that function accepts pre-built data.

```
useConfigStore ──┐
                 ├──→ useRenderer (composable)
useMockDataStore ─┤       │
                 │       ├─→ resolveColors()     ← getTheme + hexToAnsi converters
usePreviewStore ──┘       ├─→ resolveSymbols()    ← SYMBOLS/TEXT_SYMBOLS + style
                         ├─→ renderSegments()    ← SegmentRenderer methods
                         ├─→ formatLine()        ← formatSegment + buildLineFromSegments logic
                         ├─→ [or] renderTuiPanel()
                         ├─→ stripControlSeqs()  ← remove sync/guard sequences
                         └─→ ansiToHtml()        ← AnsiUp.ansi_to_html()
                               │
                               └─→ previewStore.setOutput(ansi, html)
```

### Key Files

- `src/composables/useRenderer.ts` — Main composable: orchestrates rendering pipeline, debounced watcher, error handling
- `src/composables/useRenderer/colors.ts` — (optional, if useRenderer.ts exceeds ~300 lines) Color resolution helper: wraps getTheme + hexToAnsi to produce PowerlineColors without calling getColorSupport()
- `src/composables/useRenderer/symbols.ts` — (optional) Symbol initialization helper: replicates PowerlineRenderer.initializeSymbols()
- `src/composables/useRenderer/format.ts` — (optional) Segment formatting helper: replicates formatSegment + buildLineFromSegments + calculateSegmentWidth

**Decision on file splitting:** Start as a single file. If `useRenderer.ts` exceeds ~300 lines, extract the three pure helper modules (colors, symbols, format) into a `useRenderer/` directory with an `index.ts` re-export. These are pure functions with no Vue reactivity — they take config and return data.

### Patterns to Follow

**Composable pattern (Vue best practices):**
```ts
export function useRenderer() {
  const configStore = useConfigStore()
  const mockDataStore = useMockDataStore()
  const previewStore = usePreviewStore()

  const isRendering = shallowRef(false)
  const renderError = shallowRef<string | null>(null)
  let renderToken = 0  // stale render protection

  // AnsiUp instance — reused across renders
  const ansiUp = new AnsiUp()

  // Core render function
  async function render() {
    const token = ++renderToken
    isRendering.value = true
    renderError.value = null
    try {
      // ... rendering logic ...
      if (token !== renderToken) return  // stale, discard
      previewStore.setRenderedOutput(ansi, html)
    } catch (e) {
      if (token !== renderToken) return
      renderError.value = e instanceof Error ? e.message : String(e)
    } finally {
      if (token === renderToken) isRendering.value = false
    }
  }

  // Debounced version
  const debouncedRender = useDebounceFn(render, 150)

  // Watch ALL inputs that affect rendering (including darkBackground for TUI color correction)
  watch(
    [
      () => configStore.$state,
      () => mockDataStore.$state,
      () => previewStore.terminalWidth,
      () => previewStore.colorMode,
      () => previewStore.charset,
      () => previewStore.darkBackground,
    ],
    () => { debouncedRender() },
    { deep: true }
  )

  // Initial render
  render()

  return { isRendering, renderError, renderNow: render }
}
```

**Singleton usage:** Call `useRenderer()` once in the studio page root component. Do not call from multiple components — each call creates independent watchers and side effects. Consuming components should read output from `usePreviewStore` directly.
```

**Color resolution (browser-safe):**
The `getColorSupport()` function uses `node:process` and `node:tty` — it cannot be called in the browser. The composable must bypass it by reading `previewStore.colorMode` directly (which the user sets via the UI: "truecolor" / "ansi256" / "ansi" / "none"). The browser entry exports the individual converters (`hexToAnsi`, `hexTo256Ansi`, `hexToBasicAnsi`) so we pick the right one based on the user's colorMode selection.

The `getThemeColors()` logic from `PowerlineRenderer` must be replicated locally because it's a private method not exported from the browser entry. This is the most complex piece — it resolves segment colors from the theme, handles custom themes, applies TUI fg/bg proximity correction, and builds the full `PowerlineColors` object. The implementation should closely follow the original (~80 lines).

**darkBackground and TUI color correction:** The upstream `getThemeColors()` uses `isLightTheme` (derived from `theme === 'light'`) to set a `terminalRef` color (`#f0f0f0` for light, `#1e1e1e` for dark). This reference is used in TUI mode to detect when a foreground color is too close to the terminal background (via `hexColorDistance`), swapping it to the bg color for readability. In the studio, we should derive `isLightTheme` from `previewStore.darkBackground` rather than the theme name, since the user controls the preview background independently. When `darkBackground` is false, use `#f0f0f0` as `terminalRef`; when true, use `#1e1e1e`.

**Segment rendering:**
`SegmentRenderer` IS exported from the browser entry and works in the browser. It takes `(config, symbols)` and has methods like `renderDirectory()`, `renderGit()`, `renderModel()`, `renderSession()`, etc. that return `SegmentData { text, bgColor, fgColor }`. These methods are pure — they take pre-built data objects rather than fetching from the filesystem.

For segments that `PowerlineRenderer` handles specially (session, context, metrics, block, today, version, git, tmux), the composable must pass mock data from `useMockDataStore` to the appropriate `SegmentRenderer` method. The mapping:
- `directory` → `segmentRenderer.renderDirectory(hookData, colors, config)`
- `model` → `segmentRenderer.renderModel(hookData, colors)`
- `git` → `segmentRenderer.renderGit(gitInfo, colors, config)` (gitInfo from mock store)
- `session` → `segmentRenderer.renderSession(usageInfo, colors, config)` (usageInfo from mock store)
- `sessionId` → `segmentRenderer.renderSessionId(sessionId, colors, config)`
- `tmux` → `segmentRenderer.renderTmux(tmuxSessionId, colors)`
- `context` → `segmentRenderer.renderContext(contextInfo, colors, config)`
- `metrics` → `segmentRenderer.renderMetrics(metricsInfo, colors, config)`
- `block` → `segmentRenderer.renderBlock(blockInfo, colors, config)`
- `today` → `segmentRenderer.renderToday(todayInfo, colors, type)`
- `version` → `segmentRenderer.renderVersion(hookData, colors, config)`
- `env` → `segmentRenderer.renderEnv(colors, config)` (reads `globalThis.process?.env` — will return null in browser, which is fine for preview)
- `weekly` → `segmentRenderer.renderWeekly(hookData, colors, config)`

**formatSegment logic (replicated from PowerlineRenderer):**
This is the second piece of logic that must be replicated since it's a private method. It handles:
- Capsule style: left rounded cap + bg/fg/padding/text/padding + right rounded cap
- Powerline style: bg/fg/padding/text/padding + arrow separator (fg derived from bg via `extractBgToFg`)
- Minimal style: same as powerline but empty right symbol

The `buildLineFromSegments` logic iterates segments, calls `formatSegment` for each, and handles spacing between capsule segments.

**ANSI cleanup before HTML conversion:**
The TUI renderer prepends control sequences that are meaningless in HTML:
- `SYNC_START = "\x1b[?2026h"` and `SYNC_END = "\x1b[?2026l"` — DEC synchronized output
- `WS_GUARD = "\x1b[0m"` at line starts — prevents Claude Code from stripping whitespace

Strip these with a simple regex before passing to `ansi_up`:
```ts
function stripControlSequences(ansi: string): string {
  return ansi
    .replace(/\x1b\[\?2026[hl]/g, '')  // sync sequences
    .replace(/^\x1b\[0m/gm, '')         // line-start whitespace guards
}
```

### Dependencies
- **External packages:** `ansi_up` (v6.x, ES module, zero deps, ~10KB)
- **Local linked package:** `@owloops/claude-powerline/browser` (already linked)
- **Task dependencies:** task-009 (Pinia stores must exist: useConfigStore, useMockDataStore, usePreviewStore)
- **VueUse:** `useDebounceFn` (already available via auto-import)
- **Skills:** vue, vue-best-practices, vite, pnpm

### Key technical risks
1. **getThemeColors replication accuracy** — The `getThemeColors()` private method in PowerlineRenderer is ~60 lines with subtle logic (TUI fg/bg proximity correction via `hexColorDistance`, custom theme partFg resolution). Must be carefully ported. Mitigation: copy logic precisely, test against known theme outputs.
2. **formatSegment replication accuracy** — The formatting logic differs by style and handles `extractBgToFg` for arrow colors. Must match exactly for pixel-perfect preview. Mitigation: write unit tests comparing output against PowerlineRenderer for each style.
3. **AnsiUp CSS classes vs inline styles** — Using inline styles (default) produces self-contained HTML. If we later need CSS theming of the preview terminal background, we may switch to `use_classes = true`. Start with inline styles for simplicity.

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [x] Install `ansi_up` package (`vp add ansi_up`)
- [x] Create `src/composables/useRenderer.ts` scaffold with store imports, AnsiUp instance, state refs (`isRendering`, `renderError`), and debounced watcher
- [x] Implement `resolveThemeColors()` — port `PowerlineRenderer.getThemeColors()` logic using browser-safe color converters (`hexToAnsi`/`hexTo256Ansi`/`hexToBasicAnsi`) selected by `previewStore.colorMode` instead of `getColorSupport()`
- [x] Implement `resolveSymbols()` — port `PowerlineRenderer.initializeSymbols()` logic using `SYMBOLS`/`TEXT_SYMBOLS` constants and config style/charset
- [x] Implement non-TUI render path: iterate `config.display.lines`, filter enabled segments, call appropriate `SegmentRenderer.renderXxx()` methods with mock data, collect `SegmentData[]`
- [x] Implement `formatSegment()` — port the private method from PowerlineRenderer, handling powerline arrows, capsule rounded ends, and minimal (no separator) styles with `extractBgToFg()` for arrow coloring
- [x] Implement `buildLineFromSegments()` — port the assembly logic, handle capsule spacing between segments
- [x] Implement `calculateSegmentWidth()` — port width calculation using `visibleLength()` for autoWrap support
- [x] Implement autoWrap logic — split segments across lines when total width exceeds `previewStore.terminalWidth`
- [x] Implement TUI render path: build `TuiData` object from mock stores, resolve `BoxChars` from charset, clone config and override `config.display.tui.terminalWidth` with `previewStore.terminalWidth` for grid path, call `renderTuiPanel()`, handle the async return
- [x] Implement `stripControlSequences()` — remove DEC sync sequences and whitespace guards before ANSI-to-HTML conversion
- [x] Implement ANSI-to-HTML conversion using `AnsiUp.ansi_to_html()`, write both raw ANSI and HTML output to `previewStore`
- [x] Wire up debounced `watch` on config store, mock data store, and ALL preview settings (terminalWidth, colorMode, charset, darkBackground) to trigger re-render
- [x] Implement stale render protection: increment render token before each render, check token before writing output, discard stale async results
- [x] Add error boundary: wrap render in try/catch, set `renderError` on failure, clear on success
- [x] Use `previewStore.darkBackground` (not theme name) to derive `terminalRef` for TUI fg/bg color proximity correction in `resolveThemeColors()`
- [x] Trigger initial render on composable creation
- [x] Verify: changing config triggers re-render, output contains styled `<span>` elements, TUI path produces boxed panel HTML, changing preview width updates TUI grid output

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Key implementation decisions:**
- `PowerlineRenderer` class is NOT exported from the browser entry and cannot be used directly. It is tightly coupled to Node.js data providers. We replicate only the pure rendering assembly logic (getThemeColors, initializeSymbols, formatSegment, buildLineFromSegments, calculateSegmentWidth) which are private methods.
- `SegmentRenderer` IS exported and browser-safe — it handles individual segment rendering given pre-built data. This is the primary rendering workhorse.
- `renderTuiPanel` IS exported and mostly browser-safe — it dynamically imports terminal-width (Node-only) but silently falls back when that import fails in the browser. HOWEVER, the grid path ignores the `terminalWidth` parameter and reads `config.display.tui.terminalWidth` instead. The composable must clone config and set `tui.terminalWidth` to the preview width before calling.
- `getColorSupport()` uses `node:process` and `node:tty` — must be bypassed in browser. The composable reads `previewStore.colorMode` directly and selects the matching hex-to-ANSI converter. `config.display.colorCompatibility` is NOT used for rendering — it exists only for export.
- `darkBackground` from preview store drives `terminalRef` for TUI color correction (not `theme === 'light'` as in the CLI).
- `ansi_up` v6.x is an ES module with zero dependencies. The `AnsiUp` class is instantiated once and reused. Its `ansi_to_html()` method handles stateful parsing (buffering incomplete escape sequences), which is fine since we feed it complete strings.
- The `env` segment reads `globalThis.process?.env` — this returns undefined in the browser, so the segment will render as null (hidden). This is acceptable for preview purposes; mock data can include an env value in the future if needed.
- Composable is a singleton — must be called once from the studio page root. Other components read output from `usePreviewStore` directly.
- Async TUI renders use a token-based stale render guard to prevent old results overwriting newer ones.

**Review outcomes (Codex review 2026-04-11):**
- Fixed: TUI grid width — must override `config.display.tui.terminalWidth` before calling `renderTuiPanel`
- Fixed: darkBackground missing from watcher — needed for TUI fg/bg proximity correction
- Fixed: stale render protection for async TUI path via render token
- Fixed: clarified `previewStore.colorMode` as rendering source of truth (not `config.display.colorCompatibility`)
- Fixed: singleton usage guidance to prevent duplicate watchers
- Dismissed: tmuxSessionId missing from mock store — it IS present in task-009 spec (line 88)
- Noted: unit test parity for replicated logic (getThemeColors, formatSegment) would be valuable but is a testing concern, not a scope addition for this task

**Related Tasks:**
- task-009-pinia-stores — Provides useConfigStore, useMockDataStore, usePreviewStore that this composable depends on
- task-011-terminal-preview — Will consume the HTML output from usePreviewStore that this composable produces
- task-012-preview-controls — Controls (terminalWidth, colorMode, charset, darkBackground) that trigger re-rendering live in usePreviewStore

<!-- NOTES:END -->
