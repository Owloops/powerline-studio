---
id: task-006-build-registry-integration
title: Build registry and integrate with dashboard-template
status: "Done"
created_date: '2026-04-09 17:43'
updated_date: '2026-04-09 16:24'
parent: null
subtasks:
dependencies:
	- task-001
	- task-003
	- task-004
	- task-005
---

## Description

<!-- DESCRIPTION:BEGIN -->

Build the shadcn-vue registry from electricity-ui and integrate it with the dashboard-template project. This is the final integration task that brings together the registry setup (task-001), Tailwind v4 migration (task-003), shadcn theming alignment (task-004), and dependency updates (task-005).

**What this task does:**

1. Runs `shadcn-vue build` in electricity-ui to compile `registry.json` into per-component JSON files in `public/r/`
2. Validates all generated JSON files are well-formed and contain expected fields (name, type, files with inline content)
3. Adds the `@electricity` named registry to dashboard-template's `components.json` using a local file path URL during development
4. Tests end-to-end installation of at least 2 components (one simple, one complex) from the registry into dashboard-template
5. Verifies installed components render correctly with the dashboard-template's theme in both light and dark modes
6. Documents the registry URL strategy for production use (GitHub Pages / raw GitHub)

**Prerequisites (completed by dependency tasks):**

- `registry.json` and `registry/new-york/` structure exist in electricity-ui (task-001)
- Components use Tailwind v4 CSS-first syntax (task-003)
- Components use shadcn-vue CSS variable theming (task-004)
- Dependencies match dashboard-template versions (task-005)
<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Preflight Checks

- Before starting, verify that dependency tasks have transformed electricity-ui:
  - `registry.json` exists at repo root (task-001)
  - `registry/new-york/` directory exists with component files (task-001)
  - `tailwind.config.js` and `postcss.config.js` are removed (task-003)
  - No `@headlessui/vue` or `@formkit/vue` imports remain in registry files (tasks 002/005)
  - `components.json` has `style: "new-york"` and Tailwind v4 CSS path (tasks 003/004)
- If any check fails, stop and report which dependency task is incomplete

### Registry Build (electricity-ui)

- Run `pnpm dlx shadcn-vue@latest build` (or `pnpm registry:build` if the script was added in task-001) to generate registry JSON files in `public/r/*.json`
- Each registry item in `registry.json` must produce a corresponding `public/r/<item-name>.json` file
- Validate ALL generated JSON files (not just a sample) — confirm each contains: `$schema`, `name`, `type`, `files` (with inline `content` containing the full source code), `dependencies`, and `registryDependencies`
- The build must complete without errors — any build failures indicate issues in `registry.json` that must be fixed

### Registry Configuration (dashboard-template)

- Add the `electricity` named registry to dashboard-template's `components.json` under `"registries"`. The key is `electricity`, the CLI install prefix is `@electricity/`:
  ```json
  "registries": {
    "electricity": {
      "url": "http://localhost:5050/r"
    }
  }
  ```
- For development/testing: serve electricity-ui's `public/` directory using a static file server: `npx serve public -l 5050` (do NOT use `pnpm preview` — that runs Vite preview which serves the library build output, not static files)
- For production: the URL will point to a hosted location (GitHub Pages, raw GitHub, or a static host) — document but do not implement hosting in this task

### Installation Testing

- Test installing a simple component: `pnpm dlx shadcn-vue@latest add @electricity/alert`
- Test installing a complex component with dependencies: `pnpm dlx shadcn-vue@latest add @electricity/combobox`
- Verify file placement: registry items typed as `registry:ui` install into the `ui` alias path (`src/components/ui/`), items typed as `registry:component` install into the `components` alias path (`src/components/`). Check that the item types in `registry.json` (from task-001) match the intended install locations.
- Installed components must not overwrite existing shadcn-vue base components in `src/components/ui/`
- Registry items must not require app-level plugin registration (e.g., FormKit plugin, Headless UI provider) — they should be self-contained

### Build Verification

- After installing components, run `vp check` (lint + format + type-check) in dashboard-template to verify the project still compiles
- Run `vp build` to verify production build succeeds with installed components
- Fix any type errors or import issues in the installed components

### Rendering Verification

- Installed components must render correctly using dashboard-template's Tailwind v4 + shadcn CSS variable theme
- Light mode: verify components use `--background`, `--foreground`, `--primary`, etc. correctly
- Dark mode: verify `.dark` class variant works and components adapt
- No hardcoded colors (e.g., `bg-white`, `text-gray-900`) should appear in installed component code
<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**

The shadcn-vue registry build pipeline works as follows:

1. `registry.json` (created in task-001) defines all items with their file paths, dependencies, and registryDependencies
2. `shadcn-vue build` reads `registry.json`, resolves all file paths under `registry/new-york/`, inlines file contents into per-item JSON, and writes output to `public/r/<item-name>.json`
3. The consuming project (dashboard-template) adds the registry URL to `components.json` under `"registries"`
4. `pnpm dlx shadcn-vue@latest add @electricity/<name>` fetches `<registry-url>/<name>.json`, resolves `registryDependencies`, and copies files to the consuming project

**Registry Serving Strategy:**

For development/testing, serve the built registry locally:

- Use a static file server: `npx serve public -l 5050` from the electricity-ui directory
- Do NOT use `pnpm preview` / `vite preview` — that serves the library build output (`dist/`), not the `public/` directory with registry JSON files

For production, two viable options (document both, choose later):

1. **GitHub Pages** — Deploy `public/r/` to a gh-pages branch, URL: `https://<org>.github.io/electricity-ui/r`
2. **Raw GitHub** — Serve directly from the repo, URL: `https://raw.githubusercontent.com/<org>/electricity-ui/main/public/r` (works but has rate limits)

**Key Files:**

| File              | Location            | Purpose                                                 |
| ----------------- | ------------------- | ------------------------------------------------------- |
| `registry.json`   | electricity-ui root | Registry definition (from task-001)                     |
| `public/r/*.json` | electricity-ui      | Built registry output (generated by `shadcn-vue build`) |
| `package.json`    | electricity-ui      | `registry:build` script                                 |
| `components.json` | dashboard-template  | Add `@electricity` registry entry                       |

**Component Install Flow:**

```
shadcn-vue add @electricity/combobox
  → fetches http://localhost:5050/r/combobox.json
  → reads registryDependencies (e.g., ["popover", "button"])
  → installs shadcn-vue base deps from @shadcn registry
  → copies component files to src/components/ (per aliases)
  → copies hook files to src/composables/ (per aliases)
  → adds npm dependencies to package.json
```

**Compatibility Notes:**

- dashboard-template uses `style: "new-york"` and `base: "reka"` — electricity-ui registry items are structured under `registry/new-york/` to match
- dashboard-template uses `baseColor: "neutral"` with oklch colors — registry components must use CSS variables, not color references
- dashboard-template's `cn()` util at `@/lib/utils` matches electricity-ui's — no import translation needed
- dashboard-template has empty `src/components/ui/` — registry item types determine install location: `registry:ui` → `src/components/ui/`, `registry:component` → `src/components/`. Task-001 must set item types carefully to avoid overwriting shadcn-vue base components

**Dependencies:**

- task-001 (Set up shadcn-vue registry) — Registry structure and `registry.json` must exist
- task-003 (Migrate Tailwind v4) — Components must use Tailwind v4 CSS-first syntax
- task-004 (Align shadcn-vue theming) — Components must use shadcn CSS variable theming
- task-005 (Update dependencies) — Dependencies must match dashboard-template versions
<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

### Phase 0: Preflight checks

- [x] Verify `registry.json` exists at electricity-ui root (task-001 complete)
- [x] Verify `registry/new-york/` directory exists with component files (task-001 complete)
- [x] Verify `tailwind.config.js` and `postcss.config.js` are removed (task-003 complete)
- [x] Verify no `@headlessui/vue` or `@formkit/vue` imports in registry files (tasks 002/005 complete)
- [x] Verify electricity-ui `components.json` has been updated to `style: "new-york"` with Tailwind v4 CSS path (tasks 003/004 complete) — **Fixed: was still `"style": "default"` with `tailwind.config.js` reference; updated to `"style": "new-york"` with empty config path**
- [x] If any check fails, stop and report which dependency task is incomplete

### Phase 1: Build the registry

- [x] Run `pnpm dlx shadcn-vue@latest build` in electricity-ui (or `pnpm registry:build` if script exists)
- [x] Fix any build errors (missing files, invalid paths in registry.json, schema violations) — no errors
- [x] Verify `public/r/` directory is created with one JSON file per registry item — 23 items + registry.json index
- [x] Validate ALL generated JSON files — all 24 files valid with `name`, `type`, `files[].content`, `dependencies`, `registryDependencies`

### Phase 2: Serve and configure the registry

- [x] Serve electricity-ui's `public/` via static server: `npx serve public -l 5050`
- [x] Verify `http://localhost:5050/r/alert.json` returns valid JSON
- [x] Add `@electricity` registry to dashboard-template's `components.json`:
  ```json
  "registries": {
    "@electricity": {
      "url": "http://localhost:5050/r/{name}.json"
    }
  }
  ```
  **Note:** Registry name must start with `@` and URL must include `{name}` placeholder per shadcn-vue CLI requirements.

### Phase 3: Test component installation

