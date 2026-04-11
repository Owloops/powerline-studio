<script setup lang="ts" generic="T">
import { computed } from 'vue'
import type {
	TableStyles,
	Header,
	TableColumn,
	ExpandedRowSlotProps,
	RowClassFn,
	ClassValue,
} from './types'
import { RIGHT_ALIGNED_FORMAT_TYPES } from './types'
import { type GroupedRow } from '@/composables/table'
import TableRow from './TableRow.vue'

// Define props with generic type
const props = defineProps<{
	// Processed data to display
	rows: T[]

	// Function to get leaf headers
	getLeafHeaders: () => Header[]

	// Function to get cell value
	getCellValue: (row: any, column: TableColumn) => any

	// Function to format cell value
	formatCellValue: (value: any, row: any, column: TableColumn) => any

	// Styles for the table
	styles: TableStyles

	// Function to check if a row is a group row
	isGroupRow?: (row: any) => row is GroupedRow

	// Function to toggle group expansion
	toggleGroupExpansion?: (groupId: string) => void

	// Selection props
	selectionEnabled?: boolean
	isRowSelected?: (rowId: string) => boolean
	canSelectRow?: (row: any) => boolean
	toggleRowSelected?: (rowId: string, value?: boolean) => void
	toggleRowAndChildrenSelected?: (row: any, value?: boolean) => void
	hasIndeterminateSelection?: (row: GroupedRow<T>) => boolean
	areAllChildrenSelected?: (row: GroupedRow<T>) => boolean
	getRowId?: (row: any, index?: number) => string

	// Expansion column prop
	expansionEnabled?: boolean
	isRowExpanded?: (row: any) => boolean
	getRowExpansionType?: (row: any) => 'children' | 'custom'
	getRowChildren?: (row: any) => any[]
	getToggleRowExpandedHandler?: (row: any) => () => void
	getRowCanExpand?: (row: any) => boolean

	// Function to get original row reference
	getOriginalRow?: (row: any) => any

	// Functions to get and set row metadata
	getRowMetadata?: (rowId: string) => Record<string, any>
	setRowMetadata?: (rowId: string, key: string, value: any) => void

	// Conditional row styling
	rowClass?: RowClassFn<T>
}>()

// Set default values for optional props
const isGroupRow = props.isGroupRow || (() => false)
const toggleGroupExpansion = props.toggleGroupExpansion || (() => {})
const selectionEnabled = props.selectionEnabled || false
const isRowSelected = props.isRowSelected || (() => false)
const canSelectRow = props.canSelectRow || (() => true)
const toggleRowSelected = props.toggleRowSelected || (() => {})
const toggleRowAndChildrenSelected = props.toggleRowAndChildrenSelected || (() => {})
const hasIndeterminateSelection = props.hasIndeterminateSelection || (() => false)
const areAllChildrenSelected = props.areAllChildrenSelected || (() => false)
const getRowId = props.getRowId || ((_, index) => String(index))
const getOriginalRow = props.getOriginalRow || ((row: any) => row)
const getRowMetadata = props.getRowMetadata || (() => ({}))
const setRowMetadata = props.setRowMetadata || (() => {})

// Define slot types with generic type
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

const emit = defineEmits<{
	'row-click': [{ row: T; index: number; event: Event }]
}>()

// Handle row click
const handleRowClick = (row: T, index: number, event: Event) => {
	emit('row-click', { row, index, event })
}

// Helper function to check if a column format type should be right-aligned
const isRightAlignedFormat = (formatType?: string): boolean => {
	return !!formatType && RIGHT_ALIGNED_FORMAT_TYPES.includes(formatType)
}

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

// Helper function to compute cell classes with support for function-based column.class
const computeCellClasses = (column: TableColumn, value: any, row: T): string[] => {
	const classes: string[] = []

	// Base cell style, with wrap override if column.wrap is true
	let baseClass = props.styles.bodyCell || ''
	if (column.wrap) {
		baseClass = baseClass.replace(/\bwhitespace-nowrap\b/g, 'whitespace-normal')
	}
	if (baseClass) classes.push(baseClass)

	// Column class - can be string or function
	if (column.class) {
		if (typeof column.class === 'function') {
			const dynamicClasses = column.class(value, row, column)
			classes.push(...normalizeClassValue(dynamicClasses))
		} else {
			classes.push(column.class)
		}
	}

	// Right alignment for numeric/date formats
	if (isRightAlignedFormat(column.formatType)) {
		classes.push('text-right')
	}

	return classes.filter(Boolean)
}

const dynamicCellSlots = computed(() =>
	Object.keys(slots).filter((name) => name.startsWith('col-')),
)
</script>

