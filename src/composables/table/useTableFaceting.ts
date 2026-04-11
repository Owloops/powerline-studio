import { ref, type Ref } from 'vue'
import type { TableColumn } from '@/components/Table/types'

export interface UseTableFacetingOptions {
	/**
	 * Whether faceting is enabled
	 * @default true
	 */
	enabled?: boolean

	/**
	 * Locale to use for string sorting (e.g., 'fi-FI', 'en-US')
	 * @default undefined (uses browser default)
	 */
	locale?: string
}

export interface UseTableFacetingReturn<T = any> {
	/**
	 * Get unique values for a column
	 */
	getUniqueValues: (columnId: string, data: T[]) => any[]

	/**
	 * Get min/max values for a column
	 */
	getMinMaxValues: (columnId: string, data: T[]) => { min: number; max: number } | null

	/**
	 * Whether faceting is enabled
	 */
	facetingEnabled: Ref<boolean>

	/**
	 * Get faceted options for a column based on its facet type
	 */
	getFacetedOptions: (
		columnId: string,
		data: T[],
	) => {
		uniqueValues?: any[]
		minMaxValues?: { min: number; max: number } | null
	}
}

/**
 * Composable for handling table faceting
 */
export function useTableFaceting<T = any>(
	columns: Ref<TableColumn<T>[]>,
	options: UseTableFacetingOptions = {},
): UseTableFacetingReturn<T> {
	// Default options - don't use Required since locale is optional
	const defaultOptions = {
		enabled: true,
	} as const

	// Merge options
	const mergedOptions = { ...defaultOptions, ...options }

	// State
	const facetingEnabled = ref(mergedOptions.enabled)

	// Cache for faceted values
	const uniqueValuesCache = ref<Record<string, any[]>>({})
	const minMaxValuesCache = ref<Record<string, { min: number; max: number } | null>>({})

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

	// Get unique values for a column (for select faceting)
	const getUniqueValues = (columnId: string, data: T[]): any[] => {
		// Return cached values if available
		if (uniqueValuesCache.value[columnId]) {
			return uniqueValuesCache.value[columnId]
		}

		const column = getColumn(columnId)
		if (!column) return []

		const values = data
			.map((row) => getCellValue(row, column))
			.filter((value) => value !== undefined && value !== null && value !== '')

		// Remove duplicates
		const uniqueValues = [...new Set(values)]

		// Sort the unique values using locale-aware comparison
		const sortedValues = uniqueValues.sort((a, b) => {
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
			const aStr = String(a)
			const bStr = String(b)
			return options.locale ? aStr.localeCompare(bStr, options.locale) : aStr.localeCompare(bStr)
		})

		// Cache the results
		uniqueValuesCache.value[columnId] = sortedValues

		return sortedValues
	}

	// Get min/max values for a column (for range faceting)
	const getMinMaxValues = (columnId: string, data: T[]): { min: number; max: number } | null => {
		// Return cached values if available
		if (minMaxValuesCache.value[columnId] !== undefined) {
			return minMaxValuesCache.value[columnId]
		}

		const column = getColumn(columnId)
		if (!column) return null

		const values = data
			.map((row) => getCellValue(row, column))
			.filter((value) => typeof value === 'number' && !isNaN(value))

		if (values.length === 0) {
			minMaxValuesCache.value[columnId] = null
			return null
		}

		const result = {
			min: Math.min(...values),
			max: Math.max(...values),
		}

		// Cache the results
		minMaxValuesCache.value[columnId] = result

		return result
	}

	// Get faceted options for a column based on its facet type
	const getFacetedOptions = (columnId: string, data: T[]) => {
		const column = getColumn(columnId)
		if (!column || !column.facet) return {}

		const result: {
			uniqueValues?: any[]
			minMaxValues?: { min: number; max: number } | null
		} = {}

		if (column.facet.type === 'select') {
			result.uniqueValues = getUniqueValues(columnId, data)
		} else if (column.facet.type === 'range') {
			result.minMaxValues = getMinMaxValues(columnId, data)
		}

		return result
	}

	return {
		getUniqueValues,
		getMinMaxValues,
		facetingEnabled,
		getFacetedOptions,
	}
}
