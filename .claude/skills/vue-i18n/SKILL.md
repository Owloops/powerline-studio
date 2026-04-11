---
name: vue-i18n
description: Vue I18n internationalization — createI18n, useI18n, $t, locale files, pluralization, datetime/number formatting, lazy loading, Composition API
---

# Vue I18n

Internationalization plugin for Vue 3. Provides translation, pluralization, datetime/number formatting with Composition API support.

## Installation

```bash
pnpm add vue-i18n
```

## Setup with createI18n

```ts
// src/i18n/index.ts
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ja from './locales/ja.json'

const i18n = createI18n({
	locale: 'en',
	fallbackLocale: 'en',
	messages: { en, ja },
	// Composition API mode (legacy: false is default in v10+)
	legacy: false,
})

export default i18n
```

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'

const app = createApp(App)
app.use(i18n)
app.mount('#app')
```

## useI18n() — Composition API

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// Global scope (default — accesses messages from createI18n)
const { t, locale } = useI18n()

// Local scope (component-specific messages)
const { t } = useI18n({
	messages: {
		en: { greeting: 'Hello {name}!' },
		ja: { greeting: 'こんにちは {name}!' },
	},
})
</script>

<template>
	<h1>{{ t('greeting', { name: 'World' }) }}</h1>
</template>
```

**Must call `useI18n()` at the top of `<script setup>`.**

### Scope Options

```ts
// Global scope (uses messages from createI18n)
const { t } = useI18n({ useScope: 'global' })

// Local scope (component-specific, inherits global locale)
const { t } = useI18n({ useScope: 'local', messages: { ... } })

// Isolated scope (for composables — no conflict with component scope)
const { t } = useI18n({ useScope: 'isolated', messages: { ... } })
```

## Translation Functions

### Basic Translation — t()

```vue
<template>
	<!-- Named parameters -->
	<p>{{ t('welcome', { name: 'Alice' }) }}</p>
	<!-- List parameters -->
	<p>{{ t('greeting', ['World']) }}</p>
	<!-- Linked messages -->
	<p>{{ t('fullGreeting') }}</p>
</template>
```

```json
{
	"welcome": "Welcome, {name}!",
	"greeting": "{0}, hello!",
	"theWorld": "the world",
	"fullGreeting": "@:greeting @:theWorld"
}
```

### Pluralization

Use `|` pipe to separate plural forms:

```json
{
	"car": "car | cars",
	"apple": "no apples | one apple | {count} apples",
	"banana": "no bananas | {n} banana | {n} bananas"
}
```

```vue
<template>
	<p>{{ t('car', 1) }}</p>
	<!-- "car" -->
	<p>{{ t('car', 2) }}</p>
	<!-- "cars" -->
	<p>{{ t('apple', 0) }}</p>
	<!-- "no apples" -->
	<p>{{ t('apple', 1) }}</p>
	<!-- "one apple" -->
	<p>{{ t('apple', 10) }}</p>
	<!-- "10 apples" -->
</template>
```

### Datetime Formatting — d()

```ts
const i18n = createI18n({
	locale: 'en-US',
	datetimeFormats: {
		'en-US': {
			short: { year: 'numeric', month: 'short', day: 'numeric' },
			long: {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			},
		},
		'ja-JP': {
			short: { year: 'numeric', month: 'short', day: 'numeric' },
		},
	},
	messages: { 'en-US': {}, 'ja-JP': {} },
})
```

```vue
<script setup>
const { d } = useI18n()
const now = new Date()
</script>

<template>
	<p>{{ d(now, 'short') }}</p>
	<!-- "Jan 1, 2025" -->
	<p>{{ d(now, 'long') }}</p>
	<!-- "01/01/2025, 12:00:00 AM" -->
</template>
```

### Number Formatting — n()

```ts
const i18n = createI18n({
	locale: 'en-US',
	numberFormats: {
		'en-US': {
			currency: { style: 'currency', currency: 'USD' },
			percent: { style: 'percent', minimumFractionDigits: 1 },
		},
		'ja-JP': {
			currency: { style: 'currency', currency: 'JPY', currencyDisplay: 'symbol' },
		},
	},
	messages: { 'en-US': {}, 'ja-JP': {} },
})
```

```vue
<script setup>
const { n } = useI18n()
</script>

<template>
	<p>{{ n(1000, 'currency') }}</p>
	<!-- "$1,000.00" -->
	<p>{{ n(0.95, 'percent') }}</p>
	<!-- "95.0%" -->
</template>
```

## Locale Switching

```vue
<script setup>
const { locale, availableLocales } = useI18n({ useScope: 'global' })
</script>

<template>
	<select v-model="locale">
		<option v-for="loc in availableLocales" :key="loc" :value="loc">
			{{ loc }}
		</option>
	</select>
</template>
```

## Locale File Structure

```
src/
  i18n/
    index.ts          # createI18n setup
    locales/
      en.json         # { "nav": { "home": "Home" }, "auth": { "login": "Log in" } }
      ja.json
      fr.json
```

## Lazy Loading Locales

Load translations on demand to reduce initial bundle:

```ts
// i18n/index.ts
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
	locale: 'en',
	fallbackLocale: 'en',
	messages: {}, // start empty
	legacy: false,
})

export async function loadLocale(locale: string) {
	if (i18n.global.availableLocales.includes(locale)) {
		i18n.global.locale.value = locale
		return
	}
	const messages = await import(`./locales/${locale}.json`)
	i18n.global.setLocaleMessage(locale, messages.default)
	i18n.global.locale.value = locale
}

export default i18n
```

## Vite Plugin (@intlify/unplugin-vue-i18n)

Optimizes bundle size and enables SFC `<i18n>` custom blocks:

```bash
pnpm add -D @intlify/unplugin-vue-i18n
```

```ts
// vite.config.ts
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default defineConfig({
	plugins: [
		VueI18nPlugin({
			include: resolve(dirname(fileURLToPath(import.meta.url)), './src/i18n/locales/**'),
		}),
	],
})
```

### SFC i18n Custom Blocks

```vue
<script setup>
const { t } = useI18n()
</script>

<template>
	<p>{{ t('hello') }}</p>
</template>

<i18n lang="json">
{
	"en": { "hello": "Hello!" },
	"ja": { "hello": "こんにちは!" }
}
</i18n>
```

## Global Injections (Template Only)

When `globalInjection: true` (default), these are available in templates without `useI18n`:

- `$t()` — translate
- `$d()` — datetime format
- `$n()` — number format
- `$i18n.locale` — current locale (settable)

```vue
<template>
	<!-- Works without useI18n in setup -->
	<p>{{ $t('hello') }}</p>
	<select v-model="$i18n.locale">
		<option value="en">English</option>
		<option value="ja">Japanese</option>
	</select>
</template>
```

**Note:** These are NOT available in `<script setup>` — use `useI18n()` there.

## Gotchas

- `legacy: false` is required for Composition API mode (default in v10+)
- `useI18n()` must be called at the top of `<script setup>` (Vue inject rules)
- Local scope messages are separate from global — if you want to add to global, use `useScope: 'global'` with `messages`
- Use `useScope: 'isolated'` in composables to avoid conflicts with component local scope
- Changing locale at local scope does NOT change the global locale
- Fallback warnings in console are normal — suppress with `silentFallbackWarn: true`
- For SSR, ensure locale is set from request headers/cookies before rendering
