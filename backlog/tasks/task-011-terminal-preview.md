---
id: task-011-terminal-preview
title: Build terminal preview component with ANSI-to-HTML display
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
  - task-010
---

## Description

<!-- DESCRIPTION:BEGIN -->

Build the hero component of Powerline Studio: a terminal preview that shows users exactly how their claude-powerline statusline will look in a real terminal. The component reads pre-rendered HTML from the preview store (produced by the rendering service in task-010) and displays it inside a styled terminal window chrome — complete with a macOS-style title bar with colored traffic-light dots, a dark background, rounded corners, and a Nerd Font for pixel-perfect powerline symbol rendering.

The terminal preview is the visual centerpiece of the entire application. Every config change the user makes (theme, style, segments, layout) is reflected here in real-time. The component itself is purely presentational — it reads from the store and renders, with no config mutation logic of its own.

Key behaviors:

1. Renders HTML from `usePreviewStore().htmlOutput` via `v-html` inside a monospace `<pre>` element
2. Terminal window chrome: macOS-style title bar with red/yellow/green dots, static window title
3. Uses the Nerd Font configured in task-008 for powerline/capsule separator symbols
4. Supports dark and light terminal backgrounds (toggled via preview store state)
5. Scrolls horizontally when rendered output exceeds the container width (monospace content must not wrap)
6. Displays terminal width indicator showing the current column count
7. Adapts to the page layout — fills available width within the studio layout from task-008

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Component API

- **Component:** `TerminalPreview.vue` in `src/components/studio/`
- **Props:** None — reads all state from Pinia stores
- **Emits:** None — purely presentational
- **Store dependencies:**
  - `usePreviewStore()` — reads `htmlOutput` (rendered HTML string), `terminalWidth` (number), `darkBackground` (boolean)

### Rendering

- Render `previewStore.htmlOutput` via `v-html` inside a `<pre>` element
- The `<pre>` element must use the Nerd Font family configured in task-008 as its `font-family`
- Font size: `14px` (standard terminal size), line-height `1` (`leading-none`) — tight line-height is critical for TUI box-drawing characters (`│`, `┌`, `└`) to connect seamlessly without visible vertical gaps
- The `<pre>` must have `white-space: pre` (no wrapping) — horizontal scrolling handles overflow
- HTML from ansi_up contains `<span>` elements with inline `style` attributes for ANSI colors — these must render correctly against both dark and light backgrounds

### Terminal Window Chrome

- **Title bar:** 36px height bar at the top of the terminal window
  - Three traffic-light dots (12px circles): red (`#FF5F56`), yellow (`#FFBD2E`), green (`#27C93F`) — positioned left with 8px gaps
  - Window title text centered in the title bar: show `"powerline-studio — bash"` or similar context text in `text-muted-foreground` / `text-xs`
  - Title bar background: slightly lighter/darker than terminal body (use `bg-muted` or a custom shade)
  - Bottom border separating title bar from terminal body: `border-border` or subtle `1px` line
- **Terminal body:** the `<pre>` rendering area
  - Dark background mode: `#1e1e2e` (Catppuccin Mocha base) or `#0d1117` (GitHub Dark) — use a CSS variable `--terminal-bg`
  - Light background mode: `#fafafa` or `#f5f5f5` — toggled via `previewStore.darkBackground`
  - Text color adapts accordingly (handled by ansi_up inline styles, but default text needs a base: `#c9d1d9` dark / `#24292f` light)
  - Padding: `16px` horizontal, `12px` vertical inside the `<pre>`
- **Container:** rounded corners `rounded-xl`, border `border-border`, shadow `shadow-lg` for depth
- **Overall:** the terminal chrome should visually resemble a macOS Terminal.app or iTerm2 window

### Background Toggle

- Read `previewStore.darkBackground` (boolean) to switch between dark/light terminal body styles
- Apply the background color to the `<pre>` container via a reactive class or inline style binding
- The title bar style should remain consistent regardless of background toggle (it represents the window chrome, not the terminal content)

### Terminal Width Indicator

