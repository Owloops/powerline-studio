import { computed, ref, type Ref, type ComputedRef } from 'vue'
import { useSorted } from '@vueuse/core'
import type { TableColumn, SortBy } from '@/components/Table/types'

export interface UseTableSortOptions {
	/**
	 * Initial sort state
	 */
	initialSort?: SortBy[]

	/**
	 * Fixed sort orders that are always applied first and cannot be removed
	 * @default []
	 */
	fixedSortBy?: SortBy[]

	/**
	 * Whether to allow multi-column sorting
	 * @default false
	 */
	multiSort?: boolean

	/**
	 * Whether to reset other sorts when a new column is sorted
	 * @default true
	 */
	resetOtherSorts?: boolean

	/**
	 * Whether to sort child rows recursively when sorting parent rows
	 * @default false
	 */
	sortChildren?: boolean

	/**
	 * The property key to use for finding child rows
	 * @default 'children'
	 */
	childrenKey?: string

	/**
	 * When true, always maintains at least one sorted column (toggles asc/desc only)
	 * Only affects single column sorting - multi-column sorts can still be fully cleared
	 * @default true
	 */
	alwaysSorted?: boolean

	/**
	 * Locale to use for string sorting (e.g., 'fi-FI', 'en-US')
	 * @default undefined (uses browser default)
	 */
	locale?: string
}

export interface UseTableSortReturn<T = any> {
	/**
	 * Current sort state
	 */
	sortBy: Ref<SortBy[]>

	/**
	 * Sorted data
	 */
	sortedData: ComputedRef<T[]>

	/**
	 * Toggle sort for a column
	 * @param columnId The ID of the column to toggle sort
	 * @param event Optional event object to check for modifier keys
	 */
	toggleSort: (columnId: string, event?: MouseEvent | KeyboardEvent) => void

	/**
	 * Clear all sorting
	 */
	clearSort: () => void

	/**
	 * Check if a column is sorted
	 */
	isSorted: (columnId: string | undefined) => boolean | 'asc' | 'desc'
}

/**
 * Composable for table sorting
 */
