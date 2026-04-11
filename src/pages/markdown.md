---
title: Markdown — Vue Template
description: Learn about the Vue Template project and its tech stack
---

# About This Template

This is a **routable Markdown page** powered by [unplugin-vue-markdown](https://github.com/unplugin/unplugin-vue-markdown). It renders `.md` files as Vue components with full access to the Composition API and auto-imports.

## Tech Stack

The template includes these technologies, all pre-configured and ready to use:

| Category    | Technologies                             |
| ----------- | ---------------------------------------- |
| **Core**    | Vue 3.6, Vite 8, TypeScript 6            |
| **Styling** | Tailwind CSS 4, shadcn-vue, Lucide Icons |
| **Forms**   | FormWerk, Zod                            |
| **Content** | Markdown (this page!), Shiki             |
| **Media**   | Motion-v, Unpic                          |
| **State**   | Pinia, VueUse                            |
| **SEO**     | Unhead, Vue I18n                         |
| **Backend** | Nitro (optional)                         |

## Code Examples

### TypeScript

```ts
import { z } from 'zod'

const UserSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	age: z.number().int().positive().optional(),
})

type User = z.infer<typeof UserSchema>

function validateUser(data: unknown): User {
	return UserSchema.parse(data)
}
```

### CSS (Tailwind)

```css
@import 'tailwindcss';

@custom-variant dark (&:is(.dark *));

@theme {
	--font-sans: 'Inter Variable', system-ui, sans-serif;
}
```

### JavaScript

```js
// Auto-imported composables work inside .md files
const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
	count.value++
}
```

## Features of This Page

- **Frontmatter** — YAML metadata used for page `title` and `description` via `headEnabled`
- **Shiki highlighting** — Syntax highlighting with `vitesse-light` / `vitesse-dark` themes
- **Prose styling** — Wrapped in `prose` classes for beautiful typography
- **External links** — Open in new tabs via `markdown-it-link-attributes`

## File-Based Routing

This file lives at `src/pages/markdown.md` and automatically routes to `/markdown`. No router configuration needed — Vue Router 5's file-based routing handles everything.
