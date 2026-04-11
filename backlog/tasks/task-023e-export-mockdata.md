---
id: task-023e-export-mockdata
title: 'Export/Import and Mock Data sections in single-page flow'
status: 'To Do'
created_date: '2026-04-11 23:10'
updated_date: '2026-04-11 23:10'
parent: task-023-redesign-studio-ui
subtasks:
dependencies:
  - task-023a-scaffolding
---

## Description

Move the Export/Import and Mock Data functionality from sidebar tabs to bottom sections of the single-page flow. These are used less frequently so they sit below the layout editor.

## Specification

- Export section: Shiki-highlighted JSON preview, copy button, install instructions — same content as current ExportTab.vue
- Import: accessible from the PresetSection (task-023a) as well as this section. Textarea + validation + load button.
- Mock Data: collapsible section with preset selector dropdown and all data forms. Each form section (hookData, gitInfo, etc.) keeps its current collapsible toggle pattern.
- Reset to Defaults button at the very bottom
- Both sections are collapsible (expanded by default for Export, collapsed for Mock Data)

## Design

### Key Files

- NEW `src/components/studio/sections/ExportSection.vue` — wraps ExportTab + ImportTab content
- NEW `src/components/studio/sections/MockDataSection.vue` — wraps MockDataPanel content
- Reuse: `src/components/studio/panels/ExportPanel.vue` internals (ExportTab, ImportTab)
- Reuse: `src/components/studio/panels/MockDataPanel.vue` internals (MockDataSection forms)
- Delete after migration: the 5 panel wrapper components (AppearancePanel, SegmentsPanel, TuiLayoutPanel, MockDataPanel, ExportPanel)

### Approach

- Extract the inner content from ExportPanel.vue and MockDataPanel.vue into the new section components. The panel wrappers are thin — the real content is in ExportTab, ImportTab, and the mock data forms.
- ExportSection renders ExportTab content directly (no Tabs wrapper needed since Import moves to PresetSection).
- MockDataSection renders the preset selector and all MockDataSection form components in a Collapsible.
- After all subtasks are complete, delete the old panel/ directory since everything has been restructured.

## TODO

- [ ] Create ExportSection.vue with JSON preview, copy, and install instructions
- [ ] Create MockDataSection.vue with preset selector and collapsible data forms
- [ ] Wire both into (home).vue at the bottom of the page flow
- [ ] Add Reset to Defaults button at the bottom
- [ ] Clean up: delete old panel wrapper components that are no longer referenced
- [ ] Verify export JSON output matches current behavior
- [ ] Verify mock data changes still update the preview in real-time
