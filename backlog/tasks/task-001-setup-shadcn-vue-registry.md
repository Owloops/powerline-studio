---
id: task-001-setup-shadcn-vue-registry
title: Set up electricity-ui as a shadcn-vue registry
status: 'Done'
created_date: '2026-04-09 17:29'
updated_date: '2026-04-09 16:24'
parent: null
subtasks:
dependencies:
---

## Description

<!-- DESCRIPTION:BEGIN -->

Set up the electricity-ui component library as a shadcn-vue custom registry so its components can be installed into any shadcn-vue project using `pnpm dlx shadcn-vue@latest add @electricity-ui/<name>`.

This involves:

1. Creating a `registry.json` at the repo root with the shadcn-vue schema, defining each component group as a registry item
2. Creating a `registry/new-york/` directory structure and copying (not moving) component files there, preserving `src/components/` for the existing UMD build
3. Normalizing registry copies for portability: adding explicit Vue imports (some files rely on auto-import), replacing `unplugin-icons` heroicon components with `lucide-vue-next`, and rewriting cross-component `@/components/<Name>` import paths
4. Defining 23 registry items (21 ui components + 2 hook items), each with accurate `dependencies`, `registryDependencies`, and `files` arrays
5. Excluding all FormKit-related files (`*Formkit.vue`, `*-formkit.ts`) from the registry -- these are removed in task-002
6. Excluding `TreeSelect.vue` and `TreeFormkit.vue` (depend on `@headlessui/vue`/`@headlessui-float/vue`, will be replaced)
7. Running `shadcn-vue build` to generate per-item JSON files in `public/r/` for CLI consumption
<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Registry Items (15 `registry:ui` items)

Each item below lists: name, files to include, npm `dependencies`, and `registryDependencies` (shadcn-vue base items or sibling `@electricity-ui/*` items).

**1. `calendar`** — 14 files

- Files: `Calendar.vue`, `CalendarCell.vue`, `CalendarCellTrigger.vue`, `CalendarGrid.vue`, `CalendarGridBody.vue`, `CalendarGridHead.vue`, `CalendarGridRow.vue`, `CalendarHeadCell.vue`, `CalendarHeader.vue`, `CalendarHeading.vue`, `CalendarNextButton.vue`, `CalendarPrevButton.vue`, `index.ts`, `marked-dates.ts`
- dependencies: `reka-ui`, `@internationalized/date`, `lucide-vue-next`
- registryDependencies: `button`, `@electricity-ui/select`, `@electricity-ui/custom-tooltip`
- NOTE: Calendar.vue uses Select primitives for month/year navigation. CalendarCellTrigger.vue uses CustomTooltip for marked dates.

**2. `range-calendar`** — 15 files

- Files: `RangeCalendar.vue`, `RangeCalendarCell.vue`, `RangeCalendarCellTrigger.vue`, `RangeCalendarGrid.vue`, `RangeCalendarGridBody.vue`, `RangeCalendarGridHead.vue`, `RangeCalendarGridRow.vue`, `RangeCalendarHeadCell.vue`, `RangeCalendarHeader.vue`, `RangeCalendarHeading.vue`, `RangeCalendarNextButton.vue`, `RangeCalendarNextYearButton.vue`, `RangeCalendarPrevButton.vue`, `RangeCalendarPrevYearButton.vue`, `index.ts`
- dependencies: `reka-ui`, `@internationalized/date`, `lucide-vue-next`
- registryDependencies: `button`, `@electricity-ui/custom-tooltip`, `@electricity-ui/calendar`
- NOTE: RangeCalendarCellTrigger.vue uses CustomTooltip for marked dates. Also imports `marked-dates.ts` from Calendar via `@/components/Calendar/marked-dates`.

**3. `combobox`** — 12 files

- Files: `Combobox.vue`, `ComboboxAnchor.vue`, `ComboboxEmpty.vue`, `ComboboxGroup.vue`, `ComboboxInput.vue`, `ComboboxItem.vue`, `ComboboxItemIndicator.vue`, `ComboboxLabel.vue`, `ComboboxList.vue`, `ComboboxSeparator.vue`, `ComboboxTrigger.vue`, `index.ts`
- dependencies: `reka-ui`, `lucide-vue-next`
- registryDependencies: (none)

