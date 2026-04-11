<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { TableColumn, TableStyles, Header } from './types'
import TableColumnFilter from './TableColumnFilter.vue'

const props = defineProps({
	// Headers to show filters for
	headers: {
		type: Array as PropType<Header[]>,
		required: true,
	},

	// Column filters
	columnFilters: {
		type: Object as PropType<Record<string, any>>,
		required: true,
	},

	// Current data array
	data: {
		type: Array,
		required: true,
	},

	// Styles for the table
	styles: {
		type: Object as PropType<TableStyles>,
		required: true,
	},

	// Format language strings
	formatLang: {
		type: Function as PropType<(key: string, variables?: Record<string, any>) => string>,
		required: true,
	},

	// Function to get unique values for a column
	getUniqueValues: {
		type: Function as PropType<(columnId: string, data: any[]) => any[]>,
		required: true,
	},

	// Function to get min/max values for a column
	getMinMaxValues: {
		type: Function as PropType<
			(columnId: string, data: any[]) => { min: number; max: number } | null
		>,
		required: true,
	},

	// Selection enabled flag
	selectionEnabled: {
		type: Boolean,
		default: false,
	},

	// Expansion enabled flag
	expansionEnabled: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(['update:filter', 'clear-filter'])

// Check if a column has faceting enabled
const hasFacet = (column: TableColumn) => {
	return column.facet !== undefined
}

// Get unique values for a column
const getColumnUniqueValues = (columnId: string) => {
	return props.getUniqueValues(columnId, props.data)
}

// Get min/max values for a column
const getColumnMinMaxValues = (columnId: string) => {
	return props.getMinMaxValues(columnId, props.data)
}

// Update filter for a column
const updateFilter = (columnId: string, value: any) => {
	emit('update:filter', columnId, value)
}

// Clear filter for a column
const clearFilter = (columnId: string) => {
	emit('clear-filter', columnId)
}
</script>

<template>
	<tr class="header-filter-row" :class="styles.headerRow">
		<!-- Selection column if enabled -->
		<th v-if="selectionEnabled" :class="[styles.headerCell, styles.headerCellSelection]"></th>

		<!-- Expansion column if enabled -->
		<th v-if="expansionEnabled" :class="[styles.headerCell, styles.headerCellExpansion]"></th>

		<!-- Filter cell for each header -->
		<th
			v-for="header in headers.filter((h) => h.column.visible !== false)"
			:key="`filter-${header.id}`"
			:class="styles.headerCell"
			:colspan="header.colSpan"
		>
			<template v-if="header.column.filterable !== false && !header.isPlaceholder">
				<TableColumnFilter
					:column="header.column"
					:filter-value="columnFilters[header.column.id]"
					:unique-values="getColumnUniqueValues(header.column.id)"
					:min-max-values="getColumnMinMaxValues(header.column.id)"
					:styles="styles"
					:format-lang="formatLang"
					@update:filter="(value) => updateFilter(header.column.id, value)"
					@clear-filter="clearFilter(header.column.id)"
				/>
			</template>
		</th>
	</tr>
</template>
