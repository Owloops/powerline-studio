---
id: task-005-update-dependencies
title: Update electricity-ui dependencies
status: "Done"
created_date: '2026-04-09 17:43'
updated_date: '2026-04-09 16:24'
parent: null
subtasks:
dependencies:
	- task-002
---

## Description

<!-- DESCRIPTION:BEGIN -->

Update core dependencies in electricity-ui to match the dashboard-template's versions, ensuring compatibility when components are consumed via the shadcn-vue registry. Remove packages confirmed unused (`class-variance-authority`, `shadcn-vue` runtime). Migrate `@headlessui/vue` and `@headlessui-float/vue` usage in TreeSelect to reka-ui primitives. Rename `lucide-vue-next` to the new `@lucide/vue` package.

### Current vs Target Versions

| Package                    | Current  | Target               | Change Type                      |
| -------------------------- | -------- | -------------------- | -------------------------------- |
| `reka-ui`                  | ^2.8.2   | ^2.9.5               | Minor bump                       |
| `vue-router`               | ^4.6.4   | ^5.0.4               | Major bump                       |
| `@vueuse/core`             | ^13.9.0  | ^14.2.1              | Major bump                       |
| `@vueuse/integrations`     | ^13.9.0  | ^14.2.1              | Major bump                       |
| `lucide-vue-next`          | ^0.487.0 | `@lucide/vue` ^1.0.0 | Package renamed + major bump     |
| `@headlessui/vue`          | ^1.7.23  | REMOVE               | Replace with reka-ui Popover     |
| `@headlessui-float/vue`    | ^0.15.1  | REMOVE               | Replace with reka-ui positioning |
| `class-variance-authority` | ^0.7.1   | REMOVE               | Zero imports in codebase         |
| `shadcn-vue`               | ^2.4.3   | REMOVE               | Zero imports — only CLI used     |

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Updates (no breaking changes expected)

- **`reka-ui` ^2.8 -> ^2.9**: Minor bump. No breaking API changes for components used in this project. The v2 migration guide covers radix-vue->reka-ui rename (already done) and Combobox refactoring (searchTerm/displayValue moved to ComboboxInput — already using the new API in this codebase).
- **`vue-router` ^4 -> ^5**: Transition release that merges `unplugin-vue-router` into core. For apps NOT using `unplugin-vue-router` (this project uses `vite-plugin-pages` instead), there are **no breaking changes**. `createRouter`, `createWebHistory`, and all v4 APIs continue to work unchanged.
- **`@vueuse/core` ^13 -> ^14**: The composables used in this project are: `useSorted`, `useArrayFilter`, `useOffsetPagination`, `useArrayReduce`, `reactiveOmit`, `useDebounceFn`. None of these were removed or renamed in v14. `computedEager` was deprecated (not used here). The upgrade should be seamless.
- **`@vueuse/integrations` ^13 -> ^14**: Only `useFuse` is used (in `useTableFilter.ts`). No breaking changes.

### Package rename

- **`lucide-vue-next` -> `@lucide/vue`**: In Lucide v1, the Vue package was renamed from `lucide-vue-next` to `@lucide/vue`. The API is identical — only the import path changes. All 17 files importing from `lucide-vue-next` need a find-and-replace to `@lucide/vue`.

### Removals (confirmed unused)

- **`class-variance-authority`**: Zero imports anywhere in `src/`. Grep confirms no `cva` or `class-variance-authority` usage. Safe to remove.
- **`shadcn-vue`**: Zero runtime imports. Only the CLI (`pnpm dlx shadcn-vue@latest`) is used for scaffolding. The runtime package is not needed as a dependency.

### Migration required

- **`@headlessui/vue` + `@headlessui-float/vue`**: Used in 2 source files + 2 config/scaffold files:
  - `src/components/Tree/TreeSelect.vue` — uses `Popover`, `PopoverButton`, `PopoverPanel` from headlessui and `Float`, `FloatArrow` from headlessui-float
  - `src/lib/main.ts` — `import * as HeadlessUI` re-exported on `window.EUI.HeadlessUI` (line 224) and typed in global `Window` interface (lines 107, 113)
  - `src/App.vue` — initializes `HeadlessUI: {}` stub on `window.EUI` (line 29)
  - `vite.config.ts` — imports and registers `HeadlessUiResolver` in `unplugin-vue-components` (lines 9, 51)
    These must be migrated to reka-ui Popover primitives. The existing local `Popover` wrapper (`src/components/Popover/`) is already built on reka-ui and used by DatePicker/DateRangePicker. TreeSelect should use this wrapper for consistency, with class overrides for custom width/padding since the wrapper hardcodes `w-72 p-4`.

### Constraints