**4. `select`** — 12 files

- Files: `Select.vue`, `SelectContent.vue`, `SelectGroup.vue`, `SelectItem.vue`, `SelectItemText.vue`, `SelectLabel.vue`, `SelectScrollDownButton.vue`, `SelectScrollUpButton.vue`, `SelectSeparator.vue`, `SelectTrigger.vue`, `SelectValue.vue`, `index.ts`
- dependencies: `reka-ui`, `lucide-vue-next`
- registryDependencies: (none)

**5. `date-picker`** — 2 files

- Files: `DatePicker.vue`, `index.ts`
- dependencies: `reka-ui`, `@internationalized/date`, `lucide-vue-next`
- registryDependencies: `@electricity-ui/calendar`, `@electricity-ui/popover`

**6. `date-input`** — 3 files + 2 composable files

- Files: `DateInput.vue`, `index.ts`
- Hook files: `composables/useDateInput.ts`, `composables/dateHelpers.ts` (type `registry:hook`)
- dependencies: `@internationalized/date`, `lucide-vue-next`
- registryDependencies: `@electricity-ui/date-picker`, `@electricity-ui/calendar`

**7. `date-range-picker`** — 2 files

- Files: `DateRangePicker.vue`, `index.ts`
- dependencies: `reka-ui`, `@internationalized/date`, `lucide-vue-next`
- registryDependencies: `@electricity-ui/range-calendar`, `@electricity-ui/popover`, `@electricity-ui/calendar`

**8. `popover`** — 5 files

- Files: `Popover.vue`, `PopoverClose.vue`, `PopoverContent.vue`, `PopoverTrigger.vue`, `index.ts`
- dependencies: `reka-ui`
- registryDependencies: (none)

**9. `tooltip`** — 6 files

- Files: `Tooltip.vue`, `TooltipArrow.vue`, `TooltipContent.vue`, `TooltipProvider.vue`, `TooltipTrigger.vue`, `index.ts`
- dependencies: `reka-ui`
- registryDependencies: (none)

**10. `slider`** — 3 files

- Files: `Slider.vue`, `AnimatedSlider.vue`, `index.ts`
- dependencies: `reka-ui`, `@number-flow/vue`
- registryDependencies: (none)

**11. `switch`** — 2 files

- Files: `Switch.vue`, `index.ts`
- dependencies: `reka-ui`
- registryDependencies: (none)

**12. `mask-number-input`** — 1 file

- Files: `MaskNumberInput.vue`
- dependencies: `maska`
- registryDependencies: (none)

**13. `mask-text-input`** — 1 file

- Files: `MaskTextInput.vue`
- dependencies: `maska`
- registryDependencies: (none)

**14. `percentage-input`** — 1 file

- Files: `PercentageInput.vue`
- dependencies: (none)
- registryDependencies: `@electricity-ui/mask-number-input`
- NOTE: PercentageInput.vue imports MaskNumberInput.vue directly

**15. `data-table`** — 14 component files + 14 composable files + 7 formatter files

- Component files: `DataTable.vue`, `TableBody.vue`, `TableColumnFilter.vue`, `TableColumnVisibility.vue`, `TableColumnVisibilitySelect.vue`, `TableExport.vue`, `TableFilter.vue`, `TableFilterRow.vue`, `TableHeader.vue`, `TablePagination.vue`, `TableRow.vue`, `defaults.ts`, `index.ts`, `types.ts`
- Composable files (type `registry:hook`): `composables/table/index.ts`, `useTableSort.ts`, `useTablePagination.ts`, `useTableFilter.ts`, `useTableHeaders.ts`, `useTableCells.ts`, `useTableLanguage.ts`, `useTableGrouping.ts`, `useTableSelection.ts`, `useTableFaceting.ts`, `useTableColumnVisibility.ts`, `useTableExpansion.ts`, `useTableExport.ts`, `useTableMetadata.ts`
- Formatter files (type `registry:hook`): `composables/table/formatters/index.ts`, `baseFormatter.ts`, `dateFormatters.ts`, `numberFormatters.ts`, `relativeTimeFormatters.ts`, `specialFormatters.ts`, `types.ts`
- dependencies: `@vueuse/core`, `@vueuse/integrations`, `reka-ui`, `lucide-vue-next`, `export-to-csv`, `write-excel-file`, `fuse.js`
- registryDependencies: `@electricity-ui/select`, `@electricity-ui/slider`, `@electricity-ui/custom-combobox`
- NOTE: TableColumnFilter.vue imports AnimatedSlider from Slider and CustomCombobox. useTableFilter.ts uses `@vueuse/integrations/useFuse` (requires `fuse.js`).

