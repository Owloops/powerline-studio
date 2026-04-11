<script setup lang="ts" generic="T">
import { computed, inject } from 'vue'
import type { TableMetadataContext } from '@/composables/table'
import type { PropType } from 'vue'
import type {
	TableColumn,
	TableStyles,
	ExpandedRowSlotProps,
	RowClassFn,
	ClassValue,
} from './types'
import { icons } from './defaults'
import { type GroupedRow } from '@/composables/table'

const slots = defineSlots<{
	row: (props: { row: T; index: number; parent?: GroupedRow<T> }) => any
	'group-row': (props: {
		group: GroupedRow<T>
		toggleExpansion: () => void
		rows: T[]
		groupValue: any
		groupSize: number
		isExpanded: boolean
		groupKey: string
	}) => any
	'selection-cell': (props: {
		row: T
		metadata: Record<string, any>
		isSelected: boolean
		canSelect: boolean
		toggleSelected: () => void
		isIndeterminate?: boolean
	}) => any
	'expansion-cell': (props: {
		row: T
		isExpanded: boolean
		canExpand: boolean
		toggleExpansion: () => void
	}) => any
	'expanded-row': (props: ExpandedRowSlotProps<T>) => any
	[key: `col-${string}`]: (props: {
		row: T
		originalRow: T
		column: TableColumn
		value: any
		rawValue: any
		metadata: Record<string, any>
	}) => any
}>()

const props = withDefaults(
	defineProps<{
		// Core row data
		row: T

		// Row state and structure
		cells: any[]

		// Row expansion
		depth?: number
		parent?: any

		// Selection state
		isSelected?: boolean

		// Expansion state
		isExpanded?: boolean
		expansionType?: 'children' | 'custom'
		isRowExpanded?: (row: any) => boolean
		getRowExpansionType?: (row: any) => 'children' | 'custom'

		// Row functions
		getRowChildren: (row: any) => any[]
		getRowId: (row: any, index?: number) => string

		// Toggle functions
		toggleExpansion: (row: any) => void
		canExpand?: boolean

		// Selection functions
		isRowSelected?: (rowId: string) => boolean

		// Expansion functions (for child rows)
		getToggleRowExpandedHandler?: (row: any) => () => void

		// Direct row selection function
		toggleRowSelected: (rowId: string, value?: boolean) => void

		// Formatting and display
		getCellValue: (row: any, column: TableColumn) => any
		formatCellValue: (value: any, row: any, column: TableColumn) => any

		// Styles
		styles: TableStyles

		// Additional content
		rowAttributes?: Record<string, any>

		// Helper to get cell classes (with value and row for conditional styling)
		getCellClasses?: (column: TableColumn, value: any, row: T) => string[]

		// Conditional row styling function
		rowClass?: RowClassFn<T>

		// Row index for rowClass function
		rowIndex?: number

		// Function to get leaf headers
		getLeafHeaders?: () => { column: TableColumn }[]

		// Function to get original row reference
		getOriginalRow?: (row: any) => any

		// Functions to get and set row metadata
		getRowMetadata?: (rowId: string) => Record<string, any>
		setRowMetadata?: (rowId: string, key: string, value: any) => void

		// Function to determine if a row can expand
		getRowCanExpand?: (row: any) => boolean
	}>(),
	{
		depth: 0,
		parent: null,
		isSelected: false,
		isExpanded: false,
		expansionType: 'children',
		canExpand: false,
		rowAttributes: () => ({}),
		getCellClasses: () => [],
		getLeafHeaders: () => [],
		getRowMetadata: () => ({}),
		setRowMetadata: () => {},
		getOriginalRow: (row: any) => row,
		rowIndex: 0,
	},
)

const emit = defineEmits(['row-click'])

// Helper function to normalize ClassValue to string array
const normalizeClassValue = (value: ClassValue): string[] => {
	if (!value) return []
	if (typeof value === 'string') return [value]
	if (Array.isArray(value)) return value
	// Record<string, boolean> - return keys where value is true
	return Object.entries(value)
		.filter(([, v]) => v)
		.map(([k]) => k)
}

