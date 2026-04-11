---
id: task-022-export-import
title: Build export panel with JSON output, clipboard, instructions, and localStorage persistence
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
  - task-009
---

## Description

<!-- DESCRIPTION:BEGIN -->

Create the Export/Import panel for the studio sidebar. This panel lets users get their finished configuration out of the editor and into their terminal, and also lets them bring existing configs into the editor.

The panel has two tabs: **Export** and **Import**.

**Export tab** shows:

1. The complete `claude-powerline.json` config as syntax-highlighted JSON (using Shiki, already in the project). The JSON is read-only and updates live as the user changes settings elsewhere in the studio.
2. A copy-to-clipboard button that copies the raw JSON and shows a toast confirmation ("Copied to clipboard!") via vue-sonner.
3. A collapsible "Installation Instructions" section with three pieces of info:
   - The npm install command: `npm install -g @owloops/claude-powerline`
   - Where to save: `~/.claude/claude-powerline.json`
   - The `settings.json` snippet: `"statusLine": { "command": "claude-powerline" }`
     Each instruction block has its own small copy button for the code snippet.

**Import tab** shows: 4. A textarea where users can paste an existing JSON config. A "Load Config" button parses the JSON, validates it structurally, and loads it into `useConfigStore`, replacing the current config. Invalid JSON shows an inline error message below the textarea.

**localStorage persistence** (cross-cutting, not tab-specific): 5. The current config is automatically persisted to localStorage on every change using VueUse's `useStorage`. On page load, if a saved config exists in localStorage, it is restored into the store. A "Reset to Defaults" button in the panel footer clears localStorage and resets the config store to `DEFAULT_CONFIG`.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Functional Requirements

**Export tab:**

- FR-1: Display the full `PowerlineConfig` as formatted JSON (2-space indent) with Shiki syntax highlighting using the `vitesse-dark`/`vitesse-light` themes (matching the markdown Shiki config already in `vite.config.ts`)
- FR-2: JSON output updates reactively whenever `useConfigStore` state changes
- FR-3: "Copy JSON" button copies the raw JSON string (not HTML) to clipboard using VueUse `useClipboard`
- FR-4: On successful copy, show a vue-sonner toast: "Copied to clipboard!" (success variant)
- FR-5: Collapsible "Installation Instructions" section (collapsed by default) using shadcn-vue Collapsible component
- FR-6: Three instruction blocks inside the collapsible, each with a small copy button:
  - Install command: `npm install -g @owloops/claude-powerline`
  - Config file path: `~/.claude/claude-powerline.json`
  - settings.json snippet: `{ "statusLine": { "command": "claude-powerline" } }`

**Import tab:**

- FR-7: Textarea (shadcn-vue Textarea) for pasting JSON config
- FR-8: "Load Config" button (disabled when textarea is empty or whitespace-only)
- FR-9: On load: parse JSON with `JSON.parse`, validate it is a non-null object and that any present top-level fields have correct types (`theme` is a string if present, `display` is an object if present). Accept `Partial<PowerlineConfig>` — matching upstream `claude-powerline` behavior which deep-merges partials with defaults. Call `useConfigStore.loadConfig(parsed)` which deep-merges with `DEFAULT_CONFIG`.
- FR-10: On parse/validation error: show inline red error message below the textarea (not a toast — user needs to see it while editing). Clear the error when the user modifies the textarea content.
- FR-11: On success: show a vue-sonner toast "Config loaded successfully", clear the textarea

**localStorage persistence:**

- FR-12: Use `useStorage('powerline-studio-config', structuredClone(DEFAULT_CONFIG), undefined, { mergeDefaults: deepMerge, initOnMounted: true })` to persist config. Omit the storage arg (defaults to `localStorage` at runtime) to avoid referencing browser globals during SSG. Use a custom deep merge function (not shallow `true`) since `PowerlineConfig` has nested objects (`display.lines`, `budget`). Always clone `DEFAULT_CONFIG` to avoid mutating the imported constant.
- FR-13: On app startup, if localStorage has a saved config, restore it into `useConfigStore`
- FR-14: "Reset to Defaults" button in panel footer writes `DEFAULT_CONFIG` back to storage (`storedConfig.value = structuredClone(DEFAULT_CONFIG)`) — this both resets the in-memory state and persists the clean defaults to localStorage
- FR-15: Reset shows a confirmation toast: "Config reset to defaults"