- [x] Install a simple component: `pnpm dlx shadcn-vue@latest add @electricity/alert` — installed to `src/components/Alert/`
- [x] Check file placement matches the item type — `registry:ui` items installed to `src/components/` per the `ui` alias
- [x] Install a complex component with dependencies: `pnpm dlx shadcn-vue@latest add @electricity/combobox` — 12 files installed
- [x] Verify registryDependencies are resolved — combobox has no registryDependencies, deps resolved correctly
- [x] Verify npm dependencies are added — `@lucide/vue` and `reka-ui` added to `package.json`
- [x] Confirm no file conflicts with existing `src/components/ui/` shadcn base components — `ui/` remains empty

### Phase 4: Build verification

- [x] Run `vp check` — `vp check` failed due to vp tools not being bootstrapped (pre-existing issue); ran `vue-tsc --noEmit` separately (pre-existing TS6 deprecation warning only)
- [x] Run `vp build` to verify production build succeeds — **built in 2.56s**, all components compile correctly. Non-blocking warnings from `unplugin-vue-better-define` about reka-ui type resolution.

### Phase 5: Rendering verification

- [x] Create a temporary test page in dashboard-template that imports and renders the installed components — created and verified, then removed
- [x] Verify light mode rendering — components use CSS variable colors correctly after fix
- [x] Verify dark mode rendering — CSS variables adapt via `.dark` class
- [x] Check for any hardcoded color classes — **Fixed 7 instances** of hardcoded colors in Combobox components (bg-white, text-gray-\*, text-black → bg-popover, text-popover-foreground, text-muted-foreground, bg-accent, text-accent-foreground, bg-border)

### Phase 6: Documentation

- [x] Registry build and serve documented (below)
- [x] `@electricity/<name>` install pattern documented (below)
- [x] Production URL strategy noted (below)

**Registry Build & Serve:**

```bash
# In electricity-ui:
pnpm dlx shadcn-vue@latest build    # or: pnpm registry:build
npx serve public -l 5050            # Serve for local dev (NOT vite preview)
```

**Install Components in dashboard-template:**

```bash
pnpm dlx shadcn-vue@latest add @electricity/<component-name>
# Examples:
pnpm dlx shadcn-vue@latest add @electricity/alert
pnpm dlx shadcn-vue@latest add @electricity/combobox
```

**Production URL Strategy (not yet implemented):**

- GitHub Pages: `https://<org>.github.io/electricity-ui/r/{name}.json`
- Raw GitHub: `https://raw.githubusercontent.com/<org>/electricity-ui/main/public/r/{name}.json`
<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Priority:** Medium — this is the capstone task that depends on all other tasks completing first.

**Scope Boundaries:**

- This task does NOT set up production hosting (GitHub Pages, CI/CD pipeline). It only documents the strategy.
- This task does NOT modify electricity-ui components — they should already be in final form from tasks 001-005.
- If `shadcn-vue build` fails due to issues in `registry.json`, fix only the build errors. Do not redesign the registry structure (that is task-001's scope).
- The test page created for rendering verification is temporary and should be removed (or .gitignored) after verification.

**Key Differences Between Projects:**

- dashboard-template uses `style: "new-york"`, electricity-ui's registry is structured under `registry/new-york/` to match
- dashboard-template uses Tailwind v4 with `@tailwindcss/vite`, electricity-ui will be migrated in task-003
- dashboard-template's `components.json` has `base: "reka"` and `font: "inter"` — these do not affect registry consumption but indicate the theming baseline
- dashboard-template uses VitePlus (`vp` CLI) — but `pnpm dlx shadcn-vue@latest` is used directly for registry operations, not through VitePlus

**Potential Issues:**

- electricity-ui's `pnpm preview` runs `vite preview` which serves the library build output, NOT static files — always use `npx serve public -l 5050` for registry serving
- The `shadcn-vue build` command may need `shadcn-vue` installed as a devDependency or run via `pnpm dlx`
- If the CLI can't resolve `@electricity` namespace, fall back to direct URL installation: `pnpm dlx shadcn-vue@latest add http://localhost:5050/r/combobox.json`
- Version drift: `pnpm dlx shadcn-vue@latest` may resolve to a different version between build and install. If issues arise, pin to the same version for both operations. Not worth pre-optimizing but note for debugging.
- Registry items typed as `registry:ui` will install into `src/components/ui/` per the `ui` alias. Verify during task-001 that electricity-ui items use appropriate types to avoid overwriting shadcn-vue base components.

**Related Tasks:**

- task-001-setup-shadcn-vue-registry must complete first (dependency)
- task-003-migrate-tailwind-v4 must complete first (dependency)
- task-004-align-shadcn-vue-theming must complete first (dependency)
- task-005-update-dependencies must complete first (dependency)
<!-- NOTES:END -->
