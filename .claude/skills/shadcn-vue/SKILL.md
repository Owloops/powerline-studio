---
name: shadcn-vue
description: shadcn-vue component library for Vue/Nuxt — CLI commands, component usage, Tailwind customization, reka-ui primitives
---

# shadcn-vue

Pre-styled, accessible Vue component library built on reka-ui + Tailwind CSS. Components are **copied into your project** (`components/ui/`) and fully owned — not installed as a dependency.

## Installation (Nuxt)

```bash
# Initialize in project (creates components.json)
npx shadcn-vue@latest init

# Nuxt module in nuxt.config.ts
export default defineNuxtConfig({
  modules: ['shadcn-nuxt'],
  shadcn: {
    prefix: '',                    // component prefix (e.g. 'Ui' -> UiButton)
    componentDir: './components/ui' // where components live
  }
})
```

## CLI Commands

```bash
# Add components (copies source files into components/ui/)
pnpm dlx shadcn-vue@latest add button
pnpm dlx shadcn-vue@latest add button card dialog select

# Initialize project
pnpm dlx shadcn-vue@latest init

# Options
#   -d, --defaults    use default config (new-york, zinc, css variables)
#   -f, --force       overwrite existing components.json
#   -y, --yes         skip confirmation
```

## Component Usage Pattern

Components are auto-imported in Nuxt. Each component is composed of multiple parts:

```vue
<script setup lang="ts">
// In Nuxt: auto-imported from components/ui/
// In Vite: import explicitly
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
</script>

<template>
	<Dialog>
		<DialogTrigger as-child>
			<Button variant="outline">Open</Button>
		</DialogTrigger>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Title</DialogTitle>
				<DialogDescription>Description text</DialogDescription>
			</DialogHeader>
			<!-- content -->
		</DialogContent>
	</Dialog>
</template>
```

## Available Components

**Form & Input:** Button, Input, Textarea, Checkbox, Radio Group, Select, Switch, Slider, Number Field, Combobox, Label, Input OTP, Pin Input, Tags Input
**Date & Time:** Calendar, Range Calendar, Date Picker
**Layout & Navigation:** Accordion, Breadcrumb, Navigation Menu, Sidebar, Tabs, Stepper, Separator, Scroll Area, Resizable
**Overlays:** Dialog, Alert Dialog, Sheet, Drawer, Popover, Tooltip, Hover Card, Context Menu, Dropdown Menu, Command
**Feedback:** Alert, Sonner (toast), Progress, Spinner, Skeleton, Badge
**Display:** Avatar, Card, Table, Data Table (TanStack Table), Carousel, Aspect Ratio

## Customization

Components use Tailwind CSS classes — modify them directly in the copied files:

```vue
<!-- components/ui/button/Button.vue — edit freely -->
<template>
	<Primitive
		:as="as"
		:as-child="asChild"
		:class="cn(buttonVariants({ variant, size }), $attrs.class ?? '')"
	>
		<slot />
	</Primitive>
</template>
```

### Button Variants

```vue
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><IconHeart /></Button>
```

## Theming

CSS variables defined in `assets/css/main.css` inside `@theme` or `:root`:

```css
@layer base {
	:root {
		--background: 0 0% 100%;
		--foreground: 240 10% 3.9%;
		--primary: 240 5.9% 10%;
		--primary-foreground: 0 0% 98%;
		--destructive: 0 84.2% 60.2%;
		--ring: 240 5.9% 10%;
		--radius: 0.5rem;
	}
	.dark {
		--background: 240 10% 3.9%;
		--foreground: 0 0% 98%;
	}
}
```

## Key Differences from shadcn/ui (React)

- Uses **reka-ui** primitives (not Radix UI)
- CLI is `shadcn-vue` (not `shadcn`)
- Uses **Vue Sonner** for toasts
- Form integration via VeeValidate or TanStack Form (not React Hook Form)
- Charts use Unovis (not Recharts)

## Utility: cn() Helper

All components use `cn()` for class merging (tailwind-merge + clsx):

```ts
// lib/utils.ts (auto-generated)
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
```

## Gotchas

- Components are **source code** in your project — update them directly, not via npm
- The `as-child` prop delegates rendering to the child element (from reka-ui)
- Always use the CLI to add new components; it handles dependencies between components
- Dark mode requires `class` strategy on `<html>` element
