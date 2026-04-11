<script setup lang="ts" generic="T">
import { computed, ref, toRefs, watch, reactive, provide } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type {
	TableColumn,
	TableOptions,
	SortBy,
	TableState,
	TableStyles,
	TableLanguage,
	Header,
	TableRowModels,
	GroupRowSlotProps,
	HeaderGroup,
	ExpandedRowSlotProps,
	RowClassFn,
} from './types'
import {
	useTableSort,
	useTablePagination,
	useTableFilter,
	useTableHeaders,
	useTableCells,
	useTableLanguage,
	useTableGrouping,
	useTableSelection,
	useTableColumnVisibility,
	useTableExpansion,
	useTableMetadata,
	type GroupedRow,
	type RowSelectionState,
} from '@/composables/table'
import TablePagination from './TablePagination.vue'
import TableFilter from './TableFilter.vue'
import TableHeader from './TableHeader.vue'
import TableBody from './TableBody.vue'
import TableRow from './TableRow.vue'
import TableColumnVisibility from './TableColumnVisibility.vue'
import TableExport from './TableExport.vue'
import { mergeStyles, defaultStyles, mergeOptions } from './defaults'

const props = defineProps({
	// Core data
	data: {
		type: Array,
		required: true,
	},
	columns: {
		type: Array as () => TableColumn[],
		required: true,
	},

	// Options
	options: {
		type: Object as () => TableOptions,
		default: () => ({}),
	},

	// State props (for v-model binding)
	filters: {
		type: Object,
		default: () => ({}),
	},
	globalFilter: {
		type: String,
		default: '',
	},
	pagination: {
		type: Object,
		default: () => ({}),
	},
	selection: {
		type: Array,
		default: () => [],
	},
	expanded: {
		type: Object,
		default: () => ({}),
	},
	expandedRows: {
		type: Object as () => Record<string, boolean> | undefined,
		default: undefined,
	},
	groupBy: {
		type: String,
		default: null,
	},
	columnVisibility: {
		type: Object,
		default: () => ({}),
	},
	metadata: {
		type: Object as () => Record<string, Record<string, any>> | null,
		default: null, // null means use internal metadata
	},
	rowModels: {
		type: Object as () => TableRowModels | null,
		default: null, // null means use internal row models
	},
	rowClass: {
		type: Function as unknown as () => RowClassFn | undefined,
		default: undefined, // Function to conditionally style rows: (row, index) => ClassValue
	},
})

const emit = defineEmits([
	'update:filters',
	'update:globalFilter',
	'update:pagination',
	'update:selection',
	'update:expanded',
	'update:expandedRows',
	'update:groupBy',
	'update:columnVisibility',
	'update:metadata',
	'update:rowModels',
	'row-click',
	'export-data',
])

// Define the slots with their respective props
const slots = defineSlots<{
	// Row and cell slots
	row: (props: { row: T; index: number; parent?: any }) => void
	'group-row': (props: GroupRowSlotProps<T>) => void
	'expanded-row': (props: ExpandedRowSlotProps<T>) => void
	'expansion-cell': (props: {
		row: T
		isExpanded: boolean
		canExpand: boolean
		toggleExpansion: () => void
	}) => any
	[key: `col-${string}`]: (props: {
		row: T
		originalRow: T
		metadata: Record<string, any>
		column: TableColumn<T>
		value: any
		rawValue: any
	}) => any

	// Header cell slots
	[key: `header-${string}`]: (props: {
		column: TableColumn<T>
		options: TableOptions
		headerGroups: HeaderGroup[]
		allRows: any[]
		filteredRows: any[]
		groupedRows: any[]
		paginatedRows: any[]
	}) => void

	// Selection slots
	'selection-cell': (props: {
		row: T
		metadata: Record<string, any>
		isSelected: boolean
		canSelect: boolean
		toggleSelected: () => void
		isIndeterminate?: boolean
	}) => void

	'selection-header': (props: {
		isAllSelected: boolean
		isSomeSelected: boolean
		toggleAllSelected: () => void
	}) => void

	'expansion-header': (props: { isSomeExpanded: boolean; toggleAllExpanded: () => void }) => void

	// Table structure slots
	controls: (props: {
		table: TableState
		setGlobalFilter: (filter: string) => void
		globalFilter: string
		clearFilters: (columns: boolean) => void
		expandAllGroups: () => void
		collapseAllGroups: () => void
	}) => void

	'custom-controls': (props: {
		table: TableState
		options: TableOptions
		rowModels: TableRowModels
		allRows: any[]
		filteredRows: any[]
		groupedRows: any[]
		paginatedRows: any[]
	}) => void

	'default-controls': (props: {
		table: TableState
		options: TableOptions
		rowModels: TableRowModels
		allRows: any[]
		filteredRows: any[]
		groupedRows: any[]
		paginatedRows: any[]
	}) => void

	header: (props: {
		columns: TableColumn<T>[]
		sort: SortBy[]
		headerGroups: HeaderGroup[]
	}) => void

	body: (props: { rows: T[] }) => void

	pagination: (props: {
		pagination: {
			page: number
			pageSize: number
			pageCount: number
			total: number
		}
		totalRows: number
		displayedRows: number
	}) => void

	// Footer slot with full table access
	footer: (props: {
		allRows: any[]
		paginatedRows: any[]
		filteredRows: any[]
		groupedRows: any[]
		columns: TableColumn<T>[]
		headerGroups: HeaderGroup[]
		getLeafHeaders: () => Header[]
		options: TableOptions
		state: TableState
		rowModels: TableRowModels
	}) => void
}>()

