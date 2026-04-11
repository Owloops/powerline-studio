---
name: Project Handoff & Continuation Guide
description: Complete context for continuing this project template setup after session restart
created_date: '2026-04-09 17:30'
updated_date: '2026-04-09 17:30'
---

# Project Handoff — Vue Template Setup

## What This Project Is

A **reusable project template** for scaffolding new Vue applications. Clone it to start any new project with the full stack, tooling, AI skills, and MCP servers pre-configured. Located at `C:\Users\Juugo\Documents\Projects\dashboard-template`.

## What Was Built (This Session)

### Core Stack — Fully Configured & Building

The template was scaffolded with **VitePlus** (`vp create vue`) and then heavily customized:

- **Vue 3.6 beta** (Alien Signals + Vapor Mode) — pinned via `pnpm-workspace.yaml` overrides
- **Vite 8.0.5** with Rolldown — via VitePlus (`@voidzero-dev/vite-plus-core`). Production builds in ~230ms
- **VitePlus** (`vp` CLI) — manages dev server, builds, testing (Vitest), linting (OxLint), formatting (OxFmt)
- **TypeScript 6.0** — strict, type-aware linting enabled
- **pnpm 10** as package manager

### Routing & Navigation

- **Vue Router 5** with file-based routing via `vue-router/vite` plugin
- Pages in `src/pages/` — uses route groups pattern (`(home).vue` not `index.vue`)
- **Layouts** via `vite-plugin-vue-layouts-next` — default layout at `src/layouts/default.vue`
- **Vue Macros** (`unplugin-vue-macros`) wraps the Vue plugin for extended syntax

### UI Layer

- **Tailwind CSS 4** via `@tailwindcss/vite` plugin — CSS-first config, no JS config file
- **shadcn-vue** initialized (New York style, Neutral color, reka-ui base, Lucide icons)
  - `components.json` configured with aliases
  - `src/lib/utils.ts` with `cn()` utility
  - Full CSS variable theming (light/dark) in `src/assets/main.css`
  - `tw-animate-css` for animations
- **reka-ui** ^2.9.5 installed for custom headless components
- **Lucide icons** + `unplugin-icons` with `IconsResolver` for auto-import as `<IconLucide-{name} />`

### Auto-imports

- **unplugin-auto-import** — Vue, VueUse, vue-i18n, Vue Router 5, Unhead composables + `src/composables/` + `src/stores/`
- **unplugin-vue-components** — all components in `src/components/` + icons via resolver

### Animations & Images

- **motion-v** ^2.2 installed (Motion for Vue — declarative animations)
- **@unpic/vue** ^1.0 installed (responsive `<Image>` with CDN auto-detection)

### Forms & Validation

- **FormWerk** (`@formwerk/core` ^0.14) installed — headless form composables
- **Zod** ^4.3 installed — schema validation (Standard Schema compatible)

### Head, SEO, i18n

- **@unhead/vue** — `useHead()`, `useSeoMeta()`, imported from `@unhead/vue/client` (v2 API change)
- **vue-i18n** ^11.3 + `@intlify/unplugin-vue-i18n` Vite plugin — locale files in `src/locales/`
- **VueUse** (`@vueuse/core` ^14.2) — 200+ composables, auto-imported

### Content & Fonts

- **unplugin-vue-markdown** + **Shiki** (vitesse-light/dark themes) + **markdown-it-link-attributes** — `.md` files as Vue components/pages
- **unplugin-fonts** + **@fontsource-variable/inter** — self-hosted Inter Variable font with preloading
- **vite-plugin-beasties** — critical CSS inlining at build time

### SSG

- **vite-ssg** — `main.ts` uses `ViteSSG()` instead of `createApp()`, enabling both SPA and SSG from same entry
- **vite-ssg-sitemap** — auto-generates sitemap.xml on SSG build
- Build scripts: `vp build` (SPA), `pnpm build:ssg` (SSG)

### Backend (Optional)

- **Nitro v3** (beta) installed — conditionally loaded via `WITH_NITRO=true` env var
- Server structure at `server/api/`, `server/routes/`, etc.
- Sample routes: `server/api/hello.ts`, `server/api/health.get.ts`
- Scripts: `pnpm dev:server`, `pnpm build:server`
- **Supabase** — MCP server configured, ready for `@nuxtjs/supabase` or direct `supabase-js` when needed