**Tabs:**

- FR-16: Use shadcn-vue Tabs component with two tabs: "Export" and "Import"

### Non-Functional Requirements

- NFR-1: Shiki highlighting must be loaded lazily (dynamic import) to avoid blocking initial page load — the `shiki` package is ~400KB. Use `shallowRef` for the highlighter instance.
- NFR-2: While Shiki loads, show the raw JSON in a `<pre>` block with `text-muted-foreground` styling as fallback
- NFR-3: Panel must work in all modern browsers (Chrome, Firefox, Safari, Edge). Clipboard API fallback via `useClipboard({ legacy: true })`.
- NFR-4: All copy buttons should show a brief "Copied!" state (1.5s, the `useClipboard` default `copiedDuring`). Each copy button must use its own `useClipboard` instance to avoid shared `copied` state between buttons.
- NFR-5: Clipboard failures should be handled gracefully — show a toast error if copy fails (e.g., permissions denied). Do not crash.

### Acceptance Criteria

- AC-1: Export tab shows syntax-highlighted JSON that matches the current config store state
- AC-2: Changing any config option in another panel immediately updates the JSON display
- AC-3: Copy button copies valid JSON that can be saved to a file and used by claude-powerline
- AC-4: Pasting valid JSON in the import textarea and clicking Load replaces the config and updates the preview
- AC-5: Pasting invalid JSON shows an error message without crashing
- AC-6: Refreshing the page preserves the last config state from localStorage
- AC-7: Reset to Defaults restores the default config and clears localStorage
- AC-8: Collapsible installation section can be toggled open/closed

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

### Architecture Approach

The export/import panel is a sidebar config panel (`ExportPanel.vue`) composed of three focused child components organized by responsibility. localStorage persistence is handled inside `useConfigStore` (task-009) using VueUse's `useStorage`, keeping storage concerns co-located with the config state.

Shiki is loaded lazily via a composable (`useShikiHighlighter`) that dynamically imports the `shiki` package and caches the highlighter instance in a module-level `shallowRef`. This avoids the ~400KB Shiki bundle blocking initial page load while sharing a single highlighter across all components that need it.

### Component Tree

```
ExportPanel.vue (Tabs wrapper + Reset button footer)
├── ExportTab.vue (JSON display + copy + installation instructions)
│   ├── Shiki-highlighted <pre> (via useShikiHighlighter composable)
│   ├── Copy JSON button (useClipboard + toast)
│   └── Collapsible installation instructions
│       ├── Install command + copy button
│       ├── Config path + copy button
│       └── settings.json snippet + copy button
└── ImportTab.vue (Textarea + Load button + error display)
```

### Key Files

| File                                           | Purpose                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/components/studio/panels/ExportPanel.vue` | Panel wrapper with Tabs (Export/Import) and Reset to Defaults footer button                                  |
| `src/components/studio/panels/ExportTab.vue`   | JSON output display, copy button, installation instructions collapsible                                      |
| `src/components/studio/panels/ImportTab.vue`   | Import textarea, Load Config button, validation error display                                                |
| `src/composables/useShikiHighlighter.ts`       | Lazy-loads Shiki, creates and caches a highlighter instance, exposes `highlight(code, lang)`                 |
| `src/stores/config.ts`                         | (Modified in task-009) Add `useStorage` integration for localStorage persistence, `resetToDefaults()` action |

### Component Details

**ExportPanel.vue:**

- Uses shadcn-vue `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- Two tabs: "Export" (default) and "Import"
- Footer area outside tabs with "Reset to Defaults" `Button` (variant `destructive`, size `sm`)
- Reset calls `configStore.resetToDefaults()` and shows toast

**ExportTab.vue:**

- Reads `configStore.config` and computes `configJson = computed(() => JSON.stringify(config, null, 2))`
- Passes `configJson` to `useShikiHighlighter` which returns `{ html, isLoading }`
- Renders `<div v-html="html">` when loaded, `<pre>{{ configJson }}</pre>` as fallback while loading
- "Copy JSON" button using its own `useClipboard({ legacy: true })` instance — calls `copy(configJson)`, shows toast on success
- Collapsible section using shadcn-vue `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`
- Three code blocks inside, each a `<code>` with a small icon-only copy button. Each copy button uses its **own** `useClipboard` instance to isolate `copied` state.

**ImportTab.vue:**

