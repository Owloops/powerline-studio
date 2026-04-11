<script setup lang="ts">
import { type PropType } from 'vue'
import type { TableColumn, TableStyles } from './types'
import type { ColumnVisibilityState } from '@/composables/table/useTableColumnVisibility'
import TableColumnVisibilitySelect from './TableColumnVisibilitySelect.vue'

const props = defineProps({
	// Column visibility state
	columnVisibility: {
		type: Object as PropType<ColumnVisibilityState>,
		required: true,
	},

	// All columns
	columns: {
		type: Array as PropType<TableColumn[]>,
		required: true,
	},

	// Whether column visibility is enabled
	columnVisibilityEnabled: {
		type: Boolean,
		default: true,
	},

	// Styles for the table
	styles: {
		type: Object as PropType<TableStyles>,
		required: true,
	},

	// Localized strings
	formatLang: {
		type: Function as PropType<(key: string, variables?: Record<string, any>) => string>,
		required: true,
	},
})

const emit = defineEmits([
	'update:columnVisibility',
	'toggle-column-visibility',
	'toggle-all-columns',
	'reset-column-visibility',
])
</script>

<template>
	<!-- Use the dedicated select component for column visibility -->
	<TableColumnVisibilitySelect
		:column-visibility="columnVisibility"
		:columns="columns"
		:column-visibility-enabled="columnVisibilityEnabled"
		:styles="styles"
		:format-lang="formatLang"
		@update:column-visibility="$emit('update:columnVisibility', $event)"
		@toggle-column-visibility="$emit('toggle-column-visibility', $event)"
		@toggle-all-columns="$emit('toggle-all-columns', $event)"
		@reset-column-visibility="$emit('reset-column-visibility')"
	/>
</template>