### Higher-Level Wrapper Items (3 `registry:ui` items)

**16. `custom-combobox`** — 1 file

- Files: `CustomCombobox.vue`
- dependencies: `reka-ui`
- registryDependencies: `@electricity-ui/combobox`

**17. `custom-select`** — 1 file

- Files: `CustomSelect.vue`
- dependencies: (none — uses sibling Select components)
- registryDependencies: `@electricity-ui/select`

**18. `custom-tooltip`** — 2 files

- Files: `CustomTooltip.vue`, `CustomTooltipContent.vue`
- dependencies: `reka-ui`
- registryDependencies: `@electricity-ui/tooltip`

### Standalone Items (3 `registry:ui` items)

**19. `alert`** — 1 file: `Alert.vue`

- dependencies: `lucide-vue-next`
- registryDependencies: (none)
- ISSUES REQUIRING NORMALIZATION:
  - Uses auto-imported Vue APIs (`ref`, `computed`) — need explicit imports added
  - Uses auto-imported heroicons (`i-heroicons:check-circle-20-solid`, etc.) via `unplugin-icons` — need replacement with explicit `lucide-vue-next` imports

**20. `modal`** — 1 file: `Modal.vue`

- dependencies: `reka-ui`
- registryDependencies: (none)

**21. `notification`** — 1 file: `Notification.vue`

- dependencies: (none)
- registryDependencies: (none)

### Composable-Only Items (1 `registry:hook` item)

**22. `use-tree`** — 1 file

- Files: `composables/tree.ts` (type `registry:hook`)
- dependencies: (none)
- registryDependencies: (none)

### Tree Component (4 files, excludes TreeSelect.vue and TreeFormkit.vue)

**23. `tree`** — 4 files (3 .vue + 1 NEW index.ts)

- Files: `TreeRoot.vue`, `TreeBranch.vue`, `TreeInfo.vue`, `index.ts` (NEW — existing `Tree/index.ts` is FormKit-only and must be replaced with a simple barrel export)
- dependencies: `@formkit/auto-animate` (used in TreeRoot.vue, TreeBranch.vue, TreeInfo.vue for `useAutoAnimate`)
- registryDependencies: `@electricity-ui/use-tree`
- ISSUES REQUIRING NORMALIZATION:
  - TreeRoot.vue, TreeBranch.vue, TreeInfo.vue use auto-imported Vue APIs (`ref`, `computed`, `reactive`, `watch`, `watchDebounced`, `provide`, `inject`, `nextTick`) — need explicit imports added
  - TreeRoot.vue uses auto-imported `useTree()` — needs explicit import from composables/tree.ts
  - TreeBranch.vue and TreeInfo.vue use auto-imported heroicons (`i-heroicons:*`) via `unplugin-icons` — need replacement with explicit `lucide-vue-next` imports

### Excluded Files (not included in registry)

- All `*Formkit.vue` files: `ComboboxFormkit.vue`, `DateInputFormkit.vue`, `DatePickerFormkit.vue`, `DateRangePickerFormkit.vue`, `MaskNumberFormkit.vue`, `MaskTextFormkit.vue`, `PercentageFormkit.vue`, `SelectFormkit.vue`, `SliderFormkit.vue`, `SwitchFormkit.vue`, `TreeFormkit.vue`
- All `*-formkit.ts` files: `combobox-formkit.ts`, `dateinput-formkit.ts`, `datepicker-formkit.ts`, `daterangepicker-formkit.ts`, `mask-number-formkit.ts`, `mask-text-formkit.ts`, `percentage-formkit.ts`, `select-formkit.ts`, `slider-formkit.ts`, `switch-formkit.ts`
- `TreeSelect.vue` — depends on `@headlessui/vue` + `@headlessui-float/vue` (to be replaced)
- `TreeSelectFormkit.vue` — FormKit wrapper for TreeSelect
- `src/lib/main.ts` — UMD entry point, not relevant for registry
- `src/lib/programmatic-tooltip.ts` + `.css` — uses `@floating-ui/vue`, separate concern
- `src/components/Table/TODO.md`, `src/components/DateInput/DateInput.TODO.md` — dev notes
- `src/components/__tests__/` — test files