- All existing component functionality must be preserved after updates
- **Breaking change:** `window.EUI.HeadlessUI` will be removed. This was the entire HeadlessUI namespace exposed on the global UMD object. Consumers using `EUI.HeadlessUI.*` components directly must migrate to reka-ui equivalents. This is an accepted breaking change since the project is moving away from HeadlessUI entirely.
- The `Window.HeadlessUI` type declaration in `src/lib/main.ts` must be removed alongside the runtime export
- Generated type files (`auto-imports.d.ts`, `components.d.ts`) should be regenerated after dependency changes
<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**
Three-phase update: (1) safe version bumps with no code changes, (2) package rename with import path updates, (3) HeadlessUI migration requiring component rewrite.

**Phase 1 — Safe version bumps (no code changes)**
Update `package.json` version ranges for:

- `reka-ui`: `^2.8.2` -> `^2.9.5`
- `vue-router`: `^4.6.4` -> `^5.0.4`
- `@vueuse/core`: `^13.9.0` -> `^14.2.1`
- `@vueuse/integrations`: `^13.9.0` -> `^14.2.1`

Run `pnpm install` to regenerate lockfile. Build and verify.

**Phase 2 — Lucide package rename**

1. Remove `lucide-vue-next` and add `@lucide/vue`
2. Find-and-replace all imports: `from 'lucide-vue-next'` -> `from '@lucide/vue'` (17 files)
3. Build and verify — API is identical, only the package name changed

**Phase 3 — HeadlessUI -> reka-ui migration**

