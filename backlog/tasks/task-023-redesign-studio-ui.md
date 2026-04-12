---
id: task-023-redesign-studio-ui
title: 'Redesign studio UI: single-page workflow with interactive layout editor'
status: 'Done'
created_date: '2026-04-11 23:10'
updated_date: '2026-04-12 09:51'
parent: null
subtasks:
  - task-023a-scaffolding
  - task-023b-flat-layout-editor
  - task-023c-tui-layout-editor
  - task-023d-preview-bridge
  - task-023e-export-mockdata
dependencies:
---

## Description

<!-- DESCRIPTION:BEGIN -->

The current Powerline Studio UI spreads configuration across 5 sidebar tabs (Appearance, Segments, TUI Layout, Mock Data, Export). Users must navigate between tabs to build their statusline, creating friction and disorientation. The segment list in the Segments tab duplicates what the preview already shows. The TUI grid editor is disconnected from the live preview, making layout adjustments feel indirect.

This redesign replaces the tab-based sidebar with a single scrollable page organized around the natural workflow:

1. **Preview** — always at the top, with terminal controls collapsed behind a toggle
2. **Presets** — choose a starting template (TUI or flat), or import an existing config
3. **Style & Theme** — pick display style, color theme, and global settings inline
4. **Interactive Layout Editor** — a CSS flex/grid replica of the segment layout that IS the editing surface. Click any segment to configure it in a popover. Drag rows to reorder. Click column borders to adjust widths. Add/remove segments with inline controls. The ANSI preview overlay just highlights and scrolls to the corresponding editor cell.
5. **Export & Mock Data** — at the bottom, export your config or adjust mock data for the preview

The preview hitbox overlay remains for discovery — clicking a segment in the preview scrolls to and opens that segment's editor in the layout below. But all actual editing happens in the interactive layout editor, not in separate panels.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Layout & Navigation

- Single scrollable page, no sidebar tabs, no panel switching
- Preview stays sticky or pinned at the top of the viewport
- Terminal controls (width, reserved, color, charset, font, terminal theme) hidden behind a collapsible toggle — not removed, just tucked away
- Vertical section flow: Preview → Presets → Style/Theme → Layout Editor → Export/MockData
- No `StudioSidebar` or `SidebarProvider` layout

### Interactive Layout Editor — Flat Modes (minimal/powerline/capsule)

- CSS flex layout that visually mirrors the segment arrangement per line
- Each segment rendered as a styled chip/block matching the display style aesthetic
- Click a segment → Popover opens with that segment's config form (using existing `segmentConfigMap` components)
- Drag segments to reorder within a line
- "Add Segment" button always visible — opens the existing `SegmentPicker`
- Remove segment via popover or inline control
- Multi-line support: line selector/switcher integrated into the editor
- Segments with no options (Model, Version, Tmux) show a minimal popover with just enable/disable

### Interactive Layout Editor — TUI Mode

- CSS grid layout that visually mirrors the TUI areas for the active breakpoint
- Each cell shows the segment name, clickable → popover with segment config + color overrides
- Row controls: drag handle to reorder, delete button per row, add row/divider at any position
- Column controls: visual column borders that are draggable to resize, or click to open column settings (size type, alignment)
- Title bar and footer: clickable regions that open template editing popovers
- Breakpoint switcher: tabs or buttons showing each breakpoint's minWidth. Switching a breakpoint auto-sets `previewStore.terminalWidth` to that breakpoint's minWidth (so the preview shows the correct breakpoint)
- TUI-specific options (box style, separators, padding, fitContent, min/maxWidth) grouped into a collapsible "TUI Options" section or a gear/settings popover
- Segment template overrides accessible per-cell (within the segment config popover)
- Segment color customization accessible from the cell popover

### Preview ↔ Layout Editor Bridge

- Clicking a segment hitbox in the preview scrolls to the interactive layout editor and highlights the corresponding cell
- In TUI mode: opens the popover for that cell. In flat mode: opens the popover for that segment.
- Clicking title/footer hitboxes scrolls to and opens the title/footer template popover
- Highlight animation (ring pulse or similar) on the layout editor cell when selected via preview
- The preview overlay remains purely for selection/discovery — no editing controls on the overlay itself

