import { computed, ref, type Ref, type ComputedRef } from 'vue'
import { useFuse } from '@vueuse/integrations/useFuse'
import type { TableColumn } from '@/components/Table/types'

export interface UseTableFilterOptions {
	/**
	 * Initial global filter value
	 */
	globalFilter?: string

	/**
	 * Initial column filters
	 */
	columnFilters?: Record<string, any>

	/**
	 * Filter type
	 * @default 'fuzzy'
	 */
	filterType?: 'exact' | 'fuzzy'

	/**
	 * Fuzzy search options for Fuse.js
	 */
	fuzzyOptions?: {
		/**
		 * Keys to search in
		 */
		keys?: string[]

		/**
		 * Fuse.js options
		 */
		fuseOptions?: any

		/**
		 * Result limit
		 */
		resultLimit?: number

		/**
		 * Whether to match all when search is empty
		 * @default true
		 */
		matchAllWhenSearchEmpty?: boolean
	}

	/**
	 * Whether filtering is enabled
	 * @default true
	 */
	enabled?: boolean

	/**
	 * Children key for parent-child relationships (expansion)
	 * @default 'children'
	 */
	childrenKey?: string

	/**
	 * Whether to include parent rows when any child matches the filter
	 * @default true
	 */
	includeParentWhenChildMatches?: boolean

	/**
	 * Default text for boolean true value
	 * @default 'Yes'
	 */
	booleanTrueText?: string

	/**
	 * Default text for boolean false value
	 * @default 'No'
	 */
	booleanFalseText?: string

	/**
	 * Function to format cell values for display
	 */
	formatCellValue?: (value: any, row: any, column: any) => any

	/**
	 * Locale to use for string sorting (e.g., 'fi-FI', 'en-US')
	 * @default undefined (uses browser default)
	 */
	locale?: string
}

export interface UseTableFilterReturn<T = any> {
	/**
	 * Global filter value
	 */
	globalFilter: Ref<string>

	/**
	 * Column filters
	 */
	columnFilters: Ref<Record<string, any>>

	/**
	 * Filtered data
	 */
	filteredData: ComputedRef<T[]>

	/**
	 * Set global filter
	 */
	setGlobalFilter: (value: string) => void

	/**
	 * Set column filter
	 */
	setColumnFilter: (columnId: string, value: any) => void

	/**
	 * Clear all filters
	 */
	clearFilters: (columns: boolean) => void

	/**
	 * Clear column filter
	 */
	clearColumnFilter: (columnId: string) => void

	/**
	 * Whether filtering is enabled
	 */
	filterEnabled: Ref<boolean>

	/**
	 * Get unique values for a column (for faceting)
	 */
	getUniqueValues: (columnId: string, data: T[]) => any[]

	/**
	 * Get min/max values for a column (for range faceting)
	 */
	getMinMaxValues: (columnId: string, data: T[]) => { min: number; max: number } | null
}

/**
 * Recursively flatten columns to get all leaf columns
 */
function getFlattenedFilterableColumns<T>(columns: TableColumn<T>[]): TableColumn<T>[] {
	const result: TableColumn<T>[] = []

	for (const column of columns) {
		if (column.columns && column.columns.length > 0) {
			// This is a group column, recursively get its children
			result.push(...getFlattenedFilterableColumns(column.columns))
		} else if (column.filterable !== false) {
			// This is a leaf column and is filterable
			result.push(column)
		}
	}

	return result
}

/**
 * Composable for table filtering
 */
