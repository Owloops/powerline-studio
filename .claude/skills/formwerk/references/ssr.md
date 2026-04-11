# Server Side Rendering

Formwerk is designed to work with server-side rendering. It does not rely on any client-side-only APIs and works in any environment that supports Vue.js SSR, including Nuxt and Astro.

## Label and Input ID Generation

Formwerk uses Vue.js's `useId` function (available in v3.5.0+) to generate unique IDs for labels and inputs. This means **Vue.js v3.5.0 is the minimum required version** for Formwerk.

## Nuxt Compatibility

Works seamlessly with Nuxt without additional configuration. Import and use Formwerk composables directly in Nuxt pages or components.

## SSR Considerations

- **Locale auto-detection** from `<html lang="...">` is **not available** in SSR. Set locale manually via `configure()` in a plugin (see [i18n docs](./i18n.md)).
- All composables are SSR-safe out of the box.
