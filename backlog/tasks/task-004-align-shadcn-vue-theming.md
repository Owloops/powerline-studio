---
id: task-004-align-shadcn-vue-theming
title: Align electricity-ui styles with shadcn-vue theming
status: "Done"
created_date: '2026-04-09 17:43'
updated_date: '2026-04-09 16:24'
parent: null
subtasks:
dependencies:
	- task-003
---

## Description

<!-- DESCRIPTION:BEGIN -->

Replace hardcoded color values throughout electricity-ui components with shadcn-vue CSS variable theming. The current codebase uses a dual color system: a custom HSL-based primary/secondary scale (`--color-primary-50` through `--color-primary-900`) via tailwind.config.js, plus a partial set of shadcn CSS variables (`--background`, `--foreground`, etc.) in `:root` and `.dark`. Most components still reference hardcoded Tailwind colors like `bg-white`, `text-gray-700`, `border-gray-300`, and `bg-primary-500` instead of semantic tokens.

This task migrates all component styling to use shadcn-vue's semantic CSS variable system (`bg-background`, `text-foreground`, `border-border`, `bg-primary`, etc.) so the library integrates with any shadcn-vue project's theme out of the box, with automatic dark mode support.

**Note:** This task follows the Tailwind v4 migration (task-003). The CSS variable format will change from Tailwind v3 HSL format (`220 13% 91%`) to Tailwind v4 oklch format (`oklch(0.922 0 0)`) as part of task-003. This task handles the component-level class replacements that reference those variables.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### CSS Variable System

- **Remove** the custom HSL-based primary/secondary scale (`--color-primary-50` through `--color-primary-900`) from `:root` in base.css
- **Keep** the existing shadcn CSS variables block (`:root` and `.dark`) — these already define `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--card`, `--popover`, `--border`, `--input`, `--ring`
- After task-003 (Tailwind v4 migration), the CSS variables will use oklch format and the `@theme inline` block pattern instead of the tailwind.config.js color mapping. This task assumes that migration is done.
- **Note:** `.btn-primary` in base.css has a `text-shadow` that directly references `hsl(var(--color-primary-700))` — this must be updated or removed since the old variable will no longer exist.
- Add `--chart-1` through `--chart-5` CSS variables (for Highcharts integration)
- Add `--sidebar-*` variables if sidebar components are planned

### Component Color Replacements

Map hardcoded Tailwind classes to shadcn semantic tokens:

| Hardcoded Class                        | Semantic Replacement                         | Usage Context                           |
| -------------------------------------- | -------------------------------------------- | --------------------------------------- |
| `bg-white`                             | `bg-background` or `bg-card` or `bg-popover` | General backgrounds / cards / dropdowns |
| `text-gray-900`, `text-gray-800`       | `text-foreground`                            | Primary text                            |
| `text-gray-700`                        | `text-foreground` or `text-card-foreground`  | Body text                               |
| `text-gray-600`, `text-gray-500`       | `text-muted-foreground`                      | Secondary/helper text                   |
| `text-gray-400`                        | `text-muted-foreground` (with opacity)       | Disabled/placeholder text               |
| `border-gray-200`, `border-gray-300`   | `border-border` or `border-input`            | Borders                                 |
| `bg-gray-50`                           | `bg-muted` or `bg-accent`                    | Hover states, table headers             |
| `bg-gray-100`                          | `bg-muted`                                   | Backgrounds, actions areas              |
| `bg-primary-500`                       | `bg-primary`                                 | Primary buttons                         |
| `text-primary-600`, `text-primary-700` | `text-primary`                               | Links, active tabs                      |
| `bg-primary-50`, `bg-primary-100`      | `bg-primary/10`, `bg-primary/20`             | Selection highlights                    |
| `text-white` (on primary bg)           | `text-primary-foreground`                    | Button text on primary                  |
| `bg-red-600`                           | `bg-destructive`                             | Danger buttons                          |
| `text-red-*`                           | `text-destructive`                           | Error text                              |
| `ring-primary-500`                     | `ring-ring`                                  | Focus rings                             |
| `placeholder-gray-400`                 | `placeholder:text-muted-foreground`          | Placeholder text                        |
| `divide-gray-200`                      | `divide-border`                              | Table dividers                          |

