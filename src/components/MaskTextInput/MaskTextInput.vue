<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue'
import { vMaska } from 'maska/vue'

const props = defineProps({
	modelValue: {
		type: String,
		default: '',
	},
	toView: {
		type: Function as PropType<(modelValue: string | null) => string | null>,
		default: (val: string | null) => val,
	},
	fromView: {
		type: Function as PropType<(viewValue: string | null) => string | null>,
		default: (val: string | null) => val,
	},
	// Standard Maska options
	mask: {
		type: [String, Array, Function],
		default: undefined,
	},
	eager: {
		type: Boolean,
		default: false,
	},
	reversed: {
		type: Boolean,
		default: false,
	},
	tokens: {
		type: Object,
		default: undefined,
	},
	tokensReplace: {
		type: Boolean,
		default: false,
	},
	// UI options
	placeholder: {
		type: String,
		default: '',
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	id: {
		type: String,
		default: undefined,
	},
	name: {
		type: String,
		default: undefined,
	},
	// Class handling
	class: {
		type: String,
		default: '',
	},
	inputClass: {
		type: String,
		default: '',
	},
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

// Ref for the underlying input element
const inputElement = ref<HTMLInputElement | null>(null)

// Expose the input element ref obtained via useTemplateRef
defineExpose({
	inputElement,
})

// Flag to track if we're currently handling user input
const isUserInput = ref(false)

// Use ref for the display value (formatted text)
const initialTransformedViewValue =
	props.modelValue !== null ? props.toView(props.modelValue) : null
const displayValue = ref(
	initialTransformedViewValue !== null ? String(initialTransformedViewValue) : '',
)

// Watch for changes to the modelValue prop and update the display value accordingly
watch(
	() => props.modelValue,
	(newValue, oldValue) => {
		// Skip updates during active user input to prevent cursor jumping
		if (isUserInput.value) return

		// If the values are different, update the displayed value
		if (newValue !== oldValue) {
			const transformedNewValue = newValue !== null ? props.toView(newValue) : null
			displayValue.value = transformedNewValue !== null ? String(transformedNewValue) : ''
		}
	},
)

// Configure Maska options based on props
const maskaOptions = computed(() => {
	const options: Record<string, any> = {}

	// Set mask if provided
	if (props.mask) {
		options.mask = props.mask
	}

	// Add other Maska options
	if (props.eager) options.eager = props.eager
	if (props.reversed) options.reversed = props.reversed
	if (props.tokens) options.tokens = props.tokens
	if (props.tokensReplace) options.tokensReplace = props.tokensReplace

	return options
})

// Handle Maska events - this is where we get the values that Maska has processed
function onMaska(event: CustomEvent) {
	// User is actively inputting - set flag to prevent watcher updates
	isUserInput.value = true

	// Emit the unmasked value, transformed by fromView
	const unmaskedValue = event.detail.unmasked || null // Treat empty string from maska as null for consistency
	const modelCompatibleValue = props.fromView(unmaskedValue)
	emit('update:modelValue', modelCompatibleValue === null ? '' : modelCompatibleValue) // Emit empty string if null for v-model compatibility with string type
}

// Handle focus event
function onFocus(event: FocusEvent) {
	isUserInput.value = true
	emit('focus', event)
}

// Handle blur event
function onBlur(event: FocusEvent) {
	// User has finished inputting - allow watcher updates again
	isUserInput.value = false
	emit('blur', event)
}
</script>

<template>
	<input
		ref="inputElement"
		:id="id"
		:name="name"
		type="text"
		v-model="displayValue"
		v-maska="maskaOptions"
		@maska="onMaska"
		:placeholder="placeholder"
		:disabled="disabled"
		@focus="onFocus"
		@blur="onBlur"
		:class="
			[
				'border-input bg-transparent dark:bg-input/30 text-foreground placeholder:text-muted-foreground h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
				props.class,
				props.inputClass,
			]
				.filter(Boolean)
				.join(' ')
		"
	/>
</template>
