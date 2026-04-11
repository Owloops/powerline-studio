<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { TableStyles, HeaderGroup, Header, TableColumn, TableOptions } from './types'
import TableFilterRow from './TableFilterRow.vue'
import { icons } from './defaults'

const props = defineProps({
	// Header groups for rendering
	headerGroups: {
		type: Array as PropType<HeaderGroup[]>,
		required: true,
	},

	// Current data
	data: {
		type: Array,
		required: true,
	},

	// Function to get header classes
	getHeaderClasses: {
		type: Function as PropType<
			(
				header: Header,
				styles: TableStyles,
				isSorted: (id: string) => boolean | 'asc' | 'desc',
			) => string[]
		>,
		required: true,
	},

	// Function to handle header click
	handleHeaderClick: {
		type: Function as PropType<
			(
				header: Header,
				toggleSort: (columnId: string, event?: MouseEvent | KeyboardEvent) => void,
				event?: MouseEvent | KeyboardEvent,
			) => void
		>,
		required: true,
	},

	// Function to check if a column is sorted
	isSorted: {
		type: Function as PropType<(id: string) => boolean | 'asc' | 'desc'>,
		required: true,
	},

	// Function to toggle sort
	toggleSort: {
		type: Function as PropType<(columnId: string, event?: MouseEvent | KeyboardEvent) => void>,
		required: true,
	},

	// Styles for the table
	styles: {
		type: Object as PropType<TableStyles>,
		required: true,
	},

	// Table options
	options: {
		type: Object as PropType<TableOptions>,
		default: () => ({}),
	},

	// Selection props
	selectionEnabled: {
		type: Boolean,
		default: false,
	},

	isAllRowsSelected: {
		type: Boolean,
		default: false,
	},

	isSomeRowsSelected: {
		type: Boolean,
		default: false,
	},

	toggleAllRowsSelected: {
		type: Function as PropType<(value?: boolean) => void>,
		default: () => {},
	},

	// Expansion props
	expansionEnabled: {
		type: Boolean,
		default: false,
	},

	isSomeRowsExpanded: {
		type: Boolean,
		default: false,
	},

	toggleAllRowsExpanded: {
		type: Function as PropType<() => void>,
		default: () => {},
	},

	// Column filter props
	showColumnFilters: {
		type: Boolean,
		default: false,
	},

	columnFilters: {
		type: Object as PropType<Record<string, any>>,
		default: () => ({}),
	},

	// Function to get unique values for a column
	getUniqueValues: {
		type: Function as PropType<(columnId: string, data: any[]) => any[]>,
		default: () => [],
	},

	// Function to get min/max values for a column
	getMinMaxValues: {
		type: Function as PropType<
			(columnId: string, data: any[]) => { min: number; max: number } | null
		>,
		default: () => null,
	},

	// Format language strings
	formatLang: {
		type: Function as PropType<(key: string, variables?: Record<string, any>) => string>,
		required: true,
	},
})

// Define slot types
const slots = defineSlots<{
	'selection-header': (props: {
		isAllSelected: boolean
		isSomeSelected: boolean
		toggleAllSelected: () => void
	}) => any
	'expansion-header': (props: { isSomeExpanded: boolean; toggleAllExpanded: () => void }) => any
	[key: `header-${string}`]: (props: {
		column: TableColumn
		options: TableOptions
		headerGroups: HeaderGroup[]
		rows: any[]
	}) => any
}>()

const emit = defineEmits(['update:columnFilter', 'clearColumnFilter'])

// Update column filter
const updateColumnFilter = (columnId: string, value: any) => {
	emit('update:columnFilter', columnId, value)
}

// Clear column filter
const clearColumnFilter = (columnId: string) => {
	emit('clearColumnFilter', columnId)
}

// Calculate effective colspan based on visible children
const getEffectiveColspan = (header: Header): number => {
	// If it's a leaf column, return 1
	if (!header.subHeaders.length) {
		return 1
	}

	// For parent headers, sum up visible children colspans
	let visibleColspan = 0
	const countChildColspans = (childHeaders: Header[]) => {
		for (const childHeader of childHeaders) {
			if (childHeader.column.visible !== false) {
				if (!childHeader.subHeaders.length) {
					visibleColspan += 1
				} else if (childHeader.subHeaders.some((sub) => sub.column.visible !== false)) {
					countChildColspans(childHeader.subHeaders)
				}
			}
		}
	}

	countChildColspans(header.subHeaders)
	return visibleColspan || 1 // Return at least 1 to avoid colspan=0 issues
}

// Determine if a header has any visible leaf columns down the tree
const hasVisibleLeafColumns = (header: Header): boolean => {
	// If it's a leaf column itself, check its visibility
	if (!header.subHeaders.length) {
		return header.column.visible !== false
	}

	// Otherwise, recursively check if any subheaders have visible leaf columns
	return header.subHeaders.some((subHeader) => hasVisibleLeafColumns(subHeader))
}
</script>