### Export & Mock Data

- Export section at the bottom: JSON preview (Shiki highlighted), copy button, install instructions
- Import: textarea with validation, load button
- Mock data: collapsible section with preset selector and data forms
- Reset to defaults button

### Acceptance Criteria

- All existing configuration options remain accessible (no functionality loss)
- The 13 segment config forms render correctly inside popovers
- Drag reorder works in flat mode layout editor
- TUI grid correctly reflects the areas/columns/breakpoints from config
- Breakpoint switching auto-adjusts terminal width
- Preview hitbox clicks scroll to and open the correct layout editor popover
- Config persists to localStorage identically (no config format changes)
- Export JSON output is identical to current behavior
- Works at viewport widths ≥1024px (the typical usage scenario)

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

### Architecture Approach

**Page structure** — `(home).vue` replaces the SidebarProvider layout with a vertical flow of section components. The preview and `useRenderer()` are unchanged. Each workflow step is a distinct component section:

```
(home).vue
├── StudioHeader (replaces StudioTopBar — logo, dark mode, terminal controls toggle)
├── TerminalPreview (unchanged)
├── PreviewControls (made collapsible, hidden by default)
├── PresetSection (new — template cards for TUI + flat, import button)
├── StyleThemeSection (new — combines style cards + theme grid + padding/wrap inline)
├── LayoutEditor (new — the core interactive editor)
│   ├── FlatLayoutEditor (for minimal/powerline/capsule)
│   │   ├── LineSelector integration
│   │   ├── SegmentChip (per segment — draggable, clickable)
│   │   └── SegmentConfigPopover (wraps segmentConfigMap components)
│   └── TuiLayoutEditor (for tui)
│       ├── BreakpointSwitcher (tabs/buttons with width sync)
│       ├── TuiGridVisual (CSS grid mimic of areas)
│       │   ├── TuiCellPopover (segment config + colors + template)
│       │   ├── TuiRowControls (drag, delete, add)
│       │   └── TuiColumnHandles (drag resize, alignment)
│       ├── TuiTitleFooter (clickable → template popover)
│       └── TuiOptionsMenu (box, separators, padding, sizing — collapsible)
├── ExportSection (JSON preview, copy, install guide, import)
└── MockDataSection (collapsible, preset selector + forms)
```

**Editor store refactor** — Remove `activePanel`, `SidebarPanel` type, panel-switching watchers. Add:

- `focusedSegment: { name: string, cellSegment?: string, source: 'preview' | 'editor' } | null` — drives popover opening and highlight
- `focusedTuiArea: TuiAreaTarget | null` — for title/footer popover
- `scrollToSegment(name, cellSegment?)` — triggers scroll + highlight + popover in layout editor

**Segment config popovers** — The 13 existing config components are store-connected (not prop-connected), so they render inside a `PopoverContent` without any changes. The popover wrapper adds: segment name header, enable/disable toggle, remove button. For TUI cells: also shows color override controls and template override.

**Reuse strategy** — Keep all of: segment config components (13), theme components (6), mock data forms (9), `SegmentPicker`, `StyleCard`, all stores except editor, all composables, all lib utilities. The main new code is the layout editor components and the page restructure.

### Subtask Breakdown

| Subtask                      | Scope                                                                                                                                  | Files                                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **023a: Scaffolding**        | Remove sidebar, rewrite page layout, collapsible preview controls, editor store refactor, style/theme inline section, preset section   | `(home).vue`, `editor.ts`, `types/studio.ts`, new `StudioHeader.vue`, new `PresetSection.vue`, new `StyleThemeSection.vue`, remove `StudioSidebar.vue` |
| **023b: Flat Layout Editor** | Interactive CSS flex segment editor for non-TUI modes with popovers, drag reorder, add/remove, multi-line                              | New `FlatLayoutEditor.vue`, `SegmentChip.vue`, `SegmentConfigPopover.vue`, modify `SegmentPicker.vue`                                                  |
| **023c: TUI Layout Editor**  | Interactive CSS grid editor for TUI mode with cell popovers, row/column management, breakpoint switcher + width sync, TUI options menu | New `TuiLayoutEditor.vue`, `TuiGridVisual.vue`, `TuiCellPopover.vue`, reuse/adapt existing TUI sub-components                                          |
| **023d: Preview Bridge**     | Connect preview overlay clicks to layout editor scroll/highlight/popover                                                               | Modify `SegmentOverlay.vue`, `editor.ts`, add scroll-to logic in layout editors                                                                        |
| **023e: Export & Mock Data** | Move export/import + mock data to bottom sections of single page                                                                       | New `ExportSection.vue`, `MockDataSection.vue`, adapt existing panel internals                                                                         |

