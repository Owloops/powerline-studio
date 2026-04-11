---
id: task-007-example-pages
title: Create example pages showcasing all template features
status: "To Do"
created_date: '2026-04-09 20:01'
updated_date: '2026-04-09 20:01'
parent: null
subtasks:
	- task-007a-layout-navigation
	- task-007b-ui-components
	- task-007c-content-media
	- task-007d-forms-data
dependencies:
---

## Description

<!-- DESCRIPTION:BEGIN -->

Create a set of example pages in the dashboard-template project that demonstrate every configured feature works end-to-end. The template has a comprehensive stack (Vue 3.6, Vite 8, Tailwind CSS 4, shadcn-vue, Lucide icons, Inter font, Markdown/Shiki, Motion-v, Unpic images, FormWerk/Zod, Pinia, VueUse, Vue I18n, Unhead SEO, Nitro API, SSG) but currently only has a placeholder home page with no actual feature usage. These example pages serve as both proof-of-concept and reference implementation for anyone cloning the template.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

**Required pages and features to demonstrate:**

1. **Layout & Navigation** — Proper default layout with responsive navbar, page links, and dark mode toggle. Proves: layouts plugin, useDark (VueUse), auto-component loading.

2. **UI Components page** (`/ui`) — Showcase installed shadcn-vue components (Button, Input, Card, Badge, Dialog, Sheet, Separator, Dropdown Menu, Sonner toasts) alongside Lucide icons and Tailwind CSS 4 utilities. Proves: shadcn-vue, component auto-imports, icons auto-import (`<IconLucide-{name} />`), Tailwind theming/CSS variables, dark mode styling.

3. **Content & Media page** (`/content`) — Motion-v animations (explicit import), Unpic responsive images (explicit import), Inter font weights showcase. Proves: motion-v, @unpic/vue, unplugin-fonts, Beasties critical CSS (verified at build). Note: motion-v and @unpic/vue are NOT auto-imported — they require explicit imports.

4. **Markdown page** (`/about.md` → routes to `/about`) — A routable `.md` file with frontmatter, prose styling, and Shiki syntax-highlighted code blocks. Proves: unplugin-vue-markdown, Shiki, .md file routing.

5. **Forms & Data page** (`/forms`) — FormWerk form with Zod validation, Pinia store integration, VueUse composables, and Nitro API data fetching with fallback mock data when Nitro is not running. Proves: FormWerk, Zod, Pinia, VueUse, Nitro server, auto-composable loading. Must work in both `vp dev` (mock data) and `WITH_NITRO=true pnpm dev:server` (live API).

6. **Updated home page** (`/`) — Feature overview with links to all demo pages. Proves: vue-router, useHead/useSeoMeta (Unhead), vue-i18n.

7. **SSG build** — Verify `pnpm build:ssg` generates static HTML for all pages + sitemap.xml.

**Acceptance criteria:**

- `vp dev` serves all pages with working navigation and dark mode toggle
- Auto-imports work for Vue APIs, VueUse, internal components, composables, stores (no explicit imports)
- External libraries (motion-v, @unpic/vue) use explicit imports — auto-import only covers internal code
- Icons render via `<IconLucide-{name} />` pattern
- Inter font loads with correct weights
- Markdown page renders with syntax-highlighted code blocks
- `WITH_NITRO=true pnpm dev:server` serves API data consumed by the forms page
- `pnpm build:ssg` succeeds and generates sitemap.xml
- Dark mode toggle persists preference via useStorage with no flash-of-light-mode on SSG pages (inline script in index.html or App.vue)
<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**
Split into 4 subtasks by page group. Each subtask creates its pages and supporting files independently.

**Subtask breakdown:**

### task-007a: Layout, Navigation & Home

- Register `createPinia()` in `src/main.ts` (currently missing — Pinia stores won't work without it)
- Create proper `src/layouts/default.vue` with responsive navbar, page links, dark mode toggle
- Install shadcn-vue: button, separator, dropdown-menu, sonner
- Create `src/composables/useDarkMode.ts` (wraps VueUse useDark + useStorage)
- Add dark-mode-flash prevention (inline script in index.html to apply `.dark` class before first paint)
- Update `src/pages/(home).vue` with feature overview, i18n usage, useHead/useSeoMeta
- Update `src/locales/en.json` with app strings
- **Key files:** src/main.ts, src/layouts/default.vue, src/pages/(home).vue, src/composables/useDarkMode.ts, src/locales/en.json, index.html

### task-007b: UI Components Page

- Install shadcn-vue: input, label, card, badge, dialog, sheet
- Create `src/pages/ui.vue` showcasing all installed components + icons + Tailwind utilities
- Organized sections: Typography, Buttons, Inputs, Cards, Badges, Dialogs, Icons, Color palette
- **Key files:** src/pages/ui.vue, src/components/ui/\* (installed via CLI)

### task-007c: Content & Media Page + Markdown

- Create `src/pages/content.vue` with Motion-v animations, Unpic images, font weight showcase
- Create `src/pages/about.md` with frontmatter, prose, code blocks (Shiki)
- **Key files:** src/pages/content.vue, src/pages/about.md

### task-007d: Forms, Data & Nitro

- Create `src/pages/forms.vue` with FormWerk form, Zod validation, Pinia counter store usage
- Create `src/composables/useApiData.ts` (fetches from Nitro API)
- Add Nitro API endpoint `server/api/items.get.ts`
- Verify SSG build + sitemap generation
- **Key files:** src/pages/forms.vue, src/composables/useApiData.ts, server/api/items.get.ts

**Patterns to follow:**

- All pages use `<script setup lang="ts">` with no explicit Vue/VueUse imports (auto-imported)
- Components auto-imported from `src/components/` — no import statements
- Composables auto-imported from `src/composables/` — no import statements
- Icons as `<IconLucide-{name} />` (unplugin-icons auto-import)
- `definePage()` for route metadata where needed
- `useHead()` / `useSeoMeta()` on every page
- Tailwind CSS 4 utilities only — no inline styles, no CSS modules

**Dependencies:**

- shadcn-vue CLI for component installation
- No external task dependencies (all prior migration tasks are Done)
<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Implement task-007a: Layout, Navigation & Home
- [ ] Implement task-007b: UI Components Page
- [ ] Implement task-007c: Content & Media Page + Markdown
- [ ] Implement task-007d: Forms, Data & Nitro
- [ ] Verify SSG build succeeds with all pages
- [ ] Verify sitemap.xml generated
<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Scope:** This is a parent task. Implementation is in subtasks 007a-007d.

**Execution order:** 007a must go first (layout + navigation used by all pages). 007b, 007c, 007d can run in parallel after 007a completes — they each create independent pages.

**Not in scope:**

- electricity-ui registry components (already proven in tasks 001-006)
- Complex app logic — pages are showcases, not production features
- E2E tests (Playwright) — can be added as a separate task later

**Related Tasks:**

- task-001 through task-006 — electricity-ui migration (all Done)
<!-- NOTES:END -->
