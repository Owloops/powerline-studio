import { computed, ref, type Ref, type ComputedRef } from 'vue'
import type { TableColumn } from '@/components/Table/types'

export interface UseTableGroupingOptions {
	/**
	 * Row grouping options
	 */
	grouping?: {
		/**
		 * Column ID or row property name to group by.
		 * Can be a column ID (matches column.id) or a direct property name on the row object.
		 */
		groupBy?: string | null

		/**
		 * Whether to enable row grouping
		 * @default false
		 */
		enabled?: boolean

		/**
		 * Whether to expand all groups by default
		 * @default false
		 */
		expandedByDefault?: boolean
	}
}

/**
 * Represents a grouped row in the table
 * @template T The type of the original data rows
 */
export interface GroupedRow<T = any> {
	/** Unique identifier for the group */
	id: string
	/** Flag indicating this is a group row */
	isGrouped: true
	/** Key used for grouping */
	groupKey: string
	/** Value of the grouped column */
	groupValue: any
	/** Number of rows in the group */
	groupSize: number
	/** Whether the group is expanded */
	isExpanded: boolean
	/** Level in the grouping hierarchy */
	level: number
	/** Rows in the group (only populated when expanded for rendering) */
	rows: T[]
	/** All rows in the group (always populated, regardless of expansion state) */
	allRows: T[]
	/** Original indices of rows in the data array */
	originalIndices: number[]
}

/**
 * Return type for the useTableGrouping composable
 * @template T The type of the data rows
 */
export interface UseTableGroupingReturn<T = any> {
	/**
	 * Current grouping column ID
	 */
	groupBy: Ref<string | null>

	/**
	 * Whether grouping is enabled
	 */
	groupingEnabled: Ref<boolean>

	/**
	 * Grouped data
	 */
	groupedData: ComputedRef<(T | GroupedRow<T>)[]>

	/**
	 * Set grouping column
	 */
	setGroupBy: (columnId: string | null) => void

	/**
	 * Toggle group expansion
	 */
	toggleGroupExpansion: (groupId: string) => void

	/**
	 * Expand all groups
	 */
	expandAllGroups: () => void

	/**
	 * Collapse all groups
	 */
	collapseAllGroups: () => void

	/**
	 * Get groupable columns
	 */
	getGroupableColumns: () => TableColumn<T>[]

	/**
	 * Check if a row is a group row
	 */
	isGroupRow: <R>(row: T | GroupedRow<R>) => row is GroupedRow<R>

	/**
	 * Get expanded state
	 */
	expandedGroups: Ref<Map<string, boolean>>
}

/**
 * Composable for table row grouping
 * @template T The type of the data rows
 * @param data Ref to the data array
 * @param columns Ref to the column definitions
 * @param options Grouping options
 * @returns Grouping functions and state
 */
