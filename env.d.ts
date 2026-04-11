/// <reference types="vite-plus/client" />
/// <reference types="unplugin-icons/types/vue" />
/// <reference types="unplugin-fonts/client" />
/// <reference types="vite-plugin-vue-layouts-next/client" />

interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL: string
	readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

declare module '*.vue' {
	import type { DefineComponent } from 'vue'

	const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
	export default component
}

declare module '*.md' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<object, object, any>
	export default component
}

declare module 'virtual:generated-layouts' {
	import type { RouteRecordRaw } from 'vue-router'
	export function setupLayouts(routes: RouteRecordRaw[]): RouteRecordRaw[]
}