// Compute row classes based on state
const rowClasses = computed(() => {
	const classes = [
		props.styles.bodyRow,
		props.isSelected ? props.styles.bodyRowSelected : '',
		props.isExpanded ? props.styles.bodyRowExpanded : '',
		// Add indent class for child rows
		props.depth > 0 ? `depth-${props.depth}` : '',
	]

	// Add user's conditional row classes
	if (props.rowClass) {
		const userClasses = props.rowClass(props.row, props.rowIndex ?? 0)
		classes.push(...normalizeClassValue(userClasses))
	}

	return classes.filter(Boolean)
})

// Handle row click
const handleRowClick = (event: MouseEvent) => {
	emit('row-click', {
		row: props.row,
		event,
		depth: props.depth,
		parent: props.parent,
	})
}

// Compute props to pass to the expanded row slot
const expandedRowProps = computed(() => {
	return {
		row: props.row,
		depth: props.depth,
		parent: props.parent,
		toggleExpansion: () => props.toggleExpansion(props.row),
		isExpanded: props.isExpanded,
		expandedContent: props.expansionType,
	} as ExpandedRowSlotProps<any>
})

// Compute props to pass to the row slot
const rowProps = computed(() => {
	return {
		row: props.row,
		index: props.rowIndex ?? 0,
		parent: props.parent,
		depth: props.depth,
		isSelected: props.isSelected,
		isExpanded: props.isExpanded,
		toggleSelected: () => props.toggleRowSelected(props.getRowId(props.row)),
		toggleExpansion: () => props.toggleExpansion(props.row),
		canExpand: props.canExpand,
	}
})

// Get the actual children if expansionType is 'children'
const rowChildren = computed(() => {
	if (props.expansionType !== 'children') return []
	return props.getRowChildren(props.row)
})

// Inject metadata functions
const { getRowMetadata, setRowMetadata } = inject<TableMetadataContext>('tableMetadata', {
	getRowMetadata: () => ({}),
	setRowMetadata: () => null,
	clearRowMetadata: () => {},
	clearAllMetadata: () => {},
	allMetadata: computed(() => ({})),
})

// Compute the row ID once
const rowId = computed(() => props.getRowId(props.row))

const dynamicCellSlots = computed(() =>
	Object.keys(slots).filter((name) => name.startsWith('col-')),
)
</script>