// Destructure props for reactivity
const { data, columns, options } = toRefs(props)

// Merge default options with global defaults and provided instance options
const tableOptions = computed(() => {
	return mergeOptions(options.value)
})

// Set default column visibility if not provided
if (tableOptions.value.columnVisibility === undefined) {
	tableOptions.value.columnVisibility = true
}

// Merge styles
const styles = computed(() => mergeStyles(tableOptions.value.styles))

// Set up language
const { language, formatLang, locale } = useTableLanguage({
	language: tableOptions.value.language,
	locale: tableOptions.value.formatting?.locale,
})

// Initialize formatting object if it doesn't exist to ensure we have proper
// formatting options available throughout the component
if (!tableOptions.value.formatting) {
	tableOptions.value.formatting = {}
}

// Create a modified data pipeline (sorting before grouping):
// getCoreRowModel -> getFilteredRowModel -> getSortedRowModel -> getGroupedRowModel -> getPaginationRowModel
// This allows us to sort the data before grouping, which means groups will be sorted correctly

// 1. Core Row Model (raw data)
const coreRowModel = computed(() => data.value)

// Set up cell handling early so we can use formatCellValue in filtering
const { getCellValue, formatCellValue, getFormatter } = useTableCells({
	formatting: tableOptions.value.formatting,
})

// 2. Set up filtering (before sorting and grouping)
const {
	globalFilter: globalFilterState,
	columnFilters: columnFiltersState,
	filteredData,
	setGlobalFilter,
	setColumnFilter,
	clearFilters,
	filterEnabled,
	getUniqueValues: getColumnUniqueValues,
	getMinMaxValues: getColumnMinMaxValues,
} = useTableFilter(coreRowModel, columns, {
	globalFilter: props.globalFilter || tableOptions.value.filtering?.globalFilter || '',
	columnFilters: props.filters || tableOptions.value.filtering?.filters || {},
	filterType: tableOptions.value.filtering?.type || 'fuzzy',
	enabled: tableOptions.value.filtering?.enabled !== false,
	// Pass expansion options to enable filtering on child rows
	childrenKey: tableOptions.value.expansion?.childrenKey || 'children',
	includeParentWhenChildMatches:
		tableOptions.value.filtering?.includeParentWhenChildMatches !== false,
	// Pass the formatter function for filtering on displayed values
	formatCellValue: formatCellValue,
	// Pass locale for sorting facet values
	locale: locale.value,
})

// Watch for changes in filters and emit update events
watch(globalFilterState, (newGlobalFilter) => {
	emit('update:globalFilter', newGlobalFilter)
})

watch(
	columnFiltersState,
	(newFilters) => {
		emit('update:filters', newFilters)
	},
	{ deep: true },
)

// Watch for changes in filtering options
watch(
	() => tableOptions.value.filtering,
	(newFilteringOptions) => {
		if (newFilteringOptions) {
			if (newFilteringOptions.globalFilter !== undefined && !props.globalFilter) {
				setGlobalFilter(newFilteringOptions.globalFilter)
			}
			if (newFilteringOptions.filters && !props.filters) {
				Object.entries(newFilteringOptions.filters).forEach(([key, value]) => {
					setColumnFilter(key, value)
				})
			}
		}
	},
	{ deep: true, immediate: true },
)

