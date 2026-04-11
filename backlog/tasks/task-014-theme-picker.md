---
id: task-014-theme-picker
title: Build theme picker with built-in theme grid, custom editor, and per-segment overrides
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
  - task-009
  - task-011
---

## Description

<!-- DESCRIPTION:BEGIN -->

Build the Theme configuration panel for Powerline Studio's sidebar. This panel lets users choose how their statusline looks color-wise. It has three distinct sections:

1. **Built-in theme grid** — A 2x3 grid of clickable cards showing all 6 themes (dark, light, nord, tokyo-night, rose-pine, gruvbox). Each card renders a mini-preview strip showing representative segment colors from that theme's `ColorTheme` data, so users can visually compare themes at a glance. Clicking a card selects that theme. The selected card gets a highlighted ring border.

2. **Custom theme editor** — When the user selects "Custom" (a 7th option), a full color editor appears below. It shows all 14 segment color pairs from the `ColorTheme` interface (directory, git, model, session, block, today, tmux, context, contextWarning, contextCritical, metrics, version, env, weekly). Each pair has a segment label, a background color picker, and a foreground color picker. Users build their own theme from scratch.

3. **Per-segment color overrides** — When any built-in theme is selected, a collapsible "Customize Colors" section appears below the grid. Users can override specific segment colors without switching to a fully custom theme. Each override row has a segment name, bg/fg pickers, and a reset button to revert to the theme default. Only overridden segments are stored in `colors.custom` on the config. This section is collapsed by default and shows a count badge when overrides are active.

All changes write to `useConfigStore` reactively and trigger immediate live preview updates in the terminal preview component.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Functional Requirements

- **FR-1:** Render a 2-column, 3-row grid of theme cards for the 6 canonical built-in themes (dark, light, nord, tokyo-night, rose-pine, gruvbox). Use an explicit `CANONICAL_THEMES` constant — do not iterate all 18 keys from `BUILT_IN_THEMES` (which includes ansi256/ansi variants).
- **FR-2:** Each theme card displays the theme name, and a mini-preview strip showing colored blocks for key segments (directory, git, model, session, context) using the canonical truecolor hex values. Cards always show truecolor regardless of the current `colorCompatibility` preview setting.
- **FR-3:** Clicking a theme card selects that built-in theme. Switching between built-in themes preserves any existing per-segment overrides.
- **FR-4:** The selected theme card shows a visual selection indicator (ring border + check icon).
- **FR-5:** A "Create Custom Theme" button below the grid switches to custom mode. This is visually distinct from the theme cards (not a 7th radio item) to keep the RadioGroup clean.
- **FR-6:** In custom mode, display an editable grid of all 14 segment color pairs (bg + fg) from the `ColorTheme` interface. Each row: segment label | bg color swatch+picker | fg color swatch+picker.
- **FR-7:** Studio uses its own internal `ThemeEditorState` — not raw `PowerlineConfig` — as its source of truth. The live preview and export use a materialized upstream-compatible config derived from internal state.
  - **FR-7a:** Built-in theme overrides are stored internally as `Partial<ColorTheme>`, not written directly to `PowerlineConfig.colors.custom`.
  - **FR-7b:** Live preview uses a computed `previewThemeConfig` that produces a valid upstream `PowerlineConfig` shape.
  - **FR-7c:** Switching built-in → custom clones the current effective colors (base theme + any overrides) into a custom draft.
  - **FR-7d:** Switching between built-in themes preserves the override map.
  - **FR-7e:** Switching custom → built-in shows a confirmation dialog only when the custom draft has diverged from its entry snapshot (deep inequality check).
  - **FR-7f:** Canceling a destructive switch leaves the current theme state unchanged.
- **FR-8:** In built-in theme mode, show a collapsible "Customize Colors" section (collapsed by default) for per-segment overrides.
- **FR-9:** Per-segment overrides are partial — only overridden segments are stored. Non-overridden segments use the base theme colors.
- **FR-10:** Each override row has a reset button (x icon) to revert that segment to the theme default color.
- **FR-11:** The "Customize Colors" header shows a badge count of active overrides (e.g., "Customize Colors (3)"). When the last override is reset, the override state is removed entirely (clean export).
- **FR-12:** All color changes (theme selection, custom colors, overrides) reactively update the live terminal preview via the materialized `previewThemeConfig`.

### Technical Requirements

