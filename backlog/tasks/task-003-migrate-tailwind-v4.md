---
id: task-003-migrate-tailwind-v4
title: Migrate Tailwind CSS 3→4 in electricity-ui
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

Upgrade electricity-ui from Tailwind CSS 3 to Tailwind CSS 4. Tailwind v4 moves to a CSS-first configuration model, eliminating the need for JavaScript config files and PostCSS plugins. This migration involves:

1. **Dependency swap**: Remove v3 packages (`tailwindcss` v3, `autoprefixer`, `postcss-import`, `@tailwindcss/forms`, `@tailwindcss/typography`, `tailwindcss-animate`, `tailwind-scrollbar`) and install v4 packages (`tailwindcss` v4, `@tailwindcss/vite`, `tw-animate-css`).
2. **Config file removal**: Delete `tailwind.config.js` and `postcss.config.js` — v4 uses CSS-first configuration.
3. **CSS entry point rewrite**: Convert `src/assets/base.css` from `@tailwind` directives + `@layer` blocks to `@import "tailwindcss"` + `@theme {}` block syntax. Migrate all theme customizations (colors, fonts, keyframes, container) from JS config to CSS.
4. **Vite plugin**: Replace PostCSS-based Tailwind integration with `@tailwindcss/vite` in `vite.config.ts`.
5. **Utility class updates**: Fix renamed utilities (`shadow-sm` → `shadow-xs`, `rounded-sm` → `rounded-xs`, `outline-none` → `outline-hidden`, `flex-shrink-0` → `shrink-0`, `bg-opacity-75` → `bg-gray-50/75`), update `!` important modifier syntax (prefix → suffix).
6. **Remove ALL `@apply`** (83 usages → 0): Delete ~40 unused CSS classes, convert remaining ~43 `@apply` usages to plain CSS with `var()` references to Tailwind's CSS custom properties. This includes base layer styles, component classes (.btn, .input, .checkbox, etc.), Highcharts 3rd-party overrides, and Vue `<style>` blocks.

The target format matches the dashboard-template's `src/assets/main.css` setup. This is a manual migration guided by the official Tailwind v4 upgrade documentation.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Current State (electricity-ui)

**Config files:**

- `tailwind.config.js` — JS config with: `darkMode: ['class']`, `safelist: ['dark']`, custom content paths, container config (center, padding, 2xl screen), extended theme (fonts, colors, keyframes, animations), 5 plugins
- `postcss.config.js` — PostCSS with: `postcss-import`, `tailwindcss/nesting`, `tailwindcss`, `autoprefixer`

**CSS entry point:** `src/assets/base.css`

- Uses `@tailwind base/components/utilities` directives
- Defines CSS variables for dynamic primary/secondary color shades (HSL format)
- Defines shadcn-vue CSS variables (light + `.dark` theme)
- Contains extensive `@layer components` block (~270 lines of custom component classes: buttons, inputs, badges, tabs, tables, etc.)
- Contains `@layer utilities` block (currently empty/example)
- Uses `theme()` function: `theme('colors.gray.700')` on line 34
- Uses `bg-opacity-75` (deprecated) on line 342
- Uses `!important` modifier with prefix syntax (`!rounded`, `!bg-white`, etc.) on ~10 lines
- Has non-layer Highcharts override styles at the bottom

**Tailwind-related dependencies to remove:**

- `tailwindcss` ^3.4.19 (devDep)
- `autoprefixer` ^10.4.27 (devDep)
- `postcss` ^8.5.6 (devDep)
- `postcss-import` ^16.1.1 (devDep)
- `@tailwindcss/forms` ^0.5.11 (devDep)
- `@tailwindcss/typography` ^0.5.19 (devDep)
- `tailwindcss-animate` ^1.0.7 (dep)
- `tailwind-scrollbar` ^3.1.0 (devDep)
- `@formkit/themes` 1.6.9 (dep) — removed by task-002

**Tailwind-related dependencies to add:**

- `tailwindcss` v4 (devDep)
- `@tailwindcss/vite` (devDep)
- `tw-animate-css` (dep)

**Theme customizations to migrate from JS → CSS:**

- Font family: `sans: ['"Inter Variable"', 'Inter', ...defaultTheme.fontFamily.sans]`
- Dynamic primary/secondary color scales (10 shades each, HSL via CSS vars)
- Named brand colors: `sq-white`, `sq-black`, `sq-pink` (10 shades), `sq-lavendel` (10 shades), `sq-blue` (10 shades), `sq-green` (10 shades), `sq-sand` (10 shades)
- Gray alias: `gray: colors.zinc` — **CRITICAL**: 429 occurrences of `gray-*` across 49 files rely on this alias. In v4, Tailwind's default `gray` is NOT zinc. Must explicitly remap `--color-gray-*` to zinc values in `@theme` to preserve visual consistency
- shadcn-vue semantic colors: border, input, ring, background, foreground, destructive, muted, accent, popover, card (each with CSS var references)
- Keyframes: accordion-down/up, collapsible-down/up
- Animations: accordion-down/up, collapsible-down/up
- Container: center, 2rem padding, 2xl: 1400px

