---
name: unhead-vue
description: Unhead Vue head management — useHead, useSeoMeta, useScript, titleTemplate, SSR, Head components, meta tags, SEO
---

# Unhead for Vue (@unhead/vue)

Framework-agnostic document `<head>` manager with first-class Vue support. Manages titles, meta tags, scripts, link tags, and structured data with SSR + CSR support.

**In Nuxt:** Unhead is already integrated — skip installation, just use the composables.

## Installation (Vue + Vite, non-Nuxt)

```bash
pnpm add @unhead/vue@next
```

### Client Entry

```ts
// src/entry-client.ts
import { createApp } from './main'
import { createHead } from '@unhead/vue/client'

const { app } = createApp()
const head = createHead()
app.use(head)
app.mount('#app')
```

### Server Entry (SSR only)

```ts
// src/entry-server.ts
import { createHead } from '@unhead/vue/server'
import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'

export async function render(_url: string) {
	const { app } = createApp()
	const head = createHead()
	app.use(head)
	const html = await renderToString(app)
	return { html, head }
}
```

```ts
// server.ts — transform the HTML template
import { transformHtmlTemplate } from '@unhead/vue/server'

const rendered = await render(url)
const html = await transformHtmlTemplate(
	rendered.head,
	template.replace('<!--app-html-->', rendered.html ?? ''),
)
```

## useHead()

The primary composable. Set any `<head>` tag from any component:

```vue
<script setup lang="ts">
import { useHead } from '@unhead/vue' // In Nuxt: auto-imported

useHead({
	title: 'My Page',
	titleTemplate: '%s | My Site',
	meta: [
		{ name: 'description', content: 'Page description here' },
		{ property: 'og:title', content: 'My Page' },
		{ property: 'og:image', content: 'https://example.com/og.jpg' },
	],
	link: [
		{ rel: 'canonical', href: 'https://example.com/page' },
		{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
	],
	htmlAttrs: { lang: 'en', class: 'dark' },
	bodyAttrs: { class: 'bg-white' },
	script: [{ src: 'https://example.com/analytics.js', defer: true }],
})
</script>
```

### Reactive Titles

```vue
<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ref } from 'vue'

const title = ref('Loading...')

useHead({
	title: () => title.value, // getter function for reactivity
})

// or use a computed/ref directly
useHead({
	title,
})
</script>
```

## titleTemplate

Add consistent branding across all pages. Set in a layout or app entry:

```ts
// In layout or app.vue
useHead({
	titleTemplate: '%s | My Site',
})

// In a page component
useHead({
	title: 'About', // renders: "About | My Site"
})

// Reset template for a specific page
useHead({
	title: 'Home',
	titleTemplate: null, // renders just: "Home"
})
```

### Template Params (advanced)

```ts
useHead({
	title: 'Home',
	titleTemplate: '%s %separator %siteName',
	templateParams: {
		separator: '·',
		siteName: 'My Site',
	},
})
// Output: "Home · My Site"
```

## useSeoMeta()

Flat API for 100+ SEO meta tags — no nested objects. Type-safe with autocomplete:

```vue
<script setup lang="ts">
import { useSeoMeta } from '@unhead/vue' // In Nuxt: auto-imported

useSeoMeta({
	title: 'My Page',
	ogTitle: 'My Page - Open Graph Title',
	description: 'A description of my page',
	ogDescription: 'OG description for social sharing',
	ogImage: 'https://example.com/og.jpg',
	ogUrl: 'https://example.com/page',
	twitterCard: 'summary_large_image',
	twitterTitle: 'Twitter-specific title',
	twitterDescription: 'Twitter-specific description',
	twitterImage: 'https://example.com/twitter.jpg',
	robots: 'index, follow',
})
</script>
```

**Note:** `ogTitle` and `twitterTitle` are NOT affected by `titleTemplate` — they render as-is.

## useHeadSafe()

Sanitized version of `useHead()` — strips potentially dangerous attributes (event handlers, javascript: URLs). Use when head data comes from user input or untrusted sources:

```ts
import { useHeadSafe } from '@unhead/vue'

useHeadSafe({
	title: userInput,
	meta: [{ name: 'description', content: userDescription }],
})
```

## useScript()

Performance-optimized third-party script loading:

```ts
import { useScript } from '@unhead/vue'

const { status, load } = useScript(
	{
		src: 'https://example.com/analytics.js',
		defer: true,
	},
	{
		trigger: 'onNuxtReady', // or 'idle', 'visible', manual
	},
)
```

## Head Components (Vue only)

Template-based alternative to composables. Import from `@unhead/vue/components`:

```vue
<script setup lang="ts">
import { Head } from '@unhead/vue/components'
</script>

<template>
	<Head>
		<title>My Page</title>
		<meta name="description" content="Page description" />
		<link rel="canonical" href="https://example.com/page" />
	</Head>
</template>
```

When the component unmounts, its tags are automatically removed.

## Default Tags

Unhead automatically inserts these defaults (override as needed):

- `<meta charset="utf-8">`
- `<meta name="viewport" content="width=device-width, initial-scale=1">`
- `<html lang="en">`

## Auto-imports (Vite, non-Nuxt)

```ts
// vite.config.ts
import { unheadVueComposablesImports } from '@unhead/vue'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
	plugins: [
		AutoImport({
			imports: [unheadVueComposablesImports],
		}),
	],
})
```

## Common Recipes

### SEO Starter

```ts
useHead({
	title: 'My App',
	titleTemplate: '%s %separator %siteName',
	templateParams: { separator: '|', siteName: 'My App' },
	htmlAttrs: { lang: 'en' },
})
useSeoMeta({
	description: 'My app description',
	ogImage: '/og-image.jpg',
	twitterCard: 'summary_large_image',
})
```

### Per-Page SEO

```ts
// pages/blog/[slug].vue
useSeoMeta({
	title: post.title,
	description: post.excerpt,
	ogTitle: post.title,
	ogDescription: post.excerpt,
	ogImage: post.coverImage,
	articlePublishedTime: post.publishedAt,
})
```

## Gotchas

- In **Nuxt**, composables are auto-imported — do not install `@unhead/vue` separately
- Import `createHead` from `@unhead/vue/client` for CSR and `@unhead/vue/server` for SSR — they are different
- `useSeoMeta()` is better than `useHead()` for meta tags — flatter API, better tree-shaking
- Tags from child components override parent tags (last rendered wins for deduped tags like `<title>`)
- When a component unmounts, its head tags are automatically removed
- `titleTemplate` only affects `<title>` — not `og:title` or `twitter:title`
- Use getter functions (`() => value.value`) for reactive values, not raw refs in object literals
