import { ref, type Ref } from 'vue'
import type { TableColumn } from '@/components/Table/types'

// Define type for column visibility state
export type ColumnVisibilityState = Record<string, boolean>

export interface UseTableColumnVisibilityOptions {
	// Initial visibility state (used for initial setup only)
	initialState?: ColumnVisibilityState
	// Whether column visibility feature is enabled
	enabled?: boolean
}

export interface UseTableColumnVisibilityReturn {
	// Current visibility state
	columnVisibility: Ref<ColumnVisibilityState>
	// Whether column visibility feature is enabled
	enabledColumnVisibility: Ref<boolean>
	// Methods for manipulating visibility
	toggleColumnVisibility: (columnId: string, value?: boolean) => void
	setColumnVisibility: (
		updater: ColumnVisibilityState | ((state: ColumnVisibilityState) => ColumnVisibilityState),
	) => void
	resetColumnVisibility: (defaultState?: boolean) => void
	toggleAllColumnsVisible: (value?: boolean) => void
	// Status getter methods
	getIsColumnVisible: (columnId: string) => boolean
	getCanHideColumn: (column: TableColumn) => boolean
	getIsAllColumnsVisible: () => boolean
	getIsSomeColumnsVisible: () => boolean
	// Column filter methods
	getVisibleLeafColumns: (columns: TableColumn[]) => TableColumn[]
	getVisibleColumns: (columns: TableColumn[]) => TableColumn[]
}

/**
 * Hook for managing column visibility state
 */