- shadcn-vue `Textarea` bound to a local `ref<string>`
- "Load Config" `Button` (disabled when `!textarea.value.trim()`)
- On click: try `JSON.parse`, validate it's a non-null object with correct top-level field types, call `configStore.loadConfig(parsed)` (accepts `Partial<PowerlineConfig>`), toast success, clear textarea and error
- On error: set local `errorMessage` ref, display below textarea in `text-destructive` paragraph. Clear error on textarea input via `watch`.

**useShikiHighlighter.ts:**

```ts
// Composable pattern:
// - Module-level shallowRef for cached highlighter (shared across components)
// - Also cache the in-flight promise to prevent race conditions with concurrent callers
// - Returns { html: Ref<string>, isLoading: Ref<boolean> }
// - Accepts reactive code source and lang
// - Dynamic import triggered on first call (client-only — never during SSR)
// - Uses watchEffect to re-highlight when code changes
// - Themes: vitesse-dark + vitesse-light (dual theme, matches existing markdown config)
// - Generates HTML with `codeToHtml(code, { lang: 'json', themes: { light, dark } })`
```

### Integration Point

`ExportPanel.vue` is rendered inside the sidebar main panel area from task-008. The sidebar uses `useEditorStore.activePanel` to determine which panel to show. When `activePanel === 'export'`, the sidebar renders `<ExportPanel />`. This follows the same pattern as all other panel components (ThemePicker, StylePicker, SegmentEditor, etc.).

### localStorage Persistence (in useConfigStore)

Task-022 **amends** the config store created in task-009 by adding localStorage-backed persistence. Task-009 creates the store with plain refs; this task replaces the backing ref with `useStorage`.

```ts
// Deep merge function (reuse pattern from claude-powerline/src/config/loader.ts)
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T { ... }

const storedConfig = useStorage<PowerlineConfig>(
  'powerline-studio-config',
  structuredClone(DEFAULT_CONFIG),
  undefined,  // omit storage arg — defaults to localStorage at runtime, avoids SSG crash
  {
    mergeDefaults: (stored, defaults) => deepMerge(defaults, stored),
    initOnMounted: true,  // SSG-safe: defer localStorage read until mounted
  }
)
```

- `storedConfig` is the single source of truth — all mutations go through it
- Storage arg omitted (not `localStorage` literal) to avoid referencing browser globals during SSG
- Custom deep merge function (not shallow `mergeDefaults: true`) handles nested objects like `display.lines`, `budget`
- `structuredClone(DEFAULT_CONFIG)` prevents mutating the imported constant
- `initOnMounted: true` ensures SSG/hydration safety — localStorage is only read after mount
- `resetToDefaults()` writes defaults back to storage: `storedConfig.value = structuredClone(DEFAULT_CONFIG)`
- `loadConfig(parsed)` accepts `Partial<PowerlineConfig>`, deep-merges with defaults, and assigns to `storedConfig.value`

### shadcn-vue Components Needed

**Already installed:** Button, Card, Tabs, TabsList, TabsTrigger, TabsContent, Textarea, Sonner
**Needs installation:** Collapsible (via `vp dlx shadcn-vue@latest add collapsible`)

### Patterns to Follow

- `<script setup lang="ts">` exclusively
- `useClipboard({ legacy: true })` for clipboard with browser fallback
- `toast.success()` from vue-sonner for feedback
- `shallowRef` for the Shiki highlighter instance (no deep reactivity needed)
- `computed` for derived JSON string
- `cn()` for conditional class merging
- Tailwind CSS 4 for all styling — no inline styles

### Dependencies

**Tasks:** task-009 (Pinia stores — `useConfigStore` must exist with config state, `resetToDefaults()`, and `loadConfig()` actions)
**Packages:** `shiki` (already in devDependencies), `vue-sonner` (already installed), `@vueuse/core` (already installed, auto-imported)
**Skills:** shadcn-vue, vueuse-functions, vue-best-practices

### Context Manifest

