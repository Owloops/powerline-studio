<script setup lang="ts">
import { computed, ref, useSlots, watch, type HTMLAttributes } from 'vue'
import {
	Combobox,
	ComboboxAnchor,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxLabel,
	ComboboxList,
	ComboboxTrigger,
} from '@/components/Combobox'
import { ComboboxInput as ComboboxInputRaw } from 'reka-ui'

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
	inputClass?: HTMLAttributes['class']
	contentClass?: HTMLAttributes['class']
	itemClass?: HTMLAttributes['class']
	groupClass?: HTMLAttributes['class']
	labelClass?: HTMLAttributes['class']
	placeholder?: string
	nothingFoundText?: string
	class?: HTMLAttributes['class']
	rootClass?: HTMLAttributes['class']
	/**
	 * Custom function to format the display text.
	 * For single selection: receives the selected item (or undefined if none).
	 * For multiple selection: receives an array of selected items.
	 * The #display slot takes precedence over this prop if provided.
	 */
	displayValue?: (items: ProcessedItem | ProcessedItem[] | undefined) => string
	portal?: boolean
	multiple?: boolean
	disabled?: boolean
	/**
	 * When multiple is true, controls whether tags are rendered inside or outside the input.
	 * - true (default): tags appear inside the input box alongside the text input
	 * - false: tags appear above the input box
	 */
	tagsInside?: boolean
	/**
	 * Intl.Collator sensitivity for filtering.
	 * - 'accent': ä ≠ a, ö ≠ o, but case-insensitive (default)
	 * - 'base': ä = a, ö = o, case-insensitive (Reka-UI default)
	 * - 'case': accent-insensitive but case-sensitive
	 * - 'variant': everything is distinct
	 */
	filterSensitivity?: 'base' | 'accent' | 'case' | 'variant'
	/** Locale for Intl.Collator used in filtering. Defaults to browser locale. */
	filterLocale?: string
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
	tagsInside: true,
	filterSensitivity: 'accent',
})

const emit = defineEmits(['update:modelValue', 'update:open', 'focus', 'blur'])

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
	return (
		optionsArray.value
			.map((item: any) => ({
				key: props.keySelector(item),
				value: props.valueSelector(item),
				group: props.groupSelector ? props.groupSelector(item) : undefined,
				original: item,
			}))
			// Filter out items with empty string keys to prevent ComboboxItem errors
			.filter((item) => item.key !== '' && item.key !== null && item.key !== undefined)
	)
})

// Search term for custom filtering (Reka-UI's ignoreFilter is always on)
const searchTerm = ref('')

function handleSearchInput(event: Event) {
	searchTerm.value = (event.target as HTMLInputElement).value
}

// Accent-sensitive filtering using Intl.Collator
const collator = computed(
	() =>
		new Intl.Collator(props.filterLocale, {
			usage: 'search',
			sensitivity: props.filterSensitivity,
		}),
)

function containsMatch(str: string, substring: string): boolean {
	if (!substring) return true
	str = str.normalize('NFC')
	substring = substring.normalize('NFC')
	for (let i = 0; i + substring.length <= str.length; i++) {
		if (collator.value.compare(str.slice(i, i + substring.length), substring) === 0) return true
	}
	return false
}

const filteredItems = computed(() => {
	if (!searchTerm.value) return processedItems.value
	return processedItems.value.filter((item) => {
		const text = String(item.value ?? '')
		return containsMatch(text, searchTerm.value)
	})
})