export function useTableGrouping<T extends object = any>(
	data: Ref<T[]>,
	columns: Ref<TableColumn<T>[]>,
	options: UseTableGroupingOptions = {},
): UseTableGroupingReturn<T> {
	// Default options
	const defaultOptions: Required<UseTableGroupingOptions> = {
		grouping: {
			groupBy: null,
			enabled: false, // Grouping is disabled by default
			expandedByDefault: false, // Groups are closed by default
		},
	}

	// Merge options with defaults
	const mergedOptions = {
		grouping: {
			...defaultOptions.grouping,
			...options.grouping,
		},
	}

	// Grouping state
	const groupBy = ref<string | null>(mergedOptions.grouping.groupBy || null)
	const groupingEnabled = ref<boolean>(mergedOptions.grouping.enabled === true)
	const expandedGroups = ref<Map<string, boolean>>(new Map())

	// Get groupable columns
	const getGroupableColumns = () => {
		return columns.value.filter((column) => column.groupable !== false)
	}

	// Get column by ID
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

		const allColumns = flattenColumns(columns.value)
		return allColumns.find((col) => col.id === columnId)
	}

	// Get cell value for a column or direct property
	const getCellValue = (row: T, columnId: string): any => {
		const column = getColumnById(columnId)

		if (column) {
			// Use the key or accessor function to get the value
			if (typeof column.key === 'function') {
				return column.key(row)
			} else if (typeof column.key === 'string') {
				return (row as any)[column.key]
			}
		}

		// Fall back to treating columnId as a direct property name on the row
		// This allows grouping by fields that aren't visible columns
		if (columnId in (row as any)) {
			return (row as any)[columnId]
		}

		return undefined
	}

	// Group data by column
	const groupData = (rows: T[], columnId: string): (T | GroupedRow<T>)[] => {
		if (!columnId || !groupingEnabled.value) return rows

		// Add originalIndex to each row if not already present
		const rowsWithIndex = rows.map((row, index) => {
			if ('originalIndex' in row) return row
			return { ...row, originalIndex: index }
		})

		// Group rows by the column value
		const groups = Object.groupBy(rowsWithIndex, (row) => {
			const value = getCellValue(row, columnId)
			return String(value ?? 'null')
		})

		// Convert groups to array of GroupedRow objects
		return Object.entries(groups).map(([key, groupRows = []]) => {
			const rows = groupRows
			const isExpanded =
				expandedGroups.value.get(key) ?? Boolean(mergedOptions.grouping.expandedByDefault)

			// Get the actual value (not just the string key)
			const groupValue = rows.length > 0 ? getCellValue(rows[0]!, columnId) : null

			// Store all original indices
			const originalIndices = rows
				.map((row) => ('originalIndex' in row ? (row as any).originalIndex : -1))
				.filter((idx) => idx !== -1)

			// Create the group row
			const groupRow: GroupedRow<T> = {
				id: key,
				isGrouped: true,
				groupKey: key,
				groupValue,
				groupSize: rows.length,
				isExpanded,
				level: 0,
				rows: isExpanded ? rows : [], // Only include rows if expanded
				allRows: rows, // Always include all rows for selection/operations
				originalIndices,
			}

			// Store the expanded state
			expandedGroups.value.set(key, isExpanded)

			return groupRow
		})
	}

	// Grouped data with Vue's computed caching
	const groupedData = computed<(T | GroupedRow<T>)[]>(() => {
		// If grouping is disabled or no groupBy column, return the input data
		if (!groupingEnabled.value || !groupBy.value) {
			return [...data.value]
		}

		// Calculate and return grouped data
		return groupData(data.value, groupBy.value)
	})

	// Set grouping column
	const setGroupBy = (columnId: string | null) => {
		groupBy.value = columnId
	}

	// Toggle group expansion
	const toggleGroupExpansion = (groupId: string) => {
		// Get current expansion state
		const isCurrentlyExpanded = expandedGroups.value.get(groupId) ?? false

		// Create a new Map to maintain reactivity
		const newExpandedState = new Map(expandedGroups.value)
		newExpandedState.set(groupId, !isCurrentlyExpanded)
		expandedGroups.value = newExpandedState

		// Find the group in the current grouped data
		const updateGroupInPlace = (rows: (T | GroupedRow<T>)[]) => {
			for (const row of rows) {
				if (isGroupRow(row) && row.id === groupId) {
					// Toggle expansion state
					row.isExpanded = !isCurrentlyExpanded

					// Update rows based on new expansion state
					if (row.isExpanded) {
						// When expanding, populate with the original rows
						row.rows = data.value.filter((_, index) => row.originalIndices.includes(index))
					} else {
						// When collapsing, clear the rows
						row.rows = []
					}

					return true
				}
			}
			return false
		}

		// Try to update the group in-place
		updateGroupInPlace(groupedData.value)
	}

	// Expand all groups
	const expandAllGroups = () => {
		// Get all group IDs from the current grouped data
		const groupIds = groupedData.value
			.filter((row) => isGroupRow(row))
			.map((row) => (row as GroupedRow<T>).id)

		// Create a new Map with all groups expanded
		const newExpandedState = new Map<string, boolean>()
		groupIds.forEach((id) => newExpandedState.set(id, true))

		// Update the expanded state
		expandedGroups.value = newExpandedState

		// Update all groups in-place
		for (const row of groupedData.value) {
			if (isGroupRow(row)) {
				row.isExpanded = true
				row.rows = data.value.filter((_, index) => row.originalIndices.includes(index))
			}
		}
	}

	// Collapse all groups
	const collapseAllGroups = () => {
		// Simply clear all expanded states
		expandedGroups.value = new Map<string, boolean>()

		// Update all groups in-place
		for (const row of groupedData.value) {
			if (isGroupRow(row)) {
				row.isExpanded = false
				row.rows = []
			}
		}
	}

	// Type guard for group rows
	const isGroupRow = <R>(row: T | GroupedRow<R>): row is GroupedRow<R> => {
		return (row as any).isGrouped === true
	}

	return {
		groupBy,
		groupingEnabled,
		groupedData,
		setGroupBy,
		toggleGroupExpansion,
		expandAllGroups,
		collapseAllGroups,
		getGroupableColumns,
		isGroupRow,
		expandedGroups,
	}
}