**Context Manifest:**

### How This Currently Works: Studio Page Layout and Navigation

The entire application is a single-page editor rendered at `src/pages/(home).vue`. The page uses shadcn-vue's `SidebarProvider` + `SidebarInset` layout pattern: a collapsible left sidebar (`StudioSidebar.vue`) selects which panel to show, while the main content area is split vertically into two zones -- the terminal preview (fixed at the top with `shrink-0`) and a scrollable config panel below it.

The sidebar navigation is driven by the `StudioPanel` type (defined in both `src/types/studio.ts` and `src/stores/editor.ts`):

```ts
type StudioPanel = 'appearance' | 'segments' | 'tui' | 'mockData' | 'export'
```

`StudioSidebar.vue` maintains an array of `SidebarNavItem` objects and conditionally hides items based on `configStore.isTuiStyle` -- when TUI is active, "Segments" is hidden; when not TUI, "TUI Layout" is hidden. Panel selection writes to `editorStore.activePanel` via a two-way sync between `(home).vue`'s local `activePanel` ref and the store. The home page uses a dynamic `<component :is="panelComponents[activePanel]" />` to render the selected panel.

The `StudioTopBar.vue` is minimal: just a sidebar toggle trigger, the "Powerline Studio" label, and a dark mode toggle button.

`PreviewControls.vue` sits directly below the terminal preview and provides sliders/selects for terminal width, reserved width, color mode, charset, font size, line height, font family, and terminal theme. These all bind directly to `previewStore` refs via `storeToRefs`.

The editor store has watchers that auto-redirect between panels when display style changes: if switching to TUI from segments panel, it redirects to TUI; if switching away from TUI while on TUI panel, it redirects to segments.

### How This Currently Works: Terminal Preview and Segment Hitbox Overlay

`TerminalPreview.vue` renders a fake terminal window (macOS-style traffic light dots, title bar showing width info). Inside, a `<pre>` element contains:

1. A `<div>` with `v-html="previewStore.htmlOutput"` -- the ANSI-to-HTML rendered statusline
2. `SegmentOverlay.vue` -- absolutely positioned over the same space
3. An optional "RESERVED" striped overlay for the reserved width area

The overlay is `pointer-events-none` on its container, but each individual hitbox div is `pointer-events-auto`. Hitboxes are positioned using `ch` units for left/width and `em` units for top/height, computed from `SegmentHitbox` data:

```ts
interface SegmentHitbox {
	segmentType: string // config key: 'directory', 'git', etc.
	cellSegment?: string // raw TUI cell name (e.g. 'context.bar')
	line: number // 0-based output line
	charStart: number // character offset
	charWidth: number // visible width in characters
	sourceLineIndex: number // index into config.display.lines[]
}
```

When a hitbox is clicked, `SegmentOverlay.handleClick` routes through `editorStore.selectSegment()`. For non-TUI mode, this sets `selectedSegment`, switches to the segments panel, and optionally changes the active line index. For TUI mode, it sets `selectedTuiArea` and switches to the TUI panel. Special hitbox types `__title_left`/`__title_right`/`__footer_left`/`__footer_right` route to `editorStore.selectTuiArea()` which opens the title/footer collapsible in TuiLayoutPanel.

The hitboxes are computed inside `useRenderer.ts`. For non-TUI styles, hitboxes are calculated during the segment rendering loop by accumulating `charStart` offsets using `calculateHitboxWidth()` from `src/lib/segmentHitboxes.ts`. For TUI style, `computeTuiHitboxes()` mirrors the grid engine: it calls `parseAreas`, `cullMatrix`, `calculateColumnWidths`, `selectBreakpoint`, and the late-resolve pass (for width-dependent segments like context.bar), then uses `extractTuiHitboxes()` to produce hitboxes from the final matrix and column widths. TUI title/footer hitboxes are calculated separately using `resolveTitleToken` and `visibleLength`.

