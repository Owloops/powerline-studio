<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { TableColumn, TableStyles } from './types'
import { RIGHT_ALIGNED_FORMAT_TYPES } from './types'
import { AnimatedSlider } from '@/components/Slider'
import CustomCombobox from '@/components/CustomCombobox/CustomCombobox.vue'
import { useDebounceFn } from '@vueuse/core'

// Define the shape of value-label pairs for facet options
interface ValueLabelPair {
	value: any
	label: string
}

const props = defineProps({
	// Column to render filter for
	column: {
		type: Object as PropType<TableColumn>,
		required: true,
	},

	// Current filter value for this column
	filterValue: {
		type: [String, Number, Object, Array, Boolean],
		default: null,
	},

	// Unique values for select filter
	uniqueValues: {
		type: Array,
		default: () => [],
	},

	// Min/max values for range filter
	minMaxValues: {
		type: Object as PropType<{ min: number; max: number } | null>,
		default: null,
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
})

const emit = defineEmits(['update:filter', 'clear-filter'])

// Determine the filter type based on the column configuration
const filterType = computed(() => {
	if (!props.column.facet) return 'text'
	return props.column.facet.type || 'text'
})

// For text filter input
const textFilterValue = ref((props.filterValue as string) || '')

// For range filter
const rangeValue = ref<[number, number]>(
	Array.isArray(props.filterValue)
		? (props.filterValue as [number, number])
		: props.minMaxValues
			? [props.minMaxValues.min, props.minMaxValues.max]
			: [0, 100],
)

// Special marker for null values to prevent placeholder styling
// Using a unique string that's unlikely to be a real value
const NULL_VALUE_MARKER = '__NULL_VALUE__MARKER__'

// For select filter - wrap null values to avoid placeholder styling
const selectedValue = ref<any>(props.filterValue === null ? NULL_VALUE_MARKER : props.filterValue)

// Helper to check if an option is a value/label pair or a primitive
const isValueLabelPair = (item: any): item is ValueLabelPair => {
	return (
		item !== null &&
		typeof item === 'object' &&
		'value' in item &&
		'label' in item &&
		typeof item.label === 'string'
	)
}

// Process uniqueValues to wrap null values with the marker
const processedUniqueValues = computed(() => {
	return props.uniqueValues.map((item) => {
		// If it's a value/label pair with null value, replace the value with the marker
		if (isValueLabelPair(item) && item.value === null) {
			return { ...item, value: NULL_VALUE_MARKER }
		}
		// If it's a plain null value, replace with marker
		if (item === null) {
			return NULL_VALUE_MARKER
		}
		return item
	})
})

// Watch for changes in filter value from parent
watch(
	() => props.filterValue,
	(newValue) => {
		if (filterType.value === 'text') {
			textFilterValue.value = (newValue as string) || ''
		} else if (filterType.value === 'range') {
			if (Array.isArray(newValue)) {
				rangeValue.value = newValue as [number, number]
			} else if (newValue === null || newValue === undefined) {
				// Reset range values when filter is cleared
				rangeValue.value = props.minMaxValues
					? [props.minMaxValues.min, props.minMaxValues.max]
					: [0, 100]
			}
		} else if (filterType.value === 'select') {
			// Wrap null values with the marker to prevent placeholder styling
			selectedValue.value = newValue === null ? NULL_VALUE_MARKER : newValue
		}
	},
	{ immediate: true },
)

// Debounced emit filter function to prevent too many filter updates
const debouncedEmitFilter = useDebounceFn((value: any) => {
	// Unwrap the NULL_VALUE_MARKER back to null for actual filtering
	const filterValue = value === NULL_VALUE_MARKER ? null : value
	emit('update:filter', filterValue)
}, 200) // 200ms debounce

// Update text filter
const updateTextFilter = (event: Event) => {
	const input = event.target as HTMLInputElement
	textFilterValue.value = input.value
	debouncedEmitFilter(input.value)
}

// Update range filter
const updateRangeFilter = (value: number[] | undefined) => {
	if (value && value.length === 2) {
		// Immediately update local UI state for smooth slider movement
		rangeValue.value = [value[0], value[1]]
		// Debounce the actual filter update to prevent lag
		debouncedEmitFilter({ min: value[0], max: value[1] })
	}
}

// Clear filter
const clearFilter = () => {
	if (filterType.value === 'text') {
		textFilterValue.value = ''
	} else if (filterType.value === 'range') {
		rangeValue.value = props.minMaxValues
			? [props.minMaxValues.min, props.minMaxValues.max]
			: [0, 100]
	} else if (filterType.value === 'select') {
		selectedValue.value = null
	}

	emit('clear-filter')
}

// Helper function to check if a column format type should be right-aligned
const isRightAlignedFormat = (formatType?: string): boolean => {
	return !!formatType && RIGHT_ALIGNED_FORMAT_TYPES.includes(formatType)
}

// Format display value for range filter
const formatRangeValue = (value: number) => {
	if (typeof props.column.format === 'function') {
		return props.column.format(value, {} as any)
	}
	return value.toString()
}

const handleInput = (event: any) => {
	if (event.data == null) {
		clearFilter()
	}
}

// Calculate an appropriate step size for the range slider
// Makes it about 1/100th of the range, but properly rounded
const calculateStepSize = (min: number, max: number): number => {
	const range = Math.abs(max - min)
	const rawStep = range / 100

	// Round the step to a reasonable value based on its magnitude
	if (rawStep >= 100) {
		return Math.round(rawStep / 100) * 100 // Round to nearest 100
	} else if (rawStep >= 10) {
		return Math.round(rawStep / 10) * 10 // Round to nearest 10
	} else if (rawStep >= 1) {
		return Math.round(rawStep) // Round to nearest 1
	} else if (rawStep >= 0.1) {
		return Math.round(rawStep * 10) / 10 // Round to nearest 0.1
	} else if (rawStep >= 0.01) {
		return Math.round(rawStep * 100) / 100 // Round to nearest 0.01
	} else {
		return 0.001 // Minimum step for very small ranges
	}
}
</script>

<template>
	<div class="table-column-filter">
		<!-- Text filter -->
		<template v-if="filterType === 'text'">
			<div class="flex items-center">
				<input
					:value="textFilterValue"
					@input="updateTextFilter"
					type="text"
					:placeholder="formatLang('filter.search')"
					:class="[
						styles.filter?.input,
						isRightAlignedFormat(column.formatType) ? 'text-right' : '',
						typeof column.class === 'string' ? column.class : '',
					]"
					class="w-full"
				/>
			</div>
		</template>

		<!-- Range filter -->
		<template v-else-if="filterType === 'range' && minMaxValues">
			<div class="flex flex-col">
				<AnimatedSlider
					:model-value="rangeValue"
					:min="Math.floor(minMaxValues.min)"
					:max="Math.ceil(minMaxValues.max)"
					:step="calculateStepSize(minMaxValues.min, minMaxValues.max)"
					class="w-full"
					classThumb="w-3 rounded-md"
					:tooltipFormat="formatRangeValue"
					@update:model-value="updateRangeFilter"
				/>
			</div>
		</template>

		<!-- Basic number input range for now (fallback until range slider is available) -->
		<template v-else-if="filterType === 'range' && !minMaxValues">
			<div class="flex space-x-2">
				<input
					type="number"
					:value="rangeValue[0]"
					@change="
						(e) => {
							const target = e.target as HTMLInputElement
							updateRangeFilter([Number(target.value), rangeValue[1]])
						}
					"
					:class="[
						styles.filter?.input,
						isRightAlignedFormat(column.formatType) ? 'text-right' : '',
						typeof column.class === 'string' ? column.class : '',
					]"
					class="w-1/2"
					placeholder="Min"
				/>
				<input
					type="number"
					:value="rangeValue[1]"
					@change="
						(e) => {
							const target = e.target as HTMLInputElement
							updateRangeFilter([rangeValue[0], Number(target.value)])
						}
					"
					:class="[
						styles.filter?.input,
						isRightAlignedFormat(column.formatType) ? 'text-right' : '',
						typeof column.class === 'string' ? column.class : '',
					]"
					class="w-1/2"
					placeholder="Max"
				/>
			</div>
		</template>

		<!-- Select filter -->
		<template v-else-if="filterType === 'select'">
			<div class="flex items-center">
				<CustomCombobox
					v-model="selectedValue"
					:options="processedUniqueValues"
					:keySelector="(item: any) => (isValueLabelPair(item) ? item.value : item)"
					:valueSelector="(item: any) => (isValueLabelPair(item) ? item.label : String(item))"
					:placeholder="formatLang('filter.search')"
					:nothing-found-text="formatLang('filter.noResults')"
					@input="handleInput"
					class="w-full font-normal"
					content-class="max-h-[480px]"
					@update:model-value="debouncedEmitFilter"
				/>
			</div>
		</template>
	</div>
</template>