### Build & Integration

- Add `"registry:build": "shadcn-vue build"` script to `package.json`
- `shadcn-vue build` reads `registry.json` and outputs individual JSON files to `public/r/` (e.g., `public/r/calendar.json`)
- Consuming projects add to their `components.json` registries: `{ "electricity-ui": "https://<host>/r" }`
- Consuming projects install via: `pnpm dlx shadcn-vue@latest add @electricity-ui/calendar`

### Import Path Normalization (required for registry portability)

- `@/lib/utils` for `cn()` — already standard shadcn-vue alias, works as-is
- Cross-component imports use `@/components/<Name>` paths (e.g., `@/components/Calendar`, `@/components/Popover`) — these must be rewritten in registry copies to match where shadcn CLI installs them in the consuming project (typically `@/components/ui/<name>`)
- Auto-imported Vue APIs (`ref`, `computed`, `watch`, etc.) — some files omit explicit imports because the source project uses `unplugin-auto-import`. Registry copies must add explicit imports since consumers may not have the same auto-import setup
- Auto-imported icon components (`i-heroicons:*`) — used in Alert.vue, TreeBranch.vue, TreeInfo.vue via `unplugin-icons`. Registry copies must replace these with explicit `lucide-vue-next` imports
- Auto-imported composables (`useTree`, `watchDebounced`) — TreeRoot.vue uses these without imports. Registry copies must add explicit imports
<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

### Architecture Approach

Copy component files from `src/components/` into `registry/new-york/` directory, organized by component name (PascalCase directories). Do NOT move files — `src/components/` must remain intact for the existing UMD build in `src/lib/main.ts`. The registry is a parallel distribution mechanism.

Each registry item is defined in `registry.json` at the repo root:

```json
{
	"$schema": "https://shadcn-vue.com/schema/registry.json",
	"name": "electricity-ui",
	"homepage": "https://github.com/<org>/electricity-ui",
	"items": [
		{
			"name": "calendar",
			"type": "registry:ui",
			"title": "Calendar",
			"description": "Date calendar with marked dates, decade/year navigation",
			"dependencies": ["reka-ui", "@internationalized/date", "lucide-vue-next"],
			"registryDependencies": ["button"],
			"files": [
				{ "path": "registry/new-york/Calendar/Calendar.vue", "type": "registry:component" },
				{ "path": "registry/new-york/Calendar/index.ts", "type": "registry:component" },
				...
			]
		}
	]
}
```

### Directory Structure

```
electricity-ui/
├── registry.json                          # NEW — registry definition
├── registry/new-york/                     # NEW — registry component files
│   ├── Calendar/                          # 14 files (12 .vue + index.ts + marked-dates.ts)
│   ├── RangeCalendar/                     # 15 files (14 .vue + index.ts)
│   ├── Combobox/                          # 12 files (11 .vue + index.ts)
│   ├── Select/                            # 12 files (11 .vue + index.ts)
│   ├── DatePicker/                        # 2 files
│   ├── DateInput/                         # 2 files + composables
│   ├── DateRangePicker/                   # 2 files
│   ├── Popover/                           # 5 files (4 .vue + index.ts)
│   ├── Tooltip/                           # 6 files (5 .vue + index.ts)
│   ├── Slider/                            # 3 files (2 .vue + index.ts)
│   ├── Switch/                            # 2 files (1 .vue + index.ts)
│   ├── Table/                             # 14 component files
│   ├── Tree/                              # 4 files (3 .vue + index.ts)
│   ├── CustomCombobox/                    # 1 file
│   ├── CustomSelect/                      # 1 file
│   ├── CustomTooltip/                     # 2 files
│   ├── Alert/                             # 1 file
│   ├── Modal/                             # 1 file
│   ├── Notification/                      # 1 file
│   ├── composables/                       # Shared composable files
│   │   ├── useDateInput.ts
│   │   ├── dateHelpers.ts
│   │   ├── tree.ts
│   │   └── table/                         # 14 composables + 7 formatters
│   │       ├── index.ts
│   │       ├── useTableSort.ts
│   │       ├── ... (12 more)
│   │       └── formatters/
│   │           ├── index.ts
│   │           └── ... (6 more)
├── public/r/                              # GENERATED by `shadcn-vue build`
│   ├── calendar.json
│   ├── range-calendar.json
│   ├── ... (one .json per registry item)
├── src/components/                        # UNCHANGED — existing source
├── src/lib/main.ts                        # UNCHANGED — existing UMD entry
└── package.json                           # MODIFIED — add registry:build script
```