// 3. Set up sorting (after filtering, before grouping)
const {
	sortBy: sortByState,
	sortedData,
	toggleSort,
	isSorted,
} = useTableSort(filteredData, columns, {
	initialSort: tableOptions.value.sorting?.sortBy,
	fixedSortBy: tableOptions.value.sorting?.fixedSortBy,
	multiSort: tableOptions.value.sorting?.multiSort || false,
	resetOtherSorts: tableOptions.value.sorting?.resetOtherSorts !== false,
	sortChildren: tableOptions.value.sorting?.sortChildren || false,
	childrenKey: tableOptions.value.expansion?.childrenKey || 'children',
	locale: locale.value,
	alwaysSorted: tableOptions.value.sorting?.alwaysSorted,
})

// Set up grouping options
const getGroupingOptions = () => {
	return {
		grouping: {
			groupBy: tableOptions.value.grouping?.groupBy || props.groupBy,
			enabled: tableOptions.value.grouping?.enabled !== false,
			expandedByDefault: tableOptions.value.grouping?.expandedByDefault || false,
		},
	}
}

// 4. Set up grouping (after sorting)
const {
	groupBy: groupByState,
	groupingEnabled,
	groupedData,
	setGroupBy,
	toggleGroupExpansion,
	expandAllGroups,
	collapseAllGroups,
	getGroupableColumns,
	isGroupRow,
	expandedGroups,
} = useTableGrouping(sortedData, columns, getGroupingOptions())

// Convert Map to object for expanded groups state
const expandedGroupsObject = computed(() => {
	// Convert the Map to a plain object for the table state
	return Object.fromEntries(expandedGroups.value.entries())
})

// Watch for changes in groupBy and emit update event
watch(groupByState, (newGroupBy) => {
	emit('update:groupBy', newGroupBy)
})

// Watch for changes in options
watch(
	() => options.value.grouping,
	(newGroupingOptions) => {
		// Update grouping settings
		if (newGroupingOptions?.enabled !== undefined) {
			groupingEnabled.value = newGroupingOptions.enabled
		}
		if (newGroupingOptions?.groupBy !== undefined) {
			setGroupBy(newGroupingOptions.groupBy)
		}
	},
	{ deep: true, immediate: true },
)

// Watch for changes in expanded groups and emit update event
watch(
	expandedGroupsObject,
	(newExpandedGroups) => {
		emit('update:expanded', newExpandedGroups)
	},
	{ deep: true },
)

// 5. Set up pagination (final step in the pipeline)
const {
	currentPage,
	currentPageSize,
	pageCount,
	isFirstPage,
	isLastPage,
	prev,
	next,
	first,
	last,
	goToPage,
	paginatedData,
	paginationEnabled,
	totalRows,
	displayedRows,
	visiblePageNumbers,
	uiOptions,
} = useTablePagination(groupedData, {
	page: props.pagination.page || tableOptions.value.pagination?.page || 1,
	pageSize: props.pagination.pageSize || tableOptions.value.pagination?.pageSize || 10,
	enabled: tableOptions.value.pagination?.enabled !== false,
})

// Watch for changes in pagination and emit update event
watch(
	[currentPage, currentPageSize],
	([newPage, newPageSize]) => {
		emit('update:pagination', {
			page: newPage,
			pageSize: newPageSize,
		})
	},
	{ deep: true },
)

// Watch for changes in pagination options
watch(
	() => tableOptions.value.pagination,
	(newPaginationOptions) => {
		if (newPaginationOptions) {
			if (newPaginationOptions.page !== undefined && !props.pagination.page) {
				goToPage(newPaginationOptions.page)
			}
			if (newPaginationOptions.pageSize !== undefined && !props.pagination.pageSize) {
				currentPageSize.value = newPaginationOptions.pageSize
			}
		}
	},
	{ deep: true, immediate: true },
)

// Set up header groups - automatically detects nested headers
const { getHeaderGroups, getLeafHeaders, getHeaderClasses, handleHeaderClick } =
	useTableHeaders(columns)

// Header groups for rendering
const headerGroups = computed(() => getHeaderGroups())

// Final processed data - always use the end of the pipeline
const processedData = computed(() => paginatedData.value)

