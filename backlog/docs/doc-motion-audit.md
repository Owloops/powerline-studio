---
name: Motion Performance Audit
description: Full project animation audit — tier classification, fixes applied, and remaining items
created_date: '2026-04-10 18:25'
updated_date: '2026-04-10 18:25'
---

# Motion Performance Audit

## Overview

Full-project scan of all animation code, classified by render-pipeline cost.

- **Files scanned:** 45
- **Animations found:** 51
- **Overall rank:** A

| Tier | Count | %   | Description                 |
| ---- | ----- | --- | --------------------------- |
| S    | 34    | 67% | Compositor — near-zero cost |
| A    | 1     | 2%  | JS-driven compositor props  |
| B    | 6     | 12% | FLIP / layoutId             |
| C    | 6     | 12% | Paint (repaint per frame)   |
| D    | 4     | 8%  | Layout recalc + paint       |
| F    | 0     | 0%  | —                           |

## S-Tier (34 animations)

No action needed. Includes:

- 13 Motion-v WAAPI animations (spring counter, stagger, hover/tap, badge shake/scale/icon/spinner/label, overlay fade, expanded card body, accordion chevron, accordion blur+opacity, button whilePress)
- 14 CSS `animate-in`/`animate-out` on shadcn-vue components (Tooltip, Sheet, Drawer, Dialog, Dropdown, Select, Combobox, Popover)
- Switch thumb `translateX`, `animate-spin` (Spinner/Sonner), `animate-pulse` (Supabase status), chart legend `transition-opacity`
- auto-animate tree (WAAPI), NumberFlow (WAAPI), TreeBranch expand icon rotation

## B-Tier (6 animations)

All use Motion-v `layoutId` (FLIP technique) — optimal for their use cases.

| Location                                | What                    |
| --------------------------------------- | ----------------------- |
| `src/layouts/default.vue:49`            | Nav active indicator    |
| `src/pages/animations.vue:415`          | Card thumbnail layoutId |
| `src/pages/animations.vue:434`          | Card image layoutId     |
| `src/pages/animations.vue:468`          | Expanded card layoutId  |
| `src/pages/animations.vue:473`          | Expanded image layoutId |
| `src/components/MotionAccordion.vue:65` | Accordion focus ring    |

No upgrade available — FLIP is the correct technique here.

## Fixes Applied

### 1. Global `prefers-reduced-motion` support

**Files changed:**

- `src/layouts/default.vue` — Wrapped layout in `<MotionConfig reducedMotion="user">`
- `src/assets/main.css` — Added `@media (prefers-reduced-motion: reduce)` rule for CSS animations/transitions

All Motion-v animations now auto-respect the OS preference. CSS `animate-in`/`animate-out`, `animate-spin`, and `animate-pulse` are covered by the media query.

### 2. TextGenerateEffect upgraded A-tier to S-tier

**File:** `src/components/ui/text-generate-effect/TextGenerateEffect.vue`

Before: `setTimeout` + `element.style.*` assignments (A-tier, main-thread JS).
After: Motion `animate()` function using WAAPI (S-tier, compositor). Added `prefers-reduced-motion` check that shows text immediately.

### 3. InteractiveGridPattern transition narrowed

**File:** `src/components/ui/interactive-grid-pattern/InteractiveGridPattern.vue`

Changed `transition-all` to `transition-[fill]` on SVG rects. Prevents accidental transitions on unrelated properties across up to 576 elements.

### 4. Button.vue cleanup

**File:** `src/components/ui/button/Button.vue`

- Removed per-component `useMediaQuery('prefers-reduced-motion')` — now handled globally by `MotionConfig`
- Removed permanent `will-change-transform` class — Motion promotes layers during animation automatically; keeping it static wastes GPU memory on pages with many buttons

## Remaining Items (no action required)

### D-Tier (4 animations) — layout required, no upgrade path

| Location                                | What                                       | Why                                        |
| --------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `src/pages/animations.vue:175`          | AnimatePresence `height: 'auto'` collapse  | Height change needed to reflow content     |
| `src/pages/animations.vue:267`          | Badge icon `width: 0 → 20px`               | Width pushes adjacent label in flex layout |
| `src/pages/animations.vue:363`          | Badge label width to measured text size    | Container resizes to fit label             |
| `src/components/MotionAccordion.vue:73` | Accordion `height: 'auto'` expand/collapse | Height change pushes sibling sections      |

All are intentional, low-impact (single elements, short durations, infrequent triggers), and have no practical upgrade — `scaleX`/`clip-path` alternatives would not affect layout flow.

### C-Tier (6 animations) — paint cost, acceptable

| Location                                                                | What                                                                            | Impact                                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `src/pages/animations.vue:295-349`                                      | SVG `pathLength` on badge icons (x4)                                            | Negligible — 20x20px icons, spring duration               |
| `src/components/ui/interactive-grid-pattern/InteractiveGridPattern.vue` | SVG `fill` transition                                                           | Low — 1 rect at a time, `transition-[fill]` now narrowed  |
| ~25 UI components                                                       | `transition-colors` / `transition-[color,box-shadow]` on buttons, inputs, links | Standard hover/focus micro-interactions on small elements |

## References

- Motion-v uses WAAPI for compositor properties (`transform`, `opacity`, `filter`, `clip-path`) — genuine S-tier
- `layoutId` uses FLIP: one-time layout read, then transform animation — B-tier
- SVG `pathLength` maps to `stroke-dashoffset`/`stroke-dasharray` — paint attributes, C-tier
- `height: 'auto'` requires layout recalc per frame — D-tier, no workaround for expand/collapse