### Key Decisions

1. **Copy, don't move**: `src/components/` stays for the legacy UMD build. `registry/new-york/` is the shadcn-vue registry source.
2. **Item type is `registry:ui`**: Not `registry:block` (blocks are full page examples). Components are UI primitives.
3. **File type is `registry:component`**: Individual `.vue` and `.ts` files within an item use `registry:component` type. Composables use `registry:hook`.
4. **Cross-item references via `registryDependencies`**: DatePicker depends on Calendar and Popover. When a user installs DatePicker, the CLI auto-installs Calendar and Popover.
5. **No FormKit files**: All `*Formkit.vue` and `*-formkit.ts` files are excluded. Task-002 removes FormKit entirely.
6. **No TreeSelect**: Depends on `@headlessui/vue` which is being replaced by reka-ui.

### Dependencies

- `shadcn-vue` CLI (already in devDependencies as `shadcn-vue: ^2.4.3`)
- No task dependencies — this is the foundation task
<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

### Phase 1: Scaffolding

- [ ] Create `registry/new-york/` directory structure with all subdirectories
- [ ] Add `"registry:build": "shadcn-vue build"` to `package.json` scripts
- [ ] Create `registry.json` skeleton with schema URL, name `"electricity-ui"`, empty items array

### Phase 2: Copy Component Files (no modifications needed — files already use `@/lib/utils`)

- [ ] Copy `src/components/Calendar/` → `registry/new-york/Calendar/` (14 files: 12 .vue, index.ts, marked-dates.ts)
- [ ] Copy `src/components/RangeCalendar/` → `registry/new-york/RangeCalendar/` (15 files: 14 .vue, index.ts)
- [ ] Copy `src/components/Combobox/` → `registry/new-york/Combobox/` (12 files: 11 .vue, index.ts)
- [ ] Copy `src/components/Select/` → `registry/new-york/Select/` (12 files: 11 .vue, index.ts)
- [ ] Copy `src/components/DatePicker/` → `registry/new-york/DatePicker/` (2 files: DatePicker.vue, index.ts)
- [ ] Copy `src/components/DateInput/` → `registry/new-york/DateInput/` (2 files: DateInput.vue, index.ts — exclude DateInput.TODO.md)
- [ ] Copy `src/components/DateRangePicker/` → `registry/new-york/DateRangePicker/` (2 files)
- [ ] Copy `src/components/Popover/` → `registry/new-york/Popover/` (5 files: 4 .vue, index.ts)
- [ ] Copy `src/components/Tooltip/` → `registry/new-york/Tooltip/` (6 files: 5 .vue, index.ts)
- [ ] Copy `src/components/Slider/` → `registry/new-york/Slider/` (3 files: 2 .vue, index.ts)
- [ ] Copy `src/components/Switch/` → `registry/new-york/Switch/` (2 files: Switch.vue, index.ts)
- [ ] Copy `src/components/Table/` → `registry/new-york/Table/` (14 files — exclude TODO.md)
- [ ] Copy `src/components/Tree/` → `registry/new-york/Tree/` (4 files: TreeRoot.vue, TreeBranch.vue, TreeInfo.vue, index.ts — exclude TreeSelect.vue, TreeFormkit.vue, TreeSelectFormkit.vue)
- [ ] Copy standalone files → `registry/new-york/Alert/Alert.vue`, `Modal/Modal.vue`, `Notification/Notification.vue`
- [ ] Copy wrapper files → `registry/new-york/CustomCombobox/CustomCombobox.vue`, `CustomSelect/CustomSelect.vue`, `CustomTooltip/CustomTooltip.vue` + `CustomTooltipContent.vue`
- [ ] Copy `src/components/MaskNumberInput.vue` → `registry/new-york/MaskNumberInput/MaskNumberInput.vue`
- [ ] Copy `src/components/MaskTextInput.vue` → `registry/new-york/MaskTextInput/MaskTextInput.vue`
- [ ] Copy `src/components/PercentageInput.vue` → `registry/new-york/PercentageInput/PercentageInput.vue`