<template>
	<tbody :class="styles.tbody">
		<template v-for="(row, rowIndex) in rows" :key="rowIndex">
			<!-- Group row rendering -->
			<tr
				v-if="isGroupRow(row)"
				:class="[
					styles.bodyRow,
					styles.bodyRowHover,
					styles.grouping?.groupRow,
					{ [styles.bodyRowSelected as string]: isRowSelected(row.id) },
				]"
			>
				<!-- Selection cell for group row if selection is enabled -->
				<td v-if="selectionEnabled" :class="[styles.bodyCell, styles.grouping?.groupCell]">
					<slot
						name="selection-cell"
						:row="row"
						:metadata="getRowMetadata(row.id)"
						:isSelected="
							areAllChildrenSelected ? areAllChildrenSelected(row) : isRowSelected(row.id)
						"
						:canSelect="canSelectRow(row)"
						:toggleSelected="() => toggleRowAndChildrenSelected(row)"
						:isIndeterminate="hasIndeterminateSelection(row)"
					>
						<div :class="styles.selectionContainer">
							<input
								type="checkbox"
								:checked="
									areAllChildrenSelected ? areAllChildrenSelected(row) : isRowSelected(row.id)
								"
								:indeterminate="hasIndeterminateSelection(row)"
								:disabled="!canSelectRow(row)"
								@click.stop="toggleRowAndChildrenSelected(row)"
								:class="styles.checkbox"
							/>
						</div>
					</slot>
				</td>

				<!-- Expansion cell for group row if expansion is enabled -->
				<td v-if="expansionEnabled" :class="[styles.bodyCell, styles.grouping?.groupCell]">
					<!-- For groups, we use the toggle expansion integrated with the group row -->
					<div class="flex items-center justify-center w-6"></div>
				</td>

				<td
					:colspan="
						getLeafHeaders().filter((h) => h.column.visible !== false).length -
						(selectionEnabled ? 1 : 0) -
						(expansionEnabled ? 1 : 0)
					"
					:class="[styles.bodyCell, styles.grouping?.groupCell]"
				>
					<slot
						name="group-row"
						:group="row"
						:toggleExpansion="() => toggleGroupExpansion(row.id)"
						:rows="row.rows"
						:groupValue="row.groupValue"
						:groupSize="row.groupSize"
						:isExpanded="row.isExpanded"
						:groupKey="row.groupKey"
					>
						<div class="flex items-center" @click="toggleGroupExpansion(row.id)">
							<!-- Expand/collapse icon -->
							<span :class="styles.grouping?.groupIcon" @click.stop="toggleGroupExpansion(row.id)">
								{{ row.isExpanded ? '▼' : '▶' }}
							</span>

							<!-- Group value -->
							<span>
								{{ row.groupValue }}
							</span>

							<!-- Group count -->
							<span :class="styles.grouping?.groupCount"> ({{ row.groupSize }}) </span>
						</div>
					</slot>
				</td>
			</tr>

			<!-- Child rows if group is expanded -->
			<template v-if="isGroupRow(row) && row.isExpanded">
				<!-- Use TableRow for child rows as well for consistency -->
				<TableRow
					v-for="(childRow, childIndex) in row.rows"
					:key="`${rowIndex}-${childIndex}`"
					:row="childRow"
					:cells="
						getLeafHeaders()
							.filter((header) => header.column.visible !== false)
							.map((header) => ({
								header: header,
								column: header.column,
							}))
					"
					:depth="1"
					:parent="row"
					:is-selected="isRowSelected(getRowId(childRow, childIndex))"
					:is-expanded="isRowExpanded ? isRowExpanded(childRow) : false"
					:is-row-expanded="isRowExpanded"
					:expansion-type="getRowExpansionType ? getRowExpansionType(childRow) : 'children'"
					:get-row-expansion-type="getRowExpansionType"
					:get-row-children="getRowChildren || (() => [])"
					:get-row-id="getRowId"
					:toggle-expansion="
						getToggleRowExpandedHandler ? getToggleRowExpandedHandler(childRow) : () => {}
					"
					:toggle-row-selected="toggleRowSelected"
					:can-expand="
						getRowCanExpand
							? getRowCanExpand(childRow)
							: getRowChildren && getRowChildren(childRow) && getRowChildren(childRow).length > 0
					"
					:is-row-selected="isRowSelected"
					:get-toggle-row-expanded-handler="getToggleRowExpandedHandler"
					:get-cell-value="getCellValue"
					:format-cell-value="formatCellValue"
					:styles="styles"
					:row-attributes="{}"
					:get-cell-classes="(column, value, r) => computeCellClasses(column, value, r)"
					:get-original-row="getOriginalRow"
					:get-row-can-expand="getRowCanExpand"
					:row-class="props.rowClass"
					:row-index="childIndex"
					@row-click="(data: any) => handleRowClick(data.row, childIndex, data.event)"
				>
					<!-- Forward the selection-cell slot -->
					<template v-if="selectionEnabled" #selection-cell="slotProps">
						<slot name="selection-cell" v-bind="slotProps"></slot>
					</template>

					<!-- Forward the expansion-cell slot -->
					<template v-if="expansionEnabled" #expansion-cell="slotProps">
						<slot name="expansion-cell" v-bind="slotProps"></slot>
					</template>

					<!-- Forward the row slot -->
					<template #row="slotProps">
						<slot name="row" :row="slotProps.row" :index="childIndex" :parent="row"></slot>
					</template>

					<!-- Forward specific column slots -->
					<template v-for="name in dynamicCellSlots" :key="name" #[name]="slotProps">
						<slot :name="name as keyof typeof slots" v-bind="slotProps"></slot>
					</template>

					<!-- Expanded content slot -->
					<template #expanded-row="slotProps">
						<slot name="expanded-row" v-bind="slotProps"></slot>
					</template>
				</TableRow>
			</template>

			<!-- Regular row rendering with expandable support -->
			<TableRow
				v-if="!isGroupRow(row)"
				:key="getRowId(row, rowIndex)"
				:row="row"
				:cells="
					getLeafHeaders()
						.filter((header) => header.column.visible !== false)
						.map((header) => ({
							header: header,
							column: header.column,
						}))
				"
				:depth="0"
				:parent="null"
				:is-selected="isRowSelected(getRowId(row, rowIndex))"
				:is-expanded="isRowExpanded ? isRowExpanded(row) : false"
				:is-row-expanded="isRowExpanded"
				:expansion-type="getRowExpansionType ? getRowExpansionType(row) : 'children'"
				:get-row-expansion-type="getRowExpansionType"
				:get-row-children="getRowChildren || (() => [])"
				:get-row-id="getRowId"
				:toggle-expansion="
					getToggleRowExpandedHandler ? getToggleRowExpandedHandler(row) : () => {}
				"
				:toggle-row-selected="toggleRowSelected"
				:can-expand="
					getRowCanExpand
						? getRowCanExpand(row)
						: getRowChildren && getRowChildren(row) && getRowChildren(row).length > 0
				"
				:is-row-selected="isRowSelected"
				:get-toggle-row-expanded-handler="getToggleRowExpandedHandler"
				:get-cell-value="getCellValue"
				:format-cell-value="formatCellValue"
				:styles="styles"
				:row-attributes="{}"
				:get-cell-classes="(column, value, r) => computeCellClasses(column, value, r)"
				:get-original-row="getOriginalRow"
				:get-row-can-expand="getRowCanExpand"
				:row-class="props.rowClass"
				:row-index="rowIndex"
				@row-click="(data) => handleRowClick(data.row, rowIndex, data.event)"
			>
				<!-- Selection cell for regular row if selection is enabled -->
				<template v-if="selectionEnabled" #selection-cell="slotProps">
					<slot
						name="selection-cell"
						:row="slotProps.row"
						:metadata="getRowMetadata(getRowId(slotProps.row))"
						:isSelected="slotProps.isSelected"
						:canSelect="slotProps.canSelect"
						:toggleSelected="slotProps.toggleSelected"
					>
						<div :class="styles.selectionContainer">
							<input
								type="checkbox"
								:checked="slotProps.isSelected"
								:disabled="!slotProps.canSelect"
								@click.stop="slotProps.toggleSelected()"
								:class="styles.checkbox"
							/>
						</div>
					</slot>
				</template>

				<!-- Expansion cell for regular row -->
				<template v-if="expansionEnabled" #expansion-cell="slotProps">
					<slot
						name="expansion-cell"
						:row="slotProps.row"
						:isExpanded="slotProps.isExpanded"
						:canExpand="slotProps.canExpand"
						:toggleExpansion="slotProps.toggleExpansion"
					>
						<!-- Default expansion content provided by TableRow -->
					</slot>
				</template>

				<!-- Forward the row slot -->
				<template #row="slotProps">
					<slot name="row" v-bind="slotProps"></slot>
				</template>

				<!-- Forward specific column slots -->
				<template v-for="name in dynamicCellSlots" :key="name" #[name]="slotProps">
					<slot :name="name as keyof typeof slots" v-bind="slotProps"></slot>
				</template>

				<!-- Expanded content slot -->
				<template #expanded-row="slotProps">
					<slot name="expanded-row" v-bind="slotProps"></slot>
				</template>
			</TableRow>
		</template>
	</tbody>
</template>
