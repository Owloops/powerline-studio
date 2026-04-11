<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { icons } from './defaults'
import type { TableStyles } from './types'

const props = defineProps({
	globalFilter: {
		type: String,
		default: '',
	},
	columnFilters: {
		type: Object,
		default: () => ({}),
	},
	filterEnabled: {
		type: Boolean,
		default: true,
	},
	styles: {
		type: Object as PropType<TableStyles>,
		required: true,
	},
	formatLang: {
		type: Function as PropType<(key: string, variables?: Record<string, any>) => string>,
		required: true,
	},
	columnFiltersEnabled: {
		type: Boolean,
		default: true,
	},
})

const emit = defineEmits(['update:global-filter', 'clear-filters'])

const filterText = ref(props.globalFilter)

// Watch for changes in the prop and update the local state
watch(
	() => props.globalFilter,
	(newValue) => {
		filterText.value = newValue
	},
)

// Update the parent whenever the local state changes
const updateFilter = (value: string) => {
	filterText.value = value
	emit('update:global-filter', value)
}

// Clear all filters
const clearFilters = (columns: boolean = true) => {
	filterText.value = ''
	emit('clear-filters', columns)
}

// Check if any filters are active (either global filter or column filters)
const hasActiveFilters = computed(() => {
	// Check if there's text in the global filter
	if (filterText.value) return true

	// Check if there are any column filters
	return Object.keys(props.columnFilters).length > 0
})

// Get placeholder text from formatLang function that's already properly merged
const placeholderText = computed(() => {
	return props.formatLang('filter.search', {})
})

// Get clear button text from formatLang function that's already properly merged
const clearButtonText = computed(() => {
	return props.formatLang('filter.clear', {})
})
</script>

<template>
	<div v-if="filterEnabled" :class="styles.filter?.container">
		<div class="flex items-center relative">
			<button
				v-if="columnFiltersEnabled"
				:disabled="!hasActiveFilters"
				:class="styles.filter?.clearButton"
				@click="clearFilters(true)"
				class="mr-2"
			>
				<span v-if="clearButtonText" class="ml-1">{{ clearButtonText }}</span>
				<div v-if="icons.reset" v-html="icons.reset"></div>
			</button>
			<div class="flex items-center relative">
				<input
					v-model="filterText"
					:class="styles.filter?.input"
					:placeholder="placeholderText"
					@input="updateFilter(filterText)"
				/>
				<div
					v-if="icons.reset && filterText"
					v-html="icons.reset"
					class="absolute text-muted-foreground hover:text-foreground right-1.5 p-1.5 cursor-pointer"
					@click="clearFilters(false)"
				></div>
			</div>
		</div>
	</div>
</template>