// Set up row selection
const {
	rowSelection,
	selectionEnabled,
	isRowSelected,
	canSelectRow,
	toggleRowSelected,
	toggleRowAndChildrenSelected,
	hasIndeterminateSelection,
	areAllChildrenSelected,
	getRowId,
	isAllRowsSelected,
	isSomeRowsSelected,
	toggleAllRowsSelected,
	getSelectedRowModel,
	getFilteredSelectedRowModel,
	selectedRowIds,
} = useTableSelection(
	data as any,
	isGroupRow,
	{
		selection: {
			enabled: tableOptions.value.selection?.enabled !== false,
			type: tableOptions.value.selection?.type || 'multiple',
			enableSubRowSelection: true,
		},
		childrenKey: tableOptions.value.expansion?.childrenKey || 'children',
		getRowId: tableOptions.value.getRowId,
	},
	columns, // Pass the columns reference to the selection hook
	filteredData, // Pass the filtered data for proper selection handling
)

// Set up row expansion
const expandedRowsRef = toRef(props, 'expandedRows')
const {
	expandedRows,
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
	resetExpanded,
	canSomeRowsExpand,
	isSomeRowsExpanded,
} = useTableExpansion(data as any, {
	enabled: tableOptions.value.expansion?.enabled !== false,
	expandedByDefault: tableOptions.value.expansion?.expandedByDefault || false,
	childrenKey: tableOptions.value.expansion?.childrenKey || 'children',
	expandedContent: tableOptions.value.expansion?.expandedContent || 'auto',
	getRowId: getRowId, // Reuse the same ID function from selection
	canExpand: tableOptions.value.expansion?.getRowCanExpand,
	externalExpandedRows: expandedRowsRef,
	onExpandedRowsChange: (v) => emit('update:expandedRows', v),
})

// Set up column visibility
const {
	columnVisibility: columnVisibilityState,
	enabledColumnVisibility,
	toggleColumnVisibility,
	setColumnVisibility,
	resetColumnVisibility,
	toggleAllColumnsVisible,
	getIsColumnVisible,
	getVisibleLeafColumns,
	getVisibleColumns,
} = useTableColumnVisibility(columns, {
	initialState:
		props.columnVisibility && Object.keys(props.columnVisibility).length > 0
			? props.columnVisibility
			: {},
	enabled: !!tableOptions.value.columnVisibility,
})

// Initialize column visibility state from column definitions and then apply state
const initializeColumnVisibility = () => {
	// First, collect all initial visibility settings from column definitions
	const initialState: Record<string, boolean> = {}

	const processColumn = (column: TableColumn) => {
		// If column has explicit visible property, use it for initial state
		if (column.visible !== undefined) {
			initialState[column.id] = column.visible
		}

		// Process nested columns recursively
		if (column.columns && column.columns.length) {
			column.columns.forEach(processColumn)
		}
	}

	// Process all columns to build the initial state
	columns.value.forEach(processColumn)

	// Merge with any existing state in columnVisibilityState
	// Priority: 1. Existing state from props, 2. Explicit visible property in column definition, 3. Default visibility
	const mergedState = {
		...initialState,
		...columnVisibilityState.value,
	}

	// Apply the merged state
	setColumnVisibility(mergedState)
}

// Synchronize column visibility states
const syncColumnVisibility = () => {
	const syncVisibilityToColumn = (column: TableColumn) => {
		// Skip exportOnly columns - their visibility should not be mutated by the toggle
		if (!column.exportOnly) {
			column.visible = getIsColumnVisible(column.id)
		}

		// Recursively process child columns
		if (column.columns && column.columns.length) {
			column.columns.forEach(syncVisibilityToColumn)
		}
	}

	// Process all top-level columns
	columns.value.forEach(syncVisibilityToColumn)
}

// Initialize on component mount
initializeColumnVisibility()

// Run sync whenever visibility state changes
watch(
	columnVisibilityState,
	() => {
		syncColumnVisibility()
	},
	{ deep: true },
)

