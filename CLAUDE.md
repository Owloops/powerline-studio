# CLAUDE.md

## Project Overview

Reusable Vue app template. Clone to scaffold new projects with full stack, tooling, AI skills, and MCP servers pre-configured. Supabase and Nitro optional; rendering mode configurable (SPA, SSG, fullstack). Targets headless UI, form validation, animations, optional backend.

## Tech Stack

### Core

| Tool             | Package                | Version | Role                                                                                           |
| ---------------- | ---------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| **Vue 3.6**      | `vue`                  | beta    | Composition API + `<script setup>` exclusively. Alien Signals reactivity, Vapor Mode available |
| **Vite 8**       | via VitePlus           | ^8.0    | Rolldown-powered builds (~200ms production). Managed by VitePlus                               |
| **VitePlus**     | `vite-plus` + `vp` CLI | alpha   | Unified toolchain — dev server, builds, testing, linting, formatting                           |
| **TypeScript 6** | `typescript`           | ~6.0    | Type safety throughout — always use `.ts` and `lang="ts"` in SFCs                              |
| **Vue Router 5** | `vue-router`           | ^5.0    | File-based routing via `vue-router/vite` plugin, typed routes                                  |
| **Pinia 3**      | `pinia`                | ^3.0    | State management. Prefer setup stores for complex logic                                        |

### Styling & UI

| Tool               | Package                                    | Role                                                                                           |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **Tailwind CSS 4** | `tailwindcss` + `@tailwindcss/vite`        | CSS-first config (`@import "tailwindcss"`), no JS config file                                  |
| **shadcn-vue**     | CLI + `components.json`                    | Pre-styled components built on reka-ui + Tailwind. Copied to `src/components/ui/`, fully owned |
| **reka-ui**        | `reka-ui` ^2.9                             | Headless UI primitives (formerly Radix Vue). Used directly for custom components               |
| **Lucide Icons**   | `lucide-vue-next` + `@iconify-json/lucide` | Icon library. Auto-imported via `unplugin-icons` with `IconsResolver`                          |

### Animations & Images

| Tool               | Package               | Role                                                                                              |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------------------- |
| **Motion for Vue** | `motion-v` ^2.2       | `<motion.div>`, gestures, scroll, layout animations, `<AnimatePresence>`                          |
| **Unpic**          | `@unpic/vue` ^1.0     | Responsive `<Image>` component with CDN auto-detection, srcset, lazy loading                      |
| **Inspira UI**     | `@inspira-ui/plugins` | 128 animated components (backgrounds, text effects, cards, cursors, etc.) via shadcn-vue registry |

### Forms & Validation

| Tool         | Package                | Role                                                                                      |
| ------------ | ---------------------- | ----------------------------------------------------------------------------------------- |
| **FormWerk** | `@formwerk/core` ^0.14 | Headless form composables — `useTextField`, `useNumberField`, `useForm`, `useCustomField` |
| **Zod**      | `zod` ^4.3             | Schema validation (Standard Schema compatible with FormWerk)                              |

Integrate with reka-ui/shadcn-vue via `useCustomField`: wrap any component, call `setValue()` and `validate()` manually.

### Head, SEO & i18n

| Tool         | Package          | Role                                                                                         |
| ------------ | ---------------- | -------------------------------------------------------------------------------------------- |
| **Unhead**   | `@unhead/vue`    | `useHead()`, `useSeoMeta()`, `useHeadSafe()` — reactive head management                      |
| **Vue I18n** | `vue-i18n` ^11.3 | Internationalization. Locale files in `src/locales/`. Vite plugin pre-compiles at build time |

### Content & Fonts

| Tool         | Package                                         | Role                                                                        |
| ------------ | ----------------------------------------------- | --------------------------------------------------------------------------- |
| **Markdown** | `unplugin-vue-markdown`                         | `.md` files as Vue components and routable pages. Shiki syntax highlighting |
| **Fonts**    | `unplugin-fonts` + `@fontsource-variable/inter` | Self-hosted Inter Variable font with preloading and CLS prevention          |
| **Beasties** | `vite-plugin-beasties`                          | Build-time critical CSS inliner — extracts above-fold CSS, lazy-loads rest  |

### Backend (Optional)

| Tool         | Package                 | Role                                                                         |
| ------------ | ----------------------- | ---------------------------------------------------------------------------- |
| **Nitro v3** | `nitro` (beta)          | API routes in `server/api/`. Enabled via `WITH_NITRO=true` env var           |
| **Supabase** | via MCP + future module | Postgres, Auth, Edge Functions, Realtime, Storage. MCP server pre-configured |