- **TR-1:** Import `BUILT_IN_THEMES` and `ColorTheme` type from `@owloops/claude-powerline/browser` for theme data.
- **TR-2:** Color pickers use native `<input type="color">` wrapped in a styled swatch button that shows the current color. Clicking the swatch opens the native color picker.
- **TR-3:** Use shadcn-vue `Card` for theme cards, `Collapsible` (reka-ui) for the overrides section, `Button` for reset actions.
- **TR-4:** Theme cards use `RadioGroupRoot`/`RadioGroupItem` from reka-ui for accessible single-selection semantics with keyboard navigation.
- **TR-5:** Segment labels in the color editors are human-readable (e.g., "Context Warning" not "contextWarning").
- **TR-6:** Panel scrolls via shadcn-vue `ScrollArea` if content exceeds sidebar height.

### Animation Requirements

- **AN-1:** Theme card hover: subtle `scale(1.02)` + elevated shadow, 200ms ease-out. Active press: `scale(0.98)`, instant.
- **AN-2:** Selection change: ring border animates in with a 200ms spring transition.
- **AN-3:** Custom color editor section enters with fade+rise (opacity 0→1, y 8→0, 250ms ease-out).
- **AN-4:** Override section expand/collapse: height animation via reka-ui Collapsible with 200ms ease-out.
- **AN-5:** Color swatch changes: smooth background-color transition (150ms).
- **AN-6:** Respect `prefers-reduced-motion` — disable scale/translate, keep opacity transitions.

### Acceptance Criteria

- [ ] All 6 built-in themes render as cards with correct truecolor mini-preview colors
- [ ] Clicking a theme card selects it and updates the live preview
- [ ] Custom mode shows all 14 color pair editors and updates preview on each change
- [ ] Per-segment overrides work on any built-in theme and are stored as partial internal state
- [ ] Reset button reverts individual segment colors to theme defaults; resetting last override cleans up entirely
- [ ] Overrides persist when switching between built-in themes
- [ ] Switching built-in → custom clones effective colors (including overrides) into the custom draft
- [ ] Switching custom → built-in prompts only when the custom draft is dirty
- [ ] Live preview uses the materialized upstream-valid `previewThemeConfig`
- [ ] Keyboard navigation works across theme cards (arrow keys via RadioGroup)
- [ ] All animations follow the timing/easing spec and respect reduced motion

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

### Architecture

ThemePanel is a sidebar config panel rendered when the "Theme" sidebar nav item is active. It reads from and writes to `useConfigStore`'s `ThemeEditorState`. The panel is composed of three sub-components, each handling one section of the UI.

```
ThemePanel.vue
├── ThemeGrid.vue          — 2x3 grid of theme cards (RadioGroup) + "Create Custom Theme" button
│   └── ThemeCard.vue      — Individual card with mini-preview strip
├── CustomThemeEditor.vue  — Full 14-pair color editor (shown when mode='custom')
│   └── ColorPairRow.vue   — Single segment: label + bg picker + fg picker
└── ThemeOverrides.vue     — Collapsible per-segment override section (shown when mode='builtin')
    └── ColorPairRow.vue   — Reused: label + bg picker + fg picker + reset button
```

### Studio Theme State

The theme picker uses its own internal state model rather than directly mutating `PowerlineConfig`. This is necessary because upstream `PowerlineConfig.colors.custom` only supports a full `ColorTheme`, but Studio needs partial overrides for built-in themes. The internal state is materialized into a valid upstream config for live preview and export.

```ts
type CanonicalTheme = 'dark' | 'light' | 'nord' | 'tokyo-night' | 'rose-pine' | 'gruvbox'

const CANONICAL_THEMES: CanonicalTheme[] = [
	'dark',
	'light',
	'nord',
	'tokyo-night',
	'rose-pine',
	'gruvbox',
]

interface ThemeEditorState {
	mode: 'builtin' | 'custom'
	builtinTheme: CanonicalTheme // currently selected built-in theme
	overrides: Partial<ColorTheme> // per-segment overrides for built-in mode
	customDraft: ColorTheme | null // full custom theme being edited
	customSourceSnapshot: ColorTheme | null // snapshot at time of entering custom mode (for dirty check)
}
```

**Computed selectors:**

- `effectiveColors: ColorTheme` — when `mode === 'builtin'`: base theme merged with overrides. When `mode === 'custom'`: `customDraft`.
- `previewThemeConfig: Pick<PowerlineConfig, 'theme' | 'colors'>` — when built-in with no overrides: `{ theme: builtinTheme }`. Otherwise: `{ theme: 'custom', colors: { custom: effectiveColors } }`.
- `hasModifiedCustomDraft: boolean` — deep inequality between `customDraft` and `customSourceSnapshot`.

