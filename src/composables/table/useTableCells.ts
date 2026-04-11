import type { TableColumn } from '@/components/Table/types'
import { formatters, getFormatter as getFormatterFn } from './formatters'
import type { FormatterOptions, FormattingOptions } from './formatters'

export interface UseTableCellsOptions {
	/**
	 * Custom formatters for specific column types
	 */
	customFormatters?: Record<
		string,
		(value: any, options: any, row: any, column?: TableColumn) => any
	>

	/**
	 * Global formatting options
	 */
	formatting?: FormattingOptions
}

export interface UseTableCellsReturn<T = any> {
	/**
	 * Get cell value based on column definition
	 */
	getCellValue: (row: T, column: TableColumn<T>) => any

	/**
	 * Format cell value based on column definition
	 */
	formatCellValue: (value: any, row: T, column: TableColumn<T>) => any

	/**
	 * Access to all formatters
	 */
	formatters: typeof formatters

	/**
	 * Get formatter function by format type
	 */
	getFormatter: typeof getFormatterFn
}

/**
 * Composable for handling table cell values and formatting
 */
export function useTableCells<T = any>(options: UseTableCellsOptions = {}): UseTableCellsReturn<T> {
	// Merge in custom formatters if provided
	const allFormatters = { ...formatters }
	if (options.customFormatters) {
		Object.entries(options.customFormatters).forEach(([key, formatter]) => {
			allFormatters[key] = formatter
		})
	}

	/**
	 * Get cell value based on column definition
	 */
	const getCellValue = (row: T, column: TableColumn<T>): any => {
		// Skip if this is a group column without a key
		if (!column.key) {
			return ''
		}

		// If key is a function, call it with the row
		if (typeof column.key === 'function') {
			return column.key(row)
		}

		// Otherwise, access the property directly
		return row[column.key as keyof T]
	}

	/**
	 * Format cell value based on column definition
	 */
	const formatCellValue = (value: any, row: T, column: TableColumn<T>): any => {
		// If column has a custom format function, use it directly
		if (column.format) {
			return column.format(value, row)
		}

		// If column has a format type, use the corresponding formatter
		if (column.formatType) {
			const formatter = getFormatterFn(column.formatType)

			// Build options object by merging defaults with column-specific options
			const formatterOptions: FormatterOptions = {
				// Add global common defaults
				nullValue: options.formatting?.nullValue,
				undefinedValue: options.formatting?.undefinedValue,
				emptyValue: options.formatting?.emptyValue,
				invalidValue: options.formatting?.invalidValue,
				locale: options.formatting?.locale,
			}

			// Add type-specific defaults if available and column.formatType is a string
			if (column.formatType && options.formatting?.defaults) {
				// Using type assertion to tell TypeScript this is a valid key
				const formatTypeDefaults =
					options.formatting.defaults[column.formatType as keyof typeof options.formatting.defaults]
				if (formatTypeDefaults) {
					Object.assign(formatterOptions, formatTypeDefaults)
				}
			}

			// Add column-specific options (highest priority)
			if (column.formatOptions) {
				Object.assign(formatterOptions, column.formatOptions)
			}

			return formatter(value, formatterOptions, row, column)
		}

		// Otherwise, return the raw value
		return value
	}

	return {
		getCellValue,
		formatCellValue,
		formatters: allFormatters,
		getFormatter: getFormatterFn,
	}
}
