import { computed, nextTick, ref, unref, watch } from 'vue'
import type { Ref } from 'vue'

export interface UseTableExpansionOptions<T = any> {
	enabled?: boolean
	expandedByDefault?: boolean
	childrenKey?: string
	expandedContent?: 'children' | 'custom' | 'auto'
	getRowId?: (row: T, index?: number) => string
	canExpand?: (row: T) => boolean
	externalExpandedRows?: Ref<Record<string, boolean> | undefined>
	onExpandedRowsChange?: (expandedRows: Record<string, boolean>) => void
}

export function useTableExpansion<T = any>(
	data: Ref<T[]>,
	options: UseTableExpansionOptions<T> = {},
) {
	// Default options
	const {
		enabled = true,
		expandedByDefault = false,
		childrenKey = 'children',
		expandedContent = 'auto',
		getRowId = (row: any, index?: number) => {
			// Default ID generation - similar to useTableSelection's default
			if (row.id !== undefined) {
				return String(row.id)
			}
			// Fallback to index-based ID
			const idx =
				index !== undefined ? index : Array.isArray(data.value) ? data.value.indexOf(row) : -1
			return `row_${idx}`
		},
		canExpand = (row: any) => {
			// Consider a row expandable if it has children or if expandedContent is set to 'custom'
			if (expandedContent === 'custom') return true
			if (expandedContent === 'children') return !!row[childrenKey]?.length
			// For 'auto', check if row has children
			return !!row[childrenKey]?.length
		},
		externalExpandedRows,
		onExpandedRowsChange,
	} = options

	// Expansion state - record of row IDs to boolean expansion state
	const expandedRows = ref<Record<string, boolean>>({})

	// Guard to prevent external sync from overwriting data-watcher cleanup
	let suppressExternalSync = false

	// Sync external state into internal expandedRows
	if (externalExpandedRows) {
		watch(
			externalExpandedRows,
			(newVal) => {
				if (suppressExternalSync) return
				if (newVal !== undefined) {
					expandedRows.value = { ...newVal }
				}
			},
			{ immediate: true, deep: true },
		)
	}

	// Notify parent when expandedRows changes
	if (onExpandedRowsChange) {
		watch(
			expandedRows,
			(newVal) => {
				suppressExternalSync = true
				onExpandedRowsChange({ ...newVal })
				void nextTick(() => {
					suppressExternalSync = false
				})
			},
			{ deep: true },
		)
	}

	// Initialize expanded state for all rows
	const initializeExpanded = () => {
		const rawData = unref(data)
		if (!rawData?.length) return

		const newExpandedState: Record<string, boolean> = {}

		// Function to recursively process rows and their children
		const processRows = (rows: any[]) => {
			if (!rows) return

			for (const row of rows) {
				const id = getRowId(row)
				if (id) {
					newExpandedState[id] = true
				}

				// Process children recursively if they exist
				if (row[childrenKey] && Array.isArray(row[childrenKey])) {
					processRows(row[childrenKey])
				}
			}
		}

		processRows(rawData)
		expandedRows.value = newExpandedState
	}

	// Initialize expanded state if expandedByDefault is true
	if (expandedByDefault && enabled) {
		initializeExpanded()
	}

	// Build a set of all current row IDs (recursive through children)
	const currentRowIds = computed(() => {
		const ids = new Set<string>()
		const collectIds = (rows: any[]) => {
			if (!rows) return
			for (const row of rows) {
				const id = getRowId(row)
				if (id) ids.add(id)
				if (row[childrenKey] && Array.isArray(row[childrenKey])) {
					collectIds(row[childrenKey])
				}
			}
		}
		collectIds(unref(data))
		return ids
	})

	// Single data watcher: cleans stale keys and expands new rows when expandedByDefault is on
	watch(
		data,
		(newData) => {
			const current = expandedRows.value
			const validIds = currentRowIds.value
			const nextState: Record<string, boolean> = {}
			let changed = false

			// Keep only entries for IDs that still exist in the data
			for (const [id, expanded] of Object.entries(current)) {
				if (validIds.has(id)) {
					nextState[id] = expanded
				} else {
					changed = true
				}
			}

			// When expandedByDefault is active, expand any new rows not yet in state
			if (expandedByDefault && enabled && newData?.length) {
				const addNewRows = (rows: any[]) => {
					if (!rows) return
					for (const row of rows) {
						const id = getRowId(row)
						if (id && !(id in nextState)) {
							nextState[id] = true
							changed = true
						}
						if (row[childrenKey] && Array.isArray(row[childrenKey])) {
							addNewRows(row[childrenKey])
						}
					}
				}
				addNewRows(newData)
			}

			if (changed) {
				expandedRows.value = nextState
			}
		},
		{ deep: false },
	)

	// Check if row is expanded
	const isRowExpanded = (row: T): boolean => {
		const id = getRowId(row)
		return !!expandedRows.value[id]
	}

	// Toggle row expansion state
	const toggleRowExpansion = (row: T, expanded?: boolean): void => {
		if (!enabled) return

		const id = getRowId(row)
		if (id) {
			// If expanded is provided, use it; otherwise toggle current state
			const newState = expanded !== undefined ? expanded : !expandedRows.value[id]

			// Update the state
			expandedRows.value = {
				...expandedRows.value,
				[id]: newState,
			}
		}
	}

	// Check if row can be expanded
	const getRowCanExpand = (row: T): boolean => {
		return enabled && canExpand(row)
	}

	// Get row children
	const getRowChildren = (row: T): T[] => {
		return (row as any)[childrenKey] || []
	}

	// Check if row has children
	const hasRowChildren = (row: T): boolean => {
		const children = getRowChildren(row)
		return Array.isArray(children) && children.length > 0
	}

	// Get toggle handler for a row (used for event binding)
	const getToggleRowExpandedHandler = (row: T) => {
		return () => toggleRowExpansion(row)
	}

	// Determine the expansion type for a row
	const getRowExpansionType = (row: T): 'children' | 'custom' => {
		if (expandedContent === 'auto') {
			return hasRowChildren(row) ? 'children' : 'custom'
		}
		return expandedContent as 'children' | 'custom'
	}

	// Expand all rows
	const expandAllRows = (): void => {
		if (!enabled) return

		const rawData = unref(data)
		const newExpandedState: Record<string, boolean> = {}

		// Function to recursively process rows and their children
		const processRows = (rows: any[]) => {
			if (!rows) return

			for (const row of rows) {
				if (getRowCanExpand(row)) {
					const id = getRowId(row)
					if (id) {
						newExpandedState[id] = true
					}
				}

				// Process children recursively if they exist
				if (row[childrenKey] && Array.isArray(row[childrenKey])) {
					processRows(row[childrenKey])
				}
			}
		}

		processRows(rawData)
		expandedRows.value = newExpandedState
	}

	// Collapse all rows
	const collapseAllRows = (): void => {
		if (!enabled) return
		expandedRows.value = {}
	}

	// Generate expanded row model from the provided rows
	const getExpandedRowModel = (rows: T[]): T[] => {
		if (!enabled) return rows

		const result: T[] = []

		// Function to recursively add rows and their expanded children
		const processRow = (row: T, depth = 0, _parent: T | null = null) => {
			// Add the row itself
			result.push(row)

			// If the row is expanded and has children, add them recursively
			if (isRowExpanded(row) && getRowExpansionType(row) === 'children') {
				const children = getRowChildren(row)
				if (children.length > 0) {
					children.forEach((child) => processRow(child, depth + 1, row))
				}
			}
		}

		// Process all top-level rows
		rows.forEach((row) => processRow(row))

		return result
	}

	// Get the depth of expanded rows
	const getExpandedDepth = (): number => {
		let maxDepth = 0

		const processRows = (rows: T[], currentDepth = 0) => {
			maxDepth = Math.max(maxDepth, currentDepth)

			rows.forEach((row) => {
				if (isRowExpanded(row) && hasRowChildren(row)) {
					processRows(getRowChildren(row), currentDepth + 1)
				}
			})
		}

		processRows(unref(data))

		return maxDepth
	}

	// Check if any rows can be expanded
	const canSomeRowsExpand = computed(() => {
		const rows = unref(data)
		if (!rows || !enabled) return false

		// Function to recursively check rows
		const checkRows = (rowsToCheck: T[]): boolean => {
			for (const row of rowsToCheck) {
				if (getRowCanExpand(row)) return true

				// Check children recursively
				const children = getRowChildren(row)
				if (children.length > 0 && checkRows(children)) {
					return true
				}
			}
			return false
		}

		return checkRows(rows)
	})

	// Check if any rows are expanded (only counting rows that actually exist in current data)
	const isSomeRowsExpanded = computed(() => {
		return Object.entries(expandedRows.value).some(
			([id, exp]) => exp && currentRowIds.value.has(id),
		)
	})

	// Reset expanded state
	const resetExpanded = (defaultState?: boolean): void => {
		if (defaultState) {
			// Re-expand all expandable rows
			const newExpandedState: Record<string, boolean> = {}
			const processRows = (rows: any[]) => {
				if (!rows) return
				for (const row of rows) {
					if (getRowCanExpand(row)) {
						const id = getRowId(row)
						if (id) newExpandedState[id] = true
					}
					if (row[childrenKey] && Array.isArray(row[childrenKey])) {
						processRows(row[childrenKey])
					}
				}
			}
			processRows(unref(data))
			expandedRows.value = newExpandedState
		} else {
			expandedRows.value = {}
		}
	}

	return {
		// State
		expandedRows,

		// Methods
		toggleRowExpansion,
		isRowExpanded,
		getRowCanExpand,
		expandAllRows,
		collapseAllRows,
		getRowChildren,
		hasRowChildren,
		getExpandedRowModel,
		getToggleRowExpandedHandler,
		getRowExpansionType,
		getExpandedDepth,
		resetExpanded,

		// Computed
		canSomeRowsExpand,
		isSomeRowsExpanded,
	}
}