// Watch for changes in columns prop to update visibility state
watch(
	columns,
	() => {
		// When columns change, we need to update the visibility state
		// based on the new column.visible properties
		const newVisibilityState: Record<string, boolean> = {}

		const processColumn = (column: TableColumn) => {
			// If column has explicit visible property, update the state
			if (column.visible !== undefined) {
				newVisibilityState[column.id] = column.visible
			}

			// Process nested columns recursively
			if (column.columns && column.columns.length) {
				column.columns.forEach(processColumn)
			}
		}

		// Process all columns to get their visibility
		columns.value.forEach(processColumn)

		// Merge the new visibility from columns with existing state
		// This preserves user changes while updating programmatic changes
		const currentState = { ...columnVisibilityState.value }

		// Update the state with new column visibility values
		Object.keys(newVisibilityState).forEach((columnId) => {
			currentState[columnId] = newVisibilityState[columnId]
		})

		// Apply the updated state
		setColumnVisibility(currentState)
	},
	{ deep: true },
)

// Watch for changes in column visibility and emit update event
watch(
	columnVisibilityState,
	(newColumnVisibility) => {
		emit('update:columnVisibility', newColumnVisibility)
	},
	{ deep: true },
)

// Table state
const tableState = computed<TableState>(() => ({
	sortBy: sortByState.value,
	filters: columnFiltersState.value,
	globalFilter: globalFilterState.value,
	pagination: {
		page: currentPage.value,
		pageSize: currentPageSize.value,
		pageCount: pageCount.value,
		total: totalRows.value,
	},
	selection: props.selection,
	expanded: expandedGroupsObject.value,
	expandedRows: expandedRows.value,
	groupBy: groupByState.value,
	columnVisibility: columnVisibilityState.value,
}))

// Create a mutable ref for row models data
const rowModelsData = ref<TableRowModels>({
	coreRowModel: [],
	filteredData: [],
	sortedData: [],
	groupedData: [],
	paginatedData: [],
	selectedRows: [],
	filteredSelectedRows: [],
})

// Check if we're using external rowModels (provided via props)
const rowModelsRef = toRef(props, 'rowModels')
const useExternalRowModels = computed(() => rowModelsRef.value !== null)

// Update the row models data when dependencies change
const updateRowModels = () => {
	// Get the selected rows and filtered selected rows
	const selectedRows = getSelectedRowModel()
	const filteredSelectedRows = getFilteredSelectedRowModel(filteredData.value)

	const updatedRowModels = {
		coreRowModel: coreRowModel.value,
		filteredData: filteredData.value,
		sortedData: sortedData.value,
		groupedData: groupedData.value,
		paginatedData: paginatedData.value,
		selectedRows: selectedRows,
		filteredSelectedRows: filteredSelectedRows,
	}

	// If we're using external rowModels, emit the update instead of updating internal state
	if (useExternalRowModels.value) {
		emit('update:rowModels', updatedRowModels)
	} else {
		rowModelsData.value = updatedRowModels
	}
}

// Watch for changes in pipeline data to update row models, but debounced
const updateRowModelsDebounced = useDebounceFn(updateRowModels, 50)

// Replace deep watchers with more targeted shallow watchers
watch(
	[
		() => coreRowModel.value.length,
		() => filteredData.value.length,
		() => sortedData.value.length,
		() => groupedData.value.length,
		() => paginatedData.value.length,
	],
	() => {
		updateRowModelsDebounced()
	},
	{ immediate: true },
)

// Watch for changes in selection and emit update event
watch(
	rowSelection,
	(newSelection) => {
		// Convert the selection state to an array of selected row IDs
		const selectedIds = Object.entries(newSelection)
			.filter(([_, isSelected]) => isSelected)
			.map(([id]) => id)

		emit('update:selection', selectedIds)

		// Update row models to ensure selected rows are up to date, but only if we have selections
		if (selectedIds.length > 0) {
			updateRowModelsDebounced()
		} else {
			// For empty selections, we can just clear the selection models without full recalculation
			rowModelsData.value = {
				...rowModelsData.value,
				selectedRows: [],
				filteredSelectedRows: [],
			}
		}
	},
	{ deep: true },
)

// Optimized external selection watch - defer execution for better performance
const updateSelectionFromProps = useDebounceFn((newSelection: any[]) => {
	if (!newSelection?.length) {
		// Fast path: just clear the selection object completely
		if (selectedRowIds.value.length > 0) {
			rowSelection.value = {}
		}
	} else {
		// Only update what changed to minimize object copying
		const selectedIdSet = new Set(newSelection)
		const currentState = rowSelection.value
		const changes: Record<string, boolean> = {}

		// Find IDs that need to change their state
		for (const id in currentState) {
			const shouldBeSelected = selectedIdSet.has(id)
			if (currentState[id] !== shouldBeSelected) {
				changes[id] = shouldBeSelected
			}
		}

		// Add any new IDs not in the current state
		newSelection.forEach((id) => {
			if (currentState[id] === undefined) {
				changes[id] = true
			}
		})

		// Apply all changes at once if we have any
		if (Object.keys(changes).length > 0) {
			rowSelection.value = {
				...currentState,
				...changes,
			}
		}
	}
}, 10) // Very short delay, just enough to batch changes

