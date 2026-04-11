<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/Select'

export interface ProcessedItem {
	key: any
	value: any
	group?: any
	original: any
}

interface Props {
	modelValue?: any
	options: any[] | Record<string, any>
	keySelector?: (item: any) => any
	valueSelector?: (item: any) => any
	groupSelector?: (item: any) => any
	groupLabelSelector?: (group: any) => any
	triggerClass?: HTMLAttributes['class']
	contentClass?: HTMLAttributes['class']
	itemClass?: HTMLAttributes['class']
	groupClass?: HTMLAttributes['class']
	labelClass?: HTMLAttributes['class']
	placeholder?: string
	class?: HTMLAttributes['class']
	rootClass?: HTMLAttributes['class']
	portal?: boolean
	disabled?: boolean
	multiple?: boolean
	/**
	 * Custom function to format the display text.
	 * For single selection: receives the selected item (or undefined if none).
	 * For multiple selection: receives an array of selected items.
	 * The #display slot takes precedence over this prop if provided.
	 */
	displayValue?: (items: ProcessedItem | ProcessedItem[] | undefined) => string
}

const props = withDefaults(defineProps<Props>(), {
	keySelector: (item: any) => {
		// Check if item is an array
		if (Array.isArray(item)) {
			return item[0] // First element as key
		}
		// Check if item is an object
		if (typeof item === 'object' && item !== null) {
			// Check for property existence, not truthy value (to allow 0, null, etc.)
			if ('key' in item) return item.key
			if ('id' in item) return item.id
			return item
		}
		// Use item directly as fallback
		return item
	},
	valueSelector: (item: any) => {
		// Check if item is an array
		if (Array.isArray(item)) {
			return item[1] !== undefined ? item[1] : item[0] // Second element as value, or first if only one
		}
		// Check if item is an object
		if (typeof item === 'object' && item !== null) {
			// Check for property existence, not truthy value (to allow 0, null, etc.)
			if ('value' in item) return item.value
			if ('label' in item) return item.label
			if ('name' in item) return item.name
			return item
		}
		// Use item directly as fallback
		return item
	},
	groupLabelSelector: (group: any) => group,
	portal: true,
})

const emit = defineEmits(['update:modelValue', 'update:open'])

// Create a computed property for the model value
const model = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value),
})

// Convert options to array if it's an object
const optionsArray = computed(() => {
	if (Array.isArray(props.options)) {
		return props.options
	} else {
		// If options is an object, convert it to an array of {key, value} pairs
		return Object.entries(props.options).map(([key, value]) => ({
			key,
			value,
		}))
	}
})

// Process the options items
const processedItems = computed(() => {
	return optionsArray.value.map((item: any) => ({
		key: props.keySelector(item),
		value: props.valueSelector(item),
		group: props.groupSelector ? props.groupSelector(item) : undefined,
		original: item,
	}))
})

// Group items if groupSelector is provided
const groupedItems = computed(() => {
	if (!props.groupSelector) {
		return { ungrouped: processedItems.value }
	}

	// Use Object.groupBy if available, otherwise use a manual implementation
	if (typeof Object.groupBy === 'function') {
		return Object.groupBy(processedItems.value, (item) => item.group)
	} else {
		// Manual implementation of groupBy
		return processedItems.value.reduce(
			(groups, item) => {
				const group = item.group
				if (!groups[group]) {
					groups[group] = []
				}
				groups[group].push(item)
				return groups
			},
			{} as Record<string, typeof processedItems.value>,
		)
	}
})

// Find the selected item for single selection mode
const selectedItem = computed(() => {
	if (props.multiple) {
		return undefined
	}
	return processedItems.value.find((item) => item.key === model.value)
})

// Find all selected items for multiple selection mode
const selectedItems = computed(() => {
	if (!props.multiple || !Array.isArray(model.value)) {
		return []
	}
	return processedItems.value.filter((item) => model.value.includes(item.key))
})

// Default display text (used when no slot is provided)
const displayText = computed(() => {
	if (props.multiple) {
		// Multiple selection mode
		if (selectedItems.value.length === 0) {
			return ''
		}
		// Use custom displayValue if provided
		if (props.displayValue) {
			return props.displayValue(selectedItems.value)
		}
		// Default: comma-separated for up to 3 items, otherwise "X items selected"
		if (selectedItems.value.length <= 3) {
			return selectedItems.value.map((item) => item.value).join(', ')
		}
		return `${selectedItems.value.length} items selected`
	} else {
		// Single selection mode
		if (!selectedItem.value) {
			return ''
		}
		// Use custom displayValue if provided
		if (props.displayValue) {
			return props.displayValue(selectedItem.value)
		}
		// Default: show the value
		return selectedItem.value.value
	}
})
</script>

<template>
	<Select
		v-model="model"
		:class="props.rootClass"
		:disabled="props.disabled"
		:multiple="props.multiple"
		@update:open="emit('update:open', $event)"
	>
		<SelectTrigger :class="props.class || triggerClass">
			<SelectValue :placeholder="placeholder">
				<slot name="display" :item="selectedItem" :items="selectedItems" :multiple="props.multiple">
					<!-- Default display when no slot is provided -->
					{{ displayText }}
				</slot>
			</SelectValue>
		</SelectTrigger>
		<SelectContent :class="contentClass" :portal="props.portal">
			<template v-if="props.groupSelector">
				<!-- Render grouped items -->
				<template v-for="(items, group) in groupedItems" :key="group">
					<SelectGroup :class="groupClass">
						<SelectLabel :class="labelClass">{{ props.groupLabelSelector(group) }}</SelectLabel>
						<template v-for="item in items" :key="item.key">
							<SelectItem :value="item.key" :class="itemClass">
								<slot :item="item">
									{{ item.value }}
								</slot>
							</SelectItem>
						</template>
					</SelectGroup>
				</template>
			</template>
			<template v-else>
				<!-- Render ungrouped items -->
				<template v-for="item in processedItems" :key="item.key">
					<SelectItem :value="item.key" :class="itemClass">
						<slot :item="item">
							{{ item.value }}
						</slot>
					</SelectItem>
				</template>
			</template>
		</SelectContent>
	</Select>
</template>