<template>
	<!-- Main row -->
	<tr :class="rowClasses" @click="handleRowClick" v-bind="rowAttributes">
		<!-- Selection cell -->
		<td v-if="$slots['selection-cell']" :class="styles.bodyCell">
			<slot
				name="selection-cell"
				:row="row"
				:metadata="getRowMetadata(rowId)"
				:isSelected="isSelected"
				:canSelect="true"
				:toggleSelected="() => toggleRowSelected(rowId)"
			>
				<!-- Default selection cell content -->
				<div :class="styles.selectionContainer">
					<input
						type="checkbox"
						:checked="isSelected"
						:disabled="false"
						@click.stop="toggleRowSelected(getRowId(row))"
						:class="styles.checkbox"
					/>
				</div>
			</slot>
		</td>

		<!-- Expansion cell -->
		<td v-if="$slots['expansion-cell']" :class="styles.bodyCell">
			<slot
				name="expansion-cell"
				:row="row"
				:isExpanded="isExpanded"
				:canExpand="canExpand"
				:toggleExpansion="() => toggleExpansion(row)"
			>
				<!-- Default expansion cell content -->
				<div
					:class="[
						'flex items-center justify-center w-6',
						styles.expansionContainer,
						{ 'cursor-pointer': canExpand },
					]"
					@click.stop="canExpand ? toggleExpansion(row) : null"
				>
					<span v-if="canExpand" :class="['expansion-icon', styles.expansionIcon]">
						<template v-if="icons.expanded && icons.collapsed">
							<div v-html="isExpanded ? icons.expanded : icons.collapsed"></div>
						</template>
					</span>
				</div>
			</slot>
		</td>

		<!-- Default rendering of cells -->
		<slot name="row" v-bind="rowProps">
			<td
				v-for="(cell, cellIndex) in cells"
				:key="cellIndex"
				:class="getCellClasses(cell.column, getCellValue(row, cell.column), row)"
			>
				<!-- Use column-specific slot if available -->
				<slot
					:name="`col-${cell.column.id}`"
					:row="row"
					:originalRow="getOriginalRow(row)"
					:metadata="getRowMetadata(rowId)"
					:column="cell.column"
					:value="formatCellValue(getCellValue(row, cell.column), row, cell.column)"
					:raw-value="getCellValue(row, cell.column)"
				>
					<!-- Use v-html for formatters that output HTML (url, email) -->
					<span
						v-if="cell.column.formatType === 'url' || cell.column.formatType === 'email'"
						v-html="formatCellValue(getCellValue(row, cell.column), row, cell.column)"
					>
					</span>
					<span v-else>
						{{ formatCellValue(getCellValue(row, cell.column), row, cell.column) }}
					</span>
				</slot>
			</td>
		</slot>
	</tr>

	<!-- Expanded content when expanded -->
	<template v-if="isExpanded">
		<!-- Case 1: Show child rows when expansionType is 'children' -->
		<template v-if="expansionType === 'children' && rowChildren.length > 0">
			<TableRow
				v-for="(childRow, childRowIndex) in rowChildren"
				:key="getRowId(childRow)"
				:row="childRow"
				:cells="cells"
				:depth="depth + 1"
				:parent="row"
				:is-selected="isRowSelected ? isRowSelected(getRowId(childRow)) : false"
				:get-row-children="getRowChildren"
				:get-row-id="getRowId"
				:get-cell-value="getCellValue"
				:format-cell-value="formatCellValue"
				:styles="styles"
				:get-cell-classes="getCellClasses"
				:toggle-expansion="
					getToggleRowExpandedHandler ? getToggleRowExpandedHandler(childRow) : () => {}
				"
				:is-expanded="isRowExpanded ? isRowExpanded(childRow) : false"
				:is-row-expanded="isRowExpanded"
				:expansion-type="getRowExpansionType ? getRowExpansionType(childRow) : 'children'"
				:get-row-expansion-type="getRowExpansionType"
				:toggle-row-selected="toggleRowSelected"
				:can-expand="
					props.getRowCanExpand
						? props.getRowCanExpand(childRow)
						: getRowChildren(childRow).length > 0
				"
				:is-row-selected="isRowSelected"
				:get-toggle-row-expanded-handler="getToggleRowExpandedHandler"
				:get-row-metadata="getRowMetadata"
				:set-row-metadata="setRowMetadata"
				:get-row-can-expand="getRowCanExpand"
				:row-class="rowClass"
				:row-index="childRowIndex"
				@row-click="$emit('row-click', $event)"
			>
				<!-- Forward key slots -->
				<template v-if="$slots['selection-cell']" #selection-cell="slotProps: any">
					<slot name="selection-cell" v-bind="slotProps"></slot>
				</template>

				<template v-if="$slots['expansion-cell']" #expansion-cell="slotProps: any">
					<slot name="expansion-cell" v-bind="slotProps"></slot>
				</template>

				<!-- Forward specific column slots -->
				<template v-for="name in dynamicCellSlots" :key="name" #[name]="slotProps">
					<slot :name="name as keyof typeof slots" v-bind="slotProps"></slot>
				</template>
			</TableRow>
		</template>

		<!-- Case 2: Show custom expanded content when expansionType is 'custom' -->
		<tr v-else-if="expansionType === 'custom'" class="expanded-content-row border-b border-border">
			<td
				:colspan="
					cells.length + ($slots['selection-cell'] ? 1 : 0) + ($slots['expansion-cell'] ? 1 : 0)
				"
				class="expanded-content-cell"
			>
				<slot name="expanded-row" v-bind="expandedRowProps">
					<!-- Default expanded content -->
					<div class="expanded-content-default">
						<p>No expanded content slot provided</p>
					</div>
				</slot>
			</td>
		</tr>
	</template>
</template>