### Mode Switching Rules

| Transition          | Behavior                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Built-in → built-in | Change `builtinTheme`, preserve `overrides`, recompute `effectiveColors`. No confirmation.                                                                                            |
| Built-in → custom   | Set `customDraft = effectiveColors` (clones overrides into draft), set `customSourceSnapshot = effectiveColors`, switch `mode = 'custom'`. No confirmation.                           |
| Custom → built-in   | If `hasModifiedCustomDraft`, show confirmation dialog. On confirm: discard `customDraft` and `customSourceSnapshot`, switch to target built-in theme. On cancel: stay in custom mode. |
| Reset last override | Clear `overrides` entirely. `previewThemeConfig` drops the `colors` field.                                                                                                            |

### Key Files

| File                                                | Purpose                                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/components/studio/panels/ThemePanel.vue`       | Top-level panel, switches between custom editor and override sections based on theme mode              |
| `src/components/studio/theme/ThemeGrid.vue`         | 2x3 card grid wrapped in reka-ui `RadioGroupRoot` for accessible selection                             |
| `src/components/studio/theme/ThemeCard.vue`         | Single theme card: name, mini-preview color strip, selection ring. Uses `RadioGroupItem`               |
| `src/components/studio/theme/CustomThemeEditor.vue` | Grid of 14 `ColorPairRow` components for fully custom theme editing                                    |
| `src/components/studio/theme/ThemeOverrides.vue`    | Collapsible section with per-segment override rows, badge count, collapse toggle                       |
| `src/components/studio/theme/ColorPairRow.vue`      | Reusable row: segment label, bg color swatch+picker, fg color swatch+picker, optional reset button     |
| `src/components/studio/theme/ColorSwatch.vue`       | Color swatch button wrapping native `<input type="color">`. Shows current color, opens picker on click |

### Component Contracts

**ThemePanel.vue** (no props — reads from useConfigStore directly)

- Reads `themeEditorState` from store
- Conditionally renders `CustomThemeEditor` (when `mode === 'custom'`) or `ThemeOverrides` (when `mode === 'builtin'`)
- Handles confirmation dialog for destructive custom → built-in switch

**ThemeGrid.vue**

- Props: `selectedTheme: CanonicalTheme`, `mode: 'builtin' | 'custom'`
- Emits: `select:theme(themeName: CanonicalTheme)`, `enter:custom()`
- Wraps cards in `RadioGroupRoot` with `v-model` bound to selected theme
- Iterates over the explicit `CANONICAL_THEMES` array (6 entries)
- "Create Custom Theme" button below the grid, visually distinct from theme cards

**ThemeCard.vue**

- Props: `themeName: string`, `theme: ColorTheme`, `selected: boolean`
- Wraps content in `RadioGroupItem` with `value={themeName}`
- Mini-preview: horizontal strip of 5 colored rectangles showing directory, git, model, session, context bg colors
- Selection state: ring-2 ring-primary border + check icon overlay

**CustomThemeEditor.vue**

- Props: `colors: ColorTheme`
- Emits: `update:colors(colors: ColorTheme)`
- Renders 14 `ColorPairRow` instances, one per `ColorTheme` key
- Section header "Custom Theme"

**ThemeOverrides.vue**

- Props: `baseTheme: ColorTheme`, `overrides: Partial<ColorTheme>`
- Emits: `update:overrides(overrides: Partial<ColorTheme>)`, `reset:segment(key: keyof ColorTheme)`
- Wrapped in reka-ui `CollapsibleRoot` + `CollapsibleTrigger` + `CollapsibleContent`
- Badge shows count of non-empty override keys
- Each row shows a `ColorPairRow` with current effective color (override or base) and a reset button

**ColorPairRow.vue**

- Props: `label: string`, `bg: string`, `fg: string`, `showReset?: boolean`, `isOverridden?: boolean`
- Emits: `update:bg(color: string)`, `update:fg(color: string)`, `reset()`
- Layout: `grid grid-cols-[1fr_auto_auto_auto]` — label | bg swatch | fg swatch | reset button (optional)

**ColorSwatch.vue**

- Props: `color: string` (hex), `label: string` (for aria-label)
- Emits: `update:color(hex: string)`
- Renders a 24x24 rounded button showing the color, with a hidden `<input type="color">` that opens on click
- Smooth 150ms background-color transition on change

### Data Flow

```
useConfigStore.themeEditorState (internal)
  ├── mode: 'builtin' | 'custom'
  ├── builtinTheme: CanonicalTheme
  ├── overrides: Partial<ColorTheme>
  ├── customDraft: ColorTheme | null
  ├── customSourceSnapshot: ColorTheme | null
  │
  Computed:
  ├── effectiveColors: ColorTheme          (base + overrides or customDraft)
  ├── previewThemeConfig: { theme, colors } (upstream-valid for preview/export)
  ├── hasModifiedCustomDraft: boolean       (dirty check)
  │
  ThemePanel reads store, passes to children
  │
  ├── ThemeGrid → user clicks card → emits theme name → store.selectBuiltInTheme(name)
  │             → user clicks "Create Custom" → store.enterCustomTheme()
  ├── CustomThemeEditor → user changes color → store.updateCustomColor(segment, color)
  └── ThemeOverrides → user changes override → store.setColorOverride(segment, color)
                      → user resets segment → store.resetSegmentOverride(key)