1. Rewrite `src/components/Tree/TreeSelect.vue`:
   - Use the existing local `Popover`/`PopoverTrigger`/`PopoverContent` wrappers from `@/components/Popover` (already built on reka-ui, used by DatePicker/DateRangePicker)
   - Override the wrapper's default `w-72 p-4` classes via the `class` prop to match TreeSelect's current layout (no fixed width, custom padding)
   - Ensure `PopoverTrigger` renders as a `<button type="button">` (use `as-child` if needed) so it doesn't accidentally submit forms
   - Preserve `$attrs` forwarding on the trigger element
   - Preserve `bottom-start` alignment (via `side="bottom" align="start"` on PopoverContent)
   - Preserve portal rendering (already handled by the wrapper's `PopoverPortal`)
   - Preserve keyboard behavior: Esc to close, outside click, focus return to trigger
   - Preserve enter/leave transitions (the wrapper uses `data-[state]` animations)
   - Verify that clicking inline remove-selection controls inside the trigger does not close the popover
   - Remove the `FloatArrow` — evaluate if the arrow is visually necessary; if so, add reka-ui's `PopoverArrow`
2. Clean up `src/lib/main.ts`:
   - Remove `import * as HeadlessUI from '@headlessui/vue'` (line 1)
   - Remove `HeadlessUI: any` from both `Window` interface declarations (lines 107, 113)
   - Remove `HeadlessUI` from `window.EUI` assignment (line 224)
3. Clean up `src/App.vue`:
   - Remove `HeadlessUI: {}` stub from EUI initialization (line 29)
4. Clean up `vite.config.ts`:
   - Remove `import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers'` (line 9)
   - Remove `HeadlessUiResolver()` from the resolvers array (line 51)
5. Remove `@headlessui/vue` and `@headlessui-float/vue` from `package.json`

**Phase 4 — Remove unused packages**

1. Remove `class-variance-authority` from `package.json`
2. Remove `shadcn-vue` from `package.json`
3. Run `pnpm install` to clean up lockfile

**Key Files:**

- `package.json` — version ranges, add/remove packages
- `pnpm-lock.yaml` — regenerated
- `src/components/Tree/TreeSelect.vue` — HeadlessUI -> reka-ui Popover migration
- `src/lib/main.ts` — remove HeadlessUI import, re-export, and Window type declarations
- `src/App.vue` — remove HeadlessUI stub from EUI initialization
- `vite.config.ts` — remove HeadlessUiResolver import and registration
- 17 files with lucide imports — path rename
- `src/auto-imports.d.ts`, `src/components.d.ts` — regenerated after dependency changes

**VueUse composables in use** (verified still available in v14):
| Composable | Used In |
|------------|---------|
| `useSorted` | `useTableSort.ts` |
| `useArrayFilter` | `useTableFilter.ts` |
| `useOffsetPagination` | `useTablePagination.ts` |
| `useArrayReduce` | `useTableGrouping.ts` |
| `reactiveOmit` | `TooltipContent.vue` |
| `useDebounceFn` | `DataTable.vue`, `TableColumnFilter.vue` |
| `useFuse` | `useTableFilter.ts` (from `@vueuse/integrations`) |

**Dependencies:**

- task-002 (Remove FormKit) — must complete first. FormKit removal will clean up `src/main.ts` and `src/lib/main.ts` which are also touched by this task. The HeadlessUI re-export in `src/lib/main.ts` sits alongside FormKit imports.
<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

### Phase 1 — Safe version bumps

- [ ] Update `reka-ui` from `^2.8.2` to `^2.9.5` in `package.json`
- [ ] Update `vue-router` from `^4.6.4` to `^5.0.4` in `package.json`
- [ ] Update `@vueuse/core` from `^13.9.0` to `^14.2.1` in `package.json`
- [ ] Update `@vueuse/integrations` from `^13.9.0` to `^14.2.1` in `package.json`
- [ ] Run `pnpm install` and verify build succeeds

### Phase 2 — Lucide package rename

- [ ] Remove `lucide-vue-next` and add `@lucide/vue` ^1.0.0
- [ ] Replace `from 'lucide-vue-next'` with `from '@lucide/vue'` in all 17 files
- [ ] Verify build succeeds

### Phase 3 — HeadlessUI -> reka-ui migration

- [ ] Rewrite `TreeSelect.vue` to use local `Popover` wrapper from `@/components/Popover` (reka-ui-based)
- [ ] Override wrapper's default `w-72 p-4` classes to match TreeSelect's current layout
- [ ] Ensure trigger renders as `<button type="button">` with `$attrs` forwarding
- [ ] Remove HeadlessUI import, re-export, and `Window` type declarations from `src/lib/main.ts`
- [ ] Remove `HeadlessUI: {}` stub from `src/App.vue`
- [ ] Remove `HeadlessUiResolver` import and registration from `vite.config.ts`
- [ ] Remove `@headlessui/vue` from `package.json`
- [ ] Remove `@headlessui-float/vue` from `package.json`
- [ ] Verify TreeSelect popover behavior (positioning, transitions, focus management, Esc/outside-click, inline remove-selection controls)

### Phase 4 — Remove unused packages

- [ ] Remove `class-variance-authority` from `package.json` (zero imports confirmed)
- [ ] Remove `shadcn-vue` runtime dependency from `package.json` (zero imports — CLI-only)
- [ ] Run `pnpm install` to clean lockfile

### Verification

- [ ] Full build succeeds (`pnpm build`)
- [ ] Type-check passes (`vue-tsc --noEmit`)
- [ ] Regenerate `auto-imports.d.ts` and `components.d.ts` (run dev server briefly or build)
- [ ] Manual verification of TreeSelect popover behavior (dev server smoke test)
- [ ] Verify demo pages still render correctly (`pnpm dev`)
<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Priority:** Medium — depends on FormKit removal but can proceed in parallel with Tailwind migration.

**Related Tasks:**

- task-002-remove-formkit must complete first (dependency)
- task-006-build-registry-integration depends on this task

**Risk Assessment:**

- Phase 1-2: Very low risk. Version bumps are non-breaking. Lucide rename is mechanical find-and-replace.
- Phase 3: Medium risk. TreeSelect rewrite requires careful attention to popover positioning, transitions, focus management, and inline interactive controls. Using the existing local `Popover` wrapper (same pattern as DatePicker/DateRangePicker) reduces risk compared to using raw reka-ui primitives.
- Phase 4: No risk. Packages have zero imports.

**Breaking change:** Removing `window.EUI.HeadlessUI` is an intentional breaking change. Any consumer accessing HeadlessUI components via the UMD global must migrate to reka-ui. This is accepted because the project is standardizing on reka-ui.

**Task-002 dependency:** Both tasks modify `src/lib/main.ts` and `src/main.ts`. Task-002 (FormKit removal) should complete first to avoid merge conflicts. Phases 1-2 of this task (version bumps + lucide rename) could theoretically proceed in parallel since they don't touch those files, but Phase 3+ must wait for task-002.

**Evidence for package removals:**

- `class-variance-authority`: `grep -r "class-variance-authority\|cva" src/` returns zero matches
- `shadcn-vue` runtime: `grep -r "from ['\"]shadcn-vue" src/` returns zero matches (note: `components.json` config file remains for CLI tooling)
- `@headlessui/vue`: 2 source files + `vite.config.ts` resolver + `App.vue` stub
- `@headlessui-float/vue`: 1 source file (`TreeSelect.vue`)

**Note on `@floating-ui/vue`:** This package (`^1.1.10`) remains as a direct dependency because `src/lib/programmatic-tooltip.ts` imports directly from it (24 imports including `useFloating`, `offset`, `flip`, `shift`, `arrow`, etc.). It is NOT being removed. reka-ui also uses Floating UI internally but that is a separate concern.

**Note on `vue-router`:** The v4->v5 bump only affects the demo app (`src/main.ts`), not the published library runtime. The library does not export or depend on vue-router APIs.

<!-- NOTES:END -->