### How This Currently Works: Rendering Pipeline

`useRenderer()` is called once in `(home).vue`. It watches 14 reactive sources across three stores (config, mockData, preview) and debounces rendering at 150ms.

The render path forks on `config.display.style`:

- **Non-TUI** (`minimal`/`powerline`/`capsule`): Creates a `SegmentRenderer` instance, iterates each config line's enabled segments, calls `renderSingleSegment()` to dispatch to the correct renderer method, collects `RenderedSegment[]`, optionally auto-wraps based on terminal width minus reserved width, and joins with `buildLineFromSegments()`.
- **TUI**: Builds `TuiData` from mock store values + resolved colors, calls `renderTuiPanel()` from the claude-powerline library, and separately computes hitboxes via `computeTuiHitboxes()`.

Both paths produce ANSI output which is stripped of sync sequences, converted to HTML via `ansi_up`, then post-processed by `enforceMonospaceGrid()` which wraps every visible character in a `<span class="tch">` for 1ch-width enforcement.

The composable also syncs `previewStore.reservedWidth` into TUI config's `widthReserve` for export consistency.

### How This Currently Works: Config Store

`src/stores/config.ts` is the central store, persisted to localStorage via VueUse's `useStorage` with `mergeDefaults` and `initOnMounted`. It manages:

- **PowerlineConfig** (the full claude-powerline configuration): display style, charset, padding, autoWrap, lines array (each with segments map), TUI grid config, theme, colors, budget, modelContextLimits
- **Theme editor state**: a reactive `ThemeEditorState` object tracking mode (builtin/custom), selected built-in theme, color overrides for built-in themes, custom draft colors, and snapshot for dirty detection
- **Saved custom themes**: persisted to a separate localStorage key

The store exposes ~50 mutation functions grouped by concern: style/display mutations, segment mutations (toggle, update config, reorder), line mutations (add/remove), TUI mutations (breakpoints, areas, columns, separators, box, title, footer, padding, segment templates), theme mutations (select built-in, enter custom, update colors, overrides), and global mutations (loadConfig, resetToDefaults).

Key computed: `currentLineSegments` returns the normalized segments for `editorStore.activeLineIndex`, `isTuiStyle` is a boolean for style === 'tui', `configJson` is the JSON.stringify for export.

Segment normalization (`normalizeSegments` in `segmentMeta.ts`) ensures all 13 segment keys always exist by preserving existing key order and appending missing keys with `SEGMENT_DEFAULTS`.

### How This Currently Works: Editor Store

`src/stores/editor.ts` tracks transient UI state:

- `selectedSegment: string | null` -- currently selected segment name in non-TUI
- `activePanel: SidebarPanel` -- which sidebar panel is active
- `expandedSections: Set<string>` -- accordion/collapsible state
- `activeLineIndex: number` -- which config line is being edited (non-TUI)
- `selectedTuiArea: TuiAreaTarget | null` -- TUI click target (title/footer/segment)

It has watchers that clamp `activeLineIndex` when lines shrink, clear segment selection on line switch, and auto-redirect panel when style changes.

### How This Currently Works: Mock Data Store

`src/stores/mockData.ts` holds all mock data refs (`hookData`, `gitInfo`, `usageInfo`, etc.) that feed the renderer. It supports named presets (`MOCK_DATA_PRESETS` from `src/data/mockPresets.ts`) and a "custom" state for manual edits. Each update function calls `markCustom()` to track deviation from presets.

### How This Currently Works: Preview Store

`src/stores/preview.ts` manages terminal display state: `terminalWidth`, `colorMode`, `terminalTheme`, `terminalFont`, `fontSize`, `lineHeight`, `reservedWidth`. It also holds the renderer's output: `ansiOutput`, `htmlOutput`, and `segmentHitboxes` (shallowRef for performance).

### How This Currently Works: Panel Components

**AppearancePanel** (`panels/AppearancePanel.vue`): Contains display style selection (RadioGroup of StyleCard components), padding/autoWrap controls (hidden when TUI), theme selection (ThemeGrid), custom theme editor (CustomThemeEditor), and built-in theme overrides (ThemeOverrides). Uses ScrollArea wrapper.

