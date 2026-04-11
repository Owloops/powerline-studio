---
id: task-023a-scaffolding
title: 'Scaffolding: single-page layout, editor store refactor, style/theme/preset sections'
status: 'To Do'
created_date: '2026-04-11 23:10'
updated_date: '2026-04-11 23:10'
parent: task-023-redesign-studio-ui
subtasks:
dependencies:
---

## Description

Remove the sidebar navigation and rewrite the page as a single vertical flow. Collapse preview controls behind a toggle. Refactor the editor store to remove panel-switching state. Create the Style/Theme inline section and Preset section.

## Specification

- Remove StudioSidebar.vue and SidebarProvider layout from (home).vue
- Replace with vertical section flow: Preview → PreviewControls (collapsible) → PresetSection → StyleThemeSection → [layout editor slot] → [export/mock slot]
- Redesign StudioTopBar as StudioHeader (logo, dark mode toggle, preview controls toggle button)
- PreviewControls: add a collapse/expand toggle, hidden by default
- Editor store: remove `activePanel`, `SidebarPanel` type, panel-switching watchers. Add `focusedSegment` ref and `scrollToSegment()` action for later subtasks to use.
- Remove `StudioPanel` and `SidebarNavItem` types from types/studio.ts
- StyleThemeSection: render style cards (flex row), theme grid (flex row), padding/autowrap controls, and TUI info alert inline — extract from current AppearancePanel.vue
- PresetSection: show TUI presets (already exist) and flat-mode segment presets (new — define 2-3 flat presets), plus an "Import Config" button

## Design

### Key Files

- `src/pages/(home).vue` — complete rewrite of template (keep script logic for useRenderer, stores)
- `src/stores/editor.ts` — remove panel nav, add focusedSegment/scrollToSegment
- `src/types/studio.ts` — remove StudioPanel, SidebarNavItem
- `src/components/studio/StudioSidebar.vue` — DELETE
- `src/components/studio/StudioTopBar.vue` — rewrite as StudioHeader.vue
- `src/components/studio/PreviewControls.vue` — add collapsible wrapper
- NEW `src/components/studio/sections/PresetSection.vue`
- NEW `src/components/studio/sections/StyleThemeSection.vue`

### Approach

- Keep existing AppearancePanel content but decompose it into StyleThemeSection (style cards, theme grid, overrides, custom editor) with no ScrollArea wrapper
- PresetSection shows cards for both TUI and flat presets. TUI presets already exist in tuiPresets.ts. Create 2-3 flat presets (e.g. "Standard" = dir+git+model+session+context, "Compact" = dir+git+model) in a new flatPresets.ts
- The page template uses placeholder slots/divs for the layout editor and export/mock sections — those are implemented in later subtasks
- Import button in PresetSection opens a dialog with the textarea/validation from ImportTab.vue

## TODO

- [ ] Remove StudioSidebar.vue, update (home).vue to remove SidebarProvider layout
- [ ] Create StudioHeader.vue (logo, dark mode, terminal controls toggle)
- [ ] Make PreviewControls collapsible (hidden by default, toggle button in header)
- [ ] Refactor editor.ts: remove activePanel/SidebarPanel, add focusedSegment state
- [ ] Update types/studio.ts: remove obsolete types
- [ ] Create StyleThemeSection.vue: extract style + theme content from AppearancePanel
- [ ] Create PresetSection.vue: TUI + flat presets, import button
- [ ] Create flatPresets.ts with 2-3 preset definitions
- [ ] Wire everything into (home).vue as vertical section flow
- [ ] Verify existing functionality still works (preview renders, theme selection, style switching)
