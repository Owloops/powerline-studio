---
name: inspira-ui
description: Inspira UI animated Vue components — backgrounds, text animations, special effects, cards, cursors, device mocks, and visualizations via shadcn-vue registry
---

# Inspira UI

Collection of 128 animated/visual Vue components for backgrounds, text effects, special effects, cards, cursors, and visualizations. Components are **copied into your project** via the shadcn-vue CLI from the `@inspira` registry — fully owned, not a dependency.

Built on: shadcn-vue, motion-v, @vueuse/core, Tailwind CSS 4.

## Installation

Components are added via the shadcn-vue CLI using the `@inspira` registry prefix:

```bash
# Add a single component
pnpm dlx shadcn-vue@latest add @inspira/aurora-background

# Add multiple components
pnpm dlx shadcn-vue@latest add @inspira/aurora-background @inspira/shimmer-button
```

Components are installed to `src/components/ui/<component-name>/`.

## Tailwind Plugin

The `@inspira-ui/plugins` Tailwind plugin is pre-configured via `@plugin` in `main.css`. It provides:

- `bg-grid` — grid pattern background
- `bg-grid-small` — small grid pattern background
- `bg-dot` — dot pattern background

These utilities are used by background components. Colors are customizable via CSS variables.

## Component Categories

### Backgrounds (26)

Aurora, cosmic portal, dot pattern, grid pattern, hero highlight, interactive grid, mesh gradient, meteors, moving lines, particle effects, shooting stars, spotlight, starfield, vortex, waves, and more.

### Buttons (5)

Gradient, interactive hover, rainbow, ripple, shimmer button.

### Cards (6)

3D card effect, card carousel, card spotlight, direction-aware hover, flip card, glare card.

### Cursors (5)

Fluid, image trail, sleek line, smooth, tailed cursor.

### Device Mocks (2)

iPhone mockup, Safari browser mockup.

### Input & Forms (6)

Balance slider, color picker, drag and drop file upload, search input, text field effects, input placeholders.

### Miscellaneous (23)

Animated modal, bento grid, dock, file tree, globe, image accordion, lens, magic card, marquee, orbiting circles, scroll progress, timeline, typing animation, and more.

### Special Effects (14)

Animated beam, animated border, animated gradient, border beam, confetti, glowing stars, light effect, particles, sparkles, spotlight card, and more.

### Testimonials (3)

Animated testimonials, testimonial slider, testimonial cards.

### Text Animations (23)

Blur in, blur reveal, character pull up, count up, decode text, flip text, gradual spacing, letter pull up, morphing text, number ticker, scramble text, sparkles text, text generate effect, text reveal, typewriter, wavy text, word fade in, word pull up, word rotate, and more.

### Visualization (15)

3D carousel, animated circular progress, animated tree map, bar list, chart tooltip, compare slider, globe, image gallery, interactive grid, parallax scroll, and more.

## Usage Pattern

```vue
<script setup lang="ts">
import { AuroraBackground } from '@/components/ui/aurora-background'
import { ShimmerButton } from '@/components/ui/shimmer-button'
</script>

<template>
	<AuroraBackground>
		<h1 class="text-4xl font-bold">Welcome</h1>
		<ShimmerButton>Get Started</ShimmerButton>
	</AuroraBackground>
</template>
```

## Key Notes

- Components are source code — modify directly, do not update via npm
- Uses `cn()` from `@/lib/utils` for class merging (same as shadcn-vue)
- Dark mode supported via `.dark` class on `<html>`
- Some components use `motion-v` for animations — already installed in this project
- Some components use `@vueuse/core` composables — already installed in this project
- Browse all components at https://inspira-ui.com/docs/en
- Registry URL: `https://inspira-ui.com/r/{name}.json`
