import { computed, ref, watch, type Ref } from 'vue'
import type { TableColumn } from '@/components/Table/types'
import { type GroupedRow } from './useTableGrouping'

export interface UseTableSelectionOptions {
	/**
	 * Row selection options
	 */
	selection?: {
		/**
		 * Whether to enable row selection
		 * @default false
		 */
		enabled?: boolean

		/**
		 * Type of selection
		 * @default 'multiple'
		 */
		type?: 'single' | 'multiple'

		/**
		 * Enable row selection conditionally
		 * @default true
		 */
		enableRowSelection?: boolean | ((row: any) => boolean)

		/**
		 * Enable multiple row selection conditionally
		 * @default true
		 */
		enableMultiRowSelection?: boolean | ((row: any) => boolean)

		/**
		 * Auto-select sub-rows when parent is selected
		 * @default true
		 */
		enableSubRowSelection?: boolean

		/**
		 * Whether to automatically add a selection column
		 * @default true
		 */
		showSelectionColumn?: boolean
	}

	/**
	 * Property name to use for accessing child rows
	 * @default 'children'
	 */
	childrenKey?: string

	/**
	 * Custom function to generate unique row IDs
	 * @param row The row data object
	 * @param index Optional index of the row in the data array
	 * @returns A unique string ID for the row
	 * @default undefined (will use row.id, or fallback to index-based IDs)
	 */
	getRowId?: (row: any, index?: number) => string
}

/**
 * Row selection state, keyed by row id
 */
export type RowSelectionState = Record<string, boolean>

/**
 * Composable for table row selection
 * @template T The type of the data rows
 * @param data Ref to the data array
 * @param options Selection options
 * @returns Selection functions and state
 */