### Linting & Formatting

- **VitePlus's dual-linter setup** (kept as-is, NOT @antfu/eslint-config):
  - `vp lint` / `vp fmt` — OxLint + OxFmt (fast, Rust-based)
  - ESLint with `eslint-plugin-oxlint` bridge — Vue-specific rules without duplicating OxLint checks
  - `eslint-config-prettier` — disables ESLint formatting (OxFmt handles it)
  - OxFmt config in `vite.config.ts`: single quotes, no semicolons, tabs

### AI Tooling — Fully Set Up

**MCP Servers** (`.mcp.json`):

- `nuxt` — HTTP, Nuxt 4 docs
- `supabase` — HTTP, database management (OAuth on first use)
- `shadcn` — stdio, `npx shadcn-vue@latest mcp` — browse/search/install components

**Skills** (`.claude/skills/` — 24 total):

- From antfu/skills (12): vue, nuxt, pinia, vite, vitest, pnpm, tsdown, vueuse-functions, vue-best-practices, vue-router-best-practices, vue-testing-best-practices, web-design-guidelines
- From posva/vue-rulekit (1): pages (file-based routing best practices)
- From supabase/agent-skills (2): supabase, supabase-postgres-best-practices
- Custom-created (9): shadcn-vue, reka-ui, formwerk, unhead-vue, vue-i18n, vue-macros, unpic-vue, zod, vue-markdown

**CLAUDE.md** — comprehensive project guide covering full stack, commands, conventions, AI tooling.

### Task Management

- Backlog system initialized at `backlog/` with templates for tasks, designs, and docs
- Task-001 created: "Setup shadcn-vue registry" for electricity-ui migration

### Project Memory

Memory saved at `~/.claude/projects/C--Users-Juugo--claude-projects-dashboard/memory/` — but since the project moved to `Documents/Projects/dashboard-template`, a new Claude project context will be created. The CLAUDE.md and this doc carry all the context.

---

## What Needs To Be Done Next

### 1. Create Remaining Migration Tasks (002-006)

Only task-001 was created by the subagent. Create tasks 002-006 in `backlog/tasks/`:

**task-002: Remove FormKit from electricity-ui**

- Delete all `*Formkit.vue` wrappers (12 files) and `*-formkit.ts` definitions (10 files)
- Delete `formkit-components.d.ts`
- Remove `@formkit/*` deps from package.json
- Clean FormKit from `src/main.ts` and `src/lib/main.ts` exports
- Pure removal, no replacement needed yet

**task-003: Migrate Tailwind CSS 3→4 in electricity-ui**

- Remove `tailwind.config.js`, `postcss.config.js`
- Remove `autoprefixer`, `@tailwindcss/forms`, `@tailwindcss/typography`, `tailwindcss-animate`
- Install `tailwindcss` v4 + `@tailwindcss/vite`
- Convert CSS to `@import "tailwindcss"` + `@theme {}` block
- Replace `tailwindcss-animate` with `tw-animate-css`
- Depends on: task-002

**task-004: Align electricity-ui styles with shadcn-vue theming**

- Replace hardcoded colors with shadcn CSS variables (`bg-background`, `text-foreground`, etc.)
- Use `cn()` utility pattern, same radius variables
- Verify dark mode with `.dark` class approach
- Depends on: task-003

**task-005: Update electricity-ui dependencies**

- reka-ui ^2.8→^2.9, vue-router 4→5, @vueuse/core 13→14, lucide-vue-next→^1.0
- Remove `@headlessui/vue`, `@headlessui-float/vue`, `class-variance-authority` if unused
- Depends on: task-002

**task-006: Build registry and integrate with dashboard-template**

- Run `shadcn-vue build` to generate `public/r/*.json`
- Test installing into dashboard-template
- Add `@electricity` registry to `components.json`
- Depends on: task-001, task-003, task-004, task-005

### 2. Git Init

