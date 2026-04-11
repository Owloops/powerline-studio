import { createFormatter } from './baseFormatter'
import type { RelativeTimeFormatterOptions } from './types'
import type { TableColumn } from '@/components/Table/types'

/**
 * Calculate the difference between a date and now in the specified unit
 */
function getTimeDifference(date: Date, unit: string): number {
	const now = new Date()
	const millisecondsDiff = date.getTime() - now.getTime()

	// Convert milliseconds to the appropriate unit
	switch (unit) {
		case 'year':
			return Math.round(millisecondsDiff / (1000 * 60 * 60 * 24 * 365))
		case 'quarter':
			return Math.round(millisecondsDiff / (1000 * 60 * 60 * 24 * 91.25))
		case 'month':
			return Math.round(millisecondsDiff / (1000 * 60 * 60 * 24 * 30.4375))
		case 'week':
			return Math.round(millisecondsDiff / (1000 * 60 * 60 * 24 * 7))
		case 'day':
			return Math.round(millisecondsDiff / (1000 * 60 * 60 * 24))
		case 'hour':
			return Math.round(millisecondsDiff / (1000 * 60 * 60))
		case 'minute':
			return Math.round(millisecondsDiff / (1000 * 60))
		case 'second':
			return Math.round(millisecondsDiff / 1000)
		default:
			return Math.round(millisecondsDiff / (1000 * 60 * 60 * 24)) // Default to days
	}
}

/**
 * Format a value as a relative time using Intl.RelativeTimeFormat
 */
const relativeTimeFormatter = (
	value: any,
	options: RelativeTimeFormatterOptions = {},
	_row?: any,
	_column?: TableColumn,
): string => {
	// Handle null or undefined
	if (value === null || value === undefined) {
		return options.nullValue || ''
	}

	// Get locale from options or use browser default
	const locale = options.locale || navigator.language

	// Initialize the formatter
	const formatter = new Intl.RelativeTimeFormat(locale, {
		localeMatcher: options.localeMatcher || 'best fit',
		numeric: options.numeric || 'always',
		style: options.style || 'long',
	})

	// Default unit is 'day'
	const unit = options.unit || 'day'

	let diffValue: number

	// Calculate the time difference if needed
	if (options.calculateDifference !== false) {
		// If value is a Date object
		if (value instanceof Date) {
			diffValue = getTimeDifference(value, unit)
		}
		// If value is a timestamp (number)
		else if (typeof value === 'number' && !isNaN(value) && value > 1000000000000) {
			const date = new Date(value)
			diffValue = getTimeDifference(date, unit)
		}
		// If value is an ISO date string
		else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
			const date = new Date(value)
			diffValue = getTimeDifference(date, unit)
		}
		// Otherwise, use the raw value
		else {
			diffValue = Number(value)
		}
	} else {
		// Use the raw value directly
		diffValue = Number(value)
	}

	// Format the relative time
	let result = formatter.format(diffValue, unit as Intl.RelativeTimeFormatUnit)

	// Capitalize the first letter if the option is set
	if (options.capitalize) {
		result = result.charAt(0).toUpperCase() + result.slice(1)
	}

	return result
}

// Export the formatter
export const relativeTime = createFormatter(relativeTimeFormatter)