```

### Store Methods Required (in useConfigStore, from task-009)

- `selectBuiltInTheme(theme: CanonicalTheme)` — changes built-in theme, preserves overrides. If in custom mode with dirty draft, caller must confirm first.
- `enterCustomTheme()` — clones `effectiveColors` into `customDraft` and `customSourceSnapshot`, sets `mode = 'custom'`
- `updateCustomColor(segment: keyof ColorTheme, color: SegmentColor)` — updates single segment in `customDraft`
- `setColorOverride(segment: keyof ColorTheme, color: SegmentColor)` — sets single segment override for built-in mode
- `resetSegmentOverride(segment: keyof ColorTheme)` — removes single override; clears `overrides` entirely when last one is removed
- `effectiveColors` (computed) — merges base theme + overrides (builtin) or returns `customDraft` (custom)
- `previewThemeConfig` (computed) — materializes upstream-valid `{ theme, colors }` for live preview
- `hasModifiedCustomDraft` (computed) — deep inequality between `customDraft` and `customSourceSnapshot`

### Segment Label Map

```ts
const SEGMENT_LABELS: Record<keyof ColorTheme, string> = {
	directory: 'Directory',
	git: 'Git',
	model: 'Model',
	session: 'Session',
	block: 'Block',
	today: 'Today',
	tmux: 'Tmux',
	context: 'Context',
	contextWarning: 'Context Warning',
	contextCritical: 'Context Critical',
	metrics: 'Metrics',
	version: 'Version',
	env: 'Environment',
	weekly: 'Weekly',
}
```

### shadcn-vue / reka-ui Components Used

| Component                                                     | Source                                                 | Usage                             |
| ------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------- |
| `Card`, `CardHeader`, `CardContent`                           | shadcn-vue (already installed)                         | Theme card wrapper                |
| `RadioGroupRoot`, `RadioGroupItem`                            | reka-ui (already installed via shadcn-vue radio-group) | Accessible theme selection        |
| `CollapsibleRoot`, `CollapsibleTrigger`, `CollapsibleContent` | reka-ui (direct import)                                | Override section expand/collapse  |
| `Button`                                                      | shadcn-vue (already installed)                         | Reset buttons, custom mode toggle |
| `ScrollArea`                                                  | shadcn-vue (already installed)                         | Panel scroll if content overflows |
| `Separator`                                                   | shadcn-vue (already installed)                         | Between grid and editor sections  |

**New components to install:**

- `Collapsible` — shadcn-vue wrapper around reka-ui Collapsible for override section. Install: `pnpm dlx shadcn-vue@latest add collapsible`.
- `AlertDialog` — for confirmation dialog on destructive custom → built-in switch. Install: `pnpm dlx shadcn-vue@latest add alert-dialog` (check if already installed first).

### Animation Implementation

**Theme card hover/press (Motion for Vue):**

```vue
<motion.div
  :whileHover="{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }"
  :whileTap="{ scale: 0.98 }"
  :transition="{ type: 'spring', stiffness: 400, damping: 25 }"
>
```

**Selection ring (CSS transition):**

```css
.theme-card {
	transition:
		box-shadow 200ms ease-out,
		border-color 200ms ease-out;
}
.theme-card[data-state='checked'] {
	@apply ring-2 ring-primary;
}
```

**Custom editor entrance (Motion for Vue):**

```vue
<AnimatePresence>
  <motion.div
    v-if="isCustomMode"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :exit="{ opacity: 0, y: 4 }"
    :transition="{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }"
  />