**Renamed utilities to fix (per v4 migration guide):**
| v3 usage | v4 replacement | Files affected |
|----------|---------------|----------------|
| `shadow-sm` | `shadow-xs` | base.css (12 occurrences), defaults.ts, many .vue files |
| `shadow` (bare) | `shadow-sm` | base.css, .vue files |
| `rounded-sm` | `rounded-xs` | base.css, .vue files |
| `rounded` (bare) | `rounded-sm` | base.css, .vue files |
| `outline-none` | `outline-hidden` | base.css (5), defaults.ts (3) |
| `blur` (bare) → `blur-sm` | `backdrop-blur` → `backdrop-blur-sm` | base.css line 342 |
| `flex-shrink-0` | `shrink-0` | base.css (1), defaults.ts (3) |
| `bg-opacity-75` | Use `bg-gray-50/75` opacity modifier | base.css line 342 |
| `ring` (bare) | `ring-3` | Not used standalone currently |

**Important modifier syntax change:**

- v3 prefix `!rounded` → v4 suffix `rounded!` (base.css lines 162, 166, 297, 375, 425, 429, 433)
- v3 prefix `!ring-red-500` → v4 suffix `ring-red-500!` (base.css lines 150, 158)
- v3 prefix `!bg-primary-50` → v4 suffix `bg-primary-50!` (vue template files)

**Complete `@apply` removal:**
The user requires ALL `@apply` usage to be removed. There are 83 `@apply` usages across the codebase:

- `src/assets/base.css` — 79 usages (in `@layer base`, `@layer components`, and Highcharts overrides)
- `src/pages/tables2.vue` — 2 usages (in `<style>` block)
- `src/pages/tables3.vue` — 2 usages (in `<style>` block)

**Full `@apply` inventory in `base.css`:**

_`@layer base` (5 usages):_
| Line | Class/Selector | `@apply` value | Replacement strategy |
|------|---------------|----------------|---------------------|
| 41 | `a` | `text-primary-600 hover:text-primary-500 font-medium rounded focus:decoration-2` | Plain CSS with `var()` + `@variant` |
| 45 | `.link` | `focus:outline-none focus:underline focus:decoration-primary-500` | Plain CSS with `var()` + `@variant` |
| 50 | `th, td` | `text-left` | Plain CSS: `text-align: left` |
| 119 | `*` | `border-border` | Plain CSS: `border-color: var(--border)` |
| 123 | `body` | `bg-white text-gray-700` | Plain CSS: `background-color: var(--color-background); color: var(--color-gray-700)` |

_`@layer components` — Button classes (18 usages):_
| Custom class | Template usages | Replacement strategy |
|-------------|----------------|---------------------|
| `.btn-base` | 0 (only referenced by other CSS classes) | Convert to plain CSS with `var()` references |
| `.btn` | 108 across 10 files | Convert to plain CSS; also consider inlining in demo pages |
| `.btn-primary` | ~30 across demo pages | Convert to plain CSS |
| `.btn-danger` | ~5 in modals.vue | Convert to plain CSS |
| `.btn-secondary` | ~5 in demo pages | Convert to plain CSS |
| `.btn-secondary-danger` | 0 in templates | Convert to plain CSS (or delete if unused) |
| `.btn-sm` | ~3 in popovers/tooltip pages | Convert to plain CSS |
| `.btn-lg` | 0 in templates | Convert to plain CSS (or delete if unused) |
| `.btn-group` (nested) | 0 in templates | Delete (unused) |

_`@layer components` — Form classes (10 usages):_
| Custom class | Template usages | Replacement strategy |
|-------------|----------------|---------------------|
| `.input` | ~23 across 21 files | Convert to plain CSS with `var()` |
| `.input.error` (nested) | Used via dynamic class | Convert to plain CSS |
| `.label` | ~243 across 31 files (NOTE: includes `<label>` elements, not just the class) | Convert to plain CSS |
| `.description` | ~243 (same grep, shared with label) | Convert to plain CSS |
| `.error` | ~13 across 6 files | Convert to plain CSS |
| `.input-group` (nested) | 0 in templates | Delete (unused) |
| `.checkbox` | ~33 across 11 files | Convert to plain CSS |
| `.radio` | Same grep as checkbox | Convert to plain CSS |

_`@layer components` — Badge classes (3 usages):_
| Custom class | Template usages | Replacement strategy |
|-------------|----------------|---------------------|
| `.badge-base` | 0 in templates | Delete (unused) |
| `.badge` | 0 in templates | Delete (unused, only in `tables-custom-expansion.vue` as `badge-sm` which is different) |
| `.badge-lg` | 0 in templates | Delete (unused) |

_`@layer components` — Tab classes (4 usages):_
| Custom class | Template usages | Replacement strategy |
|-------------|----------------|---------------------|
| `.tab-list` (nested) | 0 in templates | Delete (unused) |
| `.tab-panel` | 0 in templates | Delete (unused) |

