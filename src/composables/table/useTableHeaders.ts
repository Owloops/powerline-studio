import { computed, type Ref } from 'vue'
import type { TableColumn, HeaderGroup, Header, TableStyles } from '@/components/Table/types'
import { RIGHT_ALIGNED_FORMAT_TYPES } from '@/components/Table/types'

export interface UseTableHeadersOptions {
	/**
	 * Whether to enable column grouping (nested headers)
	 * This is automatically detected if columns have nested structure
	 * @default true
	 */
	enableGrouping?: boolean
}

export interface UseTableHeadersReturn {
	/**
	 * Get all header groups (rows of headers)
	 */
	getHeaderGroups: () => HeaderGroup[]

	/**
	 * Get all leaf headers (headers at the bottom level)
	 */
	getLeafHeaders: () => Header[]

	/**
	 * Get all flat headers (all headers in all rows)
	 */
	getFlatHeaders: () => Header[]

	/**
	 * Get classes for a header based on its state
	 */
	getHeaderClasses: (
		header: Header,
		styles: TableStyles,
		isSorted: (columnId: string) => boolean | 'asc' | 'desc',
	) => string[]

	/**
	 * Handle header click for sorting
	 */
	handleHeaderClick: (
		header: Header,
		toggleSort: (columnId: string, event?: MouseEvent | KeyboardEvent) => void,
		event?: MouseEvent | KeyboardEvent,
	) => void
}

/**
 * Composable for processing column definitions into header groups
 */
export function useTableHeaders<T = any>(
	columns: Ref<TableColumn<T>[]>,
	options: UseTableHeadersOptions = {},
): UseTableHeadersReturn {
	// Default options
	const defaultOptions: Required<UseTableHeadersOptions> = {
		enableGrouping: true,
	}

	// Merge options
	const mergedOptions = { ...defaultOptions, ...options }

	/**
	 * Build header groups with support for column grouping
	 */
	const headerGroups = computed<HeaderGroup[]>(() => {
		// If grouping is disabled, just create a single header group
		if (!mergedOptions.enableGrouping) {
			const headers = columns.value.map((column) => createHeader(column, 0, null))
			return [
				{
					id: 'header-group-0',
					depth: 0,
					headers,
				},
			]
		}

		// Calculate the maximum depth of the column tree
		const maxDepth = getMaxDepth(columns.value)

		// Initialize header groups array (one for each level of depth)
		const headerGroups: HeaderGroup[] = Array.from({ length: maxDepth }, (_, i) => ({
			id: `header-group-${i}`,
			depth: i,
			headers: [],
		}))

		// Create a balanced column structure by wrapping ungrouped columns in empty groups
		// to match the depth of grouped columns
		const balancedColumns: TableColumn<T>[] = []

		// Process all columns in their original order
		columns.value.forEach((column) => {
			if (column.columns?.length) {
				// Grouped columns can be added directly
				balancedColumns.push(column)
			} else {
				// For ungrouped columns, create wrapper groups to match the depth
				let currentColumn = column

				// Start from the bottom and work up to create the necessary wrapper groups
				for (let i = maxDepth - 2; i >= 0; i--) {
					// Create a wrapper group at this level
					const wrapper: TableColumn<T> = {
						id: `wrapper-${column.id}-level-${i}`,
						header: '', // Empty header for the wrapper
						columns: [currentColumn],
					}

					// Update the current column to be the wrapper for the next iteration
					currentColumn = wrapper
				}

				// Add the fully wrapped column to the balanced columns
				balancedColumns.push(currentColumn)
			}
		})

		// Process all columns with the balanced structure
		processColumns(balancedColumns, headerGroups, 0, null)

		return headerGroups
	})

	// Get all leaf headers (headers at the bottom level)
	const leafHeaders = computed<Header[]>(() => {
		const maxDepth = headerGroups.value.length - 1
		return headerGroups.value[maxDepth]?.headers || []
	})

	// Get all flat headers (all headers in all rows)
	const flatHeaders = computed<Header[]>(() => {
		return headerGroups.value.flatMap((group) => group.headers)
	})

	/**
	 * Helper function to check if a column format type should be right-aligned
	 */
	const isRightAlignedFormat = (formatType?: string): boolean => {
		return !!formatType && RIGHT_ALIGNED_FORMAT_TYPES.includes(formatType)
	}

	/**
	 * Get classes for a header based on its state
	 */
	const getHeaderClasses = (
		header: Header,
		styles: TableStyles,
		isSorted: (columnId: string) => boolean | 'asc' | 'desc',
	) => {
		const shouldWrap =
			header.column.headerWrap !== undefined
				? header.column.headerWrap
				: (header.column.wrap ?? false)

		let baseClass = styles.headerCell || ''
		if (shouldWrap) {
			baseClass = baseClass.replace(/\bwhitespace-nowrap\b/g, 'whitespace-normal')
		}

		return [
			baseClass,
			header.column.sortable && styles.headerCellSortable ? styles.headerCellSortable : '',
			isSorted(header.column.id) !== false && styles.headerCellSorted
				? styles.headerCellSorted
				: '',
			// Add text-right class for numeric columns
			isRightAlignedFormat(header.column.formatType) ? 'text-right' : '',
			// Include any custom class from the column definition
			typeof header.column.class === 'string' ? header.column.class : '',
		].filter(Boolean) // Filter out empty strings
	}

	/**
	 * Handle header click for sorting
	 */
	const handleHeaderClick = (
		header: Header,
		toggleSort: (columnId: string, event?: MouseEvent | KeyboardEvent) => void,
		event?: MouseEvent | KeyboardEvent,
	) => {
		if (header.column.sortable && !header.isPlaceholder) {
			toggleSort(header.column.id, event)
		}
	}

	// Return the header groups and utility functions
	return {
		getHeaderGroups: () => headerGroups.value,
		getLeafHeaders: () => leafHeaders.value,
		getFlatHeaders: () => flatHeaders.value,
		getHeaderClasses,
		handleHeaderClick,
	}
}