**SegmentsPanel** (`panels/SegmentsPanel.vue`): Shows LineSelector at top (prev/next/add/remove line controls), then a Reorder.Group (from motion-v) of SegmentRow components for enabled segments, with SegmentPicker at the bottom. Each SegmentRow is a Collapsible that expands to show the segment-specific config component (from `segmentConfigMap`). External selection (from preview hitbox click) auto-expands and scrolls to the row.

**TuiLayoutPanel** (`panels/TuiLayoutPanel.vue`): Shows preset buttons, validation errors, TuiGlobalOptions (minWidth/maxWidth/fitContent/widthReserve), BreakpointManager (tabbed breakpoint selector with add/remove), BreakpointEditor (title bar, GridAreaEditor, footer, ColumnSettings, SegmentTemplateEditor), and TuiStylingSection (box/separator/padding). Highlight animation from preview clicks sets `highlightedSegment` which propagates to GridCell's ring styling.

**ExportPanel** (`panels/ExportPanel.vue`): Tabs component with ExportTab (Shiki-highlighted JSON, copy button, install instructions) and ImportTab (textarea + load button). Also has "Reset to Defaults" button.

**MockDataPanel** (`panels/MockDataPanel.vue`): Preset selector dropdown, then collapsible MockDataSection components for each data type (hookData, gitInfo, usageInfo, contextInfo, metricsInfo, blockInfo, todayInfo, rateLimits), each wrapping a form component.

### For New Feature Implementation: What Needs to Connect

**Components to remove/replace:**

- `StudioSidebar.vue` -- the entire sidebar navigation. The SidebarProvider/SidebarInset layout in (home).vue must be replaced with a vertical single-page flow.
- `StudioTopBar.vue` -- the sidebar trigger button becomes irrelevant. Needs redesign as a simple header.
- All five panel components become sections in a single scrollable page rather than tab-switched panels.

**Editor store overhaul:**

- `SidebarPanel` type and `activePanel` ref become obsolete. The panel-switching watchers and auto-redirect logic can be removed.
- `selectedSegment` and `selectSegment()` need to change: instead of switching panels, they should trigger a popover opening on the clicked segment in the interactive layout editor.
- `selectedTuiArea` routing logic (title/footer opening collapsibles) needs to map to the new layout editor's popover system.

**Interactive Layout Editor (new component):**

- Must read `configStore.config.display` to know the style (minimal/powerline/capsule/tui) and render a CSS flex/grid visual representation of the segment layout.
- For non-TUI: render enabled segments as flex items in their configured order per line, styled to look like the segment style (arrows/capsules/minimal blocks). Click opens a Popover with the segment's config component from `segmentConfigMap`.
- For TUI: render the grid areas as a CSS grid matching the breakpoint's columns/areas definition. Each cell shows the segment name and is clickable to open config. This replaces the current GridAreaEditor which is purely a text-label grid.
- Drag reorder for non-TUI segments should work on this visual editor (currently uses motion-v Reorder in SegmentsPanel).
- Adding/removing segments needs to work from this editor (currently SegmentPicker popover and SegmentRow remove button).

**Preview overlay changes:**

- The overlay currently triggers `editorStore.selectSegment()` which switches panels. In the redesign, clicking a hitbox should scroll to and highlight the corresponding segment in the interactive layout editor, and optionally open its popover. The overlay should NOT host any editing UI itself.

**TUI breakpoint switching and terminal width:**

- Currently `previewStore.terminalWidth` is set by a slider in `PreviewControls.vue`. TUI breakpoints select based on panel width derived from `terminalWidth - widthReserve`. In the redesign, switching breakpoints in the interactive layout editor should auto-adjust the terminal width slider to show the preview at that breakpoint's range.
- `selectBreakpoint()` from the library picks the breakpoint with the highest `minWidth` that fits within the panel width. The layout editor needs to show which breakpoint is active and allow explicit switching.

**Segment config components (13 files in segments/):**

- These stay largely unchanged but will be rendered inside popovers instead of collapsible rows. They already receive config via stores (not props), so they are decoupled from the panel container.