_`@layer components` — Table classes (27 usages):_
| Custom class | Template usages | Replacement strategy |
|-------------|----------------|---------------------|
| `.table-container` (nested) | 0 in Vue templates | Delete (unused — tables use `defaults.ts` inline classes) |
| `.alternate` (nested) | 0 in templates | Delete (unused) |
| `.table-md` (nested) | 0 in templates | Delete (unused) |
| `.table-sm` (nested) | 0 in templates | Delete (unused) |

_`@layer components` — Other (2 usages):_
| Custom class | Template usages | Replacement strategy |
|-------------|----------------|---------------------|
| `.page-title` | 0 in templates | Delete (unused) |
| `.page-subtitle` | 0 in templates | Delete (unused) |
| `.chart-container` | 0 in templates | Delete (unused) |

_Highcharts overrides (5 usages, outside @layer):_
| Selector | `@apply` value | Replacement strategy |
|----------|----------------|---------------------|
| `.highcharts-tooltip > span` | `bg-white border border-gray-300 p-3 rounded shadow-lg` | Convert to plain CSS with `var()` |
| `.highcharts-data-table` | `table-container` | Replace with the plain CSS equivalent of table-container |
| `.highcharts-menu` | `!bg-white !py-2 !border !rounded !border-gray-300 !text-gray-700 !shadow-lg` | Convert to plain CSS |
| `.highcharts-menu-item` | `!bg-white !px-3 !py-2 !transition-none` | Convert to plain CSS |
| `.highcharts-menu-item:hover` | `!bg-primary-50 !text-gray-800` | Convert to plain CSS |

_Vue `<style>` blocks (4 usages):_
| File | `@apply` value | Replacement strategy |
|------|----------------|---------------------|
| `tables2.vue:322` | `bg-gray-50` | Plain CSS: `background-color: var(--color-gray-50)` |
| `tables2.vue:325` | `bg-gray-100` | Plain CSS: `background-color: var(--color-gray-100)` |
| `tables3.vue:432` | `bg-gray-50` | Plain CSS: `background-color: var(--color-gray-50)` |
| `tables3.vue:435` | `bg-gray-100` | Plain CSS: `background-color: var(--color-gray-100)` |

**Summary of `@apply` replacement approach:**

1. **Delete unused classes entirely** — page-title, page-subtitle, badge-base, badge, badge-lg, tab-list, tab-panel, table-container, alternate, table-md, table-sm, chart-container, btn-group, input-group, btn-secondary-danger (if unused), btn-lg (if unused). This removes ~40 `@apply` usages.
2. **Convert used CSS classes to plain CSS** — btn, btn-base, btn-primary, btn-danger, btn-secondary, btn-sm, input, label, description, error, checkbox, radio. Replace Tailwind utilities in `@apply` with equivalent plain CSS properties using `var(--color-*)`, `var(--spacing-*)`, etc. Use `@variant` for state variants (hover, focus, disabled). This removes ~30 `@apply` usages.
3. **Convert Highcharts overrides to plain CSS** — these are 3rd-party component styles that should use plain CSS anyway. This removes ~5 `@apply` usages.
4. **Convert base layer styles to plain CSS** — link styles, body styles, etc. This removes ~5 `@apply` usages.
5. **Convert Vue `<style>` blocks to plain CSS** — simple `var()` replacements. This removes 4 `@apply` usages.

**`theme()` function usage:**

- `src/assets/base.css:34` — `theme('colors.gray.700')` → replace with `var(--color-zinc-700)` (since gray = zinc in this project)

**`tailwind-scrollbar` plugin:**

- Used in 1 file: `TreeSelect.vue` with classes `scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400`
- Plugin has no v4 support — replace with native CSS `scrollbar-width: thin` and `scrollbar-color` properties

**Container customization:**

- v3 config: `container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } }`
- v4: Use `@utility container` directive in CSS

**Dark mode:**

- v3 config: `darkMode: ['class']`
- v4: Use `@custom-variant dark (&:is(.dark *));` in CSS (matches dashboard-template)

**Content/safelist:**

- v3 config: `content: ['./**/*.{vue,ts}']`, `safelist: ['dark']`
- v4: Automatic content detection (no config needed). For safelist use `@source inline("dark")` if needed

**Default border color change:**

- v4 changes default border color from `gray-200` to `currentColor`
- The project extensively uses `border` without explicit color — add compatibility layer in `@layer base`

**Default placeholder color change:**

- v4 uses current text color at 50% opacity instead of `gray-400`
- May need compatibility layer if current placeholder styling matters

### Target Format

Match the dashboard-template's `src/assets/main.css`:

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

@theme {
	--font-sans: 'Inter Variable', system-ui, -apple-system, sans-serif;
}

@theme inline {
	/* shadcn-vue CSS variable mappings */
}

:root {
	/* CSS custom properties using oklch() */
}

.dark {
	/* Dark mode overrides */
}