export function useTableFilter<T = any>(
	data: Ref<T[]>,
	columns: Ref<TableColumn<T>[]>,
	options: UseTableFilterOptions = {},
): UseTableFilterReturn<T> {
	// Default options - don't use Required since locale and formatCellValue are optional
	const defaultOptions = {
		globalFilter: '',
		columnFilters: {},
		filterType: 'fuzzy' as const,
		fuzzyOptions: {
			keys: [],
			fuseOptions: {
				threshold: 0.4, // Higher threshold = more fuzzy matching
				ignoreLocation: false,
				distance: 100, // Allow more distance between characters
				includeScore: true, // Include score in results
				useExtendedSearch: true, // Enable extended search
				minMatchCharLength: 1, // Minimum characters that must match
			},
			resultLimit: undefined,
			matchAllWhenSearchEmpty: true,
		},
		enabled: true,
		childrenKey: 'children',
		includeParentWhenChildMatches: true,
		booleanTrueText: 'Yes',
		booleanFalseText: 'No',
	}

	// Merge options
	const mergedOptions = {
		...defaultOptions,
		...options,
		fuzzyOptions: {
			...defaultOptions.fuzzyOptions,
			...options.fuzzyOptions,
		},
	}

	// Filter state
	const filterEnabled = ref(mergedOptions.enabled)
	const globalFilter = ref(mergedOptions.globalFilter)
	const columnFilters = ref<Record<string, any>>(mergedOptions.columnFilters)

	// Get column by ID
	const getColumn = (columnId: string): TableColumn<T> | undefined => {
		// Flatten all columns including nested ones
		const flattenColumns = (cols: TableColumn<T>[]): TableColumn<T>[] => {
			return cols.reduce((acc, col) => {
				acc.push(col)
				if (col.columns?.length) {
					acc.push(...flattenColumns(col.columns))
				}
				return acc
			}, [] as TableColumn<T>[])
		}

		const allColumns = flattenColumns(columns.value)
		return allColumns.find((col) => col.id === columnId)
	}

	// Get cell value
	const getCellValue = (row: T, column: TableColumn<T>): any => {
		if (typeof column.key === 'function') {
			return column.key(row)
		}
		return row[column.key as keyof T]
	}

	// Check if a row matches all column filters
	const rowMatchesColumnFilters = (row: T): boolean => {
		return Object.entries(columnFilters.value).every(([columnId, filterValue]) => {
			if (filterValue === undefined || filterValue === null || filterValue === '') return true

			const column = getColumn(columnId)
			if (!column) return true

			const cellValue = getCellValue(row, column)

			// Get formatted value if formatter is available
			let formattedValue: any = cellValue
			if (mergedOptions.formatCellValue && column) {
				try {
					formattedValue = mergedOptions.formatCellValue(cellValue, row, column)
				} catch {
					// If formatting fails, fall back to raw value
					formattedValue = cellValue
				}
			}

			// Use custom filter function if provided - now with formatted value and row context
			if (column.filterFn) {
				return column.filterFn(cellValue, filterValue, formattedValue, row)
			}

			// Default filtering logic - check both raw and formatted values
			if (cellValue === undefined || cellValue === null) {
				// Still check formatted value which might be a default like "N/A"
				if (formattedValue && typeof filterValue === 'string') {
					return String(formattedValue).toLowerCase().includes(filterValue.toLowerCase())
				}
				return false
			}

			// For select/combobox filters, use exact matching on raw value
			if (column.facet?.type === 'select') {
				return cellValue === filterValue
			}

			// Strip HTML tags from formatted value if it contains HTML
			let cleanFormattedValue = formattedValue
			if (typeof formattedValue === 'string' && formattedValue.includes('<')) {
				cleanFormattedValue = formattedValue.replace(/<[^>]*>/g, '')
			}

			// Try to match against both raw and formatted values
			const filterString = String(filterValue).toLowerCase()

			// Check formatted value first (what user sees)
			if (cleanFormattedValue !== cellValue && cleanFormattedValue != null) {
				const formattedString = String(cleanFormattedValue).toLowerCase()
				if (formattedString.includes(filterString)) {
					return true
				}
			}

			// Then check raw value using existing logic
			if (typeof cellValue === 'string') {
				if (typeof filterValue === 'string') {
					return cellValue.toLowerCase().includes(filterValue.toLowerCase())
				}
			} else if (typeof cellValue === 'number') {
				// For numbers, also check if the filter matches the formatted version
				if (typeof filterValue === 'string') {
					// Check if filter matches formatted number (e.g., "1,234.56")
					const formattedString = String(cleanFormattedValue).toLowerCase()
					if (formattedString.includes(filterString)) {
						return true
					}
					// Also check raw number as string
					return String(cellValue).toLowerCase().includes(filterString)
				} else if (typeof filterValue === 'object' && filterValue !== null) {
					const { min, max } = filterValue
					if (min !== undefined && max !== undefined) {
						return cellValue >= min && cellValue <= max
					} else if (min !== undefined) {
						return cellValue >= min
					} else if (max !== undefined) {
						return cellValue <= max
					}
				} else if (typeof filterValue === 'number') {
					return cellValue === filterValue
				}
			} else if (typeof cellValue === 'boolean') {
				// For booleans, check both raw value and formatted text
				if (typeof filterValue === 'boolean') {
					return cellValue === filterValue
				} else if (typeof filterValue === 'string') {
					// Check if filter matches formatted boolean (e.g., "Yes", "No")
					const formattedString = String(cleanFormattedValue).toLowerCase()
					return formattedString.includes(filterString)
				}
			} else if (cellValue instanceof Date) {
				// For dates, primarily check formatted value
				if (typeof filterValue === 'string') {
					const formattedString = String(cleanFormattedValue).toLowerCase()
					return formattedString.includes(filterString)
				} else if (filterValue instanceof Date) {
					return cellValue.getTime() === filterValue.getTime()
				}
			} else if (Array.isArray(cellValue)) {
				if (typeof filterValue === 'string') {
					return cellValue.some((item) =>
						String(item).toLowerCase().includes(filterValue.toLowerCase()),
					)
				} else if (Array.isArray(filterValue)) {
					return filterValue.every((item) => cellValue.includes(item))
				}
			}

			// Default: try to convert both to string and compare
			return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase())
		})
	}

	// Check if a row matches global filter
	const rowMatchesGlobalFilter = (row: T): boolean => {
		if (!globalFilter.value) return true

		const searchTerm = globalFilter.value.toLowerCase()

		// Get filterable columns
		const filterableColumns = getFlattenedFilterableColumns(columns.value)

		// Check each column's raw and formatted values
		return filterableColumns.some((column) => {
			const cellValue = getCellValue(row, column)

			// Check raw value
			if (cellValue !== undefined && cellValue !== null) {
				if (String(cellValue).toLowerCase().includes(searchTerm)) {
					return true
				}
			}

			// Check formatted value if formatter is available
			if (mergedOptions.formatCellValue) {
				try {
					const formattedValue = mergedOptions.formatCellValue(cellValue, row, column)
					if (formattedValue !== undefined && formattedValue !== null) {
						// Strip HTML tags if present
						let cleanValue = formattedValue
						if (typeof formattedValue === 'string' && formattedValue.includes('<')) {
							cleanValue = formattedValue.replace(/<[^>]*>/g, '')
						}
						if (String(cleanValue).toLowerCase().includes(searchTerm)) {
							return true
						}
					}
				} catch {
					// If formatting fails, continue with next column
				}
			}

			return false
		})
	}

	// Check if a row itself matches the filters
	const rowMatchesFilters = (
		row: T,
		checkColumnFilters = true,
		checkGlobalFilter = true,
	): boolean => {
		const matchesColumns = !checkColumnFilters || rowMatchesColumnFilters(row)
		const matchesGlobal = !checkGlobalFilter || rowMatchesGlobalFilter(row)
		return matchesColumns && matchesGlobal
	}

	// Filter rows recursively, preserving parent-child structure
	const filterRowsRecursively = (
		rows: T[],
		checkColumnFilters = true,
		checkGlobalFilter = true,
	): T[] => {
		return rows.reduce((filteredRows: T[], row: T) => {
			const childrenKey = mergedOptions.childrenKey
			const children = (row as any)[childrenKey]

			// Check if the row itself matches the filter
			const rowMatches = rowMatchesFilters(row, checkColumnFilters, checkGlobalFilter)

			// Filter children if they exist
			let filteredChildren: T[] = []
			let hasMatchingChildren = false

			if (children && Array.isArray(children) && children.length > 0) {
				filteredChildren = filterRowsRecursively(children, checkColumnFilters, checkGlobalFilter)
				hasMatchingChildren = filteredChildren.length > 0
			}

			// Create a copy of the row with filtered children
			if (rowMatches || (hasMatchingChildren && mergedOptions.includeParentWhenChildMatches)) {
				// Create a shallow copy of the row
				const rowCopy = { ...row }

				// If we have filtered children, set them on the row copy
				if (children) {
					;(rowCopy as any)[childrenKey] = filteredChildren
				}

				filteredRows.push(rowCopy)
			}

			return filteredRows
		}, [])
	}

	// Apply column filters
	const applyColumnFilters = (rows: T[]): T[] => {
		if (Object.keys(columnFilters.value).length === 0) return rows

		return filterRowsRecursively(rows, true, false)
	}

	// Apply global filter
	const applyGlobalFilter = (rows: T[]): T[] => {
		if (!globalFilter.value) return rows

		// If we're using the recursive matching approach for child rows
		if (mergedOptions.includeParentWhenChildMatches) {
			return filterRowsRecursively(rows, false, true)
		}

		// Otherwise, use the original fuzzy search approach
		// Get keys to search in
		const keys = mergedOptions.fuzzyOptions.keys?.length
			? mergedOptions.fuzzyOptions.keys
			: getFlattenedFilterableColumns(columns.value)
					.filter((col) => typeof col.key === 'string' && col.key !== '')
					.map((col) => col.key as string)

		// Configure Fuse.js
		const fuseOptions = {
			...mergedOptions.fuzzyOptions.fuseOptions,
			keys,
		}

		// Use Fuse.js for fuzzy search
		if (mergedOptions.filterType === 'fuzzy') {
			const { results } = useFuse(globalFilter.value, rows, {
				fuseOptions,
				resultLimit: mergedOptions.fuzzyOptions.resultLimit,
				matchAllWhenSearchEmpty: mergedOptions.fuzzyOptions.matchAllWhenSearchEmpty,
			})

			return computed(() => results.value.map((result: { item: T }) => result.item)).value
		}
		// Use exact search
		else {
			return rows.filter((row) => rowMatchesGlobalFilter(row))
		}
	}

	// Filtered data
	const filteredData = computed(() => {
		if (!filterEnabled.value) return data.value

		// Apply column filters first, then global filter
		const columnFiltered = applyColumnFilters(data.value)
		return applyGlobalFilter(columnFiltered)
	})

	// Set global filter
	const setGlobalFilter = (value: string) => {
		globalFilter.value = value
	}

	// Set column filter
	const setColumnFilter = (columnId: string, value: any) => {
		columnFilters.value = {
			...columnFilters.value,
			[columnId]: value,
		}
	}

	// Clear all filters
	const clearFilters = (columns: boolean = true) => {
		globalFilter.value = ''
		if (columns) {
			columnFilters.value = {}
		}
	}

	// Clear column filter
	const clearColumnFilter = (columnId: string) => {
		const newFilters = { ...columnFilters.value }
		delete newFilters[columnId]
		columnFilters.value = newFilters
	}

	// Get unique values for a column (for faceting)
	const getUniqueValues = (columnId: string, inputData: T[]): any[] => {
		const column = getColumn(columnId)
		if (!column) return []

		// Get raw values from the column and filter out nulls/undefined
		const values = inputData
			.map((row) => getCellValue(row, column))
			.filter((value) => value !== undefined && value !== null)

		// Remove duplicates
		const uniqueRawValues = [...new Set(values)]

		// Check if we need to use labels for values (for select facets)
		if (column.facet?.type === 'select') {
			// Case 1: Using labelKey (string or function)
			if (column.facet.labelKey !== undefined) {
				const valueLabels: { value: any; label: string }[] = []

				// For each unique value, find the first matching row and extract label
				for (const rawValue of uniqueRawValues) {
					const matchingRow = inputData.find((row) => getCellValue(row, column) === rawValue)

					if (matchingRow) {
						let label: string

						// If labelKey is a function, call it with the row
						if (typeof column.facet.labelKey === 'function') {
							label = column.facet.labelKey(matchingRow) || String(rawValue)
						}
						// If labelKey is a string, get the property from the row
						else {
							label = String(matchingRow[column.facet.labelKey as keyof T] || rawValue)
						}

						valueLabels.push({ value: rawValue, label })
					} else {
						// Fallback if no matching row found
						valueLabels.push({ value: rawValue, label: String(rawValue) })
					}
				}

				// Sort by labels alphabetically using locale
				return valueLabels.sort((a, b) => {
					return options.locale
						? a.label.localeCompare(b.label, options.locale)
						: a.label.localeCompare(b.label)
				})
			}

			// Case 2: Boolean column with formatType 'boolean'
			else if (column.formatType === 'boolean') {
				// Create local functions to capture mergedOptions in closure
				const booleanTrueText = mergedOptions.booleanTrueText
				const booleanFalseText = mergedOptions.booleanFalseText

				// Check format options for trueValue/falseValue or use defaults
				const getTrueLabel = (): string => {
					if (column.formatOptions?.trueValue) return column.formatOptions.trueValue
					return booleanTrueText
				}

				const getFalseLabel = (): string => {
					if (column.formatOptions?.falseValue) return column.formatOptions.falseValue
					return booleanFalseText
				}

				const result: { value: boolean; label: string }[] = []

				// Add true/false options if they exist in the data
				if (uniqueRawValues.includes(true)) {
					result.push({ value: true, label: getTrueLabel() })
				}

				if (uniqueRawValues.includes(false)) {
					result.push({ value: false, label: getFalseLabel() })
				}

				return result
			}
		}

		// Default: just return sorted unique raw values
		return uniqueRawValues.sort((a, b) => {
			// Handle null/undefined values
			if (a == null && b != null) return -1
			if (a != null && b == null) return 1
			if (a == null && b == null) return 0

			// Handle string comparison with locale
			if (typeof a === 'string' && typeof b === 'string') {
				return options.locale ? a.localeCompare(b, options.locale) : a.localeCompare(b)
			}

			// Handle number comparison
			if (typeof a === 'number' && typeof b === 'number') {
				return a - b
			}

			// Handle date comparison
			if (a instanceof Date && b instanceof Date) {
				return a.getTime() - b.getTime()
			}

			// Handle boolean comparison
			if (typeof a === 'boolean' && typeof b === 'boolean') {
				return a === b ? 0 : a ? 1 : -1
			}

			// For other types, try to convert to string and compare
			const aString = String(a)
			const bString = String(b)
			return options.locale
				? aString.localeCompare(bString, options.locale)
				: aString.localeCompare(bString)
		})
	}

	// Get min/max values for a column (for range faceting)
	const getMinMaxValues = (
		columnId: string,
		inputData: T[],
	): { min: number; max: number } | null => {
		const column = getColumn(columnId)
		if (!column) return null

		const values = inputData
			.map((row) => getCellValue(row, column))
			.filter((value) => typeof value === 'number' && !isNaN(value))

		if (values.length === 0) return null

		return {
			min: Math.min(...values),
			max: Math.max(...values),
		}
	}

	return {
		globalFilter,
		columnFilters,
		filteredData,
		setGlobalFilter,
		setColumnFilter,
		clearFilters,
		clearColumnFilter,
		filterEnabled,
		getUniqueValues,
		getMinMaxValues,
	}
}