### Existing cn() Utility

The `cn()` utility already exists at `src/lib/utils.ts` with the correct `clsx` + `tailwind-merge` pattern. No changes needed — it matches the dashboard-template pattern.

### Dark Mode

- Current base.css already has `.dark` class with shadcn variable overrides — this is correct
- Body styles currently hardcode `bg-white text-gray-700` — change to `bg-background text-foreground`
- The `@apply border-border` in `*` selector is already correct
- After task-003, dark mode variant will use `@custom-variant dark (&:is(.dark *))` instead of Tailwind v3's `darkMode: ['class']`

### Component Categories (by migration complexity)

**Low complexity** (direct class swaps, ~5 min each):

- Switch, Slider, AnimatedSlider, Tooltip/TooltipContent, Popover/PopoverContent
- Select/SelectTrigger, SelectContent, SelectItem, SelectSeparator
- Combobox/ComboboxInput, ComboboxList, ComboboxItem, ComboboxGroup, ComboboxSeparator, ComboboxTrigger

**Medium complexity** (conditional classes need rethinking):

- Modal (overlay, content, title, description, actions area)
- Notification (type-based status colors — keep semantic: green/red/yellow/blue for success/danger/warning/info)
- Calendar/CalendarCellTrigger, RangeCalendar/RangeCalendarCellTrigger (selected/today/outside-view states)
- CustomCombobox (already partially uses `bg-muted`, `text-destructive` — finish migration)
- Tree/\* (branch, info, select, root — hover/focus states)

**High complexity** (deeply nested styles, defaults.ts):

- Table/defaults.ts — the `defaultStyles` object has ~40 hardcoded gray/primary/white references
- base.css — global component classes (`.btn`, `.btn-primary`, `.input`, `.table-container`, etc.)
- Alert — type-based color variants (success/danger/warning/info should keep distinct colors, not map to shadcn semantic)

### What to NOT Replace

- **Status/semantic colors** in Alert, Notification, and programmatic-tooltip status themes (green for success, red for danger/error, yellow/amber for warning, blue for info) — these are intentionally distinct, not theme-dependent. Keep hardcoded color values for these.
- **Custom brand colors** (`sq-pink`, `sq-green`, `sq-blue`, etc.) — these are app-specific and should remain
- **Hardcoded debug/test styles** in commented-out code sections
- **The `--radius` variable** — already defined and used correctly
- **Demo app styles** — `src/main.ts` FormKit class config and `src/pages/` are not part of the shipped library

### All Components Must:

- Render correctly in both light and dark modes
- Use semantic tokens for all theme-dependent colors
- Preserve existing hover/focus/disabled states using semantic equivalents
<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**
Three-phase migration: (1) update base.css global styles, (2) update component files systematically by component group, (3) update Table defaults.ts. Each phase can be validated independently.

**Key Files (prioritized by impact):**

