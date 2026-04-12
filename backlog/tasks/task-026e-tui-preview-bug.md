---
id: task-026e-tui-preview-bug
title: 'Bug fix: TUI preview not updating on style switch'
status: 'To Do'
created_date: '2026-04-12 14:35'
updated_date: '2026-04-12 14:35'
parent: task-026-ui-polish-v2
subtasks:
dependencies:
---

## Description

When switching the display style to TUI mode, the terminal preview does not update until the page is fully refreshed. The preview should update immediately when the style changes, just as it does when switching between flat modes (minimal/powerline/capsule).

## Specification

- Switching to TUI mode via the style selector must trigger an immediate re-render of the preview
- The preview should show the TUI panel output within the normal debounce window (150ms)
- Switching away from TUI mode back to a flat mode should also update immediately
- No page refresh should be required for any style change

### Acceptance Criteria

- Switch from any flat mode to TUI → preview updates immediately
- Switch from TUI to any flat mode → preview updates immediately
- Apply a TUI preset → first render uses the preset's TUI settings
- Reload with persisted `style: 'tui'` → post-hydration render is correct
- No console errors during style switching

## Design

### Key Files

- `src/composables/useRenderer.ts` — the render function and its watch sources
- `src/stores/config.ts` — `setStyle` mutation and `ensureTuiConfig`

### Approach

The renderer watches `configStore.config` deeply. When `setStyle('tui')` is called, it sets `config.value.display.style = 'tui'` and calls `ensureTuiConfig()` which initializes `config.value.display.tui` if missing. The deep watcher should catch this change.

**Confirmed:** The UI always calls `configStore.setStyle(...)` via the RadioGroup `@update:model-value` handler (StyleThemeSection.vue:143, AppearancePanel.vue:145). The caller path is correct.

**Investigation order** (prioritized by likelihood):

1. **Watch invalidation**: Verify the renderer's deep watcher fires when `config.display.style` changes. The `useStorage` wrapper with `initOnMounted: true` may affect reactivity tracking on nested properties.
2. **Preview/config state mismatch**: On the TUI render path, `useRenderer` overwrites `config.display.tui.widthReserve` with `previewStore.reservedWidth` before rendering. The `reservedWidth` sync only seeds once during setup — not on each style switch. Stale preview-store values may produce an incorrect first TUI render.
3. **Silent render failure**: `ensureTuiConfig()` creates a minimal breakpoint (`'. .'`). If the TUI render path succeeds but produces a near-empty panel, this can be misdiagnosed as a missed re-render. Check `renderError` to distinguish.
4. **Debounce coalescing** (low priority): The 150ms debounce should coalesce rapid mutations and still fire one render. Unlikely root cause, but worth testing as a regression case.

**Debug approach**: Call `renderNow()` manually after style switch. If it produces correct output → watcher not triggering. If it produces empty/wrong output → TUI render path issue with initial config or stale preview state.

**Design note:** `applyTuiPreset()` and `applyFlatPreset()` mutate `display.style` directly instead of reusing `setStyle()`. If the fix introduces any style-transition invariant (e.g. syncing reservedWidth), those preset paths must also go through the same logic. Consider centralizing the "on style change" behavior.

## TODO

- [ ] Reproduce: switch to TUI mode, confirm preview doesn't update
- [ ] Check if the renderer's deep watcher fires on style change (targeted logging around `activeStyle`, `config.display.tui`, and `renderError`)
- [ ] Check if `renderNow()` called manually after style switch produces correct output (distinguishes watcher vs render issue)
- [ ] Verify `previewStore.reservedWidth` is synced correctly on style switch (not just on setup)
- [ ] Fix the root cause (watcher not firing, render failing silently, or stale preview state)
- [ ] If fix introduces style-transition logic, ensure `applyTuiPreset()` and `applyFlatPreset()` also use it

### Verification edge cases

- [ ] Switch flat → TUI → preview updates immediately
- [ ] Switch TUI → flat → preview updates immediately
- [ ] Switch flat → TUI after `applyFlatPreset()` has set `display.tui = undefined`
- [ ] Switch flat → TUI when `display.tui` already exists from earlier session
- [ ] Apply a TUI preset directly → first render uses preset TUI settings, not stale preview values
- [ ] Reload with persisted `style: 'tui'` → first post-hydration render is correct
- [ ] Rapid flat ↔ TUI toggles within 150ms debounce window
- [ ] No console errors during any style switching
