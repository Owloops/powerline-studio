---
id: task-026b-compact-controls
title: 'Compact preset and style/theme selects with inline previews'
status: 'To Do'
created_date: '2026-04-12 14:35'
updated_date: '2026-04-12 14:35'
parent: task-026-ui-polish-v2
subtasks:
dependencies:
  - task-026a-page-shell
---

## Description

Replace the card-grid presets section and the style/theme card grids with compact select dropdowns and buttons. Presets become two buttons — [Choose Preset] opens a grouped Select, [Import Config] opens the existing import dialog. Style and Theme become two Select dropdowns with inline visual previews in the options.

## Specification

1. **Presets section**: Replace the two 3-column card grids with a compact row containing two buttons:
   - **[Choose Preset]** — opens a `Select` dropdown with two option groups:
     - "Statusline Mode" group: Compact, Standard, Full (applies flat preset)
     - "TUI Mode" group: Compact, Standard, Full (applies TUI preset)
     - Values must be namespaced to avoid ID collision: `flat:compact`, `flat:standard`, `flat:full`, `tui:compact`, `tui:standard`, `tui:full` — both flat and TUI presets share the same `compact`/`standard`/`full` IDs in their respective arrays
     - On select: parse the namespace prefix, find the preset object in `FLAT_PRESETS` or `TUI_PRESETS`, and call `configStore.applyFlatPreset(preset)` or `configStore.applyTuiPreset(preset)` accordingly (the store methods take the full preset object, not an ID)
   - **[Import Config]** — opens the existing import dialog (already implemented)
   - The entire presets section should be one compact row, not a large card area
   - The preset Select trigger is an **action trigger** — it always shows "Choose Preset" as a static placeholder (never reflects a "selected" preset). Presets are one-shot mutations; the store does not track an active preset, and showing a stale preset name after the user customizes config would be misleading. After applying a preset, reset the select value to `undefined`/empty so the placeholder re-appears.

2. **Style select**: Replace `RadioGroupRoot` with 4 `StyleCard` options with a `Select` dropdown. Each select option shows the style name with an inline mini-preview (the same visual preview currently in StyleCard — arrow glyphs for powerline, rounded caps for capsule, etc.). The select trigger shows the currently selected style with its preview.

3. **Theme select**: Replace `ThemeGrid` with a `Select` dropdown for **built-in themes**. Each option shows the theme name with a compact color strip inline — a horizontal row of small colored rectangles for the main palette segments (directory, git, model, session, context), using only the `bg` color from each segment. This is a simplified version of the full ThemeCard palette strip, not a direct reuse. The trigger shows the selected theme name with the same compact strip.
   - **Custom theme state**: When `themeEditor.mode === 'custom'`, the select trigger should display "Custom Theme" with the effective custom draft swatches (from `themeEditor.customDraft`). The select value should be empty/unset so no built-in theme appears selected.
   - **Override indicator**: When built-in mode has overrides (`overrideCount > 0`), show a small "(modified)" badge or indicator next to the theme name in the trigger to signal the effective colors differ from the canonical theme.

4. **Saved custom themes**: The current `ThemeGrid` renders saved custom themes with load/delete actions (`load:saved`, `delete:saved` events). This functionality must be preserved. Below the built-in theme select, render saved custom themes as a small list or secondary section with load and delete actions. This can be a simple list of `<Button variant="ghost">` items with a delete icon, similar to the current layout but more compact.

5. **Theme editor buttons**: Below the Style and Theme selects, show two buttons:
   - "Customize Theme" (visible when a built-in theme is selected — opens the existing `ThemeOverrides` editor inline)
   - "Create Custom Theme" (opens the existing `CustomThemeEditor` inline, same expand/collapse as today)
   - These are inline expand/collapse of the existing components, not modal/popover — same pattern as current implementation
   - Padding and auto-wrap controls also remain below for non-TUI modes

### Acceptance Criteria

- Presets section is a single compact row with two buttons
- Preset select always shows "Choose Preset" placeholder (never retains a selected value)
- Style selection is a Select dropdown with visual previews per option
- Theme selection is a Select dropdown with color swatches per option
- Saved custom themes remain loadable and deletable from the theme section
- Custom theme mode is clearly represented in the theme select trigger
- All preset, style, and theme functionality still works (no feature loss)
- Theme customization editors are accessible via buttons below the selects

## Design

### Key Files

- `src/components/studio/sections/PresetSection.vue` — replace card grids with button row + Select
- `src/components/studio/sections/StyleThemeSection.vue` — replace RadioGroup/ThemeGrid with Select dropdowns
- `src/components/studio/StyleCard.vue` — reuse its visual preview logic for select option rendering (or inline it)

### Approach

- Use `Select` / `SelectTrigger` / `SelectContent` / `SelectGroup` / `SelectLabel` / `SelectItem` from shadcn-vue for all dropdowns. Custom option rendering using slots.
- **Important: Use `position="popper"` on `SelectContent`** for all three selects (preset, style, theme). The default `position="item-aligned"` clips horizontal overflow and doesn't handle rich custom content well. The existing `PreviewControls.vue` already uses `position="popper"` for all its selects — follow that pattern. Add `side="bottom"` for consistent placement.
- Style select options: each item renders the mini Nerd Font preview from StyleCard inline (the dark preview strip with powerline arrows, capsule caps, etc.)
- Theme select options: each item renders theme name + a compact horizontal strip of 5 colored rectangles (directory, git, model, session, context bg colors). This is a new simplified representation, not a direct reuse of ThemeCard's full palette.
- The Select trigger width should be flexible — `w-full` for style and theme selects within their layout column
- Preset select: use `SelectGroup` with `SelectLabel` for "Statusline Mode" and "TUI Mode" groups. Use namespaced values (`flat:compact`, `tui:standard`, etc.) to disambiguate identical preset IDs.
- On preset select: parse the value prefix to determine flat vs TUI, find the preset object in the corresponding array, call `configStore.applyFlatPreset(preset)` or `configStore.applyTuiPreset(preset)` with the full preset object, then reset the select value to show the placeholder again.

## TODO

- [ ] Rewrite PresetSection: replace card grids with [Choose Preset] select + [Import Config] button row
- [ ] Build grouped Select for presets with namespaced values (`flat:compact`, `tui:standard`, etc.)
- [ ] Implement preset select as action trigger — reset value after applying, always show placeholder
- [ ] Rewrite StyleThemeSection: replace RadioGroup style cards with Style Select
- [ ] Build Style Select options with inline mini-previews (Nerd Font glyphs)
- [ ] Replace ThemeGrid with Theme Select dropdown (use `position="popper"`)
- [ ] Build Theme Select options with compact 5-color palette strip
- [ ] Handle custom theme state in trigger (show "Custom Theme" + draft swatches)
- [ ] Add override indicator ("modified" badge) when built-in theme has overrides
- [ ] Preserve saved custom themes section with load/delete actions below theme select
- [ ] Add "Customize Theme" and "Create Custom Theme" buttons below selects (inline expand/collapse)
- [ ] Keep padding/auto-wrap controls for non-TUI modes
- [ ] Verify all preset/style/theme functionality works end-to-end (including saved themes)