export function useTableSort<T = any>(
	data: Ref<T[]>,
	columns: Ref<TableColumn<T>[]>,
	options: UseTableSortOptions = {},
): UseTableSortReturn<T> {
	// Initialize fixed sort state
	const fixedSortBy = options.fixedSortBy || []

	// Initialize user sort state
	const userSortBy = ref<SortBy[]>(options.initialSort || [])

	// Combine fixed and user sort states
	const sortBy = computed<SortBy[]>(() => {
		return [...fixedSortBy, ...userSortBy.value]
	})

	// Helper function to find a column by ID, including in nested columns
	const findColumnById = (
		columnId: string | undefined,
		columnsToSearch: TableColumn<T>[],
	): TableColumn<T> | undefined => {
		if (!columnId) return undefined

		for (const column of columnsToSearch) {
			if (column.id === columnId) {
				return column
			}

			if (column.columns?.length) {
				const nestedColumn = findColumnById(columnId, column.columns)
				if (nestedColumn) {
					return nestedColumn
				}
			}
		}

		return undefined
	}

	// Create a sort function based on the current sort state
	const sortFunction = computed(() => {
		return (a: T, b: T) => {
			// If no sorting is applied, return 0 (no change in order)
			if (sortBy.value.length === 0) {
				return 0
			}

			// Apply each sort in order
			for (const sort of sortBy.value) {
				// If sort has index but no id, find the column by index
				let column: TableColumn<T> | undefined

				if (sort.id) {
					column = findColumnById(sort.id, columns.value)
				} else if (sort.index !== undefined) {
					// Get all leaf columns
					const flatColumns = getFlatColumns(columns.value)
					// Get column by index
					column = flatColumns[sort.index]
				}

				if (!column) {
					continue
				}

				// Get values to compare
				let valueA: any
				let valueB: any

				// Check if we're dealing with grouped rows
				const isGroupedRowA = 'isGrouped' in (a as any) && (a as any).isGrouped === true
				const isGroupedRowB = 'isGrouped' in (b as any) && (b as any).isGrouped === true

				if (isGroupedRowA && isGroupedRowB) {
					// For grouped rows, sort by the group value
					valueA = (a as any).groupValue
					valueB = (b as any).groupValue
				} else if (typeof column.key === 'function') {
					valueA = column.key(a)
					valueB = column.key(b)
				} else {
					// Convert column.key to lowercase for case-insensitive property access
					const key = column.key as string

					// Type assertion to ensure TypeScript knows 'a' and 'b' are objects
					const aObj = a as Record<string, any>
					const bObj = b as Record<string, any>

					// Try to find a case-insensitive match for the key
					const normalizedKey = key
						? Object.keys(aObj).find((k) => k.toLowerCase() === key.toLowerCase())
						: undefined

					if (normalizedKey) {
						valueA = aObj[normalizedKey]
						valueB = bObj[normalizedKey]
					} else {
						valueA = aObj[key]
						valueB = bObj[key]
					}
				}

				// Use custom sort function if provided
				if (column.sortFn) {
					const result = column.sortFn(valueA, valueB)
					if (result !== 0) {
						return sort.desc ? -result : result
					}
				}
				// Default sorting logic
				else {
					// Handle string comparison
					if (typeof valueA === 'string' && typeof valueB === 'string') {
						const result = options.locale
							? valueA.localeCompare(valueB, options.locale)
							: valueA.localeCompare(valueB)
						if (result !== 0) {
							return sort.desc ? -result : result
						}
					}
					// Handle number comparison
					else if (typeof valueA === 'number' && typeof valueB === 'number') {
						const result = valueA - valueB
						if (result !== 0) {
							return sort.desc ? -result : result
						}
					}
					// Handle date comparison
					else if (valueA instanceof Date && valueB instanceof Date) {
						const result = valueA.getTime() - valueB.getTime()
						if (result !== 0) {
							return sort.desc ? -result : result
						}
					}
					// Handle boolean comparison
					else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
						const result = valueA === valueB ? 0 : valueA ? 1 : -1
						if (result !== 0) {
							return sort.desc ? -result : result
						}
					}
					// Handle null/undefined
					else if (valueA == null && valueB != null) {
						return sort.desc ? 1 : -1
					} else if (valueA != null && valueB == null) {
						return sort.desc ? -1 : 1
					}
				}
			}

			return 0
		}
	})

	// Sort the data using useSorted
	const sortedData = computed(() => {
		// First sort the main data
		const sortedMainData = useSorted(data, sortFunction.value).value

		// If sortChildren is enabled, also sort any child rows recursively
		const shouldSortChildren = options.sortChildren ?? false
		const childrenKey = (options as any).childrenKey || 'children'

		if (!shouldSortChildren) {
			return sortedMainData
		}

		// Helper function to recursively sort children
		const sortChildrenRecursively = (rows: any[]): any[] => {
			return rows.map((row) => {
				// Create a new row object to avoid mutating the original
				const newRow = { ...row }

				// If row has children, sort them recursively
				if (
					newRow[childrenKey] &&
					Array.isArray(newRow[childrenKey]) &&
					newRow[childrenKey].length > 0
				) {
					// Sort the children with the same sort function
					const sortedChildren = useSorted(newRow[childrenKey], sortFunction.value).value

					// Then recursively sort any grandchildren
					newRow[childrenKey] = sortChildrenRecursively(sortedChildren)
				}

				return newRow
			})
		}

		// Apply recursive sorting to the entire dataset
		return sortChildrenRecursively(sortedMainData)
	})

	// Toggle sort for a column
	const toggleSort = (columnId: string, event?: MouseEvent | KeyboardEvent) => {
		const column = findColumnById(columnId, columns.value)

		// If column is not sortable, do nothing
		if (!column || column.sortable === false) {
			return
		}

		// Find the column index for sorting by position
		const columnIndex = findColumnIndex(columnId, columns.value)

		// Check if the column is in the fixed sort list
		const fixedIndexById = fixedSortBy.findIndex((sort) => sort.id === columnId)
		const fixedIndexByPosition = fixedSortBy.findIndex((sort) => sort.index === columnIndex)
		const isFixedSort = fixedIndexById !== -1 || fixedIndexByPosition !== -1

		// If it's a fixed sort, we can only toggle its direction, not remove it
		if (isFixedSort) {
			const fixedIndex = fixedIndexById !== -1 ? fixedIndexById : fixedIndexByPosition
			const fixedSort = fixedSortBy[fixedIndex]!

			// Create a new array with the updated fixed sort
			const newFixedSortBy = [...fixedSortBy]
			newFixedSortBy[fixedIndex] = { ...fixedSort, desc: !fixedSort.desc }

			// Update the fixed sort by reference (since it's not reactive)
			fixedSortBy.splice(0, fixedSortBy.length, ...newFixedSortBy)
			return
		}

		// Check if the column is already being sorted by id in the user sort
		const indexById = userSortBy.value.findIndex((sort) => sort.id === columnId)

		// Check if the column is already being sorted by index in the user sort
		const indexByPosition = userSortBy.value.findIndex((sort) => sort.index === columnIndex)

		// Determine which index to use
		const index = indexById !== -1 ? indexById : indexByPosition

		// Check if Ctrl/Cmd key is pressed for multi-sort
		const isMultiSortKeyPressed = event && (event.ctrlKey || event.metaKey)
		const shouldMultiSort = options.multiSort || isMultiSortKeyPressed
		const shouldResetOthers = options.resetOtherSorts !== false && !shouldMultiSort

		// Create a new array to maintain reactivity
		let newUserSortBy = [...userSortBy.value]

		if (index === -1) {
			// Column is not being sorted, add it
			if (shouldResetOthers) {
				// Replace the current sort
				newUserSortBy = [{ id: columnId, index: columnIndex, desc: false }]
			} else {
				// Add to the sort array
				newUserSortBy.push({ id: columnId, index: columnIndex, desc: false })
			}
		} else {
			// Column is already being sorted
			if (newUserSortBy[index]!.desc) {
				// Check if alwaysSorted is enabled and we have only one sorted column
				const alwaysSorted = options.alwaysSorted !== false // Default to true
				const totalSorts = fixedSortBy.length + newUserSortBy.length

				if (alwaysSorted && totalSorts === 1) {
					// Don't remove the sort, toggle back to ascending
					const updatedSort = { ...newUserSortBy[index]!, desc: false }
					newUserSortBy[index] = updatedSort
				} else {
					// If it's already descending, remove it
					newUserSortBy.splice(index, 1)
				}
			} else {
				// Toggle to descending
				const updatedSort = { ...newUserSortBy[index]!, desc: true }

				if (shouldResetOthers) {
					newUserSortBy = [updatedSort]
				} else {
					newUserSortBy[index] = updatedSort
				}
			}
		}

		userSortBy.value = newUserSortBy
	}

	// Helper function to get all leaf columns (flattened)
	const getFlatColumns = (columnsToSearch: TableColumn<T>[]): TableColumn<T>[] => {
		return columnsToSearch.reduce((acc, col) => {
			if (col.columns?.length) {
				return [...acc, ...getFlatColumns(col.columns)]
			}
			return [...acc, col]
		}, [] as TableColumn<T>[])
	}

	// Helper function to find a column's index in the flattened columns array
	const findColumnIndex = (
		columnId: string | undefined,
		columnsToSearch: TableColumn<T>[],
	): number => {
		if (!columnId) return -1
		const flatColumns = getFlatColumns(columnsToSearch)
		return flatColumns.findIndex((col) => col.id === columnId)
	}

	// Clear all sorting (only clears user sort, fixed sort remains)
	const clearSort = () => {
		userSortBy.value = []
	}

	// Check if a column is sorted
	const isSorted = (columnId: string | undefined): boolean | 'asc' | 'desc' => {
		if (!columnId) return false

		// First check by id
		const indexById = sortBy.value.findIndex((sort) => sort.id === columnId)
		if (indexById !== -1) {
			return sortBy.value[indexById]!.desc ? 'desc' : 'asc'
		}

		// If not found by id, check by index
		const flatColumns = getFlatColumns(columns.value)
		const columnIndex = flatColumns.findIndex((col) => col.id === columnId)

		if (columnIndex !== -1) {
			const indexByPosition = sortBy.value.findIndex((sort) => sort.index === columnIndex)
			if (indexByPosition !== -1) {
				return sortBy.value[indexByPosition]!.desc ? 'desc' : 'asc'
			}
		}

		return false
	}

	return {
		sortBy,
		sortedData,
		toggleSort,
		clearSort,
		isSorted,
	}
}