### Phase 2b: Normalize Registry Copies (make files portable without auto-import/plugin tooling)

- [ ] Add explicit Vue imports to files that rely on auto-import: `Alert.vue` (ref, computed), `TreeRoot.vue` (ref, computed, reactive, watch, watchDebounced, nextTick, provide), `TreeBranch.vue` (computed, inject), `TreeInfo.vue` (computed)
- [ ] Replace `i-heroicons:*` icon components with `lucide-vue-next` equivalents in: `Alert.vue`, `TreeBranch.vue`, `TreeInfo.vue`
- [ ] Add explicit `useTree` import to `TreeRoot.vue` (currently auto-imported from composables)
- [ ] Add explicit `watchDebounced` import from `@vueuse/core` to `TreeRoot.vue`
- [ ] Rewrite cross-component `@/components/<Name>` import paths in registry copies to use the consuming project's component install location (e.g., `@/components/ui/calendar` or relative paths)
  - Files affected: `DatePicker.vue` (imports Calendar, Popover), `DateInput.vue` (imports DatePicker, Calendar/marked-dates), `DateRangePicker.vue` (imports RangeCalendar, Popover, Calendar/marked-dates), `Calendar.vue` (imports Select components), `CalendarCellTrigger.vue` (imports CustomTooltip), `RangeCalendarCellTrigger.vue` (imports CustomTooltip, Calendar/marked-dates), `TableColumnFilter.vue` (imports Slider, CustomCombobox), `DataTable.vue` (imports composables/table), `PercentageInput.vue` (imports MaskNumberInput), `CustomCombobox.vue` (imports Combobox), `CustomSelect.vue` (imports Select), `CustomTooltip.vue` (imports Tooltip)
- [ ] Create a new `Tree/index.ts` barrel file for registry (existing one is FormKit-only, cannot be copied)

### Phase 3: Copy Composable Files

- [ ] Copy `src/composables/useDateInput.ts` + `dateHelpers.ts` → `registry/new-york/composables/`
- [ ] Copy `src/composables/tree.ts` → `registry/new-york/composables/tree.ts`
- [ ] Copy `src/composables/table/` → `registry/new-york/composables/table/` (14 composable files + index.ts)
- [ ] Copy `src/composables/table/formatters/` → `registry/new-york/composables/table/formatters/` (7 files)

### Phase 4: Define Registry Items in registry.json

