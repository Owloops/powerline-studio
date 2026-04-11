<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { TableColumn, TableOptions } from './types'
import { useTableExport } from '@/composables/table/useTableExport'
import { defaultStyles } from './defaults'

const props = defineProps({
	options: {
		type: Object as PropType<TableOptions>,
		required: true,
	},
	columns: {
		type: Array as PropType<TableColumn[]>,
		required: true,
	},
	allRows: {
		type: Array,
		required: true,
	},
	filteredRows: {
		type: Array,
		required: true,
	},
	paginatedRows: {
		type: Array,
		required: true,
	},
	getFormatter: {
		type: Function,
		required: true,
	},
})

// Get export functionality from composable
const { getExportData, exportToCsv, exportToExcel } = useTableExport(
	props.options,
	props.getFormatter,
)

// Compute the language strings to use
const language = computed(() => props.options.language?.export || {})

// Get the filename from export options or use default
const exportFilename = computed(() => props.options.export?.filename || 'export')

// Handle export to CSV
const handleExportCsv = () => {
	const rows = getExportData(props.allRows, props.filteredRows, props.paginatedRows)
	exportToCsv(rows, props.columns, exportFilename.value)
}

// Handle export to Excel
const handleExportExcel = () => {
	const rows = getExportData(props.allRows, props.filteredRows, props.paginatedRows)
	exportToExcel(rows, props.columns, exportFilename.value)
}
</script>

<template>
	<div v-if="options.export" class="flex gap-2">
		<!-- Export buttons -->
		<button
			v-if="options.export.csv !== false"
			@click="handleExportCsv"
			:class="defaultStyles?.export?.button"
			type="button"
		>
			{{ language.csv || 'Export CSV' }}
		</button>

		<button
			v-if="options.export.excel !== false"
			@click="handleExportExcel"
			:class="defaultStyles?.export?.button"
			type="button"
		>
			{{ language.excel || 'Export Excel' }}
		</button>
	</div>
</template>