export function useTableSelection<T extends object = any>(
	data: Ref<T[]>,
	isGroupRow: (row: any) => row is GroupedRow<any>,
	options: UseTableSelectionOptions = {},
	columns: Ref<TableColumn<T>[]> = ref([]),
	filteredData?: Ref<T[]>, // Optional filtered data reference
) {
	// Default options
	const defaultOptions: Required<UseTableSelectionOptions> = {
		selection: {
			enabled: false,
			type: 'multiple',
			enableRowSelection: true,
			enableMultiRowSelection: true,
			enableSubRowSelection: true,
			showSelectionColumn: true,
		},
		childrenKey: 'children',
		getRowId: undefined as any, // We'll implement our own default logic
	}

	// Merge options with defaults
	const mergedOptions = {
		selection: {
			...defaultOptions.selection,
			...options.selection,
		},
		childrenKey: options.childrenKey || defaultOptions.childrenKey,
		getRowId: options.getRowId, // Store the user-provided getRowId function
	}

	// Get the childrenKey from merged options
	const childrenKey = mergedOptions.childrenKey

	// Selection state
	const rowSelection = ref<RowSelectionState>({})
	const selectionEnabled = ref<boolean>(mergedOptions.selection.enabled === true)
	const selectionType = ref<'single' | 'multiple'>(mergedOptions.selection.type || 'multiple')
	const enableSubRowSelection = ref<boolean>(
		mergedOptions.selection.enableSubRowSelection !== false,
	)

	// Derived states
	const selectedRowIds = computed(() =>
		Object.entries(rowSelection.value)
			.filter(([_, selected]) => selected)
			.map(([id]) => id),
	)

	/**
	 * Get all visible rows (flattened)
	 * When filtering is active, only filtered rows are considered visible
	 */
	const getAllRows = computed(() => {
		const rows: any[] = []

		// Use filtered data if available and not empty, otherwise use full data
		const sourceData =
			filteredData && filteredData.value.length > 0 ? filteredData.value : data.value

		const flattenRows = (rowsToFlatten: any[]) => {
			rowsToFlatten.forEach((row) => {
				rows.push(row)

				// If this is a group row and it's expanded
				if (isGroupRow(row) && row.isExpanded && row.rows?.length) {
					flattenRows(row.rows)
				}

				// Check for child rows in childrenKey property
				if (!isGroupRow(row) && row[childrenKey] && Array.isArray(row[childrenKey])) {
					flattenRows(row[childrenKey])
				}
			})
		}

		flattenRows(sourceData)
		return rows
	})

	// Cache for row IDs to avoid recalculating
	const rowIdCache = new Map<any, string>()

	/**
	 * Get a unique row ID (with caching)
	 */
	const getRowId = (row: any, index?: number): string => {
		// Check if we have a cached ID for this row
		if (rowIdCache.has(row)) {
			return rowIdCache.get(row)!
		}

		let rowId: string

		// If user provided a custom getRowId function, use it first
		if (mergedOptions.getRowId) {
			rowId = mergedOptions.getRowId(row, index)
		}
		// If it's a group row, use the group ID
		else if (isGroupRow(row)) {
			rowId = row.id
		}
		// If the row has an id property, use that as fallback
		else if (row.id !== undefined) {
			rowId = String(row.id)
		}
		// Otherwise, use the index with a prefix to ensure uniqueness
		else {
			const idx = index !== undefined ? index : data.value.indexOf(row)
			rowId = `row_${idx}`
		}

		// Cache the ID for future use
		rowIdCache.set(row, rowId)
		return rowId
	}

	// Clear the cache when data changes
	watch(
		() => data.value.length,
		() => {
			rowIdCache.clear()
		},
	)

	/**
	 * Check if a row can be selected
	 */
	const canSelectRow = (row: any): boolean => {
		const enableRowSelection = mergedOptions.selection.enableRowSelection
		if (typeof enableRowSelection === 'function') {
			return enableRowSelection(row)
		}
		return enableRowSelection !== false
	}

	/**
	 * Check if a row is currently selected
	 */
	const isRowSelected = (rowId: string): boolean => {
		return rowSelection.value[rowId] === true
	}

	/**
	 * Toggle row selection
	 */
	const toggleRowSelected = (rowId: string, value?: boolean): void => {
		const newValue = value ?? !rowSelection.value[rowId]

		// For single selection, clear all selected rows first
		if (newValue && selectionType.value === 'single') {
			rowSelection.value = {}
		}

		// Create a new object to maintain reactivity
		rowSelection.value = {
			...rowSelection.value,
			[rowId]: newValue,
		}
	}

	/**
	 * Get child row IDs for a group row
	 */
	const getChildrenIds = (row: GroupedRow<T>): string[] => {
		if (!isGroupRow(row)) return []

		// First, check if we have the allRows property (new approach)
		if ('allRows' in row && row.allRows && row.allRows.length > 0) {
			// Use the always-available allRows array
			return row.allRows.map((childRow) => getRowId(childRow))
		}

		// If we don't have allRows (for backward compatibility), try the rows array
		if (row.rows && row.rows.length > 0) {
			return row.rows.map((childRow) => getRowId(childRow))
		}

		// If we still don't have rows, use the original indices as a fallback
		if (row.originalIndices && row.originalIndices.length > 0) {
			return row.originalIndices
				.map((index) => {
					const childRow = data.value[index]
					if (childRow) {
						return getRowId(childRow, index)
					}
					return ''
				})
				.filter((id) => id !== '')
		}

		// General case with column lookup
		const columnId = row.groupKey
		const column = getColumnById(columnId)

		if (column) {
			// Handle string key accessor
			if (column.key && typeof column.key === 'string') {
				const keyString = column.key
				return data.value
					.filter((dataRow) => {
						const value = (dataRow as any)[keyString]
						return String(value) === String(row.groupValue)
					})
					.map((childRow) => getRowId(childRow))
			}

			// Handle function key accessor
			if (column.key && typeof column.key === 'function') {
				const keyFn = column.key
				return data.value
					.filter((dataRow) => {
						try {
							const value = keyFn(dataRow as T)
							return String(value) === String(row.groupValue)
						} catch (e) {
							console.error('Error in key function:', e)
							return false
						}
					})
					.map((childRow) => getRowId(childRow))
			}
		}

		// No results found
		return []
	}

	/**
	 * Get a column by its ID
	 */
	const getColumnById = (columnId: string): TableColumn<T> | undefined => {
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

		// Find the column by ID in the flattened list
		return flattenColumns(columns.value).find((col) => col.id === columnId)
	}

	/**
	 * Toggle selection for a row and all its children
	 */
	const toggleRowAndChildrenSelected = (row: any, value?: boolean) => {
		const rowId = getRowId(row)

		// If this is a group row, we need special handling
		if (isGroupRow(row) && enableSubRowSelection.value) {
			const childIds = getChildrenIds(row)

			// If no explicit value, determine it based on current state
			let newValue: boolean
			if (value !== undefined) {
				newValue = value
			} else {
				// If all children are selected, deselect all
				// If any children are not selected, select all
				const allChildrenSelected = childIds.every((id) => isRowSelected(id))
				newValue = !allChildrenSelected
			}

			// Apply the same selection state to the group row and all children
			toggleRowSelected(rowId, newValue)
			childIds.forEach((id) => toggleRowSelected(id, newValue))
		} else {
			// For regular rows, use the standard toggle behavior
			const newValue = value ?? !isRowSelected(rowId)
			toggleRowSelected(rowId, newValue)

			// If the row has children and sub-row selection is enabled
			if (enableSubRowSelection.value && row[childrenKey] && Array.isArray(row[childrenKey])) {
				// Apply the same selection state to all children
				row[childrenKey].forEach((childRow: any) => {
					const childId = getRowId(childRow)
					toggleRowSelected(childId, newValue)
				})
			}
		}
	}

	/**
	 * Check if a group row has indeterminate selection (some but not all children selected)
	 */
	const hasIndeterminateSelection = (row: GroupedRow<T>): boolean => {
		if (!isGroupRow(row)) return false

		const childIds = getChildrenIds(row)
		if (childIds.length === 0) return false

		const selectedCount = childIds.filter((id) => isRowSelected(id)).length
		return selectedCount > 0 && selectedCount < childIds.length
	}

	/**
	 * Check if all children of a group row are selected
	 */
	const areAllChildrenSelected = (row: GroupedRow<T>): boolean => {
		if (!isGroupRow(row)) return false

		const childIds = getChildrenIds(row)
		if (childIds.length === 0) return false

		return childIds.every((id) => isRowSelected(id))
	}

	/**
	 * Check if all rows are selected
	 */
	const isAllRowsSelected = computed(() => {
		const selectableRows = getAllRows.value.filter((row) => canSelectRow(row))
		if (selectableRows.length === 0) return false

		// For normal rows, check if they're selected
		// For group rows, they don't count themselves unless they have no children
		return selectableRows.every((row) => {
			if (isGroupRow(row)) {
				const childIds = getChildrenIds(row)
				return childIds.length === 0 ? isRowSelected(getRowId(row)) : areAllChildrenSelected(row)
			}

			// For rows with child rows in childrenKey
			if (row[childrenKey] && Array.isArray(row[childrenKey]) && row[childrenKey].length > 0) {
				// Check if all children are selected
				return row[childrenKey].every((childRow: any) => isRowSelected(getRowId(childRow)))
			}

			return isRowSelected(getRowId(row))
		})
	})

	/**
	 * Check if some but not all rows are selected
	 */
	const isSomeRowsSelected = computed(() => {
		const rows = getAllRows.value.filter((row) => canSelectRow(row))
		if (rows.length === 0) return false

		const allSelected = rows.every((row) => isRowSelected(getRowId(row)))
		const someSelected = rows.some((row) => isRowSelected(getRowId(row)))

		return someSelected && !allSelected
	})

	/**
	 * Update selection state for all rows
	 * This helper function ensures all rows have entries in the selection state
	 */
	const updateAllRowSelectionState = () => {
		const allRows = getAllRows.value.filter((row) => canSelectRow(row))
		const currentSelection = { ...rowSelection.value }

		// Process all rows, ensuring every row has an entry in the selection state
		allRows.forEach((row) => {
			const rowId = getRowId(row)

			// If it's a group row
			if (isGroupRow(row)) {
				// Ensure the group row has an entry (if it doesn't exist yet)
				if (currentSelection[rowId] === undefined) {
					currentSelection[rowId] = false
				}

				// Ensure all child rows have entries
				const childIds = getChildrenIds(row)
				childIds.forEach((childId) => {
					if (currentSelection[childId] === undefined) {
						currentSelection[childId] = false
					}
				})
			} else {
				// Ensure regular rows have entries
				if (currentSelection[rowId] === undefined) {
					currentSelection[rowId] = false
				}

				// Ensure child rows have entries
				if (row[childrenKey] && Array.isArray(row[childrenKey])) {
					row[childrenKey].forEach((childRow: any) => {
						const childId = getRowId(childRow)
						if (currentSelection[childId] === undefined) {
							currentSelection[childId] = false
						}
					})
				}
			}
		})

		rowSelection.value = currentSelection
	}

	// Initialize the selection state for all rows
	watch(
		getAllRows,
		() => {
			updateAllRowSelectionState()
		},
		{ immediate: true },
	)

	/**
	 * Toggle selection for all rows
	 */
	const toggleAllRowsSelected = (value?: boolean) => {
		// If explicit false is provided (especially from the header checkbox), immediately clear
		if (value === false) {
			rowSelection.value = {}
			return
		}

		// Determine the new value - if no value provided, toggle based on current state
		const newValue = value !== undefined ? value : !isAllRowsSelected.value

		// Fast path for deselection when toggling
		if (newValue === false) {
			rowSelection.value = {}
			return
		}

		// Otherwise for selection, we need to build a new selection state with all rows selected
		// First, ensure we have entries for all rows
		updateAllRowSelectionState()

		const allRows = getAllRows.value.filter((row) => canSelectRow(row))
		const newSelection: RowSelectionState = {}
		const processedIds = new Set<string>()

		// Process all visible rows and their children
		allRows.forEach((row) => {
			const rowId = getRowId(row)
			if (!processedIds.has(rowId)) {
				newSelection[rowId] = true
				processedIds.add(rowId)
			}

			// For group rows, also select all children
			if (isGroupRow(row)) {
				const childIds = getChildrenIds(row)
				childIds.forEach((childId) => {
					if (!processedIds.has(childId)) {
						newSelection[childId] = true
						processedIds.add(childId)
					}
				})
			}

			// For regular rows with child rows
			if (!isGroupRow(row) && row[childrenKey] && Array.isArray(row[childrenKey])) {
				row[childrenKey].forEach((childRow: any) => {
					const childId = getRowId(childRow)
					if (!processedIds.has(childId)) {
						newSelection[childId] = true
						processedIds.add(childId)
					}
				})
			}
		})

		// Set the new selection state
		rowSelection.value = newSelection
	}

	/**
	 * Get a handler function to toggle all rows selection
	 */
	const getToggleAllRowsSelectedHandler = () => {
		return () => toggleAllRowsSelected()
	}

	/**
	 * Recursively find all selected rows in data
	 */
	const findSelectedRowsRecursive = (rows: any[], selectedIdSet: Set<string>): any[] => {
		const result: any[] = []

		for (const row of rows) {
			const rowId = getRowId(row)
			if (selectedIdSet.has(rowId)) {
				result.push(row)
			}

			// Check child rows in childrenKey property
			if (row[childrenKey] && Array.isArray(row[childrenKey])) {
				const childSelectedRows = findSelectedRowsRecursive(row[childrenKey], selectedIdSet)
				result.push(...childSelectedRows)
			}
		}

		return result
	}

	/**
	 * Get all selected rows
	 */
	const getSelectedRowModel = () => {
		// Force a dependency on the rowSelection to maintain reactivity
		const currentSelection = { ...rowSelection.value }

		// Get the list of selected IDs
		const selectedIds = Object.entries(currentSelection)
			.filter(([_, selected]) => selected)
			.map(([id]) => id)

		if (selectedIds.length === 0) {
			return []
		}

		// Create a Set for faster lookups
		const selectedIdSet = new Set(selectedIds)

		// Recursively search for selected rows in the data
		return findSelectedRowsRecursive(data.value, selectedIdSet)
	}

	/**
	 * Get selected rows from a filtered dataset
	 */
	const getFilteredSelectedRowModel = (filteredData: T[]) => {
		// Force a dependency on the rowSelection to maintain reactivity
		const currentSelection = { ...rowSelection.value }

		// Get the list of selected IDs
		const selectedIds = Object.entries(currentSelection)
			.filter(([_, selected]) => selected)
			.map(([id]) => id)

		if (selectedIds.length === 0) {
			return []
		}

		// Create a Set for faster lookups
		const selectedIdSet = new Set(selectedIds)

		// Recursively search for selected rows in the filtered data
		return findSelectedRowsRecursive(filteredData, selectedIdSet)
	}

	return {
		// State
		rowSelection,
		selectionEnabled,

		// Row methods
		isRowSelected,
		canSelectRow,
		toggleRowSelected,

		// Group/parent row methods
		toggleRowAndChildrenSelected,
		hasIndeterminateSelection,
		areAllChildrenSelected,
		getChildrenIds,

		// Table methods
		isAllRowsSelected,
		isSomeRowsSelected,
		toggleAllRowsSelected,
		getToggleAllRowsSelectedHandler,

		// Row models
		getSelectedRowModel,
		getFilteredSelectedRowModel,

		// Utility
		getRowId,
		selectedRowIds,
	}
}