### Build & Quality

| Tool                    | Role                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| **VitePlus** (`vp` CLI) | Wraps Vite 8, Vitest, OxLint, OxFmt, tsdown                                                |
| **OxLint + ESLint**     | OxLint for fast checks, ESLint for Vue-specific rules (bridged via `eslint-plugin-oxlint`) |
| **OxFmt**               | Formatting — single quotes, no semicolons, tabs                                            |
| **Vitest**              | Unit/integration testing (via `vp test`)                                                   |
| **Playwright**          | E2E testing                                                                                |
| **vite-ssg**            | Static site generation with sitemap                                                        |

### Auto-imports

The following are auto-imported everywhere (via `unplugin-auto-import`):

- All Vue Composition API (`ref`, `computed`, `watch`, etc.)
- Vue Router (`useRoute`, `useRouter`, `definePage`, etc.)
- VueUse composables (`useStorage`, `useDark`, `useMediaQuery`, etc.)
- Vue I18n (`useI18n`)
- Unhead (`useHead`, `useSeoMeta`, `useHeadSafe`)
- Everything in `src/composables/` and `src/stores/`

Components in `src/components/` via `unplugin-vue-components`. Icons as `<IconLucide-{name} />`.

## Commands

```bash
# Dev
vp dev                        # Dev server + HMR
vp build                      # SPA production build (~200ms)
vp preview                    # Preview production build
pnpm build:ssg                # SSG + sitemap
pnpm dev:server               # Dev with Nitro (WITH_NITRO=true)
pnpm build:server             # Build with Nitro

# Quality
vp check                      # Lint + format + type-check
vp check --fix                # Auto-fix
vp test                       # Vitest
pnpm test:e2e                 # Playwright E2E
pnpm lint                     # OxLint + ESLint

# UI Components
pnpm dlx shadcn-vue@latest add <component>           # Add component(s)
pnpm dlx shadcn-vue@latest add button card            # Add multiple
pnpm dlx shadcn-vue@latest add @registry/name         # From custom registry
pnpm dlx shadcn-vue@latest add @inspira/component     # Add inspira-ui component
```

## Code Conventions

### Vue Components

- Always `<script setup lang="ts">` — never Options API
- Prefer `shallowRef` when deep reactivity unneeded
- `defineModel` for two-way binding
- `defineProps<{}>()` and `defineEmits<{}>()` with TypeScript generics (not runtime)
- Omit `const props =` unless props used in script block
- Named exports over default; named functions for methods, arrows for callbacks

### Styling

- Tailwind CSS 4 exclusively — no inline styles, no CSS modules
- Theme in `src/assets/main.css` via `@theme {}` + CSS variables
- shadcn-vue CSS variables: `--background`, `--foreground`, `--primary`, etc.
- Dark mode: `.dark` class — `@custom-variant dark (&:is(.dark *))`
- `cn()` from `@/lib/utils` for conditional class merging

### Forms

- Wrap reka-ui/shadcn controls with FormWerk `useCustomField`
- Zod for schema validation (Standard Schema)
- Call `validate()` manually for third-party components

### Routing

- Pages in `src/pages/`, file-based routing (Vue Router 5)
- Route groups: `(home).vue` not `index.vue`; explicit params: `[userId]` not `[id]`
- Layouts in `src/layouts/` via `vite-plugin-vue-layouts-next`
- `definePage()` for route metadata

### File Organization

```
src/
├── assets/css/main.css       # Tailwind + theme + shadcn vars
├── components/ui/            # shadcn-vue (owned, modifiable)
├── composables/              # Auto-imported composables
├── layouts/                  # Page layouts
├── lib/utils.ts              # cn() utility
├── locales/                  # i18n locale files
├── pages/                    # File-based routes
├── plugins/                  # Vue plugins
├── stores/                   # Pinia stores (auto-imported)
├── types/                    # TypeScript types
├── main.ts                   # App entry (ViteSSG)
└── App.vue                   # Root (<RouterView />)
server/                       # Nitro (optional, WITH_NITRO=true)
├── api/                      # /api/* routes
├── routes/                   # Arbitrary routes
├── middleware/                # Pre-request middleware
├── plugins/                  # Startup hooks
└── utils/                    # Auto-imported utilities
```

## AI Tooling — Skills & MCP Servers

