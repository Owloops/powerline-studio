import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

import { defineConfig } from 'vite-plus'
import vue from '@vitejs/plugin-vue'
import VueMacros from 'unplugin-vue-macros/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import VueRouter from 'vue-router/vite'
import { VueRouterAutoImports } from 'vue-router/unplugin'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import MotionResolver from 'motion-v/resolver'
import Layouts from 'vite-plugin-vue-layouts-next'
import Unfonts from 'unplugin-fonts/vite'
import generateSitemap from 'vite-ssg-sitemap'

const withNitro = process.env.WITH_NITRO === 'true'

export default defineConfig({
	staged: {
		'*': 'vp check --fix',
	},
	fmt: {
		semi: false,
		singleQuote: true,
		useTabs: true,
	},
	lint: {
		plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'vue', 'vitest'],
		env: {
			browser: true,
		},
		categories: {
			correctness: 'error',
		},
		options: {
			typeAware: true,
			typeCheck: true,
		},
	},
	plugins: [
		VueRouter({
			extensions: ['.vue'],
			dts: 'src/typed-router.d.ts',
			routesFolder: 'src/pages',
		}),

		VueMacros({
			betterDefine: false,
			plugins: {
				vue: vue(),
			},
		}),

		Layouts({
			layoutsDirs: 'src/layouts',
			defaultLayout: 'default',
		}),

		AutoImport({
			imports: [
				'vue',
				'@vueuse/core',
				VueRouterAutoImports,
				{ from: '@unhead/vue', imports: ['useHead', 'useSeoMeta', 'useHeadSafe'] },
			],
			dirs: ['src/composables', 'src/stores'],
			dts: 'src/auto-imports.d.ts',
			vueTemplate: true,
		}),

		Components({
			extensions: ['vue'],
			globs: ['src/components/**/*.vue'],
			dts: 'src/components.d.ts',
			resolvers: [
				IconsResolver({
					prefix: 'Icon',
				}),
				MotionResolver(),
			],
		}),

		Icons({
			compiler: 'vue3',
			autoInstall: true,
		}),

		tailwindcss(),

		Unfonts({
			fontsource: {
				families: [
					{
						name: 'Inter Variable',
						weights: [400, 500, 600, 700],
						styles: ['normal'],
						subset: 'latin',
					},
				],
			},
		}),

		vueDevTools(),

		...(withNitro ? [(await import('nitro/vite')).nitro({ serverDir: './server' })] : []),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	// @ts-expect-error vite-ssg extends Vite config with ssgOptions
	ssgOptions: {
		script: 'async',
		formatting: 'minify',
		beastiesOptions: {
			reduceInlineStyles: false,
		},
		onFinished() {
			generateSitemap()
		},
	},
	ssr: {
		noExternal: [],
	},
})
