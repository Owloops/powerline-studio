---
name: vue-markdown
description: unplugin-vue-markdown, Shiki syntax highlighting, markdown-it plugins, .md as Vue components, frontmatter, code blocks
---

# Vue Markdown Tooling

Three packages working together: **unplugin-vue-markdown** renders `.md` as Vue components, **@shikijs/markdown-it** adds syntax highlighting, and **markdown-it-link-attributes** handles external links.

## Vite Configuration

```ts
// vite.config.ts
import Vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import Shiki from '@shikijs/markdown-it'
import LinkAttributes from 'markdown-it-link-attributes'

export default defineConfig({
	plugins: [
		Vue({
			include: [/\.vue$/, /\.md$/], // Allow Vue to compile .md files
		}),
		Markdown({
			wrapperClasses: 'prose dark:prose-invert',
			headEnabled: true, // Auto useHead() from frontmatter (requires @unhead/vue)
			markdownOptions: {
				html: true,
				linkify: true,
				typographer: true,
			},
			async markdownSetup(md) {
				md.use(
					await Shiki({
						themes: {
							light: 'vitesse-light',
							dark: 'vitesse-dark',
						},
					}),
				)
				md.use(LinkAttributes, {
					matcher: (href: string) => /^https?:\/\//.test(href),
					attrs: { target: '_blank', rel: 'noopener noreferrer' },
				})
			},
		}),
	],
})
```

## .md Files as Vue Components

Import and use directly -- each `.md` file IS a Vue component:

```vue
<script setup lang="ts">
import Readme from './README.md'
import Changelog from '~/content/changelog.md'
</script>

<template>
	<Readme />
	<Changelog />
</template>
```

### As Pages (file-based routing)

Place `.md` files in `pages/` with the router configured for `.md` extensions. With `vite-plugin-pages`:

```ts
Pages({ extensions: ['vue', 'md'] })
```

In Nuxt, `.md` files in `pages/` work automatically once the Vite plugin processes them.

## Vue Components Inside Markdown

Use any registered (global or auto-imported) Vue component directly in `.md`:

```md
# My Page

Some text, then a Vue component:

<Counter :init="5" />

<Alert type="warning">
  This **markdown** is rendered inside the component slot.
</Alert>
```

Or use `<script setup>` inside the `.md` file:

```md
<script setup>
import { ref } from 'vue'
import MyWidget from '../components/MyWidget.vue'
const count = ref(0)
</script>

# Interactive Page

<MyWidget />
Current count: {{ count }}
```

## Frontmatter

YAML frontmatter is exposed as `frontmatter` in the template:

```md
---
title: Getting Started
description: A quick guide
author: Jane
---

# {{ frontmatter.title }}

Written by {{ frontmatter.author }}
```

### headEnabled (auto document head)

When `headEnabled: true`, frontmatter maps to `useHead()` automatically. Requires `@unhead/vue` installed and registered.

```yaml
---
title: My Page Title
meta:
  - name: description
    content: Page description for SEO
  - property: og:title
    content: My Page Title
---
```

This sets `<title>` and `<meta>` tags without any code.

## Key Options

| Option                  | Type                      | Description                                                                           |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| `wrapperClasses`        | `string`                  | CSS classes on the wrapper `<div>` around rendered markdown                           |
| `headEnabled`           | `boolean`                 | Auto-call `useHead()` with frontmatter data                                           |
| `wrapperComponent`      | `string`                  | Vue component name to wrap all markdown content                                       |
| `markdownOptions`       | `object`                  | Options passed to the markdown-it parser (`html`, `linkify`, `typographer`, `breaks`) |
| `markdownSetup`         | `(md) => void`            | Callback to add markdown-it plugins via `md.use()`                                    |
| `frontmatterPreprocess` | `(fm, options) => object` | Transform frontmatter before it reaches the component                                 |

## Shiki Themes (Light/Dark)

Dual theme output uses CSS variables. Add this CSS for dark mode support:

```css
/* Query-based */
@media (prefers-color-scheme: dark) {
	.shiki,
	.shiki span {
		color: var(--shiki-dark) !important;
		background-color: var(--shiki-dark-bg) !important;
	}
}

/* Class-based (e.g., html.dark from color-mode) */
html.dark .shiki,
html.dark .shiki span {
	color: var(--shiki-dark) !important;
	background-color: var(--shiki-dark-bg) !important;
}
```

## markdown-it-link-attributes

Conditional matching -- only apply to external links:

```ts
md.use(LinkAttributes, {
	matcher: (href: string) => /^https?:\/\//.test(href),
	attrs: {
		target: '_blank',
		rel: 'noopener noreferrer',
		class: 'external-link',
	},
})
```

Multiple configs (array form) -- first match wins:

```ts
md.use(LinkAttributes, [
	{
		matcher: (href: string) => /^https?:\/\//.test(href),
		attrs: { target: '_blank', rel: 'noopener noreferrer' },
	},
	{
		matcher: (href: string) => href.startsWith('/'),
		attrs: { class: 'internal-link' },
	},
])
```

## TypeScript Shim

```ts
// env.d.ts
declare module '*.md' {
	import type { ComponentOptions } from 'vue'
	const Component: ComponentOptions
	export default Component
}
```

## Install

```bash
pnpm add -D unplugin-vue-markdown @shikijs/markdown-it markdown-it-link-attributes
```