// Watch for external selection changes
watch(
	() => props.selection,
	(newSelection) => {
		updateSelectionFromProps(newSelection)
	},
	{ immediate: true },
)

// Watch for changes in selection options
watch(
	() => tableOptions.value.selection,
	(newSelectionOptions) => {
		if (newSelectionOptions) {
			selectionEnabled.value = newSelectionOptions.enabled !== false
		}
	},
	{ deep: true, immediate: true },
)

// Reference to the metadata prop for reactivity
const metadataRef = toRef(props, 'metadata')

// Set up centralized metadata management
const { getRowMetadata, setRowMetadata, clearRowMetadata, clearAllMetadata, allMetadata } =
	useTableMetadata(metadataRef, (event, value) => emit(event, value))

// Provide metadata functions to all child components
provide('tableMetadata', {
	getRowMetadata,
	setRowMetadata,
	clearRowMetadata,
	clearAllMetadata,
})

// Computed property for row models that uses either external or internal state
const rowModels = computed<TableRowModels>(() => {
	// If external rowModels are provided (via v-model:rowModels), use them
	if (useExternalRowModels.value) {
		return rowModelsRef.value!
	}

	// Otherwise use the internal state
	return rowModelsData.value
})

// Watch for external row model changes
watch(
	() => props.rowModels,
	(newRowModels) => {
		if (newRowModels && useExternalRowModels.value) {
			// External model has changed, trigger another update to ensure
			// everything is in sync
			updateRowModelsDebounced()
		}
	},
	{ deep: true },
)

// Create a direct getter for raw metadata to expose to external code
const rawMetadata = computed(() => allMetadata.value)

// Expose rowModels, column visibility, and metadata APIs to the template
defineExpose({
	rowModels,
	getVisibleLeafColumns,
	getVisibleColumns,
	getIsColumnVisible,
	toggleColumnVisibility,
	setColumnVisibility,
	resetColumnVisibility,
	toggleAllColumnsVisible,
	// Metadata access - expose the raw data for external access
	rawMetadata,
	getRowMetadata,
	setRowMetadata,
	clearRowMetadata,
	clearAllMetadata,
	// Expansion access
	expandedRows,
	isRowExpanded,
	toggleRowExpansion,
	expandAllRows,
	collapseAllRows,
	resetExpanded,
})

// Handle row click
const handleRowClick = (data: { row: any; index: number; event: Event }) => {
	emit('row-click', data)
}

const dynamicCellSlots = computed(() =>
	Object.keys(slots).filter((name) => name.startsWith('col-')),
)

// Get header cell slots (slots starting with "header-")
const dynamicHeaderSlots = computed(() =>
	Object.keys(slots).filter((name) => name.startsWith('header-')),
)

// Check if the custom-controls slot is provided
const hasCustomControls = computed(() => !!slots['custom-controls'])

// Map to store references to original rows by their IDs
const originalRowMap = computed(() => {
	const map = new Map<string, any>()

	// Recursive function to add rows and their children to the map
	const addRowsToMap = (rows: any[]) => {
		for (const row of rows) {
			const rowId = getRowId(row)
			map.set(rowId, row)

			// Process children if they exist
			const childrenKey = tableOptions.value.expansion?.childrenKey || 'children'
			if (row[childrenKey] && Array.isArray(row[childrenKey])) {
				addRowsToMap(row[childrenKey])
			}
		}
	}

	// Add all rows from the source data
	addRowsToMap(data.value)

	return map
})

// Lookup function to get original row
const getOriginalRow = (row: any): any => {
	const rowId = getRowId(row)
	return originalRowMap.value.get(rowId) || row
}
</script>