</AnimatePresence>
```

**Override collapsible (reka-ui Collapsible + CSS):**

```css
[data-state='open'] .collapsible-content {
	animation: slideDown 200ms ease-out;
}
[data-state='closed'] .collapsible-content {
	animation: slideUp 150ms ease-out;
}
```

**Color swatch transition (CSS):**

```css
.color-swatch {
	transition: background-color 150ms ease-out;
}
```

**Reduced motion:**

```css
@media (prefers-reduced-motion: reduce) {
	.theme-card {
		transition: none;
	}
	.color-swatch {
		transition: opacity 0.01ms;
	}
}
```

### Dependencies

**Task dependencies:** task-009 (Pinia stores — provides useConfigStore), task-011 (terminal preview — live preview updates)
**Skills used during implementation:** shadcn-vue, reka-ui, ux-design, animations, motion, vue-best-practices

### Context Manifest

| Source          | Path                                                                               | Why Needed                                                                                  |
| --------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| ColorTheme type | `claude-powerline/src/themes/index.ts`                                             | `ColorTheme` interface (14 segment color pairs), `BUILT_IN_THEMES` map, `SegmentColor` type |
| Theme data      | `claude-powerline/src/themes/{dark,light,nord,tokyo-night,rose-pine,gruvbox}.ts`   | Actual hex color values for mini-preview rendering                                          |
| Config types    | `claude-powerline/src/config/loader.ts`                                            | `PowerlineConfig` interface — `theme` field, `colors.custom` structure                      |
| Store           | `src/stores/` (from task-009)                                                      | `useConfigStore` — read/write config, reactive theme state                                  |
| Existing UI     | `src/components/ui/card/`, `radio-group/`, `button/`, `scroll-area/`, `separator/` | shadcn-vue components already installed                                                     |

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Install shadcn-vue Collapsible wrapper via `pnpm dlx shadcn-vue@latest add collapsible`
- [ ] Define `CANONICAL_THEMES` constant and `CanonicalTheme` type in a shared location (e.g., `src/lib/themes.ts`)
- [ ] Add `ThemeEditorState` interface and state to `useConfigStore`: `mode`, `builtinTheme`, `overrides`, `customDraft`, `customSourceSnapshot`
- [ ] Add store methods: `selectBuiltInTheme()`, `enterCustomTheme()`, `updateCustomColor()`, `setColorOverride()`, `resetSegmentOverride()`
- [ ] Add store computeds: `effectiveColors`, `previewThemeConfig`, `hasModifiedCustomDraft`
- [ ] Create `ColorSwatch.vue` — styled button wrapping native `<input type="color">` with smooth 150ms color transition
- [ ] Create `ColorPairRow.vue` — reusable row with label, bg swatch, fg swatch, optional reset button
- [ ] Create `ThemeCard.vue` — individual theme card with name, mini-preview strip (5 colored blocks from truecolor theme data), selection ring, wrapped in `RadioGroupItem`
- [ ] Create `ThemeGrid.vue` — 2x3 grid of ThemeCards wrapped in `RadioGroupRoot` + "Create Custom Theme" button below
- [ ] Create `CustomThemeEditor.vue` — scrollable list of 14 ColorPairRow instances for full custom theme editing, with fade+rise entrance animation
- [ ] Create `ThemeOverrides.vue` — collapsible section (via shadcn-vue Collapsible) with override rows, badge count, reset buttons, height animation
- [ ] Create `ThemePanel.vue` — top-level panel composing ThemeGrid + conditional CustomThemeEditor/ThemeOverrides, connected to useConfigStore
- [ ] Add confirmation dialog for destructive custom → built-in switch (uses shadcn-vue AlertDialog)
- [ ] Add Motion for Vue hover/tap animations to ThemeCard
- [ ] Add `prefers-reduced-motion` handling for all animations
- [ ] Verify keyboard navigation works across theme grid (arrow keys, enter to select)
- [ ] Test mode switching: built-in↔built-in preserves overrides, built-in→custom clones effective colors, custom→built-in prompts on dirty draft
- [ ] Test live preview updates on theme selection, custom color edits, and segment overrides
- [ ] Test cleanup: resetting last override removes override state entirely

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

[Implementation decisions, issues encountered, important discoveries during implementation]

<!-- NOTES:END -->
