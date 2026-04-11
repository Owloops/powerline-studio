import { ref } from 'vue'
import type { TableColumn, TableOptions, TableExportOptions } from '@/components/Table/types'
import { generateCsv, download as downloadCsv, mkConfig } from 'export-to-csv'
import writeXlsxFile from 'write-excel-file/browser'
import {
	parseAbsolute,
	toTimeZone,
	getLocalTimeZone,
	fromDate,
	type ZonedDateTime,
} from '@internationalized/date'

export function useTableExport(options: TableOptions, getFormatter: any) {
	const filename = ref('export')

	// Get export options
	const getExportOptions = (): TableExportOptions => {
		return options.export || {}
	}

	// Determine which rows to export based on export options
	const getExportData = (allRows: any[], filteredRows: any[], paginatedRows: any[]): any[] => {
		const exportOptions = getExportOptions()
		const include = exportOptions.include || 'all'
		const exportChildRows = exportOptions.exportChildRows !== false // Default to true if not specified
		const childrenKey = options.expansion?.childrenKey || 'children'
		const expandedContent = options.expansion?.expandedContent || 'auto'

		// Get the base rows to export based on selected include option
		let baseRows: any[]
		switch (include) {
			case 'filtered':
				baseRows = filteredRows
				break
			case 'visible':
				baseRows = paginatedRows
				break
			case 'all':
			default:
				baseRows = allRows
		}

		// If child rows should not be exported, return the base rows as is
		if (!exportChildRows) {
			return baseRows
		}

		// If exporting child rows, flatten the data structure to include children recursively
		return flattenRowsWithChildren(baseRows, childrenKey, expandedContent)
	}

	// Helper function to flatten rows with their children recursively
	const flattenRowsWithChildren = (
		rows: any[],
		childrenKey: string,
		expandedContent: string,
	): any[] => {
		if (!rows || !rows.length) return []

		return rows.reduce((accumulator: any[], row: any) => {
			// Always add the current row
			accumulator.push(row)

			// Check if this row has children and if we should include them
			// Only include child rows when expansion type is 'children' or 'auto' with children present
			const hasChildren =
				row[childrenKey] && Array.isArray(row[childrenKey]) && row[childrenKey].length > 0
			const shouldIncludeChildren =
				hasChildren &&
				(expandedContent === 'children' || (expandedContent === 'auto' && hasChildren))

			if (shouldIncludeChildren) {
				// Recursively flatten children
				const flattenedChildren = flattenRowsWithChildren(
					row[childrenKey],
					childrenKey,
					expandedContent,
				)
				accumulator.push(...flattenedChildren)
			}

			return accumulator
		}, [])
	}

	// Get all leaf columns - flattens nested column structure
	const getLeafColumns = (columns: TableColumn[]): TableColumn[] => {
		return columns.flatMap((column) => {
			if (column.columns && column.columns.length > 0) {
				return getLeafColumns(column.columns)
			}
			return column
		})
	}

	// Filter out columns that should be excluded from export
	const getExportColumns = (columns: TableColumn[]): TableColumn[] => {
		const exportOptions = getExportOptions()

		// First, flatten the column structure to get all leaf columns
		const leafColumns = getLeafColumns(columns)

		return leafColumns.filter((column) => {
			// Skip columns marked for exclusion
			if (exportOptions.excludeColumns?.includes(column.id)) {
				return false
			}

			// Skip selection/expansion columns
			if (column.id === 'selection' || column.id === 'expansion') {
				return false
			}

			// Export-only columns are always included (they're never "visible" in the UI)
			if (column.exportOnly) {
				return true
			}

			// Check for hidden columns based on the includeHiddenColumns option
			const includeHiddenColumns = exportOptions.includeHiddenColumns !== false // Default to true
			if (!includeHiddenColumns && column.visible === false) {
				return false
			}

			return true
		})
	}

	// Format a value for export using column's exportFormat if available
	// The formatted parameter lets us choose between raw or formatted values
	const formatValueForExport = (
		value: any,
		row: any,
		column: TableColumn,
		formatted = true,
	): any => {
		// Use exportFormat if defined and formatting is requested
		if (formatted && column.exportFormat) {
			return column.exportFormat(value, row, column)
		}

		// Otherwise use standard formatter if available and formatting is requested
		if (formatted && column.formatType && value !== null && value !== undefined) {
			const formatter = getFormatter(column.formatType)

			// Safely call the formatter with proper arguments
			if (formatter) {
				try {
					// Provide both the value and the options, ensuring options is an object
					// This includes timezone if specified for date/datetime columns
					const formatOptions = column.formatOptions || {}
					return formatter(value, formatOptions)
				} catch (error) {
					// If formatter errors, fall back to the raw value
					console.warn(`Error formatting value for export: ${String(error)}`, { column, value })
					return value
				}
			}
		}

		return value
	}

	// Prepare data for CSV export
	const prepareDataForCsv = (rows: any[], columns: TableColumn[]): Record<string, any>[] => {
		return rows.map((row) => {
			const exportRow: Record<string, any> = {}

			columns.forEach((column) => {
				// Get the raw cell value based on column key/accessor
				let cellValue: any
				if (typeof column.key === 'function') {
					cellValue = column.key(row)
				} else if (column.key && typeof column.key === 'string') {
					cellValue = row[column.key]
				} else {
					cellValue = row[column.id]
				}

				// Format the value for export
				const formattedValue = formatValueForExport(cellValue, row, column, true)

				// Replace NBSP (U+00A0) and narrow no-break space (U+202F) with regular space for CSV compatibility.
				// Intl.NumberFormat uses NBSP as group separator in many locales (e.g. fi-FI).
				const sanitizedValue =
					typeof formattedValue === 'string'
						? formattedValue.replace(/[\u00A0\u202F]/g, ' ')
						: formattedValue

				// Use header as the column name (or id as fallback)
				const columnName =
					typeof column.header === 'function'
						? column.id // If header is a function, use id instead
						: column.header || column.id

				exportRow[columnName] = sanitizedValue
			})

			return exportRow
		})
	}

	// Export to CSV
	const exportToCsv = (rows: any[], columns: TableColumn[], filenameOverride?: string) => {
		const exportColumns = getExportColumns(columns)
		const exportData = prepareDataForCsv(rows, exportColumns)

		const csvConfig = mkConfig({
			filename: filenameOverride || filename.value,
			useKeysAsHeaders: true,
		})

		const csv = generateCsv(csvConfig)(exportData)
		downloadCsv(csvConfig)(csv)
	}

	// Helper function to convert dates with timezone support
	const convertDateForExcel = (value: any, column: TableColumn): Date | null => {
		try {
			// Get timezone settings from column formatOptions
			const targetTimezone =
				column.formatOptions?.timeZone || column.formatOptions?.timezone || getLocalTimeZone()

			let zonedDateTime: ZonedDateTime | null = null

			// If already a Date object
			if (value instanceof Date) {
				if (isNaN(value.getTime())) return null

				// Convert Date to ZonedDateTime in local timezone first
				// Then convert to target timezone if different
				const localTz = getLocalTimeZone()
				zonedDateTime = fromDate(value, localTz)

				if (localTz !== targetTimezone) {
					zonedDateTime = toTimeZone(zonedDateTime, targetTimezone)
				}
			}
			// If string value that might contain timezone info
			else if (typeof value === 'string') {
				// Try parsing as ISO string with timezone info
				if (value.includes('Z') || /[+-]\d{2}:\d{2}$/.test(value)) {
					try {
						// Parse as absolute time (UTC or with offset)
						zonedDateTime = parseAbsolute(value, targetTimezone)
					} catch {
						// Fall back to regular Date parsing
						const date = new Date(value)
						if (!isNaN(date.getTime())) {
							const localTz = getLocalTimeZone()
							zonedDateTime = fromDate(date, localTz)
							if (localTz !== targetTimezone) {
								zonedDateTime = toTimeZone(zonedDateTime, targetTimezone)
							}
						}
					}
				} else {
					// Regular date string - parse as local time and convert
					const date = new Date(value)
					if (!isNaN(date.getTime())) {
						const localTz = getLocalTimeZone()
						zonedDateTime = fromDate(date, localTz)
						if (localTz !== targetTimezone) {
							zonedDateTime = toTimeZone(zonedDateTime, targetTimezone)
						}
					}
				}
			}
			// If numeric timestamp
			else if (typeof value === 'number') {
				const date = new Date(value)
				if (!isNaN(date.getTime())) {
					const localTz = getLocalTimeZone()
					zonedDateTime = fromDate(date, localTz)
					if (localTz !== targetTimezone) {
						zonedDateTime = toTimeZone(zonedDateTime, targetTimezone)
					}
				}
			}

			// Convert back to JavaScript Date for Excel
			// IMPORTANT: Excel has no concept of timezones. The write-excel-file library
			// uses the UTC components of the Date object (getUTCHours, etc.) to write to Excel.
			// To display the correct wall-clock time in Excel, we create a "fake UTC" Date
			// where the UTC components match the desired display time in the target timezone.
			if (zonedDateTime) {
				// Extract wall-clock components from the ZonedDateTime in target timezone
				const year = zonedDateTime.year
				const month = zonedDateTime.month // Note: @internationalized/date uses 1-based months
				const day = zonedDateTime.day
				const hour = zonedDateTime.hour
				const minute = zonedDateTime.minute
				const second = zonedDateTime.second || 0
				const millisecond = zonedDateTime.millisecond || 0

				// Create a Date where UTC components match the target timezone wall-clock time
				// This ensures Excel displays the exact time we want
				return new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond))
			}

			return null
		} catch (error) {
			console.warn(`Error converting date for Excel export:`, { value, column, error })

			// Fallback: try basic Date conversion
			try {
				const date = new Date(value)
				return isNaN(date.getTime()) ? null : date
			} catch {
				return null
			}
		}
	}

	// Get the raw value for Excel, ensuring the correct type
	const getRawValueForExcel = (value: any, column: TableColumn): any => {
		// For percentage columns, ensure we have the raw number (not string with %)
		if (column.formatType === 'percentage' && typeof value === 'number') {
			return value // Return the raw number (e.g., 0.29 not "29%")
		}

		// For decimal/number columns, ensure we return a number if possible
		if (
			(column.formatType === 'number' ||
				column.formatType === 'decimal' ||
				column.formatType === 'integer' ||
				column.formatType === 'currency') &&
			typeof value === 'string'
		) {
			// Try to parse numeric value from string
			const parsedValue = parseFloat(value.replace(/[^0-9.-]/g, ''))
			if (!isNaN(parsedValue)) {
				return parsedValue
			}
		}

		// Handle dates - ensure we have Date objects for date columns with proper timezone conversion
		if ((column.formatType === 'date' || column.formatType === 'datetime') && value) {
			const convertedDate = convertDateForExcel(value, column)
			if (convertedDate) {
				return convertedDate
			}
		}

		// For boolean columns, ensure we have a boolean value
		if (column.formatType === 'boolean' && typeof value !== 'boolean') {
			if (value === 'true' || value === 'yes' || value === '1' || value === 1) {
				return true
			}
			if (value === 'false' || value === 'no' || value === '0' || value === 0) {
				return false
			}
		}

		return value
	}

	// Resolve timezone abbreviation using Intl.DateTimeFormat
	const getTimezoneAbbreviation = (timeZone: string): string => {
		try {
			const formatter = new Intl.DateTimeFormat('en-US', {
				timeZone,
				timeZoneName: 'short',
			})
			const parts = formatter.formatToParts(new Date())
			const tzPart = parts.find((p) => p.type === 'timeZoneName')
			return tzPart?.value || ''
		} catch {
			return ''
		}
	}

	// Helper to get the appropriate format string for a column
	const getFormatForColumn = (column: TableColumn): string | undefined => {
		if (column.formatType === 'percentage') {
			// Check if custom decimal places are specified
			const decimalPlaces = column.formatOptions?.decimalPlaces ?? 2
			return `0.${'0'.repeat(decimalPlaces)}%`
		} else if (column.formatType === 'date') {
			// Use custom format if specified, otherwise default
			if (column.formatOptions?.excelFormat) {
				return column.formatOptions.excelFormat
			}
			return 'yyyy-mm-dd'
		} else if (column.formatType === 'datetime') {
			// Use custom format if specified, otherwise default
			if (column.formatOptions?.excelFormat) {
				return column.formatOptions.excelFormat
			}
			// Check if we should include seconds
			const includeSeconds = column.formatOptions?.second !== undefined
			let format = includeSeconds ? 'yyyy-mm-dd hh:mm:ss' : 'yyyy-mm-dd hh:mm'

			// Append timezone abbreviation if timeZoneName is requested
			if (column.formatOptions?.timeZoneName) {
				const tz = column.formatOptions?.timeZone || column.formatOptions?.timezone
				if (tz) {
					const abbr = getTimezoneAbbreviation(tz)
					if (abbr) {
						format += ` "${abbr}"`
					}
				}
			}
			return format
		} else if (column.formatType === 'currency') {
			// Export currency as plain decimal number without currency symbol
			const decimalPlaces = column.formatOptions?.decimalPlaces ?? 2
			return `#,##0.${'0'.repeat(decimalPlaces)}`
		} else if (column.formatType === 'number' || column.formatType === 'decimal') {
			const decimalPlaces = column.formatOptions?.decimalPlaces ?? 2
			return `#,##0.${'0'.repeat(decimalPlaces)}`
		} else if (column.formatType === 'integer') {
			return '#,##0'
		}
		return undefined
	}

	// Get value for Excel export, respecting exportFormat if defined
	const getValueForExcel = (row: any, column: TableColumn): any => {
		// Get the raw cell value
		let cellValue: any
		if (typeof column.key === 'function') {
			cellValue = column.key(row)
		} else if (column.key && typeof column.key === 'string') {
			cellValue = row[column.key]
		} else {
			cellValue = row[column.id]
		}

		// If exportFormat is defined, use it for null handling and string overrides (like '-')
		if (column.exportFormat) {
			const formatted = column.exportFormat(cellValue, row, column)
			// If exportFormat returns null/undefined/empty string, return null for empty cell
			if (formatted === null || formatted === undefined || formatted === '') {
				return null
			}
			// If exportFormat returns a non-numeric string (like '-'), use it as-is
			if (typeof formatted === 'string' && isNaN(Number(formatted))) {
				return formatted
			}
			// For columns with native Excel formatting (percentage, currency, etc.),
			// skip numeric results from exportFormat - Excel formats the raw value itself.
			// e.g. exportFormat might return 55 (for CSV "55%"), but Excel expects 0.55 with 0.00% format.
			const hasNativeExcelFormat =
				column.formatType === 'percentage' ||
				column.formatType === 'number' ||
				column.formatType === 'decimal' ||
				column.formatType === 'integer' ||
				column.formatType === 'currency' ||
				column.formatType === 'date' ||
				column.formatType === 'datetime'
			if (!hasNativeExcelFormat) {
				cellValue = typeof formatted === 'number' ? formatted : cellValue
			}
		}

		// For null/undefined values without exportFormat, return null for empty cell
		if (cellValue === null || cellValue === undefined) {
			return null
		}

		// For boolean columns, use the label text (same as CSV) instead of native TRUE/FALSE
		if (column.formatType === 'boolean') {
			const boolValue =
				typeof cellValue === 'boolean'
					? cellValue
					: cellValue === 'true' || cellValue === 'yes' || cellValue === '1' || cellValue === 1
			const trueLabel = column.formatOptions?.trueValue || 'Yes'
			const falseLabel = column.formatOptions?.falseValue || 'No'
			return boolValue ? trueLabel : falseLabel
		}

		// Apply type-specific processing for Excel
		return getRawValueForExcel(cellValue, column)
	}

	// Determine Excel cell type based on value and column configuration
	const getExcelCellType = (
		value: any,
		column: TableColumn,
	): typeof String | typeof Number | typeof Date | typeof Boolean => {
		// Handle null/undefined/empty first - always use String for empty cells
		if (value === null || value === undefined || value === '') {
			return String
		}

		// If value is a non-numeric string (like '-' from exportFormat), use String
		if (typeof value === 'string' && isNaN(Number(value))) {
			return String
		}

		// Check column format type for numeric/date/boolean columns
		if (
			column.formatType === 'number' ||
			column.formatType === 'decimal' ||
			column.formatType === 'integer' ||
			column.formatType === 'percentage' ||
			column.formatType === 'currency'
		) {
			return Number
		} else if (column.formatType === 'date' || column.formatType === 'datetime') {
			return Date
		} else if (column.formatType === 'boolean') {
			return Boolean
		}

		// Fall back to runtime type checks
		if (value instanceof Date) return Date
		if (typeof value === 'boolean') return Boolean
		if (typeof value === 'number') return Number

		// Default to string for everything else
		return String
	}

	// Export to Excel
	const exportToExcel = async (rows: any[], columns: TableColumn[], filenameOverride?: string) => {
		const exportColumns = getExportColumns(columns)

		// Create schema for Excel export
		const schema = exportColumns.map((column) => {
			// Excel schema entry with dynamic type detection
			return {
				column:
					typeof column.header === 'function'
						? column.id // If header is a function, use id instead
						: column.header || column.id,
				// Add format based on column type
				format: getFormatForColumn(column),
				// Store column reference for later use
				_column: column,
				value: (row: any) => {
					try {
						return getValueForExcel(row, column)
					} catch (error) {
						console.warn(`Error in Excel export for column ${column.id}:`, error)
						return null
					}
				},
			}
		})

		try {
			// Create data array in the format expected by write-excel-file
			const excelData = rows.map((row) => {
				// Convert each row into an array of cell objects for excel-file-writer
				return schema.map((schemaColumn) => {
					try {
						// Get value using the value accessor from the schema
						const value = schemaColumn.value(row)

						// Determine the right cell type based on value and column configuration
						const valueType = getExcelCellType(value, schemaColumn._column)

						// Get format string based on column type and actual value type
						let format = schemaColumn.format

						// Only apply format for Number and Date types
						// String and Boolean cells don't use custom formats (String only supports "@")
						if (valueType === String || valueType === Boolean) {
							format = undefined
						} else if (valueType === Date && !format) {
							// Provide a default date format if none specified
							format = 'yyyy-mm-dd'
						} else if (valueType === Number && !format) {
							const col = schemaColumn._column
							if (col?.formatType === 'percentage') {
								format = '0.00%'
							} else if (col?.formatType === 'currency') {
								format = '#,##0.00'
							} else if (col?.formatType === 'number' || col?.formatType === 'decimal') {
								format = '#,##0.00'
							} else if (col?.formatType === 'integer') {
								format = '#,##0'
							}
						}

						// Return the cell object in the format expected by write-excel-file
						// For null values, return empty cell (no value property or empty string)
						if (value === null || value === undefined) {
							return {
								type: String,
								value: '',
							}
						}

						return {
							type: valueType,
							value: value,
							format: format,
						}
					} catch (error) {
						console.warn(`Error preparing Excel cell for column ${schemaColumn.column}:`, error)
						return { type: String, value: '' }
					}
				})
			})

			// Get Excel-specific options from export config
			const exportOptions = getExportOptions()
			const excelOptions = exportOptions.excelOptions || {}
			const shouldStyleHeaders = excelOptions.styleHeaders !== false // Default to true
			const headerStyle = excelOptions.headerStyle || {}

			// Create the column headers row with configurable formatting
			const headerRow = schema.map((column) => {
				const headerCell: any = {
					type: String,
					value: column.column,
				}

				// Apply header styling if enabled
				if (shouldStyleHeaders) {
					// Apply font weight (default to 'bold' unless explicitly set to 'normal')
					if (headerStyle.fontWeight !== 'normal') {
						headerCell.fontWeight = headerStyle.fontWeight || 'bold'
					}

					// Apply other header styles if specified
					if (headerStyle.backgroundColor) {
						headerCell.backgroundColor = headerStyle.backgroundColor
					}
					if (headerStyle.color) {
						headerCell.color = headerStyle.color
					}
					if (headerStyle.fontFamily) {
						headerCell.fontFamily = headerStyle.fontFamily
					}
					if (headerStyle.fontSize) {
						headerCell.fontSize = headerStyle.fontSize
					}
					if (headerStyle.fontStyle) {
						headerCell.fontStyle = headerStyle.fontStyle
					}
				}

				return headerCell
			})

			// Combine headers and data
			const excelContent = [headerRow, ...excelData]

			// Build write options with configurable settings
			// Use the filename from export options or the override parameter
			const actualFilename = filenameOverride || exportOptions.filename || filename.value

			const writeOptions: any = {
				fileName: `${actualFilename}.xlsx`,
				// Apply global font settings (with defaults)
				fontFamily: excelOptions.fontFamily || 'Calibri',
				fontSize: excelOptions.fontSize || 11,
			}

			// Now write the Excel file with properly formatted data
			await writeXlsxFile(excelContent, writeOptions)
		} catch (error) {
			console.error('Error writing Excel file:', error)
			// Fallback to CSV export if Excel fails
			console.warn('Falling back to CSV export due to Excel export failure')
			exportToCsv(rows, columns, filenameOverride)
		}
	}

	return {
		filename,
		getExportData,
		getExportColumns,
		exportToCsv,
		exportToExcel,
	}
}
