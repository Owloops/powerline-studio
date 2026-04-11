---
name: unpic-vue
description: Unpic Vue responsive image component — layout modes, priority for LCP, background blur placeholders, CDN auto-detection, Source for art direction
---

# @unpic/vue

High-performance, responsive image component for Vue. Generates a responsive `<img>` tag with correct `srcset`, `sizes`, and styles. Auto-detects image URLs from most image CDNs and resizes with no build step.

## Installation

```bash
pnpm add @unpic/vue
```

## Basic Usage

```vue
<script setup lang="ts">
import { Image } from '@unpic/vue'
</script>

<template>
	<Image
		src="https://cdn.shopify.com/static/sample-images/bath.jpeg"
		layout="constrained"
		width="800"
		height="600"
		alt="A lovely bath"
	/>
</template>
```

## Layout Modes

### constrained (default)

Renders at maximum `width` x `height`, scales down if container is smaller. Maintains aspect ratio.

```vue
<Image
	src="https://example.com/photo.jpg"
	layout="constrained"
	width="800"
	height="600"
	alt="Photo"
/>
```

### fullWidth

Fills container width. Optimized for hero images. Optionally set a fixed `height`.

```vue
<Image src="https://example.com/hero.jpg" layout="fullWidth" height="500" alt="Hero banner" />
```

### fixed

Renders at exact `width` x `height`. No responsive scaling.

```vue
<Image
	src="https://example.com/avatar.jpg"
	layout="fixed"
	width="48"
	height="48"
	alt="User avatar"
/>
```

## Priority Prop (LCP Optimization)

By default images load lazily. Set `priority` for above-the-fold images (hero images, LCP):

```vue
<Image src="https://example.com/hero.jpg" layout="fullWidth" height="600" alt="Hero" priority />
```

When `priority` is `true`:

- `loading="eager"` (not lazy)
- `fetchpriority="high"`
- No lazy loading attributes

## Background / Blur Placeholder

```vue
<!-- Auto low-res blur placeholder (loaded from CDN) -->
<Image
	src="https://example.com/photo.jpg"
	layout="constrained"
	width="800"
	height="600"
	background="auto"
	alt="Photo with blur"
/>

<!-- Solid color placeholder -->
<Image
	src="https://example.com/photo.jpg"
	layout="constrained"
	width="800"
	height="600"
	background="#f0f0f0"
	alt="Photo with gray bg"
/>

<!-- CSS gradient placeholder -->
<Image
	src="https://example.com/photo.jpg"
	layout="constrained"
	width="800"
	height="600"
	background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
	alt="Photo with gradient bg"
/>

<!-- Inline base64 placeholder (best performance) -->
<Image
	src="https://example.com/photo.jpg"
	layout="constrained"
	width="800"
	height="600"
	background="data:image/jpeg;base64,/9j/4AAQSkZJ..."
	alt="Photo with base64 bg"
/>
```

**Note:** The background is NOT removed after the image loads. It remains visible if the image has transparency.

For generating inline placeholders, use `@unpic/placeholder`.

## Aspect Ratio

Instead of specifying both `width` and `height`:

```vue
<Image
	src="https://example.com/photo.jpg"
	layout="constrained"
	width="800"
	aspect-ratio="16/9"
	alt="Widescreen photo"
/>
```

## Custom Breakpoints

Override the auto-generated `srcset` breakpoints:

```vue
<Image
	src="https://example.com/photo.jpg"
	layout="constrained"
	width="800"
	height="600"
	:breakpoints="[320, 640, 960, 1280, 1920]"
	alt="Photo"
/>
```

## CDN Auto-Detection

Unpic automatically detects and transforms URLs from 40+ image CDNs including:
Cloudinary, Imgix, Shopify, Contentful, Sanity, WordPress, Vercel/Next.js, Cloudflare, Bunny, AWS CloudFront, and more.

If the CDN cannot be detected, it uses the source URL without transformation.

### Fallback Provider

Specify a fallback CDN for unrecognized URLs:

```vue
<Image
	src="https://example.com/photo.jpg"
	fallback="cloudinary"
	width="800"
	height="600"
	alt="Photo"
/>
```

### Provider-Specific Operations

```vue
<Image
	src="https://example.com/photo.jpg"
	:operations="{ imgix: { flip: 'h' }, bunny: { flop: true } }"
	width="800"
	height="600"
	alt="Flipped photo"
/>
```

### Provider Options

```vue
<Image
	src="/photo.jpg"
	:options="{ cloudinary: { cloudName: 'demo' }, ipx: { baseUrl: '/_images' } }"
	width="800"
	height="600"
	alt="Photo"
/>
```

## Source Component (Art Direction)

For responsive art direction (different images at different breakpoints):

```vue
<script setup lang="ts">
import { Image, Source } from '@unpic/vue'
</script>

<template>
	<picture>
		<!-- Desktop image -->
		<Source
			src="https://example.com/hero-desktop.jpg"
			media="(min-width: 768px)"
			layout="fullWidth"
			width="1200"
			height="600"
		/>
		<!-- Mobile image (fallback) -->
		<Image
			src="https://example.com/hero-mobile.jpg"
			layout="fullWidth"
			width="400"
			height="400"
			alt="Hero image"
		/>
	</picture>
</template>
```

### Dark Mode Art Direction

```vue
<picture>
  <Source
    src="https://example.com/logo-dark.png"
    media="(prefers-color-scheme: dark)"
    layout="fixed"
    width="200"
    height="50"
  />
  <Image
    src="https://example.com/logo-light.png"
    layout="fixed"
    width="200"
    height="50"
    alt="Logo"
  />
</picture>
```

### Format Selection

```vue
<picture>
  <Source
    src="https://example.com/photo.jpg"
    type="image/avif"
    layout="constrained"
    width="800"
    height="600"
  />
  <Source
    src="https://example.com/photo.jpg"
    type="image/webp"
    layout="constrained"
    width="800"
    height="600"
  />
  <Image
    src="https://example.com/photo.jpg"
    layout="constrained"
    width="800"
    height="600"
    alt="Photo"
  />
</picture>
```

## Auto-Set Props

These are set automatically but can be overridden:

- `sizes` — computed from layout and width
- `role` — set when no alt text
- `decoding` — `async` by default
- `loading` — `lazy` by default (unless `priority`)
- `fetchpriority` — `high` when `priority`

## Gotchas

- `srcset` is auto-generated from `src` — do not pass `srcset` manually
- `background="auto"` still fetches from the remote server — prefer inline base64 for best performance
- The `<Source>` component must be inside a `<picture>` tag
- For local/self-hosted images without a CDN, the component still generates proper responsive markup but cannot resize
- Width and height should be the intrinsic (natural) size of the image, not the display size
