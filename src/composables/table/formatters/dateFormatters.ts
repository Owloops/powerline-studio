import { createFormatter } from './baseFormatter'
import type { DateFormatterOptions } from './types'
import type { TableColumn } from '@/components/Table/types'

/**
 * Helper function to parse a date value from different formats
 */
function parseDateValue(value: any, _options: DateFormatterOptions = {}): Date | null {
	// Return null for undefined/null
	if (value == null) {
		return null
	}

	// If it's already a Date object, use it directly
	if (value instanceof Date) {
		return value
	}

	// Handle string ISO format (e.g., "2025-03-21T12:34:56Z")
	if (typeof value === 'string') {
		try {
			const date = new Date(value)
			// Check if parsing worked correctly
			if (isNaN(date.getTime())) {
				return null
			}
			return date
		} catch (error) {
			console.error('Error parsing date string:', error)
			return null
		}
	}

	// Handle timestamp (number)
	if (typeof value === 'number') {
		try {
			return new Date(value)
		} catch (error) {
			console.error('Error parsing timestamp:', error)
			return null
		}
	}

	// Couldn't parse the date
	return null
}

/**
 * Helper function to get Intl.DateTimeFormat options from our options object
 */
function getDateFormatOptions(options: DateFormatterOptions = {}): Intl.DateTimeFormatOptions {
	const intlOptions: Intl.DateTimeFormatOptions = {}

	// Date/time styles (shorthand formats)
	if (options.dateStyle) {
		intlOptions.dateStyle = options.dateStyle
	}

	if (options.timeStyle) {
		intlOptions.timeStyle = options.timeStyle
	}

	// Individual date components
	if (options.weekday) {
		intlOptions.weekday = options.weekday
	}

	if (options.year) {
		intlOptions.year = options.year
	}

	if (options.month) {
		intlOptions.month = options.month
	}

	if (options.day) {
		intlOptions.day = options.day
	}

	// Time components
	if (options.hour) {
		intlOptions.hour = options.hour
	}

	if (options.minute) {
		intlOptions.minute = options.minute
	}

	if (options.second) {
		intlOptions.second = options.second
	}

	if (options.hour12 !== undefined) {
		intlOptions.hour12 = options.hour12
	}

	// Timezone options
	if (options.timeZone) {
		intlOptions.timeZone = options.timeZone
	}

	if (options.timeZoneName) {
		intlOptions.timeZoneName = options.timeZoneName
	}

	return intlOptions
}

/**
 * Format a date (without time)
 */
const dateFormatter = (
	value: any,
	options: DateFormatterOptions = {},
	_row?: any,
	_column?: TableColumn,
): string => {
	// Parse the date
	const date = parseDateValue(value, options)
	if (!date) {
		return options.invalidValue || ''
	}

	// Set default options for date-only formatting
	const dateOptions: DateFormatterOptions = {
		...options,
	}

	// Only set dateStyle if not using individual component options
	if (!options.day && !options.month && !options.year && !options.weekday) {
		dateOptions.dateStyle = options.dateStyle || 'medium'
	}

	// Get Intl options
	const intlOptions = getDateFormatOptions(dateOptions)

	// Format the date
	try {
		const formatter = new Intl.DateTimeFormat(options.locale, intlOptions)
		return formatter.format(date)
	} catch (error) {
		console.error('Date formatting error:', error)
		return options.invalidValue || ''
	}
}

/**
 * Format a time (without date)
 */
const timeFormatter = (
	value: any,
	options: DateFormatterOptions = {},
	_row?: any,
	_column?: TableColumn,
): string => {
	// Parse the date
	const date = parseDateValue(value, options)
	if (!date) {
		return options.invalidValue || ''
	}

	// Set default options for time-only formatting
	const timeOptions: DateFormatterOptions = {
		...options,
	}

	// Only set timeStyle if not using individual component options
	if (!options.hour && !options.minute && !options.second) {
		timeOptions.timeStyle = options.timeStyle || 'short'
	}

	// Get Intl options
	const intlOptions = getDateFormatOptions(timeOptions)

	// Format the time
	try {
		const formatter = new Intl.DateTimeFormat(options.locale, intlOptions)
		return formatter.format(date)
	} catch (error) {
		console.error('Time formatting error:', error)
		return options.invalidValue || ''
	}
}

/**
 * Format a datetime
 */
const datetimeFormatter = (
	value: any,
	options: DateFormatterOptions = {},
	_row?: any,
	_column?: TableColumn,
): string => {
	// Parse the date
	const date = parseDateValue(value, options)
	if (!date) {
		return options.invalidValue || ''
	}

	// Set default options for datetime formatting
	const datetimeOptions: DateFormatterOptions = {
		...options,
	}

	// Only set dateStyle/timeStyle if not using individual component options
	if (!options.day && !options.month && !options.year && !options.weekday) {
		datetimeOptions.dateStyle = options.dateStyle || 'medium'
	}
	if (!options.hour && !options.minute && !options.second) {
		datetimeOptions.timeStyle = options.timeStyle || 'short'
	}

	// Special handling for Finnish locale to avoid "klo" between date and time
	if (options.locale === 'fi-FI') {
		try {
			// Build date format options
			const dateIntlOptions: Intl.DateTimeFormatOptions = {}
			if (
				datetimeOptions.dateStyle &&
				!options.day &&
				!options.month &&
				!options.year &&
				!options.weekday
			) {
				dateIntlOptions.dateStyle = datetimeOptions.dateStyle
			} else {
				// Use individual date components if specified
				if (options.weekday) dateIntlOptions.weekday = options.weekday
				if (options.year) dateIntlOptions.year = options.year
				if (options.month) dateIntlOptions.month = options.month
				if (options.day) dateIntlOptions.day = options.day
			}

			// Build time format options
			const timeIntlOptions: Intl.DateTimeFormatOptions = {}
			if (datetimeOptions.timeStyle && !options.hour && !options.minute && !options.second) {
				timeIntlOptions.timeStyle = datetimeOptions.timeStyle
			} else {
				// Use individual time components if specified
				if (options.hour) timeIntlOptions.hour = options.hour
				if (options.minute) timeIntlOptions.minute = options.minute
				if (options.second) timeIntlOptions.second = options.second
				if (options.hour12 !== undefined) timeIntlOptions.hour12 = options.hour12
			}

			// Add timezone options to time formatter
			if (options.timeZone) timeIntlOptions.timeZone = options.timeZone
			if (options.timeZoneName) timeIntlOptions.timeZoneName = options.timeZoneName

			// Format date part
			const dateFormatter = new Intl.DateTimeFormat(options.locale, dateIntlOptions)

			// Format time part
			const timeFormatter = new Intl.DateTimeFormat(options.locale, timeIntlOptions)

			// Join with space instead of "klo"
			return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`
		} catch (error) {
			console.error('Finnish datetime formatting error:', error)
			return options.invalidValue || ''
		}
	}

	// Default handling for other locales
	// Get Intl options
	const intlOptions = getDateFormatOptions(datetimeOptions)

	// Format the datetime
	try {
		const formatter = new Intl.DateTimeFormat(options.locale, intlOptions)
		return formatter.format(date)
	} catch (error) {
		console.error('Datetime formatting error:', error)
		return options.invalidValue || ''
	}
}

// Export formatters
export const date = createFormatter(dateFormatter)
export const time = createFormatter(timeFormatter)
export const datetime = createFormatter(datetimeFormatter)
