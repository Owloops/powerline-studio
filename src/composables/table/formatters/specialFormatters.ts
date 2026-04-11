import { createFormatter } from './baseFormatter'
import type { UrlFormatterOptions, EmailFormatterOptions, BooleanFormatterOptions } from './types'
import type { TableColumn } from '@/components/Table/types'

/**
 * Format a value as a URL link
 * This returns HTML, which will need to be rendered with v-html in the component
 */
const urlFormatter = (
	value: any,
	options: UrlFormatterOptions = {},
	row?: any,
	_column?: TableColumn,
): string => {
	// Use selector functions if provided and row data is available
	let url = ''
	let text = ''

	if (row && options.urlSelector) {
		url = options.urlSelector(row) || ''
	} else {
		url = options.url || String(value || '')
	}

	if (row && options.textSelector) {
		text = options.textSelector(row) || ''
	} else {
		text = options.text || String(value || '')
	}

	// If no URL after all attempts, just return the text
	if (!url) {
		return text
	}

	// Build additional attributes
	const target = options.openInNewTab ? '_blank' : ''
	const rel = options.openInNewTab ? 'noopener noreferrer' : ''

	// Handle download attribute with optional filename
	let downloadAttr = ''
	if (options.download) {
		if (typeof options.download === 'string') {
			// If a string is provided, use it as the filename
			downloadAttr = ` download="${options.download}"`
		} else {
			// If true, just add the download attribute without a value
			downloadAttr = ' download'
		}
	}

	// Add custom attributes
	let customAttrs = ''
	if (options.attributes) {
		for (const [key, value] of Object.entries(options.attributes)) {
			customAttrs += ` ${key}="${value}"`
		}
	}

	// Build the complete HTML link
	return `<a href="${url}"${target ? ` target="${target}"` : ''}${
		rel ? ` rel="${rel}"` : ''
	}${downloadAttr}${customAttrs}>${text}</a>`
}

/**
 * Format a value as an email
 * Optionally renders as a mailto: link
 */
const emailFormatter = (
	value: any,
	options: EmailFormatterOptions = {},
	row?: any,
	_column?: TableColumn,
): string => {
	// Use selector function if provided and row data is available
	let email = String(value || '')
	let displayText = ''

	if (row && options.textSelector) {
		displayText = options.textSelector(row) || ''
	}

	// If no email, return empty string
	if (!email) {
		return ''
	}

	// Set up display text if not explicitly provided
	if (!displayText) {
		if (options.maskDomain) {
			// Mask the domain part of the email
			const parts = email.split('@')
			if (parts.length === 2) {
				displayText = `${parts[0]}@...`
			} else {
				displayText = email
			}
		} else {
			displayText = email
		}
	}

	// Return as mailto link if requested
	if (options.asLink) {
		return `<a href="mailto:${email}">${displayText}</a>`
	}

	// Otherwise just return the display text
	return displayText
}

// Import the default language settings
import { defaultLanguage } from '@/components/Table/defaults'

/**
 * Format a boolean value
 */
const booleanFormatter = (
	value: any,
	options: BooleanFormatterOptions = {},
	_row?: any,
	_column?: TableColumn,
): string => {
	if (value === null || value === undefined) {
		return options.nullValue || ''
	}

	// Convert to boolean
	const boolValue = Boolean(value)

	// Get the true/false text from language settings
	// First from column options, then from default language settings
	const trueValue = options.trueValue || defaultLanguage.formatters?.boolean?.true || 'Yes'

	const falseValue = options.falseValue || defaultLanguage.formatters?.boolean?.false || 'No'

	// Return formatted value
	return boolValue ? trueValue : falseValue
}

/**
 * Format truncated text
 */
const truncateFormatter = (
	value: any,
	options: any = {},
	_row?: any,
	_column?: TableColumn,
): string => {
	const text = String(value || '')

	// No truncation needed if text is short enough
	if (!options.truncate || text.length <= options.truncate) {
		return text
	}

	// Truncate and add suffix
	const suffix = options.truncateSuffix || '...'
	return text.substring(0, options.truncate) + suffix
}

// Export formatters
export const url = createFormatter(urlFormatter)
export const email = createFormatter(emailFormatter)
export const boolean = createFormatter(booleanFormatter)
export const truncate = createFormatter(truncateFormatter)