**Theme components (6 files in theme/):**

- ThemeGrid, CustomThemeEditor, ThemeOverrides stay but move into a "Style/Theme" section of the single-page flow. Currently nested inside AppearancePanel.

**Mock data (9 files in mockdata/):**

- MockDataSection pattern with toggle/collapsible stays. The preset selector and data forms just move to a different position in the page flow.

**shadcn-vue components actively used across the studio:**
Sidebar (removed), ScrollArea, Badge, Slider, Select, Label, NumberField, Switch, Button, Popover, Input, Collapsible, RadioGroup (reka-ui direct), AlertDialog, Alert, Separator, Dialog, Tabs, Textarea, Tooltip, Card, Accordion (via Collapsible pattern). The Popover component will become much more central in the redesign for segment config editing.

**Key library dependency:**
`@owloops/claude-powerline/browser` exports: SegmentRenderer, renderTuiPanel, getTheme, color conversion functions, SYMBOLS/TEXT_SYMBOLS, BOX_CHARS/BOX_PRESETS, grid functions (parseAreas, cullMatrix, calculateColumnWidths, selectBreakpoint, solveFitContentLayout), segment resolution functions, and all TypeScript types for config/data shapes. The rendering engine is used only in `useRenderer.ts`.

### Technical Reference Details

#### Component Interfaces & Signatures

**Stores:**

- `useConfigStore()` -- 769 lines, ~50 exposed members. Key: `config: Ref<PowerlineConfig>`, `configJson: ComputedRef<string>`, `isTuiStyle: ComputedRef<boolean>`, `currentLineSegments: ComputedRef<Required<LineConfig['segments']>>`, `themeEditor: ThemeEditorState`, `effectiveColors: ComputedRef<ColorTheme>`
- `useEditorStore()` -- 127 lines. Key: `selectedSegment: Ref<string|null>`, `activePanel: Ref<SidebarPanel>`, `activeLineIndex: Ref<number>`, `selectedTuiArea: Ref<TuiAreaTarget|null>`, `selectSegment(name, sourceLineIndex?, cellSegment?)`, `selectTuiArea(target)`, `setActivePanel(panel)`
- `usePreviewStore()` -- 95 lines. Key: `terminalWidth: Ref<number>`, `segmentHitboxes: ShallowRef<SegmentHitbox[]>`, `htmlOutput: Ref<string>`, `setRenderedOutput(ansi, html, hitboxes?)`, `setTerminalWidth(width)`
- `useMockDataStore()` -- 150 lines. Key: `hookData`, `gitInfo`, `usageInfo`, etc. as individual refs. `applyPreset(id)`, `getActivePresetData()`

**Composables:**

- `useRenderer()` -- returns `{ isRendering: ShallowRef<boolean>, renderError: ShallowRef<string|null>, renderNow: () => Promise<void> }`. Auto-watches all stores, debounced at 150ms.
- `useTuiValidation(tuiConfig: () => TuiGridConfig | undefined)` -- returns `{ errors, hasErrors, errorsForPath, usedSegmentsInOtherRows }`
- `useShikiHighlighter(source: () => string)` -- returns `{ html: Ref<string>, isLoading: Ref<boolean> }`
- `useDarkMode()` -- returns `{ isDark, toggleDark }`

**Segment config map:**

```ts
// src/components/studio/segments/index.ts
export const segmentConfigMap: Record<string, Component> = {
	directory: DirectoryConfig,
	git: GitConfig,
	model: ModelConfig,
	session: SessionConfig,
	context: ContextConfig,
	block: BlockConfig,
	metrics: MetricsConfig,
	today: TodayConfig,
	env: EnvConfig,
	weekly: WeeklyConfig,
	version: VersionConfig,
	tmux: TmuxConfig,
	sessionId: SessionIdConfig,
}
```

#### Data Structures

**SegmentHitbox** (`src/lib/segmentHitboxes.ts`):

```ts
interface SegmentHitbox {
	segmentType: string
	cellSegment?: string
	line: number
	charStart: number
	charWidth: number
	sourceLineIndex: number
}
```

**TuiAreaTarget** (`src/stores/editor.ts`):

