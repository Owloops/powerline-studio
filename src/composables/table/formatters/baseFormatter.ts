import type { CommonFormatterOptions, FormatterFunction } from './types'
import type { TableColumn } from '@/components/Table/types'

/**
 * Base formatter wrapper that handles null/undefined/empty values
 * @param value The value to format
 * @param options Common formatting options
 * @param formatter The specific formatter function to apply if value is valid
 * @param row Optional row data
 * @param column Optional column definition
 * @returns Formatted string or empty string for null values
 */
export function baseFormat(
	value: any,
	options: CommonFormatterOptions,
	formatter: (val: any, opts: CommonFormatterOptions, row?: any, column?: TableColumn) => string,
	row?: any,
	column?: TableColumn,
): string {
	// Handle null/undefined
	if (value === null) {
		return options.nullValue ?? ''
	}

	if (value === undefined) {
		return options.undefinedValue ?? ''
	}

	if (value === '') {
		return options.emptyValue ?? ''
	}

	// Apply actual formatter
	try {
		const formattedValue = formatter(value, options, row, column)

		// Apply prefix/suffix to the formatted value
		return `${options.prefix || ''}${formattedValue}${options.suffix || ''}`
	} catch (error) {
		console.error('Formatter error:', error)
		return options.invalidValue ?? ''
	}
}

/**
 * Creates a formatter function with common value handling
 * @param formatter The core formatting logic
 * @returns A formatter function with null handling
 */
export function createFormatter(
	formatter: (
		value: any,
		options: CommonFormatterOptions,
		row?: any,
		column?: TableColumn,
	) => string,
): FormatterFunction {
	return (value: any, options: CommonFormatterOptions, row?: any, column?: TableColumn): string => {
		return baseFormat(value, options, formatter, row, column)
	}
}
