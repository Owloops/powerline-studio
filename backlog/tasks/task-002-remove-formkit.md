---
id: task-002-remove-formkit
title: Remove FormKit from electricity-ui
status: 'Done'
created_date: '2026-04-09 17:43'
updated_date: '2026-04-09 16:24'
parent: null
subtasks:
dependencies:
---

## Description

<!-- DESCRIPTION:BEGIN -->

Remove all FormKit dependencies and related code from the electricity-ui component library. FormKit was previously used for form handling but is no longer needed. This is a pure removal task with no replacement — the FormKit wrappers, type definitions, and configuration will be deleted, and the package dependencies will be cleaned from package.json and application entry points.

**Note:** `@formkit/auto-animate` is used independently of FormKit's form system in 3 Tree components (`TreeRoot.vue`, `TreeBranch.vue`, `TreeInfo.vue`) via `useAutoAnimate`. This import needs to be replaced with the standalone `@formkit/auto-animate` package (which has no FormKit dependency) or the auto-animate calls removed. Since `@formkit/auto-animate` is a standalone animation utility (not part of FormKit's form system), it can remain as-is — but the `@formkit/addons` plugin (`createAutoAnimatePlugin`) used in `main.ts` and `lib/main.ts` must be removed.

**Note:** `classifications.txt` is a reference/documentation file containing FormKit class configurations and plugin setup code used by consuming applications. It should be deleted as it is only relevant to FormKit integration.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Files to Delete (24 files)

**FormKit Vue wrapper components (12 files):**

- `src/components/ComboboxFormkit.vue`
- `src/components/SelectFormkit.vue`
- `src/components/SwitchFormkit.vue`
- `src/components/SliderFormkit.vue`
- `src/components/MaskNumberFormkit.vue`
- `src/components/MaskTextFormkit.vue`
- `src/components/DatePickerFormkit.vue`
- `src/components/DateRangePickerFormkit.vue`
- `src/components/DateInputFormkit.vue`
- `src/components/PercentageFormkit.vue`
- `src/components/Tree/TreeFormkit.vue`
- `src/components/Tree/TreeSelectFormkit.vue`

**FormKit input type definition files (10 files):**

- `src/components/combobox-formkit.ts`
- `src/components/select-formkit.ts`
- `src/components/switch-formkit.ts`
- `src/components/slider-formkit.ts`
- `src/components/mask-number-formkit.ts`
- `src/components/mask-text-formkit.ts`
- `src/components/datepicker-formkit.ts`
- `src/components/daterangepicker-formkit.ts`
- `src/components/dateinput-formkit.ts`
- `src/components/percentage-formkit.ts`

**Other files to delete:**

- `src/formkit-components.d.ts` — FormKit type declarations
- `src/pages/formkit-test.vue` — Dedicated FormKit test page

### Packages to Remove from `package.json` (5 packages)

- `@formkit/addons` (1.6.9)
- `@formkit/i18n` (1.6.9)
- `@formkit/icons` (^1.7.2)
- `@formkit/themes` (1.6.9)
- `@formkit/vue` (1.6.9)

**Keep:** `@formkit/auto-animate` (0.8.2) — standalone animation utility with zero FormKit dependencies, used by Tree components

### Files to Edit

**`src/main.ts` — Gut the entire FormKit configuration (lines 3-4, 7-20, 27-239):**

- Remove imports: `@formkit/vue`, `@formkit/themes`, `@formkit/icons`, `@formkit/addons`, `@formkit/auto-animate`
- Remove all 12 formkit-related imports (lines 7-17): 10 `*-formkit.ts` files + `formkitTreeSelect`/`formkitTree` from Tree/index.ts + `genesisIcons` from `@formkit/icons`
- Remove all FormKit class configuration objects: `textClassification`, `selectClassification`, `boxClassification`, `buttonClassification`, `switchClassification`, `comboboxClassification`, `sliderClassification` (lines 27-155)
- Remove `autoAnimateOptions` and the entire `app.use(plugin, defaultConfig(...))` block (lines 160-239)
- Keep: `createApp`, `router`, `app.use(router)`, `app.mount('#app')`, font/CSS imports (lines 1, 2, 5, 6, 22-25, 158-159, 240)

**`src/lib/main.ts` — Remove all FormKit imports and exports:**

- Remove import: `createAutoAnimatePlugin` from `@formkit/addons` (line 2)
- Remove import: `generateClasses` from `@formkit/themes` (line 3)
- Remove all FormKit component imports (lines 12-13, 15-16, 20-21, 25-26, 30-31, 34-35, 48-49, 52-53, 57-58, 75-76) — the `*Formkit.vue` and `*-formkit.ts` imports
- Remove `Window` interface declarations: `CreateAutoAnimatePlugin` (line 108), `GenerateClasses` (line 109), `ElectricityUIFormkitTypes` (line 115)
- Remove `EUI.Components.FormKit` object (lines 148-169)
- Remove `EUI.Utils.FormKit` object (lines 215-217)

