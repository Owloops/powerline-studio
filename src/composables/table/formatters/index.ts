import * as numberFormatters from './numberFormatters'
import * as dateFormatters from './dateFormatters'
import * as specialFormatters from './specialFormatters'
import * as relativeTimeFormatters from './relativeTimeFormatters'
import type { FormatterOptions, FormatterFunction, Formatters } from './types'

// Export all formatter types
export * from './types'

// Combine all formatters into a single object
export const formatters: Formatters = {
	// Number formatters
	integer: numberFormatters.integer,
	decimal: numberFormatters.decimal,
	currency: numberFormatters.currency,
	percentage: numberFormatters.percentage,

	// Date formatters
	date: dateFormatters.date,
	time: dateFormatters.time,
	datetime: dateFormatters.datetime,

	// Special formatters
	url: specialFormatters.url,
	email: specialFormatters.email,
	boolean: specialFormatters.boolean,
	truncate: specialFormatters.truncate,

	// Relative time formatter
	relativeTime: relativeTimeFormatters.relativeTime,

	// Simple text formatter (passthrough with common options)
	text: (value: any, options: FormatterOptions): string => {
		if (value === null && options.nullValue !== undefined) {
			return options.nullValue
		}
		if (value === undefined && options.undefinedValue !== undefined) {
			return options.undefinedValue
		}
		if (value === '' && options.emptyValue !== undefined) {
			return options.emptyValue
		}

		const stringValue = value !== null && value !== undefined ? String(value) : ''
		return `${options.prefix || ''}${stringValue}${options.suffix || ''}`
	},
}

// Create a helper function to get a formatter by name
export function getFormatter(type: string): FormatterFunction {
	return (formatters[type] ?? formatters.text)!
}

// Export the formatter utility functions
export { createFormatter } from './baseFormatter'
