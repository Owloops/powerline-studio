import type { MaybeRefOrGetter } from 'vue'
import type { HighlighterCore } from 'shiki'

// Module-level cache — shared across all consumers
const highlighter = shallowRef<HighlighterCore | null>(null)
let loadPromise: Promise<HighlighterCore> | null = null

function ensureHighlighter(): Promise<HighlighterCore> {
	if (highlighter.value) return Promise.resolve(highlighter.value)
	if (loadPromise) return loadPromise

	loadPromise = import('shiki')
		.then((mod) =>
			mod.createHighlighter({
				themes: ['light-plus', 'dark-plus'],
				langs: ['json'],
			}),
		)
		.then((h) => {
			highlighter.value = h
			return h
		})
		.catch((err) => {
			loadPromise = null
			throw err
		})

	return loadPromise
}

export function useShikiHighlighter(
	code: MaybeRefOrGetter<string>,
	lang: MaybeRefOrGetter<string> = 'json',
) {
	const html = ref('')
	const isLoading = ref(true)

	// Kick off loading immediately
	void ensureHighlighter()

	// watchEffect tracks highlighter.value, code, and lang
	// Once highlighter loads, it becomes non-null and this re-runs
	watchEffect(() => {
		const h = highlighter.value
		const codeValue = toValue(code)
		const langValue = toValue(lang)

		if (!h) return

		html.value = h.codeToHtml(codeValue, {
			lang: langValue,
			themes: { light: 'light-plus', dark: 'dark-plus' },
			defaultColor: false,
		})
		isLoading.value = false
	})

	return { html, isLoading }
}
