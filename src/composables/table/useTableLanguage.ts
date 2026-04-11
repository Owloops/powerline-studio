import { computed, ref, type Ref } from 'vue'
import type { TableLanguage } from '@/components/Table/types'
import { mergeLanguage, formatLanguageString } from '@/components/Table/defaults'

export interface UseTableLanguageOptions {
	/**
	 * Custom language strings
	 */
	language?: TableLanguage

	/**
	 * Locale for date/number formatting
	 */
	locale?: string
}

export interface UseTableLanguageReturn {
	/**
	 * Merged language strings
	 */
	language: Ref<TableLanguage>

	/**
	 * Format a language string with variables
	 */
	formatLang: (key: string, variables?: Record<string, any>) => string

	/**
	 * Current locale for formatters
	 */
	locale: Ref<string>
}

/**
 * Composable for handling table language strings
 */
export function useTableLanguage(options: UseTableLanguageOptions = {}): UseTableLanguageReturn {
	// Merge language with defaults
	const language = computed(() => mergeLanguage(options.language))

	// Set the locale, default to browser locale or 'en-US'
	const locale = ref(options.locale || navigator.language || 'en-US')

	/**
	 * Format a language string with variables
	 */
	const formatLang = (key: string, variables: Record<string, any> = {}): string => {
		// Split the key by dots to access nested properties
		const parts = key.split('.')
		let value: any = language.value

		// Navigate through the nested properties
		for (const part of parts) {
			if (!value || typeof value !== 'object') return key
			value = value[part]
		}

		if (typeof value !== 'string') return key
		return formatLanguageString(value, variables)
	}

	return {
		language,
		formatLang,
		locale,
	}
}