@layer base {
	* {
		@apply border-border outline-ring/50;
	}
	body {
		@apply bg-background text-foreground;
	}
}
```

### What the CLI upgrade tool can handle vs manual work

**CLI tool (`npx @tailwindcss/upgrade`) can handle:**

- Updating `tailwindcss` package version
- Converting `@tailwind` directives to `@import "tailwindcss"`
- Migrating `tailwind.config.js` theme values to `@theme {}` block
- Renaming deprecated/renamed utility classes in templates
- Converting `@layer components/utilities` to `@utility` directives
- Updating `theme()` function calls to CSS variables
- Updating important modifier prefix to suffix syntax

**CLI tool limitations / manual work required:**

- Cannot handle `tailwindcss-animate` → `tw-animate-css` swap
- Cannot handle `tailwind-scrollbar` plugin removal (no v4 equivalent)
- Cannot handle `@formkit/themes/tailwindcss` plugin removal (task-002 dependency)
- May not correctly handle dynamic HSL color generation pattern (`generateDynamic` function)
- May not correctly handle complex nested `@apply` within `@layer components` (button groups, input groups, table containers with nested selectors)
- Cannot add `@reference` directives to Vue `<style>` blocks
- Cannot configure `@custom-variant dark`
- May need manual review of shadcn-vue CSS variable conversions (HSL → oklch if desired)
- Container customization must be done manually with `@utility container`
- Default border color compatibility layer must be added manually

**Recommended approach: Manual migration**, using the upgrade docs as reference. The CLI tool can be tried first on a branch to see what it catches, but the project's complexity (dynamic colors, nested component styles, multiple plugins) means significant manual review and fixes will be needed regardless.

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

### Architecture Approach

Manual migration following the official Tailwind CSS v3→v4 upgrade guide. The migration has 6 phases executed in order.

### Phase 1: Dependency Changes (`package.json`)

Remove:

```
tailwindcss, autoprefixer, postcss, postcss-import,
@tailwindcss/forms, @tailwindcss/typography,
tailwindcss-animate, tailwind-scrollbar
```

Add:

```
tailwindcss (v4), @tailwindcss/vite, tw-animate-css
```

### Phase 2: Config File Removal

Delete:

- `tailwind.config.js`
- `postcss.config.js`

### Phase 3: Vite Plugin (`vite.config.ts`)

Add `@tailwindcss/vite` plugin:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [
		tailwindcss(),
		// ... existing plugins
	],
})
```

### Phase 4: CSS Entry Point Rewrite (`src/assets/base.css`)

Transform from v3 to v4 format:

**Header:**

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));
```

**Theme block — fonts, gray→zinc alias, and brand colors:**

```css
@theme {
	--font-sans: 'Inter Variable', Inter, system-ui, -apple-system, sans-serif;

	/* CRITICAL: Remap gray to zinc (preserves v3 behavior where gray: colors.zinc) */
	--color-gray-50: var(--color-zinc-50);
	--color-gray-100: var(--color-zinc-100);
	/* ... all gray shades 50-950 mapped to zinc ... */

	/* Dynamic primary/secondary colors (keep HSL CSS var pattern) */
	--color-primary-50: hsl(var(--hsl-primary-50));
	/* ... all 10 shades for primary and secondary ... */

	/* Brand colors — static values */
	--color-sq-white: #fafafa;
	--color-sq-black: #14181e;
	--color-sq-pink-50: #fdf2f7;
	/* ... all sq-pink, sq-lavendel, sq-blue, sq-green, sq-sand shades ... */

	/* Keyframes */
	--animate-accordion-down: accordion-down 0.2s ease-out;
	--animate-accordion-up: accordion-up 0.2s ease-out;
	--animate-collapsible-down: collapsible-down 0.2s ease-in-out;
	--animate-collapsible-up: collapsible-up 0.2s ease-in-out;
}
```

**Theme inline block — shadcn-vue semantic mappings:**

```css
@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	/* ... all shadcn-vue semantic color mappings ... */
}
```

**CSS variables (`:root` and `.dark`):**

- Keep existing shadcn-vue CSS variables
- Rename dynamic color vars from `--color-primary-*` to `--hsl-primary-*` to avoid collision with `@theme` namespace
- Consider converting HSL values to oklch for consistency with dashboard-template (optional, can be deferred)

**Base layer — convert `@apply` to plain CSS:**

```css
@layer base {
	* {
		border-color: var(--border);
	}
	body {
		background-color: var(--background);
		color: var(--foreground);
	}
	html,
	body {
		font-size: 16px;
		height: 100%;
		font-family:
			'Inter Variable',
			Inter,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
	}
	a {
		color: var(--color-primary-600);
		font-weight: 500;
		border-radius: var(--radius-sm);
		&:hover {
			color: var(--color-primary-500);
		}
		&:focus {
			text-decoration-thickness: 2px;
		}
	}
	.link {
		&:focus {
			outline: none;
			text-decoration: underline;
			text-decoration-color: var(--color-primary-500);
		}
	}
	th,
	td {
		text-align: left;
	}
}
```

**Component classes — convert `@apply` to plain CSS in `@layer components`:**

All custom CSS classes that are actively used (`.btn`, `.btn-primary`, `.input`, `.checkbox`, etc.) must be rewritten from `@apply` to plain CSS properties using `var()` references to Tailwind's CSS custom properties. Use `@variant` for interactive states.

Example conversion:

```css
/* BEFORE (v3 with @apply): */
.btn-base {
	@apply inline-flex transition-shadow items-center font-medium rounded-md
		focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
		px-4 py-2 text-sm flex-shrink-0 disabled:cursor-default;
}