- Display the current `previewStore.terminalWidth` value (e.g., "80 cols") as a small badge or label
- Position: top-right corner of the terminal chrome, inside or overlapping the title bar
- Use shadcn-vue `Badge` component with `variant="secondary"` or a custom muted style
- Format: `"{width} cols"` (e.g., "80 cols", "120 cols")

### Horizontal Scrolling

- The terminal body area must scroll horizontally when content width exceeds container width
- Use shadcn-vue `ScrollArea` wrapping the `<pre>` element, with an explicit `<ScrollBar orientation="horizontal" />` added (the default `ScrollArea` only renders a vertical scrollbar)
- The `<pre>` must use `min-w-max` or equivalent to size to its content and trigger horizontal overflow reliably
- The scrollbar should be styled subtly (thin, matching terminal aesthetic)
- Vertical scrolling: not needed for single-line/few-line powerline output, but allow it for TUI style which can produce multi-row output (keep the default vertical `ScrollBar` as well)
- The `ScrollArea` must have a `max-h` constraint (e.g., `max-h-[600px]`) so vertical scrolling actually triggers for tall TUI output — without a constrained height, the ScrollArea simply grows and pushes the page layout down

### Empty State & Stability

- When `previewStore.htmlOutput` is empty (before first render or during re-render), show a muted placeholder text: `"Preview will appear here..."` in `text-muted-foreground text-sm italic`
- The terminal body area must have a stable `min-h-[3rem]` to prevent layout collapse when content is empty or transitioning
- No skeleton/loading state needed — the rendering is synchronous once the store is populated

### Responsive Behavior

- The terminal preview fills the available width of its parent container
- Minimum width: none — scroll handles overflow
- The component should look good from 400px to full desktop width
- No max-width constraint on the outer container (parent layout controls this)

### Accessibility

- The `<pre>` element should have `role="img"` and `aria-label="Terminal preview of powerline statusline"` since the HTML content is decorative/visual
- Traffic-light dots are decorative — use `aria-hidden="true"`
- Terminal width badge should be readable by screen readers

### Acceptance Criteria

1. Component renders HTML from `usePreviewStore().htmlOutput` correctly with ANSI-colored spans visible
2. Terminal chrome has macOS-style title bar with three colored dots
3. Nerd Font is applied and powerline symbols (,, etc.) render correctly
4. Dark background is the default; light background applies when toggled
5. Content scrolls horizontally when wider than container
6. Terminal width badge shows current column count
7. No layout shift or flash when HTML content updates reactively
8. Component has zero business logic — purely reads store and renders

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**

Single standalone Vue SFC that is purely presentational. It reads reactive state from Pinia stores and renders — no mutations, no business logic. The component is composed of three visual layers:

1. **Outer container** — the terminal window frame (rounded corners, border, shadow)
2. **Title bar** — macOS-style chrome with traffic-light dots and centered title text
3. **Terminal body** — `ScrollArea` wrapping a `<pre>` with `v-html` for the rendered output

```
┌─────────────────────────────────────────────────────┐
│ ● ● ●    powerline-studio — bash        [80 cols]  │ ← Title bar
├─────────────────────────────────────────────────────┤
│                                                     │
│  ~/project  main ✓  ◆ Sonnet 4  $2.85  42%       │ ← <pre v-html>
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Component Structure:**

```vue
<script setup lang="ts">
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

// Read from stores (auto-imported)
const previewStore = usePreviewStore()
// Computed for reactive background class
const terminalClasses = computed(() =>
	previewStore.darkBackground
		? 'bg-terminal-dark text-terminal-dark-fg'
		: 'bg-terminal-light text-terminal-light-fg',
)
</script>