| Source                                    | Key info extracted                                                                                                                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `claude-powerline/src/config/loader.ts`   | `PowerlineConfig` interface: `{ theme, display, colors?, budget?, modelContextLimits? }`. `DisplayConfig` has `lines`, `style`, `charset`, `colorCompatibility`, `autoWrap`, `padding`, `tui?` |
| `claude-powerline/src/config/defaults.ts` | `DEFAULT_CONFIG` — full default PowerlineConfig with theme `"dark"`, style `"minimal"`, 13 segments in one line                                                                                |
| `vite.config.ts`                          | Shiki configured via `@shikijs/markdown-it` with `vitesse-light`/`vitesse-dark` themes. `shiki` package at `^4.0.2` in devDependencies                                                         |
| `src/components/ui/sonner/Sonner.vue`     | vue-sonner already set up as shadcn-vue component                                                                                                                                              |
| `src/components/ui/tabs/`                 | Tabs, TabsList, TabsTrigger, TabsContent already installed                                                                                                                                     |
| `src/components/ui/textarea/Textarea.vue` | Textarea component already installed                                                                                                                                                           |
| `src/components/ui/button/Button.vue`     | Button component already installed                                                                                                                                                             |
| `src/components/ui/collapsible/`          | **NOT installed** — needs `vp dlx shadcn-vue@latest add collapsible`                                                                                                                           |

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Install shadcn-vue Collapsible component: `vp dlx shadcn-vue@latest add collapsible`
- [ ] Create `src/composables/useShikiHighlighter.ts` — lazy-load Shiki, cache highlighter in module-level `shallowRef`, expose `highlight(code, lang)` returning `{ html, isLoading }`; use `vitesse-dark`/`vitesse-light` dual themes
- [ ] Add localStorage persistence to `useConfigStore` (amends task-009): replace raw `ref` with `useStorage('powerline-studio-config', structuredClone(DEFAULT_CONFIG), undefined, { mergeDefaults: deepMerge, initOnMounted: true })`. Add `deepMerge` utility, `resetToDefaults()`, and `loadConfig(partial: Partial<PowerlineConfig>)` actions.
- [ ] Create `src/components/studio/panels/ExportTab.vue` — computed JSON from config store, Shiki-highlighted `<pre>` with raw fallback while loading, "Copy JSON" button with `useClipboard({ legacy: true })` + toast
- [ ] Add collapsible installation instructions to ExportTab — three code blocks (install command, config path, settings.json snippet) each with individual copy buttons
- [ ] Create `src/components/studio/panels/ImportTab.vue` — Textarea for pasting JSON, "Load Config" button (disabled when empty/whitespace), JSON.parse + top-level structural validation, error display below textarea (cleared on input), success toast + clear
- [ ] Create `src/components/studio/panels/ExportPanel.vue` — Tabs wrapper with Export/Import tabs, "Reset to Defaults" destructive button in footer
- [ ] Verify end-to-end: change config in another panel, confirm JSON updates in export tab; paste JSON in import, confirm config loads; refresh page, confirm localStorage restores; reset to defaults, confirm clean state

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Implementation Notes:**

- Shiki `codeToHtml` with dual themes generates HTML with `style="--shiki-light:...; --shiki-dark:..."` CSS variables. The app already has dual-theme Shiki CSS in `src/assets/main.css` — reuse that, do not add duplicate theme CSS.
- The lazy Shiki highlighter composable should cache both the highlighter instance AND the in-flight promise to prevent race conditions when multiple consumers call it simultaneously.
- Import accepts `Partial<PowerlineConfig>` matching upstream behavior — the real claude-powerline CLI accepts partials and deep-merges with defaults. Full Zod schema validation is out of scope.
- `useStorage` requires a custom deep merge function (not `mergeDefaults: true` which is shallow). Reuse the `deepMerge` pattern from `claude-powerline/src/config/loader.ts`.
- Always `structuredClone(DEFAULT_CONFIG)` before use as defaults to avoid mutating the imported constant.
- Use `initOnMounted: true` on `useStorage` for SSG/hydration safety — the app uses `vite-ssg` and localStorage must not be accessed during SSR. Also omit the storage arg (pass `undefined`) instead of passing `localStorage` directly, to avoid referencing the browser global during SSG build.
- Reset writes defaults back to storage (`storedConfig.value = structuredClone(DEFAULT_CONFIG)`) rather than nullifying the key. This keeps the store and localStorage consistent without needing a separate in-memory ref.

**Relevant Documentation:**

- backlog/designs/dsgn-001-powerline-studio.md — Section 7 (Export) defines the full feature scope

**Related Tasks:**

- task-009-pinia-stores — Provides `useConfigStore` which this task extends with localStorage persistence
- task-008-page-layout — Provides the sidebar/panel layout structure where ExportPanel is mounted

<!-- NOTES:END -->