```ts
type TuiAreaTarget =
	| { kind: 'title' }
	| { kind: 'footer' }
	| { kind: 'segment'; name: string; cellSegment?: string }
```

**StudioPanel / SidebarNavItem** (`src/types/studio.ts`):

```ts
type StudioPanel = 'appearance' | 'segments' | 'tui' | 'mockData' | 'export'
interface SidebarNavItem {
	id: StudioPanel
	label: string
	icon: Component
}
```

**TUI types** (`src/types/tui.ts`): re-exports `TuiGridConfig`, `TuiGridBreakpoint`, `SegmentName`, `AlignValue`, `SegmentTemplate` from the library. Adds `EditorBreakpoint` (with `_id`), `ParsedCell`, `TuiValidationError`.

**SegmentMeta** (`src/components/studio/segments/segmentMeta.ts`): 13 segment keys, each with name and lucide icon component. `SEGMENT_DEFAULTS` defines all 13 segment default configs.

**ThemeEditorState** (`src/lib/themes.ts`):

```ts
interface ThemeEditorState {
	mode: 'builtin' | 'custom'
	builtinTheme: CanonicalTheme
	overrides: Partial<ColorTheme>
	customDraft: ColorTheme | null
	customSourceSnapshot: ColorTheme | null
}
```

**TuiPreset** (`src/lib/tuiPresets.ts`): `{ id, name, description, tui: TuiGridConfig, segments: LineConfig['segments'] }`. Three presets: compact, standard, full.

**MockDataPreset** (`src/data/mockPresets.ts`): `{ hookData, gitInfo, usageInfo, contextInfo, metricsInfo, blockInfo, todayInfo, tmuxSessionId }`.

#### Configuration Requirements

- localStorage keys: `powerline-studio-config` (PowerlineConfig), `powerline-studio-custom-themes` (SavedCustomTheme[])
- Local linked dependency: `@owloops/claude-powerline` from `../claude-powerline`
- Self-hosted FiraCode Nerd Font woff2 at `src/assets/fonts/`
- VitePlus manages build toolchain (import from `vite-plus` not `vite`)
- Auto-imports: Vue APIs, VueUse, composables, stores (no manual imports needed)

#### File Locations

**Core page/layout:**

- `src/pages/(home).vue` -- single page, orchestrates all components
- `src/layouts/default.vue` -- full-height wrapper with Sonner toast

**Studio components (all affected):**

- `src/components/studio/StudioSidebar.vue` -- sidebar nav (TO REMOVE)
- `src/components/studio/StudioTopBar.vue` -- top bar (TO REDESIGN)
- `src/components/studio/TerminalPreview.vue` -- terminal preview (KEEP, minor changes)
- `src/components/studio/PreviewControls.vue` -- preview settings bar (KEEP/RELOCATE)
- `src/components/studio/SegmentOverlay.vue` -- hitbox overlay (MODIFY click behavior)
- `src/components/studio/SegmentPicker.vue` -- add-segment popover (REUSE in layout editor)
- `src/components/studio/SegmentRow.vue` -- segment row with collapsible (REPLACE with popover)
- `src/components/studio/LineSelector.vue` -- line prev/next/add/remove (INTEGRATE into layout editor)
- `src/components/studio/StyleCard.vue` -- style option card (KEEP)

**Panel components (all restructured):**

- `src/components/studio/panels/AppearancePanel.vue` -- style + theme (SPLIT into sections)
- `src/components/studio/panels/SegmentsPanel.vue` -- segment list (REPLACE with interactive editor)
- `src/components/studio/panels/TuiLayoutPanel.vue` -- TUI config (MERGE into interactive editor)
- `src/components/studio/panels/MockDataPanel.vue` -- mock data forms (RELOCATE)
- `src/components/studio/panels/ExportPanel.vue` -- export/import (RELOCATE)

**TUI editor components:**