<template>
	<div class="rounded-xl border border-border shadow-lg overflow-hidden">
		<!-- Title Bar -->
		<div class="flex items-center h-9 px-4 bg-muted border-b border-border">
			<div class="flex gap-2" aria-hidden="true">
				<span class="size-3 rounded-full bg-[#FF5F56]" />
				<span class="size-3 rounded-full bg-[#FFBD2E]" />
				<span class="size-3 rounded-full bg-[#27C93F]" />
			</div>
			<span class="flex-1 text-center text-xs text-muted-foreground">
				powerline-studio — bash
			</span>
			<Badge variant="secondary">{{ previewStore.terminalWidth }} cols</Badge>
		</div>
		<!-- Terminal Body -->
		<ScrollArea class="min-h-[3rem] max-h-[600px]">
			<pre
				v-if="previewStore.htmlOutput"
				v-html="previewStore.htmlOutput"
				class="min-w-max font-nerd text-sm leading-none whitespace-pre px-4 py-3"
				:class="terminalClasses"
				role="img"
				aria-label="Terminal preview of powerline statusline"
			/>
			<p v-else class="px-4 py-3 text-sm italic text-muted-foreground" :class="terminalClasses">
				Preview will appear here...
			</p>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	</div>
</template>
```

**Styling Approach:**

- All styling via Tailwind CSS 4 utility classes
- Terminal colors registered as first-class Tailwind colors in `src/assets/main.css` under `@theme inline`:
  ```css
  @theme inline {
  	--color-terminal-dark: #1e1e2e;
  	--color-terminal-dark-fg: #cdd6f4;
  	--color-terminal-light: #fafafa;
  	--color-terminal-light-fg: #24292f;
  }
  ```
  This enables standard Tailwind classes (`bg-terminal-dark`, `text-terminal-dark-fg`) instead of arbitrary bracket notation
- The Nerd Font family from task-008 applied via a Tailwind `font-nerd` utility (defined in `@theme` block in main.css) or inline `font-family` style
- Traffic-light dot colors are hardcoded hex values (standard macOS chrome, not theme-dependent)

**Store Integration:**

- `usePreviewStore().htmlOutput` — the rendered HTML string (reactive, updates on config/mock changes via task-010)
- `usePreviewStore().terminalWidth` — number, displayed in the badge
- `usePreviewStore().darkBackground` — boolean, toggles terminal body colors
- Only `usePreviewStore` is used — no dependency on `useEditorStore` or `useConfigStore`
- Stores are auto-imported; no explicit import needed

**Existing Components Used:**

- `ScrollArea` / `ScrollBar` from `src/components/ui/scroll-area/` — wraps the terminal body for horizontal overflow
- `Badge` from `src/components/ui/badge/` — displays terminal width indicator

**Key Files:**

- `src/components/studio/TerminalPreview.vue` — the terminal preview component (NEW)
- `src/stores/preview.ts` — usePreviewStore (from task-009, read-only dependency)
- `src/assets/main.css` — may need `--font-nerd` added to `@theme` block if task-008 doesn't add it

**Patterns to Follow:**

- Vue SFC with `<script setup lang="ts">` — Composition API only
- No `const props =` since component has no props
- Tailwind CSS 4 for all styling — no inline styles except the dynamic background binding
- `computed()` for derived reactive values (background classes)
- `cn()` from `@/lib/utils` for conditional class merging if needed
- `shallowRef` not needed here — no local component state beyond store reads

**Dependencies:**

- **Tasks:** task-010 (rendering service provides HTML), task-008 (Nerd Font setup), task-009 (Pinia stores)
- **External packages:** None new — uses existing shadcn-vue components (ScrollArea, Badge)
- **Skills:** vue, vue-best-practices, shadcn-vue, web-design-guidelines

**Scope Boundaries:**

- IN SCOPE: Terminal chrome, HTML rendering, background toggle, width badge, horizontal scroll
- OUT OF SCOPE: Preview controls UI (task-012), segment hitbox overlays (task-013), any config mutation logic
- The dark/light toggle button itself is NOT part of this component — it lives in the preview controls (task-012). This component only reads the state and renders accordingly.

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Create `src/components/studio/TerminalPreview.vue` SFC with `<script setup lang="ts">`
- [ ] Add terminal window outer container with `rounded-xl`, `border-border`, `shadow-lg`, `overflow-hidden`
- [ ] Build title bar: 36px height, `bg-muted`, `border-b border-border`, flex layout
- [ ] Add traffic-light dots in title bar: three 12px circles (red `#FF5F56`, yellow `#FFBD2E`, green `#27C93F`), `aria-hidden="true"`
- [ ] Add centered title text in title bar: `"powerline-studio — bash"` in `text-xs text-muted-foreground`
- [ ] Add terminal width badge in title bar (top-right): shadcn-vue `Badge` showing `"{width} cols"` from `previewStore.terminalWidth`
- [ ] Add terminal body area: `ScrollArea` wrapping a `<pre>` element with `v-html="previewStore.htmlOutput"`
- [ ] Apply Nerd Font family to the `<pre>` element (use `font-nerd` utility or inline `font-family`)
- [ ] Set `<pre>` typography: `text-sm`, `leading-none` (line-height: 1 for TUI box-drawing), `whitespace-pre`
- [ ] Add padding to `<pre>`: `px-4 py-3` (16px horizontal, 12px vertical)
- [ ] Register terminal colors in `main.css` `@theme inline` block: `--color-terminal-dark`, `--color-terminal-dark-fg`, `--color-terminal-light`, `--color-terminal-light-fg`
- [ ] Implement reactive dark/light background: `computed()` reading `previewStore.darkBackground`, applying `bg-terminal-dark`/`bg-terminal-light` Tailwind classes
- [ ] Set terminal default text color to match background mode (dark: `#cdd6f4`, light: `#24292f`)
- [ ] Configure `ScrollArea` with explicit `<ScrollBar orientation="horizontal" />` for horizontal scrolling; keep default vertical scrollbar for TUI multi-row output; add `max-h-[600px]` so vertical scroll triggers for tall TUI output
- [ ] Ensure `<pre>` uses `min-w-max` to size to content and trigger horizontal overflow
- [ ] Add empty state: when `htmlOutput` is empty, show placeholder text with `min-h-[3rem]` on ScrollArea to prevent layout collapse
- [ ] Add accessibility: `role="img"` and `aria-label` on `<pre>`, `aria-hidden` on decorative elements
- [ ] Verify component renders correctly with sample HTML containing ANSI-colored `<span>` elements
- [ ] Verify Nerd Font powerline symbols render correctly in the preview
- [ ] Verify horizontal scroll activates when content exceeds container width

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Implementation Decisions:**