**`src/components/Tree/index.ts` — Complete rewrite:**

- Currently only exports FormKit tree inputs (`formkitTreeSelect`, `formkitTree`)
- Delete the file entirely or replace with non-FormKit Tree exports if needed

**`src/components.d.ts` — Remove 12 FormKit component type declarations:**

- Line 28: `ComboboxFormkit`
- Line 43: `DateInputFormkit`
- Line 45: `DatePickerFormkit`
- Line 47: `DateRangePickerFormkit`
- Line 56: `MaskNumberFormkit`
- Line 58: `MaskTextFormkit`
- Line 62: `PercentageFormkit`
- Line 86: `SelectFormkit`
- Line 97: `SliderFormkit`
- Line 99: `SwitchFormkit`
- Line 116: `TreeFormkit`
- Line 120: `TreeSelectFormkit`

**`tsconfig.node.json` — Remove FormKit type reference:**

- Remove line 10: `"./src/formkit-components.d.ts"`

**`tailwind.config.js` — Remove FormKit Tailwind plugin:**

- Remove line 165: `require('@formkit/themes/tailwindcss')`

**`classifications.txt` — Delete entirely:**

- Contains FormKit class configurations and plugin setup code for consuming apps

**`src/components/DateInput/DateInput.vue` — Remove FormKit comments:**

- Line 167: Remove comment `// Always emit blur for FormKit's touched state`
- Line 232: Remove comment `// Always emit blur for FormKit's touched state`
- Keep the `emit('blur')` calls — they are valid component behavior

**`src/components/Tree/TreeRoot.vue` — Replace auto-animate import:**

- Line 2: `import { useAutoAnimate } from '@formkit/auto-animate/vue'` — keep as-is (standalone package, not FormKit form system)

**`src/components/Tree/TreeBranch.vue` — Same as TreeRoot.vue**

**`src/components/Tree/TreeInfo.vue` — Same as TreeRoot.vue**

**`src/pages/index.vue` — Remove navigation links:**

- Line 7: Remove `{ name: '🧪 FormKit Test (All Components)', path: '/formkit-test' }` entry
- Line 14: Remove `{ name: 'Mask Inputs', path: '/mask-inputs' }` entry (if `mask-inputs.vue` is deleted)

### Demo Pages with FormKit Usage (remove FormKit sections, keep non-FormKit sections)

These pages contain both FormKit and non-FormKit demos. Remove only the FormKit-specific sections, including their associated script-block state:

- `src/pages/datepickers.vue` — Remove "FormKit Button DatePicker" section (lines ~306-415, including "FormKit Form Data" display block). Remove script-block state: `formData` reactive (line 41), `displayData` ref (line 55), `watch(formData, ...)` (lines 57-59), `handleSubmit` (lines 62-65). Keep `formatDisplayDate` (shared with non-FormKit sections). Also remove stray FormKit comment at line 550.
- `src/pages/dateinputs.vue` — Remove 3 FormKit sections: "FormKit DateInput Integration" (~393-446), "FormKit Validation Visibility Test" (~451-503), "FormKit Date Range Validation" (~606-637), and the custom validation rule (~147). Also remove stray FormKit comment at line 595.
- `src/pages/comboboxes.vue` — Remove FormKit combobox examples (~188-199, ~211-216, ~341-361), remove `selectedMultipleLanguagesFormkit` ref
- `src/pages/selects.vue` — Remove FormKit select examples (Examples 5, 9, 14, 15, **and 16**). Remove associated script state: `selectedDisabledFormkit`, `selectedMultipleCountriesFormkit` refs, `customValidationForm` ref (line 88), `componentTypes`/`timeResolutions` arrays, `requiredForProfileCostRule` function (lines 93-106)
- `src/pages/switches.vue` — Remove "FormKit Switch" section (~53-102) **and** FormKit-only script state: `formData` reactive, `displayData` ref, `watch` (~lines 8-20)
- `src/pages/sliders.vue` — Remove "FormKit Slider" section (~70-183) **and** FormKit-only script state: `formData` reactive, `displayData` ref, `watch` (~lines 9-25)
- `src/pages/modals.vue` — Remove "Third Modal with FormKit Select" (~114-169), remove `openFormKit`, `setOpenFormKit`, `formKitCountry` refs
- `src/pages/mask-inputs.vue` — Page is ~95% FormKit but contains one non-FormKit `MaskTextInput` "Date Mask" example (line 466). Either: (a) surgically remove FormKit sections and keep the MaskTextInput example, or (b) delete the entire page and accept loss of non-FormKit demo coverage. If deleted, also remove nav link from `index.vue`.
- `src/pages/daterangepickers.vue` — Remove FormKit DateRangePicker section (~103-133), remove `FormKit` import
- `src/pages/trees.vue` — Remove FormKit tree select section (~1462-1472)