/* AFTER (v4 plain CSS): */
@layer components {
	.btn-base {
		display: inline-flex;
		align-items: center;
		font-weight: 500;
		border-radius: var(--radius-md);
		padding: var(--spacing-2) var(--spacing-4);
		font-size: var(--text-sm);
		line-height: var(--text-sm--line-height);
		flex-shrink: 0;
		transition-property: box-shadow;
		transition-duration: 150ms;
		&:focus {
			outline: none;
			box-shadow: var(--ring-offset-shadow), var(--ring-shadow);
			--tw-ring-color: var(--color-primary-500);
			--tw-ring-offset-width: 2px;
		}
		&:disabled {
			cursor: default;
		}
	}
}
```

**Unused classes — DELETE entirely:**
The following classes are defined in `base.css` but never used in any template. Delete them:

- `.page-title`, `.page-subtitle` (0 usages)
- `.badge-base`, `.badge`, `.badge-lg` (0 usages)
- `.tab-list`, `.tab-panel` (0 usages)
- `.table-container`, `.alternate`, `.table-md`, `.table-sm` (0 usages — tables use `defaults.ts` inline classes)
- `.chart-container` (0 usages)
- `.btn-group` (0 usages)
- `.input-group` (0 usages)
- `.btn-secondary-danger` (verify, likely 0 usages)
- `.btn-lg` (verify, likely 0 usages)

This eliminates ~40 `@apply` usages by simply deleting dead code.

**Highcharts overrides — convert to plain CSS:**

```css
.highcharts-tooltip > span {
	background-color: white;
	border: 1px solid var(--color-gray-300);
	padding: var(--spacing-3);
	border-radius: var(--radius-sm);
	box-shadow: var(--shadow-lg);
}