- `src/components/studio/tui/GridAreaEditor.vue` -- grid area visual editor
- `src/components/studio/tui/GridCell.vue` -- individual cell with popover picker
- `src/components/studio/tui/BreakpointEditor.vue` -- breakpoint config (title/footer/columns/templates)
- `src/components/studio/tui/BreakpointManager.vue` -- breakpoint tabs
- `src/components/studio/tui/ColumnSettings.vue` -- column defs + alignment
- `src/components/studio/tui/TuiGlobalOptions.vue` -- minWidth/maxWidth/fitContent
- `src/components/studio/tui/TuiStylingSection.vue` -- box/separator/padding
- `src/components/studio/tui/SegmentTemplateEditor.vue` -- custom segment templates
- `src/components/studio/tui/TemplateEditor.vue` -- title/footer template inputs
- `src/components/studio/tui/TokenPicker.vue` -- token insertion dropdown

**Segment config forms (13, all reusable as-is):**

- `src/components/studio/segments/{Directory,Git,Model,Session,Context,Block,Metrics,Today,Env,Weekly,Version,Tmux,SessionId}Config.vue`
- `src/components/studio/segments/index.ts` -- `segmentConfigMap` registry
- `src/components/studio/segments/segmentMeta.ts` -- names, icons, defaults, normalization

**Theme components (reusable):**

- `src/components/studio/theme/{ThemeGrid,ThemeCard,CustomThemeEditor,ThemeOverrides,ColorPairRow,ColorInput}.vue`

**Mock data forms (reusable):**

- `src/components/studio/mockdata/{MockDataSection,HookDataForm,GitInfoForm,UsageInfoForm,ContextInfoForm,MetricsInfoForm,BlockInfoForm,TodayInfoForm,RateLimitsForm}.vue`

**Stores:**

- `src/stores/config.ts` -- (KEEP, no changes needed)
- `src/stores/editor.ts` -- (MAJOR REFACTOR: remove panel nav, add popover/scroll-to state)
- `src/stores/mockData.ts` -- (KEEP)
- `src/stores/preview.ts` -- (KEEP, possibly add breakpoint-width sync)
- `src/stores/utils.ts` -- (KEEP)

**Composables:**

- `src/composables/useRenderer.ts` -- (KEEP)
- `src/composables/useTuiValidation.ts` -- (KEEP)
- `src/composables/useShikiHighlighter.ts` -- (KEEP)
- `src/composables/useDarkMode.ts` -- (KEEP)

**Types:**

- `src/types/studio.ts` -- (REFACTOR: StudioPanel type obsolete)
- `src/types/tui.ts` -- (KEEP)

**Libraries:**

- `src/lib/segmentHitboxes.ts` -- hitbox computation (KEEP)
- `src/lib/themes.ts` -- theme types and utilities (KEEP)
- `src/lib/tuiPresets.ts` -- TUI preset definitions (KEEP)
- `src/lib/terminalFonts.ts` -- font definitions (KEEP)
- `src/lib/terminalThemes.ts` -- terminal theme definitions (KEEP)
- `src/lib/utils.ts` -- cn() utility (KEEP)

**shadcn-vue UI components installed** (in `src/components/ui/`):
accordion, alert, alert-dialog, badge, button, card, checkbox, collapsible, dialog, drawer, dropdown-menu, input, label, number-field, popover, radio-group, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, stepper, switch, table, tabs, textarea, toggle, toggle-group, tooltip

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [x] task-023a: Scaffolding — page layout, editor store refactor, style/theme section, presets
- [x] task-023b: Flat Layout Editor — interactive segment editor for non-TUI modes
- [x] task-023c: TUI Layout Editor — interactive grid editor for TUI mode
- [x] task-023d: Preview Bridge — connect preview overlay to layout editor
- [x] task-023e: Export & Mock Data — bottom page sections

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Key decisions:**

- Segment config forms (13) are store-connected not prop-connected, so they can render inside popovers with zero changes. This is the linchpin of the redesign — the popover pattern works because the forms are already decoupled from their container.
- The ANSI preview is read-only for editing purposes — the interactive layout editor is a CSS-based replica, not an attempt to make the ANSI output interactive. Preview overlay just drives selection.
- TUI breakpoint ↔ terminal width sync is bidirectional: switching breakpoints sets the width, and manually adjusting width can change the active breakpoint.

**Related Tasks:**

- task-024-tui-breakpoint-reserved-space — breakpoints don't subtract reserved space
- task-025-tui-fitcontent-truncation — right-column segments truncated with ellipsis (both may be upstream bugs in claude-powerline)

<!-- NOTES:END -->