1. `src/assets/base.css` — Global styles foundation
   - Remove `--color-primary-*` and `--color-secondary-*` HSL variables (replaced by shadcn's `--primary`)
   - Update body from `bg-white text-gray-700` to `bg-background text-foreground`
   - Update `.btn`, `.btn-primary`, `.btn-danger`, `.btn-secondary`, `.input`, `.label`, `.description`, `.error`, `.checkbox`, `.radio`, `.badge-base`, `.tab-list`, `.table-container`, `.highcharts-*` classes
   - Remove duplicate `:root` block (currently has both custom and shadcn variables)

2. `src/components/Table/defaults.ts` — Table styling defaults
   - Update all 40+ hardcoded color references in `defaultStyles` object
   - Affects: container, header, body, footer, pagination, filter, column visibility, grouping, export styles

3. Component files (by group):
   - **Selects/Combobox**: SelectTrigger, SelectContent, SelectItem, ComboboxInput, ComboboxList, ComboboxItem, ComboboxGroup, ComboboxSeparator, ComboboxTrigger, CustomCombobox
   - **Calendar/DatePicker**: Calendar, CalendarCell, CalendarCellTrigger, CalendarHeadCell, DatePicker, DateInput, DateRangePicker, RangeCalendar\*
   - **Overlays**: Modal, PopoverContent, TooltipContent, Notification
   - **Controls**: Switch, Slider, AnimatedSlider
   - **Trees**: TreeBranch, TreeInfo, TreeRoot, TreeSelect
   - **Shipped CSS**: `src/lib/programmatic-tooltip.css` — default tooltip surface colors (shipped via `src/lib/main.ts`)
   - **Other**: Alert (partial — keep status colors)

4. `src/lib/utils.ts` — Already correct, no changes needed

**Patterns to Follow:**

- shadcn-vue theming: CSS variables in `:root` / `.dark`, referenced via `@theme inline` block in Tailwind v4
- `cn()` utility using `clsx` + `tailwind-merge` for class merging (already exists)
- Semantic color mapping: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `card`, `popover`, `border`, `input`, `ring`
- For opacity variants of semantic colors, use Tailwind's slash syntax: `bg-primary/10`

**Migration Strategy for primary-N scale:**
The current `primary-50` through `primary-900` scale maps to shadcn as:

- `primary-500`/`primary-600` → `bg-primary` / `text-primary`
- `primary-50`/`primary-100` → `bg-primary/10` / `bg-accent`
- `primary-700`/`primary-800` → `text-primary` (darker shades absorbed)
- `text-white` on primary backgrounds → `text-primary-foreground`

**Dependencies:**

- task-003 (Migrate Tailwind v4) — Tailwind v4 must be in place before theming changes. The `@theme inline` block and oklch variables from task-003 are prerequisites.
<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

### Phase 1: Base CSS (src/assets/base.css)

- [ ] Remove `--color-primary-*` and `--color-secondary-*` HSL variable blocks from `:root`
- [ ] Consolidate duplicate `:root` blocks into one (keep shadcn variables)
- [ ] Update body styles: `bg-white text-gray-700` → `bg-background text-foreground`
- [ ] Update `a` tag: `text-primary-600 hover:text-primary-500` → `text-primary hover:text-primary/80`
- [ ] Update `.link`: `decoration-primary-500` → `decoration-primary`
- [ ] Update `.btn`: replace `bg-white`, `text-gray-700`, `border-gray-300`, etc. with semantic tokens
- [ ] Update `.btn-primary`: `bg-primary-500` → `bg-primary`, `text-white` → `text-primary-foreground`
- [ ] Update `.btn-danger`: `bg-red-600` → `bg-destructive`, `text-white` → `text-destructive-foreground`
- [ ] Update `.btn-secondary`: `bg-primary-100` → `bg-secondary`, etc.
- [ ] Update `.input`: `border-gray-300` → `border-input`, `placeholder-gray-400` → `placeholder:text-muted-foreground`, `focus:ring-primary-500` → `focus:ring-ring`
- [ ] Update `.label`: `text-gray-700` → `text-foreground`
- [ ] Update `.description`: `text-gray-500` → `text-muted-foreground`
- [ ] Update `.checkbox` and `.radio`: `focus:ring-primary-500` → `focus:ring-ring`, `text-primary-600` → `text-primary`
- [ ] Update `.badge-base`: `bg-primary-100 text-primary-800` → `bg-primary/15 text-primary`
- [ ] Update `.tab-list` and `.tab`: replace gray and primary references
- [ ] Update `.table-container`: `border-gray-200` → `border-border`, `bg-gray-50` → `bg-muted`, `bg-white` → `bg-background`
- [ ] Update `.highcharts-*` styles: `bg-white` → `bg-popover`, `border-gray-300` → `border-border`

### Phase 2: Table Defaults (src/components/Table/defaults.ts)

- [ ] Update `tableContainer`: `border-gray-200` → `border-border`
- [ ] Update `thead`: `bg-gray-50` → `bg-muted`
- [ ] Update `headerRow`, `headerCell`: gray references → semantic tokens
- [ ] Update `headerCellSortable`: `hover:bg-gray-100` → `hover:bg-accent`
- [ ] Update `tbody`: `bg-white` → `bg-background`
- [ ] Update `bodyRow`: `border-gray-100` → `border-border/50`
- [ ] Update `bodyRowHover`: `hover:bg-gray-50` → `hover:bg-muted/50`
- [ ] Update `bodyRowSelected`: `bg-primary-50` → `bg-primary/10`
- [ ] Update `bodyCell`: `text-gray-700` → `text-foreground`
- [ ] Update `checkbox`: references to primary and gray
- [ ] Update `footerCell`, `tfoot`: gray references → semantic
- [ ] Update all pagination styles (pageButton, pageSize, pageInfo, etc.)
- [ ] Update all filter styles (input, select, clearButton, columnFilter)
- [ ] Update all column visibility styles
- [ ] Update all grouping styles
- [ ] Update all export styles

### Phase 3: Component Files

- [ ] **Select group**: SelectTrigger (`bg-white`, `text-gray-500`, `ring-primary-500`), SelectContent (`bg-white`), SelectItem (`bg-primary-50`)
- [ ] **Combobox group**: ComboboxInput (`placeholder:text-gray-400`), ComboboxList (`bg-white text-gray-700`), ComboboxItem (`bg-primary-50`), ComboboxGroup (`text-gray-700`, `text-gray-500`), ComboboxSeparator (`bg-gray-200`), ComboboxTrigger (`ring-primary-500`, `text-gray-500`)
- [ ] **CustomCombobox**: Already partially migrated — verify remaining hardcoded refs
- [ ] **Modal**: overlay `bg-gray-700/75` → `bg-black/75` (neutral scrim, not theme-dependent), content `bg-white` → `bg-background`, `text-gray-900` → `text-foreground`, actions `bg-gray-100` → `bg-muted`
- [ ] **Notification**: `bg-white` → `bg-card`, `border-gray-300` → `border-border`, `text-gray-900` → `text-foreground`, `text-gray-400/700` → `text-muted-foreground`/`text-foreground`. Keep status icon colors (green/red/yellow/blue).
- [ ] **Switch**: `bg-gray-200` → `bg-input`, `bg-primary-500` → `bg-primary`, `ring-primary-500` → `ring-ring`, `ring-offset-white` → `ring-offset-background`
- [ ] **Slider/AnimatedSlider**: `bg-primary-200` → `bg-primary/20`, `bg-primary-500` → `bg-primary`, `border-primary-500` → `border-primary`, `bg-white` → `bg-background`
- [ ] **PopoverContent**: `bg-white` → `bg-popover`
- [ ] **TooltipContent**: `bg-white` → `bg-popover`, `text-gray-700` → `text-popover-foreground`
- [ ] **Calendar/CalendarCellTrigger**: `bg-white` → `bg-background`, `text-gray-700` → `text-foreground`, `bg-primary-600` → `bg-primary`, `text-white` → `text-primary-foreground`, `bg-primary-100` → `bg-primary/15`
- [ ] **CalendarHeadCell**: `text-gray-500` → `text-muted-foreground`
- [ ] **RangeCalendar** group: same base pattern as Calendar, plus `data-[selection-start]`, `data-[selection-end]`, `data-[in-range]` states that use `bg-gray-100` → `bg-accent`, `bg-primary-600` → `bg-primary`
- [ ] **DatePicker**: `text-gray-600` → `text-muted-foreground`, calendar nav button and month selector updates
- [ ] **DateInput**: `text-gray-600` → `text-muted-foreground`, `ring-primary-500` → `ring-ring`
- [ ] **TreeBranch**: `hover:bg-gray-50` → `hover:bg-accent`, `bg-primary-50` → `bg-accent`, `text-gray-800` → `text-foreground`
- [ ] **TreeInfo**: `text-gray-700` → `text-foreground`, hover states
- [ ] **TreeRoot**: `ring-primary-500` → `ring-ring`
- [ ] **TreeSelect**: `text-gray-500` → `text-muted-foreground`, `border-gray-200 bg-white` → `border-border bg-popover`, `text-gray-400` → `text-muted-foreground`
- [ ] **Alert**: Keep status-specific colors (green/red/yellow/blue). Only replace generic grays if present.
- [ ] **Table/TableHeader**: `text-gray-600/500` → `text-muted-foreground`
- [ ] **Table/TableFilter**: `text-gray-500/700` → `text-muted-foreground`/`text-foreground`
- [ ] **programmatic-tooltip.css**: Default tooltip surface uses hardcoded `white`/`#374151`/`#e5e7eb` — update to use CSS variables: `background: var(--popover)`, `color: var(--popover-foreground)`, `border-color: var(--border)`. Keep status theme variants (success/warning/error/info) with hardcoded colors like Alert.

### Phase 4: Validation

- [ ] Visual test all components in light mode
- [ ] Visual test all components in dark mode (add `.dark` to html/body)
- [ ] Verify no remaining hardcoded gray/white/primary-N references in components (excluding Alert status colors and brand colors)
- [ ] Verify `cn()` usage is consistent across all components
<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Priority:** Medium — depends on Tailwind v4 migration completing first.

**Scope Summary:**

- ~30 Vue component files need color class updates
- 1 CSS file (base.css) needs major refactoring (~20 component classes)
- 1 TS file (defaults.ts) with ~40 hardcoded color references in table styles
- `cn()` utility and shadcn CSS variable definitions already exist — no new infrastructure needed

**Current State Observations:**

- The codebase is in a hybrid state: some shadcn tokens are already used (`bg-muted`, `text-destructive`, `border-input`, `hover:bg-accent` in CustomCombobox, SelectSeparator, Calendar nav buttons), but most components still use hardcoded Tailwind classes
- The `primary-N` scale (50-900) uses a custom HSL CSS variable system (`--color-primary-N`) defined in both base.css and tailwind.config.js. This will be replaced by shadcn's single `--primary` variable with opacity modifiers
- The `gray` palette is aliased to Tailwind's `zinc` in tailwind.config.js
- Body text color is set to `theme('colors.gray.700')` in `:root` AND `bg-white text-gray-700` in the base layer — both need to change

**Risk: Primary Color Scale Loss**
The current primary scale has 10 shades (primary-50 through primary-900). shadcn uses a single `--primary` value. Components that rely on precise shade differences (e.g., `primary-100` for hover, `primary-200` for active, `primary-500` for default) will need opacity-based alternatives (`bg-primary/10`, `bg-primary/20`, etc.). This may subtly change visual appearance — visual testing is important.

**Out of Scope:**

- `src/main.ts` FormKit theme class definitions — these are demo app only (the library entry is `src/lib/main.ts`). FormKit theming is a consumer concern, not a library concern.
- Demo pages in `src/pages/` — these are for local development only and don't ship with the library.
- CSS packaging/export strategy — `base.css` is currently only imported by the demo app's `App.vue`, not by the library entry `src/lib/main.ts`. How consumers import theme CSS is a separate concern (likely part of the registry/packaging task).

**Related Tasks:**

- task-003-migrate-tailwind-v4 must complete first (dependency)
- task-006-build-registry-integration depends on this task
<!-- NOTES:END -->
