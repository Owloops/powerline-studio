---
id: task-026a-page-shell
title: 'Page shell: header alignment, sticky preview, config dropdown, fix scrollbar'
status: 'To Do'
created_date: '2026-04-12 14:35'
updated_date: '2026-04-12 14:35'
parent: task-026-ui-polish-v2
subtasks:
dependencies:
---

## Description

Refine the page shell: align header with body content width, make the preview sticky (scrolls over the header), move terminal config into a dropdown menu on the preview, and fix the double scrollbar issue.

## Specification

1. **Header alignment**: The "Powerline Studio" text and header controls should align with the `max-w-4xl` body content container. Header is NOT sticky — it scrolls away with the page.
2. **Terminal config popover**: Remove the config toggle button from `StudioHeader`. Add a settings icon button to `TerminalPreview.vue` next to the cols `Badge`. This button has a `Tooltip` ("Configure terminal preview") and opens a `Popover` containing all 8 preview control options (Width, Reserved, Color, Charset, Font Size, Line Height, Font, Terminal theme). Each option rendered as a labeled row with its control inline. Use a `Popover` (not `DropdownMenu`) because the controls include Sliders and nested Selects — menu primitives have focus-trap and close-on-interact behaviors that conflict with form controls. Reuse `PreviewControls.vue` as the popover content (refactored to fit a vertical layout) to avoid duplicating slider/select wiring. The popover must remain open while the user adjusts multiple settings — it only closes on outside click or pressing the trigger again.
3. **Sticky preview**: The preview section (including the terminal window) should be `sticky top-0` so it follows the user as they scroll down. It should have a high enough `z-index` to overlay content below. Note: `sticky top-0` means the preview sticks once the header has scrolled out of the viewport — it does not visually overlap the header while the header is still visible. This is the intended behavior.
4. **Fix double scrollbar**: Currently `default.vue` has `overflow-hidden` and `h-svh`, while `(home).vue` content area has `overflow-y-auto` and `h-full`, creating a nested scrollbar. Change to natural page-level scroll:
   - `default.vue`: change `h-svh` to `min-h-svh`, remove `overflow-hidden`
   - `(home).vue`: remove `h-full` from the page wrapper, remove `overflow-y-auto` and `flex-1` from the content wrapper
   - Let the document body scroll naturally

### Acceptance Criteria

- Header aligns with `max-w-4xl` body content
- Header scrolls away when user scrolls
- Preview sticks to top of viewport after header scrolls away
- Terminal config opens as a Popover from the preview title bar, not a collapsible row
- Popover stays open while adjusting multiple controls (Sliders, Selects all work correctly)
- Single page-level scrollbar (the terminal's own horizontal ScrollArea is separate and expected)
- `showPreviewControls` state and toggle button removed from header
- `PreviewControls.vue` refactored as popover content (not deleted, reused)

## Design

### Key Files

- `src/pages/(home).vue` — remove inner scroll wrapper, make preview sticky, remove collapsible preview controls
- `src/layouts/default.vue` — remove `overflow-hidden`, allow natural page scroll
- `src/components/studio/StudioHeader.vue` — remove settings toggle button, add `max-w-4xl mx-auto` alignment
- `src/components/studio/TerminalPreview.vue` — add settings icon button + Popover trigger
- `src/components/studio/PreviewControls.vue` — refactor layout from horizontal flex-wrap to vertical stack for use as Popover content

### Approach

- Use a `Popover` (from `src/components/ui/popover/`) instead of `DropdownMenu` for the terminal config panel. DropdownMenu items have focus-trap and close-on-interact behaviors (from reka-ui's menu primitives) that conflict with interactive form controls like Sliders and nested Selects. A Popover provides an open surface without menu semantics.
- Refactor `PreviewControls.vue` from its current horizontal flex-wrap layout to a vertical stack suitable for popover content. This reuses all existing slider/select wiring and avoids duplication.
- For sticky preview: wrap the preview section in a `sticky top-0 z-30 bg-background` container. The border-b on this section provides visual separation from content below. Portaled overlays (Popovers, Selects, Tooltips) render at z-50, so z-30 keeps the preview above page content but below overlays.
- For the scroll fix: change `default.vue` from `h-svh overflow-hidden` to `min-h-svh` (no overflow constraint). Remove `h-full` and the inner scroll wrapper from `(home).vue`. This produces natural document-level scrolling.
- Remove `editorStore.showPreviewControls` since the collapsible is replaced by the popover.

## TODO

- [ ] Fix double scrollbar: `default.vue` change `h-svh` → `min-h-svh`, remove `overflow-hidden`; `(home).vue` remove `h-full`, `overflow-y-auto`, `flex-1` from wrappers
- [ ] Make header non-sticky with `max-w-4xl mx-auto` inner alignment
- [ ] Remove settings toggle button from StudioHeader
- [ ] Remove `showPreviewControls` ref, `togglePreviewControls` function, and their exports from editor store
- [ ] Remove `Collapsible` wrapper from `(home).vue`, remove Collapsible/CollapsibleContent imports
- [ ] Add settings icon button to `TerminalPreview.vue` title bar (next to cols badge)
- [ ] Add `Tooltip` on settings button ("Configure terminal preview")
- [ ] Add `Popover` on settings button that renders `PreviewControls` as content
- [ ] Refactor `PreviewControls.vue` from horizontal flex-wrap to vertical stack layout suitable for popover
- [ ] Make preview section `sticky top-0 z-30 bg-background`
- [ ] Verify: single page-level scrollbar, header scrolls away, preview sticks after header exits viewport
- [ ] Verify: Popover stays open while interacting with Sliders and nested Selects inside it