export function useTableColumnVisibility<T = any>(
	columns: Ref<TableColumn<T>[]>,
	options: UseTableColumnVisibilityOptions = {},
): UseTableColumnVisibilityReturn {
	// Extract options with defaults
	const { initialState = {}, enabled = true } = options

	// Create initial state based on provided options
	const getInitialVisibilityState = (): ColumnVisibilityState => {
		return { ...initialState }
	}

	// Current visibility state
	const columnVisibility = ref<ColumnVisibilityState>(getInitialVisibilityState())
	const enabledColumnVisibility = ref(enabled)

	// Get all leaf column IDs including nested columns
	function getAllColumnIds(cols: TableColumn[]): string[] {
		return cols.flatMap((col) => {
			if (col.columns && col.columns.length) {
				return getAllColumnIds(col.columns)
			}
			return col.id
		})
	}

	// Get all leaf columns (columns without children)
	function getLeafColumns(cols: TableColumn[]): TableColumn[] {
		return cols.flatMap((col) => {
			if (col.columns && col.columns.length) {
				return getLeafColumns(col.columns)
			}
			return col
		})
	}

	// Toggle visibility for a specific column
	const toggleColumnVisibility = (columnId: string, value?: boolean) => {
		const currentValue = columnVisibility.value[columnId] ?? true
		const newValue = value !== undefined ? value : !currentValue

		// Update the state with the new value
		columnVisibility.value = {
			...columnVisibility.value,
			[columnId]: newValue,
		}
	}

	// Set visibility state for multiple columns at once
	const setColumnVisibility = (
		updater: ColumnVisibilityState | ((state: ColumnVisibilityState) => ColumnVisibilityState),
	) => {
		if (typeof updater === 'function') {
			columnVisibility.value = updater(columnVisibility.value)
		} else {
			columnVisibility.value = updater
		}
	}

	// Store the original column visibility state from initial setup
	const originalColumnVisibility = ref<ColumnVisibilityState>({})

	// Function to capture the original column visibility from column definitions
	// Called once during initialization to preserve the original column.visible values
	const captureOriginalVisibility = () => {
		const leafColumns = getLeafColumns(columns.value)
		leafColumns.forEach((column) => {
			// Store the original visible state (using true as default if not specified)
			originalColumnVisibility.value[column.id] =
				column.visible !== undefined ? column.visible : true
		})
	}

	// Call this immediately to capture the original state
	captureOriginalVisibility()

	// Reset visibility to initial or specified state
	const resetColumnVisibility = (defaultState?: boolean) => {
		if (defaultState !== undefined) {
			// Reset all columns to the specified default state
			const allColumnIds = getAllColumnIds(columns.value)
			const newState: ColumnVisibilityState = {}

			allColumnIds.forEach((id) => {
				newState[id] = defaultState
			})

			columnVisibility.value = newState
		} else {
			// Reset to the ORIGINAL state captured during initialization
			// Create a new state object to ensure reactivity
			const newState: ColumnVisibilityState = {}

			// Use the originalColumnVisibility captured at the beginning
			// This prevents using the potentially modified column.visible values
			for (const columnId in originalColumnVisibility.value) {
				newState[columnId] = originalColumnVisibility.value[columnId]!
			}

			// Set the new state
			columnVisibility.value = newState
		}
	}

	// Toggle all columns visible or hidden
	const toggleAllColumnsVisible = (value?: boolean) => {
		const allVisible = getIsAllColumnsVisible()
		const newVisibility = value !== undefined ? value : !allVisible

		// Get all leaf columns
		const leafColumns = getLeafColumns(columns.value)
		const newState: ColumnVisibilityState = { ...columnVisibility.value }

		// Update visibility for each column that can be hidden (skip export-only columns)
		leafColumns.forEach((column) => {
			if (!column.exportOnly && getCanHideColumn(column)) {
				newState[column.id] = newVisibility
			}
		})

		columnVisibility.value = newState
	}

	// Check if a column is visible
	const getIsColumnVisible = (columnId: string): boolean => {
		// First check if the column has explicit visibility set in the state
		if (columnId in columnVisibility.value) {
			return columnVisibility.value[columnId]!
		}

		// Next, check if the column has a visible property defined in its definition
		const allColumns = getLeafColumns(columns.value)
		const column = allColumns.find((col) => col.id === columnId)
		if (column && column.visible !== undefined) {
			return column.visible
		}

		// Columns are visible by default if nothing else specified
		return true
	}

	// Check if a column can be hidden (based on column options)
	const getCanHideColumn = (column: TableColumn): boolean => {
		// If enableHiding is explicitly set, use that
		if (column.enableHiding !== undefined) {
			return column.enableHiding
		}

		// Columns are hideable by default
		return true
	}

	// Check if all columns are visible
	const getIsAllColumnsVisible = (): boolean => {
		// Get all leaf columns
		const leafColumns = getLeafColumns(columns.value)

		// Check if any column that can be hidden is not visible (skip export-only columns)
		return !leafColumns.some(
			(column) => !column.exportOnly && getCanHideColumn(column) && !getIsColumnVisible(column.id),
		)
	}

	// Check if some columns are visible
	const getIsSomeColumnsVisible = (): boolean => {
		// Get all leaf columns
		const leafColumns = getLeafColumns(columns.value)

		// Check if any column is visible
		return leafColumns.some((column) => getIsColumnVisible(column.id))
	}

	// Filter visible leaf columns
	const getVisibleLeafColumns = (cols: TableColumn[]): TableColumn[] => {
		return getLeafColumns(cols).filter(
			(column) => !column.exportOnly && getIsColumnVisible(column.id),
		)
	}

	// Filter visible columns including parent columns
	const getVisibleColumns = (cols: TableColumn[]): TableColumn[] => {
		// A helper function to check if a column or any of its descendants are visible
		const isColumnOrDescendantsVisible = (column: TableColumn): boolean => {
			// If this is a leaf column, return its visibility (export-only columns are never visible in UI)
			if (!column.columns || column.columns.length === 0) {
				return !column.exportOnly && getIsColumnVisible(column.id)
			}

			// If it's a parent column, check if any of its descendants are visible
			return column.columns.some((childColumn) => isColumnOrDescendantsVisible(childColumn))
		}

		// Filter columns that are visible or have visible descendants
		return cols.filter(isColumnOrDescendantsVisible).map((column) => {
			// If it's a parent column, recursively filter its children
			if (column.columns && column.columns.length) {
				return {
					...column,
					columns: getVisibleColumns(column.columns),
				}
			}

			// Return leaf columns as is
			return column
		})
	}

	return {
		columnVisibility,
		enabledColumnVisibility,
		toggleColumnVisibility,
		setColumnVisibility,
		resetColumnVisibility,
		toggleAllColumnsVisible,
		getIsColumnVisible,
		getCanHideColumn,
		getIsAllColumnsVisible,
		getIsSomeColumnsVisible,
		getVisibleLeafColumns,
		getVisibleColumns,
	}
}