### CLAUDE.md

- Remove FormKit references from the electricity-ui `CLAUDE.md` documentation

### Build Artifacts (do not manually edit)

- `dist/` files will be regenerated on next build
- `pnpm-lock.yaml` will be regenerated after removing packages

### Post-removal Validation

- No remaining imports of `@formkit/vue`, `@formkit/themes`, `@formkit/icons`, `@formkit/i18n`, `@formkit/addons`
- `@formkit/auto-animate` remains (standalone animation utility, used by Tree components)
- No remaining `FormKit` component usage in templates (grep for `<FormKit`)
- No dead reactive state referencing removed FormKit sections
- Project builds successfully
- No TypeScript errors from removed type declarations
<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**
Systematic deletion of all FormKit-related files and references, executed in dependency order to avoid intermediate broken states.

**Execution Order (remove usages before deleting files):**

1. Edit `src/main.ts` — remove all FormKit imports, class configs, and plugin registration
2. Edit `src/lib/main.ts` — remove all FormKit imports, exports, and Window declarations
3. Edit `src/components/Tree/index.ts` — remove FormKit tree input exports (delete file if empty)
4. Edit demo pages — remove FormKit sections from 10 pages, keep non-FormKit demos
5. Edit `src/components/DateInput/DateInput.vue` — remove FormKit-related comments
6. Edit `src/pages/index.vue` — remove FormKit test/page links
7. Edit `src/components.d.ts` — remove 12 FormKit component type declarations
8. Edit `tsconfig.node.json` — remove `formkit-components.d.ts` reference
9. Edit `tailwind.config.js` — remove `@formkit/themes/tailwindcss` plugin
10. Edit `CLAUDE.md` — remove FormKit documentation
11. Delete all 12 `*Formkit.vue` wrapper components and 10 `*-formkit.ts` definition files
12. Delete `src/formkit-components.d.ts`, `src/pages/formkit-test.vue`, `classifications.txt`
13. Remove 5 `@formkit/*` packages from `package.json` (keep `@formkit/auto-animate`)
14. Run `pnpm install` to update lockfile
15. Verify build succeeds and grep for remaining FormKit references

**`@formkit/auto-animate` Decision:**
Keep `@formkit/auto-animate`. It is the official, framework-agnostic package name (FormKit created AutoAnimate as a standalone utility). It has zero dependencies on the FormKit form library. There is no practical alternative npm package with the same `/vue` subpath export.

**Patterns to Follow:**

- Delete files completely, never comment out
- When editing demo pages, remove entire FormKit sections cleanly (including surrounding divs, headings)
- Remove associated `ref()` declarations when removing FormKit sections from pages
- Verify no remaining imports reference deleted files
- Keep `emit('blur')` calls in DateInput even though the comments mention FormKit

**Dependencies:**

- No task dependencies
- Tasks 005 and 006 depend on this task completing
<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Edit `src/main.ts` — remove all FormKit imports, class configs, plugin registration (keep app bootstrap)
- [ ] Edit `src/lib/main.ts` — remove FormKit imports, Window declarations (`CreateAutoAnimatePlugin`, `GenerateClasses`, `ElectricityUIFormkitTypes`), `EUI.Components.FormKit`, `EUI.Utils.FormKit`
- [ ] Edit or delete `src/components/Tree/index.ts` — remove FormKit tree input exports
- [ ] Edit 10 demo pages — remove FormKit sections, associated script state, and stray comments (see Specification)
- [ ] Edit `src/components/DateInput/DateInput.vue` — remove FormKit comments (keep blur emits)
- [ ] Edit `src/pages/index.vue` — remove FormKit test link and mask-inputs link (if page deleted)
- [ ] Edit `src/components.d.ts` — remove 12 FormKit component type declarations
- [ ] Edit `tsconfig.node.json` — remove `formkit-components.d.ts` reference
- [ ] Edit `tailwind.config.js` — remove `@formkit/themes/tailwindcss` plugin
- [ ] Edit `CLAUDE.md` — remove FormKit documentation references
- [ ] Delete 12 `*Formkit.vue` wrapper components (see Specification for exact paths)
- [ ] Delete 10 `*-formkit.ts` definition files (see Specification for exact paths)
- [ ] Delete `src/formkit-components.d.ts`, `src/pages/formkit-test.vue`, `classifications.txt`
- [ ] Remove 5 `@formkit/*` packages from `package.json` (keep `@formkit/auto-animate`)
- [ ] Run `pnpm install` to regenerate lockfile
- [ ] Grep entire codebase for remaining FormKit references (excluding `@formkit/auto-animate`)
- [ ] Verify project builds successfully
<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Priority:** High — this removal unblocks other tasks by simplifying the codebase.

**Related Tasks:**

- task-005-update-dependencies depends on this task completing first
- task-006-build-registry-integration depends on this task (transitively)
<!-- NOTES:END -->