- [ ] Add `calendar` item (14 files, deps: reka-ui, @internationalized/date, lucide-vue-next, regDeps: button, select, custom-tooltip)
- [ ] Add `range-calendar` item (15 files, deps: reka-ui, @internationalized/date, lucide-vue-next, regDeps: button, custom-tooltip, calendar)
- [ ] Add `combobox` item (12 files, deps: reka-ui, lucide-vue-next)
- [ ] Add `select` item (12 files, deps: reka-ui, lucide-vue-next)
- [ ] Add `date-picker` item (2 files, deps: reka-ui, @internationalized/date, lucide-vue-next, regDeps: calendar, popover)
- [ ] Add `date-input` item (2 component + 2 hook files, deps: @internationalized/date, lucide-vue-next, regDeps: date-picker, calendar)
- [ ] Add `date-range-picker` item (2 files, deps: reka-ui, @internationalized/date, lucide-vue-next, regDeps: range-calendar, popover, calendar)
- [ ] Add `popover` item (5 files, deps: reka-ui)
- [ ] Add `tooltip` item (6 files, deps: reka-ui)
- [ ] Add `slider` item (3 files, deps: reka-ui, @number-flow/vue)
- [ ] Add `switch` item (2 files, deps: reka-ui)
- [ ] Add `mask-number-input` item (1 file, deps: maska)
- [ ] Add `mask-text-input` item (1 file, deps: maska)
- [ ] Add `percentage-input` item (1 file, regDeps: mask-number-input)
- [ ] Add `data-table` item (14 component files + 21 hook files, deps: @vueuse/core, @vueuse/integrations, reka-ui, lucide-vue-next, export-to-csv, write-excel-file, fuse.js, regDeps: select, slider, custom-combobox)
- [ ] Add `custom-combobox` item (1 file, deps: reka-ui, regDeps: combobox)
- [ ] Add `custom-select` item (1 file, regDeps: select)
- [ ] Add `custom-tooltip` item (2 files, deps: reka-ui, regDeps: tooltip)
- [ ] Add `alert` item (1 file, deps: lucide-vue-next)
- [ ] Add `modal` item (1 file, deps: reka-ui)
- [ ] Add `notification` item (1 file)
- [ ] Add `tree` item (4 files, deps: @formkit/auto-animate, @vueuse/core, lucide-vue-next, regDeps: use-tree)
- [ ] Add `use-tree` item (1 hook file, type: registry:hook)

### Phase 5: Validate & Build

- [ ] Review all cross-component import paths in registry files for correctness
- [ ] Run `shadcn-vue build` to generate `public/r/*.json` output files
- [ ] Verify generated JSON files have correct file contents, dependencies, and registryDependencies
- [ ] Add `public/r/` to `.gitignore` (generated output, not source)
<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Scope Assessment:** 23 registry items with ~120 files total. The work is NOT purely mechanical — while most is copy + metadata, a normalization pass (Phase 2b) is required to make files portable. This includes adding explicit Vue imports, replacing auto-imported icons, rewriting cross-component import paths, and creating a new Tree barrel file. This normalization is scoped to the registry copies only; `src/components/` is not modified.

**Key Insight — Copy, Don't Move:** The existing `src/components/` directory and `src/lib/main.ts` UMD entry point must remain functional. The registry is a parallel distribution mechanism. Once task-002 (FormKit removal) and task-003 (Tailwind v4) are complete, the `src/` source and `registry/` source can be unified.

**Cross-Component Imports (review finding):** Source files use `@/components/<Name>` paths (e.g., DatePicker imports `@/components/Calendar`). In a consuming project, shadcn CLI installs components to `@/components/ui/<name>`. Registry copies must rewrite these paths. The `registryDependencies` field ensures install order but does NOT rewrite imports — that's a manual step in Phase 2b.

**Auto-Import Portability (review finding):** The source project uses `unplugin-auto-import` and `unplugin-icons` which inject Vue APIs and icon components without explicit imports. Registry consumers may not have these plugins. Affected files: Alert.vue (ref, computed, heroicons), TreeRoot.vue (ref, computed, reactive, watch, watchDebounced, provide, nextTick, useTree), TreeBranch.vue (computed, inject, heroicons), TreeInfo.vue (computed, heroicons). Phase 2b adds explicit imports.

**Tree Component Partial:** Only TreeRoot, TreeBranch, TreeInfo are included. TreeSelect depends on `@headlessui/vue` + `@headlessui-float/vue` and needs to be rebuilt on reka-ui. TreeFormkit is a FormKit wrapper (removed in task-002). Existing `Tree/index.ts` is FormKit-only — a new barrel file must be created. All three Tree .vue files use `@formkit/auto-animate` for animations.

**Hosting `public/r/`:** The `shadcn-vue build` output goes to `public/r/`. For CLI consumption, these files must be served at a URL. Options: commit to git and serve via GitHub Pages/raw URLs, or generate in CI. Decision deferred to task-006.

**Related Tasks:**

- task-002-remove-formkit — FormKit wrapper files are excluded from registry; once removed, `src/` and `registry/` can align
- task-003-migrate-tailwind-v4 — Tailwind migration happens after registry structure is in place
- task-004-align-shadcn-vue-theming — Theming alignment depends on registry structure
- task-006-build-registry-integration — Final build and integration depends on this task
<!-- NOTES:END -->