<template>
	<div :class="styles.container">
		<!-- Table controls wrapper -->
		<div :class="styles.controls?.wrapper">
			<!-- Table controls (filters, export buttons) -->
			<slot
				name="controls"
				:table="tableState"
				:setGlobalFilter="setGlobalFilter"
				:globalFilter="globalFilterState"
				:clearFilters="clearFilters"
				:expandAllGroups="expandAllGroups"
				:collapseAllGroups="collapseAllGroups"
			>
				<!-- Default controls -->
				<div :class="styles.controls?.container">
					<!-- Controls row -->
					<div :class="styles.controls?.row">
						<!-- Left side: Column visibility and export controls -->
						<div :class="styles.controls?.leftSection">
							<!-- Column visibility toggle -->
							<TableColumnVisibility
								:column-visibility="columnVisibilityState"
								:columns="columns"
								:column-visibility-enabled="enabledColumnVisibility"
								:styles="styles"
								:format-lang="formatLang"
								@update:column-visibility="setColumnVisibility"
								@toggle-column-visibility="toggleColumnVisibility"
								@toggle-all-columns="toggleAllColumnsVisible"
								@reset-column-visibility="resetColumnVisibility"
							/>
							<!-- Export buttons -->
							<TableExport
								:options="tableOptions"
								:columns="columns"
								:all-rows="coreRowModel"
								:filtered-rows="filteredData"
								:paginated-rows="processedData"
								:get-formatter="getFormatter"
							/>
						</div>

						<!-- Default controls slot between left and right sections -->
						<div :class="styles.controls?.defaultSection" v-if="$slots['default-controls']">
							<slot
								name="default-controls"
								:table="tableState"
								:options="tableOptions"
								:row-models="rowModels"
								:all-rows="coreRowModel"
								:filtered-rows="filteredData"
								:grouped-rows="groupedData"
								:paginated-rows="processedData"
							>
							</slot>
						</div>

						<!-- Right side: Search filter -->
						<div :class="styles.controls?.rightSection">
							<TableFilter
								:global-filter="globalFilterState"
								:column-filters="columnFiltersState"
								:filter-enabled="filterEnabled"
								:column-filters-enabled="tableOptions.filtering?.columnFilters !== false"
								:styles="styles"
								:format-lang="formatLang"
								@update:global-filter="setGlobalFilter"
								@clear-filters="clearFilters"
							/>
						</div>
					</div>
				</div>
				<!-- Custom controls area if slot is provided -->
				<div v-if="hasCustomControls" :class="styles.controls?.customControls">
					<slot
						name="custom-controls"
						:table="tableState"
						:options="tableOptions"
						:row-models="rowModels"
						:all-rows="coreRowModel"
						:filtered-rows="filteredData"
						:grouped-rows="groupedData"
						:paginated-rows="processedData"
					>
					</slot>
				</div>
			</slot>
		</div>
		<!-- Table container -->
		<div :class="styles.tableContainer">
			<table :class="styles.table">
				<!-- Table header -->
				<slot
					name="header"
					:columns="columns"
					:sort="tableState.sortBy"
					:headerGroups="headerGroups"
				>
					<TableHeader
						:header-groups="headerGroups"
						:data="data"
						:get-header-classes="getHeaderClasses"
						:handle-header-click="handleHeaderClick"
						:is-sorted="isSorted"
						:toggle-sort="toggleSort"
						:styles="styles"
						:options="tableOptions"
						:selection-enabled="selectionEnabled"
						:is-all-rows-selected="isAllRowsSelected"
						:is-some-rows-selected="isSomeRowsSelected"
						:toggle-all-rows-selected="toggleAllRowsSelected"
						:expansion-enabled="
							tableOptions.expansion?.enabled && tableOptions.expansion?.showExpandColumn
						"
						:is-some-rows-expanded="isSomeRowsExpanded"
						:toggle-all-rows-expanded="
							() => (isSomeRowsExpanded ? collapseAllRows() : expandAllRows())
						"
						:show-column-filters="tableOptions.filtering?.columnFilters !== false"
						:column-filters="columnFiltersState"
						:get-unique-values="(columnId, data) => getColumnUniqueValues(columnId, data)"
						:get-min-max-values="(columnId, data) => getColumnMinMaxValues(columnId, data)"
						:format-lang="formatLang"
						@update:column-filter="setColumnFilter"
						@clear-column-filter="(columnId) => setColumnFilter(columnId, undefined)"
					>
						<!-- Forward the selection-header slot -->
						<template #selection-header="slotProps">
							<slot name="selection-header" v-bind="slotProps"></slot>
						</template>

						<!-- Forward the expansion-header slot -->
						<template #expansion-header="slotProps">
							<slot name="expansion-header" v-bind="slotProps"></slot>
						</template>

						<template v-for="name in dynamicHeaderSlots" :key="name" #[name]="slotProps">
							<slot :name="name as keyof typeof slots" v-bind="slotProps"></slot>
						</template>
					</TableHeader>
				</slot>

				<!-- Table body -->
				<slot name="body" :rows="processedData">
					<TableBody
						:rows="processedData"
						:get-leaf-headers="getLeafHeaders"
						:get-cell-value="getCellValue"
						:format-cell-value="formatCellValue"
						:styles="styles"
						:is-group-row="isGroupRow"
						:toggle-group-expansion="toggleGroupExpansion"
						:selection-enabled="selectionEnabled"
						:is-row-selected="isRowSelected"
						:can-select-row="canSelectRow"
						:toggle-row-selected="toggleRowSelected"
						:toggle-row-and-children-selected="toggleRowAndChildrenSelected"
						:has-indeterminate-selection="hasIndeterminateSelection"
						:are-all-children-selected="areAllChildrenSelected"
						:get-row-id="getRowId"
						:expansion-enabled="
							tableOptions.expansion?.enabled && tableOptions.expansion?.showExpandColumn
						"
						:is-row-expanded="isRowExpanded"
						:get-row-expansion-type="getRowExpansionType"
						:get-row-children="getRowChildren"
						:get-toggle-row-expanded-handler="getToggleRowExpandedHandler"
						:get-row-can-expand="getRowCanExpand"
						:get-original-row="getOriginalRow"
						:get-row-metadata="getRowMetadata"
						:set-row-metadata="setRowMetadata"
						:row-class="rowClass"
						@row-click="handleRowClick"
					>
						<!-- Manually add slots with their props -->
						<template #row="slotProps">
							<slot name="row" v-bind="slotProps"></slot>
						</template>

						<!-- Forward the group-row slot -->
						<template #group-row="slotProps">
							<slot name="group-row" v-bind="slotProps"></slot>
						</template>

						<!-- Forward the selection-cell slot -->
						<template #selection-cell="slotProps">
							<slot name="selection-cell" v-bind="slotProps"></slot>
						</template>

						<!-- Forward the expansion-cell slot -->
						<template #expansion-cell="slotProps">
							<slot name="expansion-cell" v-bind="slotProps"></slot>
						</template>

						<!-- Forward the expanded-row slot -->
						<template #expanded-row="slotProps">
							<slot name="expanded-row" v-bind="slotProps"></slot>
						</template>

						<template v-for="name in dynamicCellSlots" :key="name" #[name]="slotProps">
							<slot :name="name as keyof typeof slots" v-bind="slotProps"></slot>
						</template>
					</TableBody>
				</slot>
				<!-- Table footer -->
				<slot
					name="footer"
					:all-rows="coreRowModel"
					:paginated-rows="processedData"
					:filtered-rows="filteredData"
					:grouped-rows="groupedData"
					:columns="columns"
					:header-groups="headerGroups"
					:get-leaf-headers="getLeafHeaders"
					:options="tableOptions"
					:state="tableState"
					:row-models="rowModels"
				></slot>
			</table>
		</div>

		<!-- Pagination -->
		<slot
			name="pagination"
			:pagination="tableState.pagination"
			:totalRows="totalRows"
			:displayedRows="displayedRows"
			v-if="paginationEnabled"
		>
			<TablePagination
				v-if="paginationEnabled"
				:current-page="currentPage"
				:page-count="pageCount"
				:current-page-size="currentPageSize"
				:page-size-options="tableOptions.pagination?.pageSizeOptions"
				:is-first-page="isFirstPage"
				:is-last-page="isLastPage"
				:total-rows="totalRows"
				:displayed-rows="displayedRows"
				:selected-rows-count="rowModels.selectedRows?.length || 0"
				:visible-page-numbers="visiblePageNumbers"
				:ui-options="uiOptions"
				:styles="styles"
				:format-lang="formatLang"
				@page-change="goToPage"
				@page-size-change="(size) => (currentPageSize = size)"
				@first="first"
				@last="last"
				@prev="prev"
				@next="next"
			/>
		</slot>
	</div>
</template>
