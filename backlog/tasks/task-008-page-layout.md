---
id: task-008-page-layout
title: Create studio page route, layout shell, sidebar navigation, and Nerd Font setup
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
---

## Description

<!-- DESCRIPTION:BEGIN -->

Create the `/studio` page for Powerline Studio — a full-screen visual config editor for claude-powerline. The page has a dedicated layout (no default template nav bar) with two regions stacked vertically: a terminal preview area at the top, and a sidebar + main panel below it. The sidebar lists six navigation items (Theme, Style, Segments, TUI Layout, Mock Data, Export) — clicking one shows its corresponding config panel in the main area. A Nerd Font must be self-hosted and loaded so the terminal preview can render powerline glyphs (arrows, git branch symbols, etc.) correctly.

This task is the foundational shell. It does not implement the actual terminal preview rendering (task-011), the config panels' inner content (tasks 014–022), or the Pinia stores (task-009). It creates the page route, layout structure, sidebar navigation, panel switching mechanism with placeholder panels, and the Nerd Font setup.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Route & Layout

- File-based route at `/studio` via `src/pages/studio.vue`
- Uses `definePage()` to set route meta and opt into a `studio` layout: `definePage({ meta: { layout: 'studio' } })`
- Page sets document title via `useHead({ title: 'Powerline Studio' })` (same pattern as other pages)
- Dedicated `src/layouts/studio.vue` layout — full viewport, no template nav bar, no container padding
- The layout renders `<RouterView />` in a full-height flex column
- Layout includes `<Sonner />` for toast notifications (needed for export/copy actions in later tasks)

### Page Structure

The studio page is a two-region vertical stack filling the viewport (below any minimal top bar):

```
┌─────────────────────────────────────────────────────┐
│  Top bar: Logo/title left, dark mode toggle right   │
├─────────────────────────────────────────────────────┤
│  Terminal Preview Region                            │
│  (placeholder slot — filled by task-011)            │
│  Minimum height ~120px, background: dark card       │
├──────────────┬──────────────────────────────────────┤
│  Sidebar     │  Config Panel                        │
│  (fixed-w)   │  (flex-1, scrollable)                │
│              │                                      │
│  Theme       │  <component :is="activePanel" />     │
│  Style       │  (placeholder components per panel)  │
│  Segments    │                                      │
│  TUI Layout  │                                      │
│  Mock Data   │                                      │
│  Export      │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### Sidebar Navigation

- Built using shadcn-vue `Sidebar` component system (must be installed via CLI first)
- Components: `SidebarProvider`, `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuButton`, `SidebarMenuItem`, `SidebarInset`
- 6 items, each with an icon (auto-imported via `unplugin-icons` as `<IconLucide-{name} />`) and label:
  - Theme (`<IconLucide-palette />`)
  - Style (`<IconLucide-pen-tool />`)
  - Segments (`<IconLucide-layout-list />`)
  - TUI Layout (`<IconLucide-grid-3x3 />`)
  - Mock Data (`<IconLucide-database />`)
  - Export (`<IconLucide-download />`)
- Active item highlighted via `is-active` prop on `SidebarMenuButton`
- Default active panel: `'theme'` (first item)
- Sidebar should be collapsible to icons on smaller screens (`collapsible="icon"`)
- `SidebarRail` for drag-to-resize affordance
- On mobile (sheet mode), selecting a panel closes the sheet overlay

### Config Panel Switching

- Active panel tracked by a local `activePanel` ref initialized to `'theme'` (will migrate to `useEditorStore` in task-009)
- A `StudioPanel` type union: `'theme' | 'style' | 'segments' | 'tui' | 'mockData' | 'export'`
- Dynamic rendering via `<component :is="panelComponents[activePanel]" />`
- Each panel is a placeholder stub component showing the panel name and "Coming soon" text
- Placeholder components: `src/components/studio/panels/ThemePanel.vue`, `StylePanel.vue`, `SegmentsPanel.vue`, `TuiLayoutPanel.vue`, `MockDataPanel.vue`, `ExportPanel.vue`

### Nerd Font

- Self-host a Nerd Font woff2 file (FiraCode Nerd Font Mono recommended — monospace, widely used, good powerline glyph coverage)
- Place font file in `src/assets/fonts/FiraCodeNerdFontMono-Regular.woff2`
- Add `@font-face` declaration in `src/assets/main.css` for font-family `'FiraCode Nerd Font Mono'` with `font-display: swap` to prevent invisible text during font load
- Add `--font-nerd` to the `@theme` block: `--font-nerd: 'FiraCode Nerd Font Mono', ui-monospace, monospace;`
- Terminal preview region applies `font-nerd` class — actual usage by task-011, but the CSS must be ready

### Responsive Behavior

- Desktop (>=1024px): sidebar expanded with labels + icons, full layout
- Tablet (768–1023px): sidebar collapsed to icon-only mode via `collapsible="icon"`
- Below 768px: sidebar as sheet/overlay (shadcn Sidebar default mobile behavior); selecting a panel closes the sheet
- Terminal preview region remains full-width at all breakpoints
- The split-pane region (sidebar + panel) uses `overflow-hidden` on the flex container and `min-h-0` on the flex child so that the config panel can scroll independently (`overflow-y-auto`) without breaking the flex layout
- Config panel scrolls independently (overflow-y-auto)

### Acceptance Criteria

- Navigating to `/studio` renders the studio layout (no default template nav)
- Browser title is "Powerline Studio"
- All 6 sidebar items render with icons and labels
- Theme panel is shown by default on page load
- Clicking a sidebar item updates the main panel to show the matching placeholder
- Active sidebar item is visually highlighted
- Sidebar collapses to icons on tablet widths
- On mobile, sidebar opens as sheet overlay and selecting a panel closes the sheet
- Config panel scrolls independently when content overflows
- Nerd Font CSS is loaded with `font-display: swap` and a test character (e.g., ``) renders in the preview area placeholder
- Dark mode toggle works in the studio top bar
- Toast notifications are available (Sonner outlet present in studio layout)
- No console errors; `vp check` passes (fallback: `vue-tsc --build` + `vp lint`)

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**

The studio page uses a separate layout (`src/layouts/studio.vue`) to avoid the default template's nav bar and container. The page itself (`src/pages/studio.vue`) composes the full editor UI. The layout is minimal — just a full-viewport shell with a `<RouterView />`.

The sidebar uses shadcn-vue's `Sidebar` component system, which provides built-in collapsible behavior, mobile sheet overlay, keyboard accessibility, and theming via CSS variables already present in `main.css` (`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, etc.).