<template>
	<thead :class="styles.thead">
		<!-- Header rendering with support for column groups -->
		<tr
			v-for="(headerGroup, groupIndex) in headerGroups"
			:key="headerGroup.id"
			:class="styles.headerRow"
		>
			<!-- Add selection cell in all header rows -->
			<th v-if="selectionEnabled" :class="[styles.headerCell, styles.headerCellSelection]">
				<!-- Add selection checkbox only in the last regular header row -->
				<template v-if="groupIndex === headerGroups.length - 1">
					<slot
						name="selection-header"
						:isAllSelected="isAllRowsSelected"
						:isSomeSelected="isSomeRowsSelected"
						:toggleAllSelected="toggleAllRowsSelected"
					>
						<div :class="styles.selectionContainer">
							<input
								type="checkbox"
								:checked="isAllRowsSelected"
								:indeterminate="!isAllRowsSelected && isSomeRowsSelected"
								@click.stop="toggleAllRowsSelected(isAllRowsSelected ? false : true)"
								:class="styles.checkbox"
							/>
						</div>
					</slot>
				</template>
				<!-- Empty cell for other rows -->
				<template v-else>
					<!-- Empty content for alignment -->
				</template>
			</th>

			<!-- Add expansion cell in all header rows -->
			<th v-if="expansionEnabled" :class="[styles.headerCell, styles.headerCellExpansion]">
				<!-- Content only in last header row -->
				<template v-if="groupIndex === headerGroups.length - 1">
					<slot
						name="expansion-header"
						:isSomeExpanded="isSomeRowsExpanded"
						:toggleAllExpanded="toggleAllRowsExpanded"
					>
						<div
							:class="[
								'flex items-center justify-center w-6',
								styles.expansionContainer,
								'cursor-pointer',
							]"
							@click.stop="toggleAllRowsExpanded"
						>
							<span :class="['expansion-icon', styles.expansionIcon]">
								<template v-if="icons.expanded && icons.collapsed">
									<div v-html="isSomeRowsExpanded ? icons.expanded : icons.collapsed"></div>
								</template>
							</span>
						</div>
					</slot>
				</template>
				<!-- Empty cell for other rows -->
				<template v-else>
					<!-- Empty content for alignment -->
				</template>
			</th>

			<template v-for="header in headerGroup.headers" :key="header.id">
				<!-- Only render if header has visible leaf columns -->
				<th
					v-if="hasVisibleLeafColumns(header)"
					:colspan="getEffectiveColspan(header)"
					:rowspan="header.rowSpan"
					:class="getHeaderClasses(header, styles, isSorted)"
					@click="handleHeaderClick(header, toggleSort, $event)"
					@keydown.enter="handleHeaderClick(header, toggleSort, $event)"
					@keydown.space="handleHeaderClick(header, toggleSort, $event)"
					tabindex="0"
				>
					<!-- Skip rendering content for placeholder headers -->
					<template v-if="!header.isPlaceholder">
						<!-- Check if there's a custom header slot for this column -->
						<slot
							:name="`header-${header.column.id}`"
							:column="header.column"
							:options="options"
							:headerGroups="headerGroups"
							:rows="data"
						>
							<!-- Default header content if no custom slot -->
							<template v-if="typeof header.column.header === 'string'">
								{{ header.column.header }}
							</template>
							<template v-else-if="typeof header.column.header === 'function'">
								{{ header.column.header() }}
							</template>
						</slot>

						<!-- Sort indicators - always shown for sortable columns regardless of header slot -->
						<span
							v-if="header.column.sortable"
							class="absolute inset-y-0 right-0 flex items-center pr-2"
						>
							<span
								v-if="isSorted(header.column.id) === 'asc'"
								v-html="icons.ascending"
								class="w-4 h-4 text-foreground"
							></span>
							<span
								v-else-if="isSorted(header.column.id) === 'desc'"
								v-html="icons.descending"
								class="w-4 h-4 text-foreground"
							></span>
							<span v-else v-html="icons.unsorted" class="w-4 h-4 text-muted-foreground"></span>
						</span>
					</template>
				</th>
			</template>
		</tr>
		<!-- Filter row -->
		<TableFilterRow
			v-if="showColumnFilters && headerGroups.length > 0"
			:headers="headerGroups[headerGroups.length - 1].headers"
			:column-filters="columnFilters"
			:data="data"
			:styles="styles"
			:format-lang="formatLang"
			:get-unique-values="getUniqueValues"
			:get-min-max-values="getMinMaxValues"
			:selection-enabled="selectionEnabled"
			:expansion-enabled="expansionEnabled"
			@update:filter="updateColumnFilter"
			@clear-filter="clearColumnFilter"
		/>
	</thead>
</template>