/**
 * Calculate the maximum depth of the column tree
 */
function getMaxDepth<T>(columns: TableColumn<T>[]): number {
	let maxDepth = 0

	for (const column of columns) {
		if (column.columns?.length) {
			// For group columns, the depth is 1 (for the group header) + the max depth of its children
			const childDepth = 1 + getMaxDepth(column.columns)
			maxDepth = Math.max(maxDepth, childDepth)
		} else {
			// For leaf columns, the depth is 1
			maxDepth = Math.max(maxDepth, 1)
		}
	}

	return maxDepth
}

/**
 * Process columns recursively to build header groups
 */
function processColumns<T>(
	columns: TableColumn<T>[],
	headerGroups: HeaderGroup[],
	depth: number,
	parentHeader: Header | null,
): void {
	const headerGroup = headerGroups[depth]!

	for (const column of columns) {
		// Create header for this column
		const header = createHeader(column, depth, parentHeader)

		// Set the headerGroup reference
		header.headerGroup = headerGroup

		// Add header to the current header group
		headerGroup.headers.push(header)

		// Process child columns if any
		if (column.columns?.length) {
			processColumns(column.columns, headerGroups, depth + 1, header)
		} else if (depth < headerGroups.length - 1) {
			// Create placeholder headers for leaf columns that don't reach the maximum depth
			createPlaceholderHeaders(column, header, headerGroups, depth + 1)
		}
	}
}

/**
 * Create a header object from a column definition
 */
function createHeader<T>(
	column: TableColumn<T>,
	depth: number,
	parentHeader: Header | null,
): Header {
	// Calculate colSpan based on the number of leaf columns
	const colSpan = getLeafCount(column)

	// Calculate rowSpan - if it's a leaf column, it should span all the way to the bottom
	let rowSpan = 1
	if (!column.columns?.length) {
		// For leaf columns, calculate how many rows it should span
		// This ensures leaf columns in the top row span all the way to the bottom
		rowSpan = getMaxDepth([column])
	}

	// Create the header object
	const header: Header = {
		id: `header-${column.id}-${depth}`,
		column,
		colSpan,
		rowSpan,
		depth,
		isPlaceholder: false,
		subHeaders: [],
		headerGroup: {} as HeaderGroup, // Will be set by the caller
	}

	// Set parent reference
	if (parentHeader) {
		parentHeader.subHeaders.push(header)
	}

	return header
}

/**
 * Create placeholder headers for leaf columns that don't reach the maximum depth
 * This is only needed for leaf columns that are in a row above the bottom row
 */
function createPlaceholderHeaders<T>(
	column: TableColumn<T>,
	parentHeader: Header,
	headerGroups: HeaderGroup[],
	startDepth: number,
): void {
	// Skip if the parent header already spans to the bottom
	if (parentHeader.rowSpan > 1) {
		return
	}

	// Only create a placeholder for the next row
	// This prevents creating unnecessary empty rows
	if (startDepth < headerGroups.length) {
		const headerGroup = headerGroups[startDepth]!

		// Create and link the placeholder header
		const placeholderHeader: Header = {
			id: `placeholder-${column.id}-${startDepth}`,
			column,
			colSpan: 1,
			rowSpan: 1,
			depth: startDepth,
			isPlaceholder: true,
			placeholderId: parentHeader.id,
			subHeaders: [],
			headerGroup: headerGroup,
		}

		// Add to header group and link to parent
		headerGroup.headers.push(placeholderHeader)
		parentHeader.subHeaders.push(placeholderHeader)
	}
}

/**
 * Get the number of leaf columns under a column
 */
function getLeafCount<T>(column: TableColumn<T>): number {
	if (!column.columns?.length) {
		return 1
	}

	return column.columns.reduce((count, subColumn) => {
		return count + getLeafCount(subColumn)
	}, 0)
}
