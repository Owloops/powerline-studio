import { vaporInteropPlugin } from 'vue'
import { ViteSSG } from 'vite-ssg'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'

import App from './App.vue'
import en from './locales/en.json'
import no from './locales/no.json'
import de from './locales/de.json'
import fr from './locales/fr.json'
import ja from './locales/ja.json'

import 'unfonts.css'
import './assets/main.css'

if (import.meta.env.DEV) {
	import('cssstudio').then(({ startStudio }) => startStudio())
}

// ViteSSG creates and installs an @unhead/vue head instance automatically
// (server variant during SSG builds, client variant in the browser).
// Do NOT create a second head instance here — it would shadow vite-ssg's
// and prevent useHead/useSeoMeta from rendering into the static HTML.
export const createApp = ViteSSG(
	App,
	{
		routes: setupLayouts(routes),
		base: import.meta.env.BASE_URL,
	},
	(ctx) => {
		const { app } = ctx

		const pinia = createPinia()

		const i18n = createI18n({
			locale: 'en',
			fallbackLocale: 'en',
			messages: { en, no, de, fr, ja },
		})

		app.use(pinia)
		app.use(i18n)
		app.use(vaporInteropPlugin)
	},
)