Panel switching is handled via a `Map<StudioPanel, Component>` lookup with Vue's `<component :is>` dynamic component rendering. This avoids routing overhead for what is essentially tab-like switching within a single page.

The Nerd Font is self-hosted because Nerd Fonts are not available via `@fontsource`. A single woff2 file (~400KB) is loaded via `@font-face` and exposed as a Tailwind font family.

**Key Files:**

- `src/layouts/studio.vue` — Full-viewport layout (no nav bar), renders `<RouterView />`
- `src/pages/studio.vue` — Studio page: preview area, SidebarProvider + Sidebar + SidebarInset, panel switching
- `src/components/studio/StudioSidebar.vue` — Sidebar component with 6 nav items
- `src/components/studio/StudioTopBar.vue` — Minimal top bar with logo and dark mode toggle
- `src/components/studio/panels/ThemePanel.vue` — Placeholder
- `src/components/studio/panels/StylePanel.vue` — Placeholder
- `src/components/studio/panels/SegmentsPanel.vue` — Placeholder
- `src/components/studio/panels/TuiLayoutPanel.vue` — Placeholder
- `src/components/studio/panels/MockDataPanel.vue` — Placeholder
- `src/components/studio/panels/ExportPanel.vue` — Placeholder
- `src/assets/fonts/FiraCodeNerdFontMono-Regular.woff2` — Self-hosted Nerd Font
- `src/assets/main.css` — `@font-face` + `--font-nerd` theme addition
- `src/types/studio.ts` — `StudioPanel` type and sidebar nav item type

**Component Hierarchy:**

```
studio.vue (layout)
  └── studio.vue (page)
       ├── StudioTopBar.vue
       │    ├── Logo/title
       │    └── Dark mode toggle (Button + icon)
       ├── Preview region (placeholder div, font-nerd applied)
       └── SidebarProvider
            ├── StudioSidebar.vue
            │    └── Sidebar > SidebarContent > SidebarGroup > SidebarMenu
            │         └── SidebarMenuItem × 6 (SidebarMenuButton with icon + label)
            └── SidebarInset
                 └── <component :is="activePanel" /> (dynamic panel)
```