.highcharts-menu {
	font-family: 'Inter Variable';
	background-color: white !important;
	padding-block: var(--spacing-2) !important;
	border: 1px solid var(--color-gray-300) !important;
	border-radius: var(--radius-sm) !important;
	color: var(--color-gray-700) !important;
	box-shadow: var(--shadow-lg) !important;
}
/* etc. */
```

**Vue `<style>` blocks — convert to plain CSS:**

```vue
<!-- tables2.vue / tables3.vue -->
<style>
tr:nth-child(even) td {
	background-color: var(--color-gray-50);
}
tr:nth-child(even):hover td {
	background-color: var(--color-gray-100);
}
</style>
```

No `@reference` directive needed since there's no `@apply`.

**Container customization:**

```css
@utility container {
	margin-inline: auto;
	padding-inline: 2rem;
	max-width: 1400px;
}
```

**Default border color compatibility:**

```css
@layer base {
	*,
	::after,
	::before,
	::backdrop,
	::file-selector-button {
		border-color: var(--color-gray-200, currentColor);
	}
}
```

### Phase 5: Utility Class Updates (templates + CSS)

Search-and-replace across all `.vue`, `.ts`, `.css` files:

| Find                                                 | Replace                                                  | Scope                 |
| ---------------------------------------------------- | -------------------------------------------------------- | --------------------- |
| `shadow-sm`                                          | `shadow-xs`                                              | All files             |
| `shadow` (bare, not `shadow-*`)                      | `shadow-sm`                                              | All files             |
| `rounded-sm`                                         | `rounded-xs`                                             | All files             |
| `rounded` (bare, not `rounded-*`)                    | `rounded-sm`                                             | All files             |
| `outline-none`                                       | `outline-hidden`                                         | All files             |
| `backdrop-blur` (bare)                               | `backdrop-blur-sm`                                       | base.css              |
| `flex-shrink-0`                                      | `shrink-0`                                               | base.css, defaults.ts |
| `bg-opacity-75`                                      | Remove, use `bg-gray-50/75`                              | base.css              |
| `backdrop-filter`                                    | Remove (no longer needed)                                | base.css              |
| `theme('colors.gray.700')`                           | `var(--color-zinc-700)`                                  | base.css              |
| `!rounded` (prefix)                                  | `rounded!` (suffix)                                      | base.css              |
| `!bg-*`, `!py-*`, etc. (prefix)                      | `bg-*!`, `py-*!`, etc. (suffix)                          | base.css, .vue files  |
| `scrollbar-thin scrollbar-track-* scrollbar-thumb-*` | Native CSS `scrollbar-width: thin; scrollbar-color: ...` | TreeSelect.vue        |

**Important:** These replacements must be done carefully with word-boundary regex to avoid false positives. Order matters — rename `shadow-sm` → `shadow-xs` BEFORE renaming `shadow` → `shadow-sm`. Scope is ALL `.vue`, `.ts`, `.css` files in `src/` — not just base.css and defaults.ts. Use `grep` to find all occurrences before replacing.

### Phase 6: Vue `<style>` Block Updates

Since ALL `@apply` is being removed, Vue `<style>` blocks are converted to plain CSS (handled in Phase 4b). No `@reference` directive is needed.

### Key Files Changed

| File                                                        | Action                                                                |
| ----------------------------------------------------------- | --------------------------------------------------------------------- |
| `tailwind.config.js`                                        | DELETE                                                                |
| `postcss.config.js`                                         | DELETE                                                                |
| `package.json`                                              | Update deps                                                           |
| `vite.config.ts`                                            | Add `@tailwindcss/vite` plugin                                        |
| `src/assets/base.css`                                       | Full rewrite to v4 format                                             |
| `src/components/Table/defaults.ts`                          | Rename utilities                                                      |
| `src/components/Tree/TreeSelect.vue`                        | Replace scrollbar classes                                             |
| `src/components/Tree/TreeBranch.vue`                        | Fix `!` prefix modifiers                                              |
| `src/components/RangeCalendar/RangeCalendarCellTrigger.vue` | Fix `!` prefix modifiers                                              |
| `src/pages/tables2.vue`                                     | Add `@reference`, rename utilities                                    |
| `src/pages/tables3.vue`                                     | Add `@reference`, rename utilities                                    |
| Multiple `.vue` files                                       | Rename `shadow-sm`→`shadow-xs`, `outline-none`→`outline-hidden`, etc. |

### Dependencies

- **task-002 (Remove FormKit)** must complete first — removes `@formkit/themes/tailwindcss` plugin from tailwind.config.js and all FormKit dependencies, simplifying the migration
- **task-004 (Align shadcn-vue theming)** depends on this task — will refine the CSS variable format (HSL → oklch) after v4 is working
- **task-006 (Build registry integration)** depends on this task
<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

### Phase 1: Dependencies

- [ ] Remove devDeps: `tailwindcss`, `autoprefixer`, `postcss`, `postcss-import`, `@tailwindcss/forms`, `@tailwindcss/typography`, `tailwind-scrollbar`
- [ ] Remove dep: `tailwindcss-animate`
- [ ] Add devDeps: `tailwindcss` (v4), `@tailwindcss/vite`
- [ ] Add dep: `tw-animate-css`
- [ ] Run install to verify dependency resolution

### Phase 2: Config File Removal

- [ ] Delete `tailwind.config.js`
- [ ] Delete `postcss.config.js`

### Phase 3: Vite Plugin

- [ ] Import `tailwindcss` from `@tailwindcss/vite` in `vite.config.ts`
- [ ] Add `tailwindcss()` to the plugins array in `vite.config.ts`

### Phase 4: CSS Entry Point Rewrite (`src/assets/base.css`)

- [ ] Replace `@tailwind base/components/utilities` directives with `@import "tailwindcss"`
- [ ] Add `@import "tw-animate-css"` after tailwindcss import
- [ ] Add `@custom-variant dark (&:is(.dark *));`
- [ ] Create `@theme {}` block with: font-sans, gray→zinc alias (all shades 50-950), brand color scales (sq-pink, sq-lavendel, sq-blue, sq-green, sq-sand, sq-white, sq-black), dynamic primary/secondary colors, keyframes, and animations
- [ ] **CRITICAL**: Remap `--color-gray-*` to zinc values in `@theme` — 429 occurrences of `gray-*` across 49 files depend on this alias
- [ ] Create `@theme inline {}` block with shadcn-vue semantic color mappings (background, foreground, primary, secondary, muted, accent, destructive, popover, card, border, input, ring)
- [ ] Rename dynamic color CSS vars from `--color-primary-*` to `--hsl-primary-*` to avoid `@theme` namespace collision, update all references
- [ ] Keep `:root` and `.dark` CSS variable blocks for shadcn-vue theming
- [ ] Remove empty `@layer utilities` block
- [ ] Replace `theme('colors.gray.700')` with `var(--color-gray-700)` (which maps to zinc via @theme)
- [ ] Add `@utility container` block with `margin-inline: auto; padding-inline: 2rem;` (existing usage always adds `mx-auto` and `px-*` inline, so max-width override from v3 `screens.2xl: 1400px` may not be needed — verify)
- [ ] Update `@layer base` body style to use `bg-background` (not `bg-white`) so dark mode works correctly

### Phase 4b: Remove ALL `@apply` (83 usages → 0)

**Delete unused CSS classes (removes ~40 `@apply` usages):**

- [ ] Delete `.page-title` (0 template usages)
- [ ] Delete `.page-subtitle` (0 template usages)
- [ ] Delete `.badge-base`, `.badge`, `.badge-lg` (0 template usages)
- [ ] Delete `.tab-list` and nested `.tab` rules (0 template usages)
- [ ] Delete `.tab-panel` (0 template usages)
- [ ] Delete `.table-container` and all nested table rules (0 template usages — tables use `defaults.ts` inline classes)
- [ ] Delete `.alternate` (0 template usages)
- [ ] Delete `.table-md` (0 template usages)
- [ ] Delete `.table-sm` (0 template usages)
- [ ] Delete `.chart-container` (0 template usages)
- [ ] Delete `.btn-group` and nested rules (0 template usages)
- [ ] Delete `.input-group` and nested rules (0 template usages)
- [ ] Verify and delete `.btn-secondary-danger` if unused in templates
- [ ] Verify and delete `.btn-lg` if unused in templates

**Convert `@layer base` styles to plain CSS (5 usages):**

- [ ] Convert `a { @apply ... }` → plain CSS with `color: var(--color-primary-600); font-weight: 500;` etc. + `@variant hover/focus` or native `&:hover`/`&:focus`
- [ ] Convert `.link { @apply ... }` → plain CSS focus styles
- [ ] Convert `th, td { @apply text-left }` → `text-align: left`
- [ ] Convert `* { @apply border-border }` → `border-color: var(--border)`
- [ ] Convert `body { @apply bg-white text-gray-700 }` → `background-color: var(--background); color: var(--foreground)`

**Convert used component classes to plain CSS (removes ~30 `@apply` usages):**

- [ ] Convert `.btn-base` — replace `@apply` with plain CSS properties using `var(--spacing-*)`, `var(--radius-*)`, `var(--color-*)`, `var(--text-*)`, etc.
- [ ] Convert `.btn` — plain CSS with `var()` + `&:hover`, `&:active`, `&:disabled` native selectors
- [ ] Convert `.btn-primary` — plain CSS
- [ ] Convert `.btn-danger` — plain CSS
- [ ] Convert `.btn-secondary` — plain CSS
- [ ] Convert `.btn-sm` — plain CSS
- [ ] Convert `.input` — plain CSS with `var()` + `&.error`, `&:focus`, `&:disabled` selectors
- [ ] Convert `.label` — plain CSS
- [ ] Convert `.description` — plain CSS
- [ ] Convert `.error` — plain CSS
- [ ] Convert `.checkbox` — plain CSS
- [ ] Convert `.radio` — plain CSS

**Convert Highcharts overrides to plain CSS (5 usages):**

- [ ] Convert `.highcharts-tooltip > span` — replace `@apply` with plain CSS
- [ ] Convert `.highcharts-data-table` — replace `@apply table-container` with the CSS properties directly (since `.table-container` is being deleted)
- [ ] Convert `.highcharts-menu` — replace `@apply` with plain CSS
- [ ] Convert `.highcharts-menu-item` — replace `@apply` with plain CSS
- [ ] Convert `.highcharts-menu-item:hover` — replace `@apply` with plain CSS

**Convert Vue `<style>` block `@apply` to plain CSS (4 usages):**

- [ ] Convert `tables2.vue` `@apply bg-gray-50` → `background-color: var(--color-gray-50)`
- [ ] Convert `tables2.vue` `@apply bg-gray-100` → `background-color: var(--color-gray-100)`
- [ ] Convert `tables3.vue` `@apply bg-gray-50` → `background-color: var(--color-gray-50)`
- [ ] Convert `tables3.vue` `@apply bg-gray-100` → `background-color: var(--color-gray-100)`

**Final verification:**

- [ ] Grep for `@apply` across entire codebase — must return 0 results

### Phase 5: Renamed Utility Classes (ALL .vue, .ts, .css files — full codebase sweep)

- [ ] Rename `shadow-sm` → `shadow-xs` (base.css: 12, defaults.ts, ~26 .vue files including PopoverContent.vue, ComboboxList.vue, etc.)
- [ ] Rename bare `shadow` → `shadow-sm` (carefully, AFTER shadow-sm→shadow-xs is done)
- [ ] Rename `rounded-sm` → `rounded-xs` (if used in templates)
- [ ] Rename bare `rounded` → `rounded-sm` (where used as standalone utility, not in rounded-md/lg/xl etc.)
- [ ] Rename `outline-none` → `outline-hidden` (base.css: 5, defaults.ts: 3, plus any .vue templates)
- [ ] Rename `flex-shrink-0` → `shrink-0` (base.css: 1, defaults.ts: 3)
- [ ] Rename `backdrop-blur` (bare) → `backdrop-blur-sm` (base.css line 342)
- [ ] Remove `backdrop-filter` utility (no longer needed in v4, base.css line 342)
- [ ] Replace `bg-opacity-75` with opacity modifier syntax `bg-gray-50/75` (base.css line 342)
- [ ] Fix `!` important modifier prefix → suffix syntax in base.css (~10 occurrences: `!rounded`→`rounded!`, `!px-3`→`px-3!`, `!bg-white`→`bg-white!`, etc.)
- [ ] Fix `!` important modifier prefix → suffix syntax in .vue template files (TreeBranch.vue, RangeCalendarCellTrigger.vue, and any others found via grep `!\w+-`)
- [ ] Replace `scrollbar-thin scrollbar-track-* scrollbar-thumb-*` classes in TreeSelect.vue with native CSS `scrollbar-width: thin; scrollbar-color: var(--color-gray-300) var(--color-gray-100);`
- [ ] Verify `space-x-*` / `space-y-*` usage (206 occurrences across 32 files) — v4 changed the selector from `:not([hidden]) ~ :not([hidden])` to `:not(:last-child)`. Test visually for layout changes, especially where inline elements or custom margins/padding are used alongside these utilities

### Phase 6: Vue `<style>` Block Updates

- [ ] ~~Add `@reference`~~ — No longer needed since all `@apply` is being removed
- [ ] Handled in Phase 4b above (Vue `<style>` blocks converted to plain CSS)

### Verification

- [ ] Run `vp build` (or `vite build`) — verify no CSS compilation errors
- [ ] Run `vp dev` — verify dev server starts and HMR works
- [ ] Visual spot-check: buttons, inputs, tables, badges, tabs render correctly
- [ ] Verify dark mode toggle works (`.dark` class application)
- [ ] Verify custom brand colors (sq-pink, sq-blue, etc.) render correctly
- [ ] Verify dynamic primary/secondary color system still works
<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Priority:** High — this is a foundational change that subsequent theming and styling tasks depend on.

**Related Tasks:**

- task-002-remove-formkit must complete first (dependency)
- task-004-align-shadcn-vue-theming depends on this task
- task-006-build-registry-integration depends on this task

**Migration Strategy Decision:**
The user specified: "there's a migration CLI tool, but it can't do everything. Another option is all manual but you MUST use the documentation migration guide from tailwind to do it properly."

Recommended: **Manual migration** using the official Tailwind v4 upgrade guide (https://tailwindcss.com/docs/upgrade-guide). The CLI tool (`npx @tailwindcss/upgrade`) can optionally be run first on a branch to see what it auto-fixes, but this project has several patterns the CLI cannot handle:

1. Dynamic HSL color generation via `generateDynamic()` function
2. Complex nested `@layer components` blocks with nested selectors
3. `tailwind-scrollbar` plugin (no v4 equivalent)
4. `tailwindcss-animate` → `tw-animate-css` swap
5. FormKit Tailwind plugin removal (handled by task-002)

**Key v4 Breaking Changes to Watch For:**

- Default border color changes from `gray-200` to `currentColor` — the project uses many borderless `border` utilities that will look different
- Default ring width changes from 3px to 1px — affects all `ring` usages
- Default ring color changes from `blue-500` to `currentColor` — add `ring-blue-500` where old default was relied upon
- Buttons use `cursor: default` instead of `cursor: pointer` by default — may need compatibility CSS
- `hover` variant now only applies when device supports hover — affects mobile behavior
- `@layer` is now native CSS cascade layers — keep `@layer components` for component abstractions (do NOT convert to `@utility`)
- `space-x-*` / `space-y-*` selector changed from `:not([hidden]) ~ :not([hidden])` to `:not(:last-child)` — 206 occurrences across 32 files, test visually
- `divide-x-*` / `divide-y-*` selector also changed — same pattern
- `gray` is no longer aliased to `zinc` by default — must explicitly remap in `@theme` (429 occurrences depend on zinc-based gray)

**Dynamic Color System:**
The project uses a pattern where primary/secondary colors are defined as HSL CSS variables (`--color-primary-50` through `--color-primary-900`) and referenced in `tailwind.config.js` via `hsl(var(--color-primary-500), <alpha-value>)`. In v4, this needs to be converted to `@theme` entries. The `<alpha-value>` placeholder no longer exists — use standard CSS opacity modifiers instead. The CSS variable names need renaming to avoid collision with Tailwind v4's auto-generated `--color-*` namespace.

**`@apply` Removal Rationale:**
The user explicitly requested ALL `@apply` usage be removed. This is consistent with Tailwind v4 best practices — `@apply` exists for backward compatibility but the preferred approach is:

1. For reusable styles in CSS → use plain CSS with `var()` references to Tailwind's CSS custom properties
2. For element styling → use inline utility classes in templates
3. For component abstractions → define as Vue components with inline utilities, not CSS classes

This project benefits significantly from this change:

- ~40 of the 83 `@apply` usages are in **completely unused CSS classes** that can simply be deleted
- The remaining usages are straightforward conversions from `@apply text-sm text-gray-500` to `font-size: var(--text-sm); color: var(--color-gray-500);`
- Highcharts 3rd-party overrides were always better as plain CSS anyway

**Important CSS variable names in Tailwind v4:**
When converting `@apply` to plain CSS, use these Tailwind v4 CSS variable patterns:

- Colors: `var(--color-gray-500)`, `var(--color-primary-600)`
- Spacing: `var(--spacing-2)` for `0.5rem`, `var(--spacing-4)` for `1rem`
- Font size: `var(--text-sm)` for `0.875rem`, `var(--text-sm--line-height)` for line height
- Radius: `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`
- Shadows: `var(--shadow-sm)`, `var(--shadow-lg)`

**Scope Boundary:**
This task handles the Tailwind v3→v4 migration AND `@apply` removal. Converting CSS variables from HSL to oklch format is deferred to task-004 (shadcn-vue theming alignment). The current HSL values will work fine with Tailwind v4.

<!-- NOTES:END -->