```bash
cd C:\Users\Juugo\Documents\Projects\dashboard-template
git init
git add -A
git commit -m "Initial template setup: Vue 3.6 + Vite 8 + VitePlus + shadcn-vue + full stack"
```

### 3. Test Dev Server

```bash
cd C:\Users\Juugo\Documents\Projects\dashboard-template
vp dev
```

Verify the home page renders at localhost with Tailwind styles and Inter font.

### 4. Update Project Memory

Since the project moved from `~/.claude/projects/dashboard` to `~/Documents/Projects/dashboard-template`, Claude will create a new project context. Save a memory entry about the project and link to this doc.

### 5. Add More shadcn-vue Components

The template has shadcn-vue initialized but no components added yet. Add commonly needed ones:

```bash
pnpm dlx shadcn-vue@latest add button input label card dialog sheet dropdown-menu separator badge toast sonner
```

### 6. Implement the electricity-ui Migration Tasks

Work through tasks 001-006 in order, following the dependency chain. The electricity-ui repo is at `C:\Users\Juugo\Documents\Projects\electricity-ui`.

### 7. Consider PWA Support

Vitesse includes `vite-plugin-pwa`. We deliberately didn't add it — add it per-project if needed:

```bash
pnpm add -D vite-plugin-pwa
```

---

## Key Architecture Decisions Made

1. **Vue 3.6 + Vite 8 over Nuxt 4** — Nuxt pins Vite 7, blocking VitePlus. For SPA-focused work, the plugin assembly (Vue Router 5 + layouts + auto-imports + Nitro) covers what Nuxt provides with less magic.

2. **VitePlus linting over @antfu/eslint-config** — VitePlus has its own dual-linter (OxLint + ESLint bridge). Adding antfu's config would create conflicts. We kept VP's setup.

3. **shadcn-vue registry for electricity-ui** — instead of copying components manually or publishing to npm, electricity-ui will become a shadcn-vue custom registry. Install with `pnpm dlx shadcn-vue@latest add @electricity/date-picker`.

4. **Nitro conditional, not always-on** — `WITH_NITRO=true` env var enables it. Default is pure SPA. Avoids complexity when not needed.

5. **vite-ssg for SSG** — `ViteSSG()` in main.ts enables both SPA mode and SSG from the same entry point. No separate config needed.

6. **Unhead v2 API** — `createHead()` imports from `@unhead/vue/client` (not `@unhead/vue`). The main index only exports `createUnhead`/`createHeadCore`.

---

## File Structure Reference

```
dashboard-template/
├── .claude/skills/              # 24 AI skills
├── .mcp.json                    # 3 MCP servers (nuxt, supabase, shadcn)
├── .vite-hooks/                 # VitePlus hooks
├── .vscode/                     # Editor config
├── backlog/                     # Task management
│   ├── tasks/task-001-*.md      # Migration tasks
│   ├── designs/
│   ├── docs/doc-project-handoff.md  # THIS FILE
│   └── archive/
├── CLAUDE.md                    # AI project guide
├── components.json              # shadcn-vue config + registries
├── e2e/                         # Playwright tests
├── eslint.config.ts             # ESLint (Vue + oxlint bridge)
├── nitro.config.ts              # Nitro config (optional backend)
├── package.json                 # pnpm, VitePlus
├── pnpm-workspace.yaml          # Vue 3.6 beta overrides
├── server/                      # Nitro API routes (optional)
│   └── api/hello.ts, health.get.ts
├── src/
│   ├── App.vue                  # Root (<RouterView /> only)
│   ├── assets/main.css          # Tailwind + shadcn theme + dark mode
│   ├── components/ui/           # shadcn-vue (empty, add via CLI)
│   ├── composables/             # Auto-imported
│   ├── layouts/default.vue      # Default layout
│   ├── lib/utils.ts             # cn() utility
│   ├── locales/en.json          # i18n
│   ├── main.ts                  # Entry (ViteSSG)
│   ├── pages/(home).vue         # Home page
│   ├── plugins/
│   ├── stores/counter.ts        # Example Pinia store
│   └── types/
├── tsconfig.json                # Base (paths for shadcn)
├── vite.config.ts               # 15+ Vite plugins configured
└── vitest.config.ts
```