// Group items if groupSelector is provided
const groupedItems = computed(() => {
	if (!props.groupSelector) {
		return { ungrouped: filteredItems.value }
	}

	// Use Object.groupBy if available, otherwise use a manual implementation
	if (typeof Object.groupBy === 'function') {
		return Object.groupBy(filteredItems.value, (item) => item.group)
	} else {
		// Manual implementation of groupBy
		return filteredItems.value.reduce(
			(groups, item) => {
				const group = item.group
				if (!groups[group]) {
					groups[group] = []
				}
				groups[group].push(item)
				return groups
			},
			{} as Record<string, typeof filteredItems.value>,
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

// Check if display slot is provided
const slots = useSlots()
const hasDisplaySlot = computed(() => !!slots.display)

// Function to display the selected value in the input (for single selection without display slot)
const displayValueFn = (key: any) => {
	// For multiple mode, the input is just for filtering, don't show selected values
	if (props.multiple) {
		return ''
	}
	// If display slot is provided, don't use this (we'll render slot instead)
	if (hasDisplaySlot.value) {
		// Return empty - the slot will handle display
		// But we still need to show something in the input for single mode
		// Actually for combobox, the input IS the display, so we need to return text
	}
	// Use custom displayValue function if provided
	if (props.displayValue) {
		const item = processedItems.value.find((item) => item.key === key)
		return props.displayValue(item)
	}
	// Otherwise use default behavior
	const item = processedItems.value.find((item) => item.key === key)
	return item ? item.value : ''
}

// Force ComboboxInput remount when options load after modelValue is already set.
// Reka-ui's ComboboxInput only re-resolves display text on modelValue changes,
// not when options change — causing a blank input until user interacts.
const inputKey = ref(0)
watch(processedItems, (newItems, oldItems) => {
	if (props.multiple || model.value == null || model.value === '') return
	const wasResolvable = oldItems?.some((item) => item.key === model.value) ?? false
	const isResolvable = newItems.some((item) => item.key === model.value)
	if (!wasResolvable && isResolvable) {
		inputKey.value++
	}
})

// Default display text for multiple selection (shown as tags area)
const multipleDisplayText = computed(() => {
	if (!props.multiple || selectedItems.value.length === 0) {
		return ''
	}
	if (props.displayValue) {
		return props.displayValue(selectedItems.value)
	}
	// Default: comma-separated for up to 3 items, otherwise "X items selected"
	if (selectedItems.value.length <= 3) {
		return selectedItems.value.map((item) => item.value).join(', ')
	}
	return `${selectedItems.value.length} items selected`
})

// Remove an item from multiple selection
function handleOpenChange(open: boolean) {
	if (!open) searchTerm.value = ''
	emit('update:open', open)
}

function removeItem(key: any) {
	if (props.multiple && Array.isArray(model.value)) {
		model.value = model.value.filter((k: any) => k !== key)
	}
}
</script>

<template>
	<Combobox
		v-model="model"
		:class="props.rootClass"
		:multiple="props.multiple"
		:disabled="props.disabled"
		ignore-filter
		@update:open="handleOpenChange"
	>
		<ComboboxAnchor>
			<div class="relative w-full">
				<!-- Multiple selection with tags OUTSIDE input -->
				<template v-if="props.multiple && !props.tagsInside">
					<div v-if="selectedItems.length > 0" class="mb-1">
						<slot
							name="display"
							:item="undefined"
							:items="selectedItems"
							:multiple="true"
							:remove="removeItem"
						>
							<!-- Default: show as inline tags above input -->
							<div class="flex flex-wrap gap-1">
								<span
									v-for="item in selectedItems"
									:key="item.key"
									class="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted rounded"
								>
									{{ item.value }}
									<button
										type="button"
										class="hover:text-destructive"
										@click.stop="removeItem(item.key)"
									>
										×
									</button>
								</span>
							</div>
						</slot>
					</div>
					<div class="relative">
						<ComboboxInput
							:key="inputKey"
							:display-value="displayValueFn"
							:placeholder="selectedItems.length > 0 ? '' : placeholder"
							:class="props.class || props.inputClass"
							@input="handleSearchInput"
							@focus="emit('focus', $event)"
							@blur="emit('blur', $event)"
						/>
						<ComboboxTrigger :class="triggerClass" />
					</div>
				</template>
				<!-- Multiple selection with tags INSIDE input -->
				<template v-else-if="props.multiple && props.tagsInside">
					<div
						class="flex flex-col gap-1 pr-8 min-h-[38px] w-full rounded-md border border-input bg-transparent text-sm shadow-xs transition-colors focus-within:ring-ring/50 focus-within:ring-[3px] px-3 py-2"
					>
						<div v-if="selectedItems.length > 0" class="flex flex-wrap gap-1">
							<slot
								name="display"
								:item="undefined"
								:items="selectedItems"
								:multiple="true"
								:remove="removeItem"
							>
								<!-- Default: show as inline tags -->
								<span
									v-for="item in selectedItems"
									:key="item.key"
									class="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted rounded"
								>
									{{ item.value }}
									<button
										type="button"
										class="hover:text-destructive"
										@click.stop="removeItem(item.key)"
									>
										×
									</button>
								</span>
							</slot>
						</div>
						<ComboboxInputRaw
							:key="inputKey"
							:display-value="displayValueFn"
							:placeholder="selectedItems.length > 0 ? '' : placeholder"
							class="w-full bg-transparent p-0 h-auto border-none outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground text-sm"
							@input="handleSearchInput"
							@focus="emit('focus', $event)"
							@blur="emit('blur', $event)"
						/>
					</div>
					<ComboboxTrigger :class="triggerClass" />
				</template>
				<!-- Single selection: standard layout -->
				<template v-else>
					<ComboboxInput
						:key="inputKey"
						:display-value="displayValueFn"
						:placeholder="placeholder"
						:class="props.class || props.inputClass"
						@input="handleSearchInput"
						@focus="emit('focus', $event)"
						@blur="emit('blur', $event)"
					/>
					<ComboboxTrigger :class="triggerClass" />
				</template>
			</div>
		</ComboboxAnchor>
		<ComboboxList :class="contentClass" :portal="props.portal">
			<ComboboxEmpty>
				{{ nothingFoundText || '...' }}
			</ComboboxEmpty>

			<template v-if="props.groupSelector">
				<!-- Render grouped items -->
				<template v-for="(items, group) in groupedItems" :key="group">
					<ComboboxGroup :class="groupClass">
						<ComboboxLabel :class="labelClass">{{ props.groupLabelSelector(group) }}</ComboboxLabel>
						<template v-for="item in items" :key="item.key">
							<ComboboxItem :value="item.key" :class="itemClass">
								<slot :item="item">
									{{ item.value }}
								</slot>
								<ComboboxItemIndicator />
							</ComboboxItem>
						</template>
					</ComboboxGroup>
				</template>
			</template>
			<template v-else>
				<!-- Render ungrouped items -->
				<template v-for="item in filteredItems" :key="item.key">
					<ComboboxItem :value="item.key" :class="itemClass">
						<slot :item="item">
							{{ item.value }}
						</slot>
						<ComboboxItemIndicator />
					</ComboboxItem>
				</template>
			</template>
		</ComboboxList>
	</Combobox>
</template>
