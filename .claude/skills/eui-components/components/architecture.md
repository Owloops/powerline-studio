# ElectricityUI Architecture

## Key Rules

- ElectricityUI is distributed primarily as a **shadcn-vue custom registry** -- components are copied into your project and fully owned
- UMD bundle (`electricity-ui.umd.js`) and ES module bundle still available for legacy consumers
- Built on **Reka UI** ^2.9 (Radix for Vue) primitives -- headless, accessible components
- **TailwindCSS 4** with CSS-first configuration -- no `tailwind.config.js`, no `@apply`
- **shadcn-vue theming** -- oklch CSS variables (`bg-background`, `text-foreground`, `bg-primary`, etc.)
- Icons via **@lucide/vue** (renamed from `lucide-vue-next`) and **heroicons** (via unplugin-icons)
- Vue 3 is a **peer dependency** -- must be available globally as `window.Vue` for UMD consumers
- No FormKit -- removed entirely. `@formkit/auto-animate` remains only for Tree component animations

## Distribution Model

### Primary: shadcn-vue Custom Registry

Components are defined in `registry.json` and source files live in `registry/new-york/`. Consumers install via:

```bash
pnpm dlx shadcn-vue@latest add @electricity-ui/alert
pnpm dlx shadcn-vue@latest add @electricity-ui/data-table
pnpm dlx shadcn-vue@latest add @electricity-ui/combobox @electricity-ui/custom-combobox
```

Registry items can declare dependencies on other registry items (`registryDependencies`) and npm packages (`dependencies`).

### Secondary: UMD Bundle (Legacy)

All components registered under global `EUI` namespace on `window` for legacy integration:

```javascript
window.EUI = {
	Components: {
		Alert,
		Modal,
		Notification,
		TreeRoot,
		TreeBranch,
		TreeSelect,
		TreeInfo,
		Popover,
		PopoverContent,
		PopoverTrigger,
		PopoverClose,
		Select: CustomSelect,
		Switch,
		Slider,
		AnimatedSlider,
		Combobox: CustomCombobox,
		Tooltip: CustomTooltip,
		NumberMask: MaskNumberInput,
		TextMask: MaskTextInput,
		DatePicker,
		DateRangePicker,
		DateInput,
		PercentageInput,
		SelectComponent: {
			/* all Select primitives */
		},
		ComboboxComponent: {
			/* all Combobox primitives */
		},
		TooltipComponent: {
			/* all Tooltip primitives */
		},
		DataTable: { DataTable, Defaults: { Icons, Language, Styles }, GlobalOptions },
	},
	Utils: {
		Tooltip: { createTooltip, showTooltip },
	},
}
```

## Source Structure

```
electricity-ui/
├── registry.json                 # shadcn-vue registry definition
├── registry/new-york/            # Registry component source
│   ├── Alert/, Calendar/, Combobox/, CustomCombobox/
│   ├── CustomSelect/, CustomTooltip/, DateInput/, DatePicker/
│   ├── DateRangePicker/, MaskNumberInput/, MaskTextInput/
│   ├── Modal/, Notification/, PercentageInput/, Popover/
│   ├── RangeCalendar/, Select/, Slider/, Switch/
│   ├── Table/, Tooltip/, Tree/
│   └── composables/              # Shared composables (table/, tree, dateHelpers, useDateInput)
├── src/
│   ├── components/               # Vue component source files
│   │   ├── Alert.vue, Modal.vue, Notification.vue
│   │   ├── CustomCombobox.vue, CustomSelect.vue, CustomTooltip.vue
│   │   ├── MaskNumberInput.vue, MaskTextInput.vue, PercentageInput.vue
│   │   ├── Calendar/, Combobox/, DateInput/, DatePicker/
│   │   ├── DateRangePicker/, Popover/, RangeCalendar/
│   │   ├── Select/, Slider/, Switch/, Table/, Tooltip/, Tree/
│   │   └── __tests__/
│   ├── assets/base.css           # Tailwind 4 entry + shadcn theme
│   └── lib/
│       ├── main.ts               # Library entry + UMD exports
│       ├── utils.ts              # cn() utility
│       └── programmatic-tooltip.ts
└── dist/
    ├── electricity-ui.umd.js     # UMD bundle
    ├── electricity-ui.es.js      # ES module bundle
    └── electricity-ui.css        # Compiled CSS
```

## Reka UI Foundation

Components use Reka UI ^2.9 primitives for accessibility:

```javascript
import { PopoverRoot, PopoverTrigger, PopoverContent } from 'reka-ui'
import { ComboboxRoot, ComboboxInput, ComboboxContent } from 'reka-ui'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent } from 'reka-ui'
import { SelectRoot, SelectTrigger, SelectContent, SelectItem } from 'reka-ui'
```

## TailwindCSS 4 Configuration

CSS-first configuration in `src/assets/base.css`:

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

@theme {
	--font-sans: 'Inter Variable', Inter, system-ui, -apple-system, sans-serif;

	/* Brand colors (sq-* palette) */
	--color-sq-pink-500: #f2578f;
	--color-sq-blue-500: #18a5df;
	--color-sq-green-500: #3fc66b;
	/* ... full palette for pink, lavendel, blue, green, sand */

	/* Animation keyframes */
	--animate-accordion-down: accordion-down 0.2s ease-out;
	--animate-accordion-up: accordion-up 0.2s ease-out;
}
```

- No `tailwind.config.js` or `postcss.config.js`
- No `@apply` -- all component styles use inline Tailwind utility classes
- `tw-animate-css` replaces `tailwindcss-animate`
- Gray remapped to zinc via `@theme` block

## Design Tokens (shadcn-vue CSS Variables)

All components use oklch-based CSS variables via `@theme inline`:

```css
@theme inline {
	--radius-sm: calc(var(--radius) - 4px);
	--radius-md: calc(var(--radius) - 2px);
	--radius-lg: var(--radius);
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-destructive: var(--destructive);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);
	--color-card: var(--card);
	--color-popover: var(--popover);
	--color-chart-1 through --color-chart-5
	--color-sidebar-*
}

:root {
	--radius: 0.5rem;
	--background: oklch(1 0 0);
	--foreground: oklch(0.145 0 0);
	--primary: oklch(0.205 0 0);
	--primary-foreground: oklch(0.985 0 0);
	--destructive: oklch(0.577 0.245 27.325);
	/* ... */
}

.dark {
	--background: oklch(0.145 0 0);
	--foreground: oklch(0.985 0 0);
	--primary: oklch(0.922 0 0);
	/* ... */
}
```

Components reference these as Tailwind utilities: `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, `bg-destructive`, etc.

## Dependencies

Key runtime dependencies:

| Package                   | Version | Purpose                               |
| ------------------------- | ------- | ------------------------------------- |
| `reka-ui`                 | ^2.9    | Headless UI primitives                |
| `@lucide/vue`             | ^1.0    | Icon library                          |
| `@internationalized/date` | ^3.11   | Date utilities for Calendar/DateInput |
| `maska`                   | ^3.2    | Number/text input masking             |
| `@tanstack/vue-table`     | ^8.21   | DataTable engine                      |
| `@vueuse/core`            | ^14.2   | Vue composables                       |
| `@formkit/auto-animate`   | 0.8.2   | Tree component animations only        |
| `@number-flow/vue`        | ^0.4    | Animated number display (Slider)      |
| `tailwind-merge`          | ^3.5    | Class merging (cn utility)            |
| `clsx`                    | ^2.1    | Conditional classes                   |
| `tw-animate-css`          | ^1.2    | Animation classes                     |
| `write-excel-file`        | ^2.3    | Excel export                          |
| `export-to-csv`           | ^1.4    | CSV export                            |
| `fuse.js`                 | ^7.1    | Fuzzy search                          |

## Component Categories

1. **Form Inputs**: Select, Combobox, DateInput, DatePicker, DateRangePicker, NumberMask, TextMask, PercentageInput, Switch, Slider
2. **Data Display**: DataTable, Tree
3. **Feedback**: Alert, Modal, Notification, Tooltip
4. **Layout/Overlay**: Popover, Calendar, RangeCalendar

## Best Practices

### Component Development

- Use Reka UI primitives as the foundation for new components
- Ensure WAI-ARIA compliance and keyboard navigation
- Use shadcn-vue CSS variables for theming -- never hardcode colors
- All styles as inline Tailwind utilities -- no `@apply`, no custom CSS classes
- Use `cn()` from `@/lib/utils` for conditional class merging
- Support dark mode via `.dark` class variant

### Integration

- Prefer registry installation over UMD for new projects
- Use `cn()` for class merging when customizing component styles
- Components are fully owned after installation -- customize freely

### Performance

- Use virtual scrolling for large datasets in DataTables
- Follow Vue reactivity patterns and avoid unnecessary re-renders