> CRITICAL: This project uses bleeding-edge frameworks. Training data is likely outdated.
> MUST use skills and MCP servers proactively for current docs before writing or modifying code.
>
> Before any task: identify relevant skills/MCP servers, load early, use throughout — not just at start.
> Cost of loading an unnecessary skill ≈ 0. Cost of stale API knowledge = high.

### MCP Servers (`.mcp.json`)

| Server       | Type  | Purpose                                                              |
| ------------ | ----- | -------------------------------------------------------------------- |
| **nuxt**     | HTTP  | Nuxt 4 documentation, guides, migration help                         |
| **supabase** | HTTP  | Database management, edge functions, logs, docs (OAuth on first use) |
| **shadcn**   | stdio | Browse, search, install shadcn-vue components and registry items     |
| **uidotsh**  | HTTP  | AI UI generation, fetch designs. Use when designing pages/layouts    |

### Skills

Load via `/skill-name` or the Skill tool. Load proactively — don't wait for problems.

**Vue/Nuxt ecosystem:** vue, nuxt, pinia, vite, vitest, pnpm, tsdown, vueuse-functions
**Best practices:** vue-best-practices, vue-router-best-practices, vue-testing-best-practices, web-design-guidelines, pages
**UI & Components:** shadcn-vue, reka-ui, unpic-vue, inspira-ui, eui-components
**Forms & Validation:** formwerk, zod
**Head & i18n:** unhead-vue, vue-i18n
**Build tools:** vue-macros, vue-markdown
**Animations:** motion, animations, css-spring, motion-audit, see-transition
**Backend:** supabase, supabase-postgres-best-practices
**Global (user-level):** ui

### Documentation Access

- shadcn-vue: use the `shadcn` MCP server or `ref_search_documentation`
- inspira-ui: browse components at `https://inspira-ui.com/docs/en`, install via `pnpm dlx shadcn-vue@latest add @inspira/<name>`
- Nuxt docs: use the `nuxt` MCP server or fetch `https://nuxt.com/llms.txt`
- Supabase docs: use the `supabase` MCP server's `search_docs` tool
- All other libraries: use `ref_search_documentation` or `context7` MCP tools

### Usage Protocol

For every task:

1. Identify relevant skills — match against files, APIs, features involved
2. Load skills at task start, not after hitting a wall
3. Consult MCP servers for current API surfaces (shadcn components, Supabase schema, Nuxt modules)
4. Re-consult during implementation for unfamiliar patterns — don't guess
5. Never rely on training data alone for: Vue 3.6, Vite 8, VitePlus, Tailwind 4, reka-ui, shadcn-vue, FormWerk, Motion for Vue, Nuxt 4, Supabase

## Important Notes

- VitePlus manages Vite: don't install `vite`, `vitest`, `oxlint`, `oxfmt` directly. Import from `vite-plus` (not `vite`) and `vite-plus/test` (not `vitest`)
- Vue 3.6 pinned to beta via `pnpm-workspace.yaml` overrides. All `@vue/*` resolve to beta. Vapor Mode available but not production-ready
- Nitro optional: `WITH_NITRO=true` activates. Default SPA. Use `pnpm dev:server` / `pnpm build:server`
- Custom shadcn-vue registries: add to `components.json` `"registries"`. Install: `pnpm dlx shadcn-vue@latest add @namespace/component`

### Inspira UI

Inspira UI is a collection of 128 animated/visual Vue components (backgrounds, text animations, special effects, cards, cursors, etc.) installed via the shadcn-vue CLI from the `@inspira` registry. Components are copy-pasted into `src/components/ui/` and fully owned. The `@inspira-ui/plugins` Tailwind plugin provides `bg-grid`, `bg-grid-small`, and `bg-dot` background pattern utilities used by some components.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ built-in commands (`vp dev`, `vp build`, `vp test`, etc.) always run the Vite+ built-in tool, not any `package.json` script of the same name. To run a custom script that shares a name with a built-in command, use `vp run <script>`. For example, if you have a custom `dev` script that runs multiple services concurrently, run it with `vp run dev`, not `vp dev` (which always starts Vite's dev server).
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## CI Integration

For GitHub Actions, consider using [`voidzero-dev/setup-vp`](https://github.com/voidzero-dev/setup-vp) to replace separate `actions/setup-node`, package-manager setup, cache, and install steps with a single action.

```yaml
- uses: voidzero-dev/setup-vp@v1
  with:
    cache: true
- run: vp check
- run: vp test
```

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->
