<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { TableColumn, TableStyles } from './types'
import type { ColumnVisibilityState } from '@/composables/table/useTableColumnVisibility'
import { computed, type PropType } from 'vue'
import {
	SelectContent,
	SelectIcon,
	SelectItem,
	SelectItemIndicator,
	SelectItemText,
	SelectPortal,
	SelectRoot,
	SelectTrigger,
	SelectValue,
	SelectViewport,
} from 'reka-ui'
import { ChevronDown } from '@lucide/vue'

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

// Get all leaf columns (columns without children)
const leafColumns = computed(() => {
	const getLeafColumns = (columns: TableColumn[]): TableColumn[] => {
		return columns.flatMap((col) => {
			if (col.columns && col.columns.length) {
				return getLeafColumns(col.columns)
			}
			return col
		})
	}

	return getLeafColumns(props.columns)
})

// Count the total number of columns that can be hidden (exclude export-only columns)
const totalColumns = computed(() => {
	return leafColumns.value.filter((column) => !column.exportOnly && column.enableHiding !== false)
		.length
})

// Count the currently visible columns
const visibleCount = computed(() => {
	let count = 0

	for (const column of leafColumns.value) {
		// Skip columns that can't be hidden or are export-only
		if (column.exportOnly || column.enableHiding === false) continue

		const isVisible = props.columnVisibility[column.id] !== false
		if (isVisible) {
			count++
		}
	}

	return count
})

// Generate display text for the trigger with x/y columns shown
const displayText = computed(() => {
	return props.formatLang('columnVisibility.columnsShown', {
		count: `${visibleCount.value}/${totalColumns.value}`,
	})
})

// Prepare options for the select by transforming columns
const columnOptions = computed(() => {
	return leafColumns.value
		.filter((column) => !column.exportOnly && column.enableHiding !== false) // Exclude export-only and non-hideable columns
		.map((column) => ({
			id: column.id,
			name: typeof column.header === 'function' ? column.header() : column.header,
		}))
})

// Determine the currently visible column IDs
const visibleColumnIds = computed(() => {
	const visibleIds: string[] = []

	for (const column of leafColumns.value) {
		// Skip columns that can't be hidden or are export-only
		if (column.exportOnly || column.enableHiding === false) continue

		const isVisible = props.columnVisibility[column.id] !== false
		if (isVisible) {
			visibleIds.push(column.id)
		}
	}

	return visibleIds
})

// Show all columns
const showAllColumns = (e: Event) => {
	e.preventDefault()
	e.stopPropagation()
	emit('toggle-all-columns', true)
}

// Hide all columns
const hideAllColumns = (e: Event) => {
	e.preventDefault()
	e.stopPropagation()
	emit('toggle-all-columns', false)
}

// Reset to default visibility
const resetVisibility = (e: Event) => {
	e.preventDefault()
	e.stopPropagation()
	emit('reset-column-visibility')
}

// Handle model value changes
const onValueChange = (value: any) => {
	// Handle type safety - ensure we have an array of strings
	const selectedIds = Array.isArray(value) ? (value as string[]) : []

	// Create a new visibility state based on selected columns
	const newVisibility: ColumnVisibilityState = { ...props.columnVisibility }

	// Set all available columns to hidden first (skip exportOnly columns)
	for (const column of leafColumns.value) {
		if (column.enableHiding !== false && !column.exportOnly) {
			newVisibility[column.id] = false
		}
	}

	// Then set selected columns to visible
	for (const id of selectedIds) {
		newVisibility[id] = true
	}

	emit('update:columnVisibility', newVisibility)
}
</script>

<template>
	<div v-if="columnVisibilityEnabled" :class="styles.columnVisibility?.container">
		<SelectRoot multiple :model-value="visibleColumnIds" @update:modelValue="onValueChange">
			<SelectTrigger :class="cn(styles.filter?.select, styles.columnVisibility?.trigger)">
				<SelectValue :placeholder="formatLang('columnVisibility.toggleColumns')">
					{{ displayText }}
				</SelectValue>
				<SelectIcon as-child>
					<ChevronDown class="ml-1 h-4 w-4 opacity-50" />
				</SelectIcon>
			</SelectTrigger>

			<SelectPortal>
				<SelectContent :class="styles.columnVisibility?.content" position="popper">
					<div :class="styles.columnVisibility?.actionsContainer">
						<button
							@click="showAllColumns"
							@mousedown.prevent
							:class="styles.columnVisibility?.actionButton"
						>
							{{ formatLang('columnVisibility.showAll') }}
						</button>
						<button
							@click="hideAllColumns"
							@mousedown.prevent
							:class="styles.columnVisibility?.actionButton"
						>
							{{ formatLang('columnVisibility.hideAll') }}
						</button>
						<button
							@click="resetVisibility"
							@mousedown.prevent
							:class="styles.columnVisibility?.actionButton"
						>
							{{ formatLang('columnVisibility.resetToDefault') }}
						</button>
					</div>

					<SelectViewport :class="styles.columnVisibility?.viewport">
						<SelectItem
							v-for="option in columnOptions"
							:key="option.id"
							:value="option.id"
							:class="styles.columnVisibility?.item"
						>
							<SelectItemText>{{ option.name }}</SelectItemText>
							<SelectItemIndicator :class="styles.columnVisibility?.itemIndicator">
								<!-- Empty indicator - we'll handle with CSS -->
							</SelectItemIndicator>
						</SelectItem>
					</SelectViewport>
				</SelectContent>
			</SelectPortal>
		</SelectRoot>
	</div>
</template>