**Patterns to Follow:**

- File-based routing with `definePage({ meta: { layout: 'studio' } })` to select the studio layout
- `useHead({ title: 'Powerline Studio' })` for document title (matches codebase pattern)
- shadcn-vue Sidebar component API (SidebarProvider wrapping everything, Sidebar + SidebarInset as siblings)
- `<script setup lang="ts">` exclusively
- Tailwind CSS 4 for all styling, `cn()` for conditional classes
- Lucide icons via `unplugin-icons` auto-import (`<IconLucide-palette />`, `<IconLucide-pen-tool />`, etc.) — NOT direct `lucide-vue-next` imports
- `useDarkMode()` composable for dark mode toggle (already exists)
- Studio layout includes `<Sonner />` for toast support
- Flex layout with `overflow-hidden` + `min-h-0` on the split-pane region to enable independent scrolling

**shadcn-vue Components Required (install via CLI):**

- `sidebar` — full sidebar component system (26 files)
- `separator` — already installed

**Dependencies:**

- task-009 (Pinia stores) — future migration of `activePanel` to `useEditorStore`. This task uses a local ref as interim.
- No blocking dependencies — this task can start immediately.

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Install shadcn-vue `sidebar` component via `pnpm dlx shadcn-vue@latest add sidebar`
- [ ] Create `src/types/studio.ts` with `StudioPanel` type union and sidebar nav item type
- [ ] Create `src/layouts/studio.vue` — full-viewport layout with `<RouterView />` + `<Sonner />`
- [ ] Create `src/components/studio/StudioTopBar.vue` — logo/title + dark mode toggle
- [ ] Create `src/components/studio/StudioSidebar.vue` — Sidebar with 6 nav items using `<IconLucide-*>` auto-imports, collapsible to icons, mobile sheet close on selection
- [ ] Create 6 placeholder panel components in `src/components/studio/panels/`
- [ ] Create `src/pages/studio.vue` — page route with `definePage()` + `useHead()`, preview region, sidebar + panel layout, default active panel `'theme'`
- [ ] Download and place Nerd Font woff2 in `src/assets/fonts/`
- [ ] Add `@font-face` (with `font-display: swap`) and `--font-nerd` to `src/assets/main.css`
- [ ] Apply `font-nerd` to terminal preview placeholder region
- [ ] Ensure flex layout uses `overflow-hidden` + `min-h-0` for independent panel scrolling
- [ ] Verify responsive behavior: desktop (expanded), tablet (icon-only), mobile (sheet overlay with close on selection)
- [ ] Run `vp check` to verify no lint/type errors (fallback: `vue-tsc --build` + `vp lint`)

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Key Decisions:**

- Using a separate `studio` layout instead of the default layout. The default layout has a full nav bar with links to template example pages (Components, Charts, Forms, etc.) that are irrelevant to Powerline Studio. The studio needs all available viewport space.
- shadcn-vue `Sidebar` component is preferred over a custom sidebar because it provides collapsible behavior, mobile sheet overlay, keyboard accessibility, and uses the sidebar CSS variables already defined in `main.css`.
- Self-hosting the Nerd Font as woff2 rather than using a CDN — keeps the app self-contained and avoids external dependencies. FiraCode Nerd Font Mono is chosen for its monospace proportions and comprehensive powerline glyph coverage.
- Panel switching uses `<component :is>` with a local ref now, migrating to `useEditorStore.activePanel` when task-009 is done. This avoids a circular dependency (task-008 doesn't depend on task-009).
- The `SidebarInset` component from shadcn-vue provides the main content area that adjusts automatically when the sidebar collapses.

**Nerd Font Source:**

- Download from https://github.com/ryanoasis/nerd-fonts/releases — get `FiraCode.zip`, extract the `FiraCodeNerdFontMono-Regular.ttf`, convert to woff2 (or find a woff2 build). File size ~400KB.
- Alternative: Use the woff2 from the Nerd Fonts webfont CDN if a direct download is easier.

**Related Tasks:**

- task-009-pinia-stores — `useEditorStore` will own `activePanel` state; this task uses a local ref as interim
- task-011-terminal-preview — fills the preview region placeholder created here
- task-012-preview-controls — adds controls below the preview region
- tasks 014–022 — replace the placeholder panel components with real implementations

<!-- NOTES:END -->
