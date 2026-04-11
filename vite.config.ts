import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from 'node:path'
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
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import Unfonts from 'unplugin-fonts/vite'
import generateSitemap from 'vite-ssg-sitemap'
import Markdown from 'unplugin-vue-markdown/vite'
import Shiki from '@shikijs/markdown-it'
// @ts-expect-error no type declarations available
import LinkAttributes from 'markdown-it-link-attributes'
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
			extensions: ['.vue', '.md'],
			dts: 'src/typed-router.d.ts',
			routesFolder: 'src/pages',
		}),

		VueMacros({
			betterDefine: false,
			plugins: {
				vue: vue({
					include: [/\.vue$/, /\.md$/],
				}),
			},
		}),

		Layouts({
			layoutsDirs: 'src/layouts',
			defaultLayout: 'default',
		}),

		AutoImport({
			imports: [
				'vue',
				'vue-i18n',
				'@vueuse/core',
				VueRouterAutoImports,
				{ from: '@unhead/vue', imports: ['useHead', 'useSeoMeta', 'useHeadSafe'] },
			],
			dirs: ['src/composables', 'src/stores'],
			dts: 'src/auto-imports.d.ts',
			vueTemplate: true,
		}),

		Components({
			extensions: ['vue', 'md'],
			globs: [
				'src/components/**/*.{vue,md}',
				// Exclude custom DataTable internal components — they use explicit imports
				// inside DataTable.vue. This prevents them from shadowing shadcn-vue's
				// Table, TableHeader, TableBody, TableRow, etc.
				'!src/components/Table/Table{Header,Body,Row,Cell,Filter,FilterRow,Export,Pagination,ColumnFilter}.vue',
			],
			dts: 'src/components.d.ts',
			resolvers: [
				IconsResolver({
					prefix: 'Icon',
				}),
				MotionResolver(),
			],
		}),

		Markdown({
			wrapperClasses: 'prose sm:prose-lg dark:prose-invert m-auto text-left',
			headEnabled: true,
			async markdownItSetup(md) {
				md.use(
					// @ts-ignore Shiki async plugin type mismatch with markdown-it
					await Shiki({
						defaultColor: false,
						themes: {
							light: 'vitesse-light',
							dark: 'vitesse-dark',
						},
					}),
				)
				md.use(LinkAttributes, {
					matcher: (link: string) => /^https?:\/\//.test(link),
					attrs: {
						target: '_blank',
						rel: 'noopener',
					},
				})
			},
		}),

		Icons({
			compiler: 'vue3',
			autoInstall: true,
		}),

		tailwindcss(),

		VueI18n({
			runtimeOnly: true,
			compositionOnly: true,
			fullInstall: true,
			include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
		}),

		Unfonts({
			fontsource: {
				families: [
					{
						name: 'Inter Variable',
						weights: [400, 500, 600, 700],
						styles: ['normal'],
						subset: 'latin',
					},
					{
						name: 'Public Sans Variable',
						weights: [400, 500, 600, 700],
						styles: ['normal'],
						subset: 'latin',
					},
					{
						name: 'Geist Variable',
						weights: [400, 500, 600, 700],
						styles: ['normal'],
						subset: 'latin',
					},
					{
						name: 'Mona Sans Variable',
						weights: [400, 500, 600, 700],
						styles: ['normal'],
						subset: 'latin',
					},
					{
						name: 'DM Serif Display',
						weights: [400],
						styles: ['normal'],
						subset: 'latin',
					},
					{
						name: 'Playfair Display Variable',
						weights: [400, 500, 600, 700],
						styles: ['normal'],
						subset: 'latin',
					},
				],
			},
		}),

		// Critical CSS inlining is handled by vite-ssg during SSG builds (via
		// ssgOptions.beastiesOptions below). The vite-plugin-beasties plugin was
		// removed from the SPA pipeline because an SPA's initial HTML is an empty
		// <div id="app"> with nothing above the fold to inline.

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
		noExternal: ['vue-i18n'],
	},
})