- Terminal background colors use Catppuccin Mocha palette (`#1e1e2e` base) for dark mode — matches the aesthetic of popular terminal themes and looks premium
- Traffic-light dots use exact macOS colors, not theme variables — they represent OS chrome, not app theming
- ScrollArea from shadcn-vue preferred over native `overflow-x: auto` for consistent cross-browser styling and visual polish
- Component has zero props and zero emits — entirely store-driven to keep the interface clean and avoid prop-drilling from the studio page layout
- The `v-html` directive is safe here because the HTML source is `ansi_up.ansi_to_html()` which only produces `<span style="...">` elements — no user-supplied HTML

**Cross-Task Drift (from review):**

- Store field name is `htmlOutput` (per task-009), not `html` — this task has been corrected to use `htmlOutput`
- Sidebar panel key naming drifts between tasks: task-008 uses `'tui-layout' | 'mock-data'`, task-009 uses `'tui' | 'mockData'` — does not affect this task (no panel key dependency) but should be normalized in task-009
- `charset` ownership is contradictory between task-009 (derived computed from config store) and task-012 (writable v-model on preview store) — does not affect this task but needs resolution before task-012

**Scope Note:**

- The toggle button for dark/light background belongs to task-012 (preview controls), not this component
- Segment click hitbox overlays belong to task-013 — they layer on top of this component but are a separate concern
- This component should be usable standalone for testing with hardcoded HTML before task-010 is complete

**Related Tasks:**

- task-008-page-layout — provides the Nerd Font and the layout container this component sits in
- task-009-pinia-stores — provides usePreviewStore with `htmlOutput`, `terminalWidth`, `darkBackground`
- task-010-rendering-service — provides the reactive HTML output via useRenderer composable
- task-012-preview-controls — adds the UI controls (width slider, background toggle, color mode) that modify preview store state
- task-013-segment-hitboxes — overlays clickable div elements on top of this component's rendered output

<!-- NOTES:END -->
