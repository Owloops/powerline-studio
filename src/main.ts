import { vaporInteropPlugin } from 'vue'
import { ViteSSG } from 'vite-ssg'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { createPinia } from 'pinia'

import App from './App.vue'

import 'unfonts.css'
import './assets/main.css'

if (import.meta.env.DEV) {
	void import('cssstudio').then(({ startStudio }) => startStudio())
}

export const createApp = ViteSSG(
	App,
	{
		routes: setupLayouts(routes),
		base: import.meta.env.BASE_URL,
	},
	(ctx) => {
		const { app } = ctx

		const pinia = createPinia()

		app.use(pinia)
		app.use(vaporInteropPlugin)
	},
)
