<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { vMaska } from 'maska/vue'

const props = defineProps({
	modelValue: {
		type: Number,
		default: null,
	},
	locale: {
		type: String,
		default: 'fi-FI',
	},
	fraction: {
		type: Number,
		default: 2,
	},
	unsigned: {
		type: Boolean,
		default: false,
	},
	// Add standard Maska options
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
	inputClass: {
		type: String,
		default: '',
	},
	toView: {
		type: Function as PropType<(modelValue: number | null) => string | number | null>,
		default: (val: number | null) => val,
	},
	fromView: {
		type: Function as PropType<(viewValue: number | null) => number | null>,
		default: (val: number | null) => val,
	},
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

// Reference to the input element
const inputRef = ref<HTMLInputElement>()

// Track if input has focus
const hasFocus = ref(false)

// Track if Maska has initialized
const isMaskaInitialized = ref(false)

// Helper to round numbers to avoid floating point issues
const roundToFraction = (value: number, fraction: number): number => {
	const multiplier = Math.pow(10, fraction)
	return Math.round(value * multiplier) / multiplier
}

// Set the input value programmatically, letting Maska format it
const setInputValue = async (value: string) => {
	if (!inputRef.value || !isMaskaInitialized.value) return

	// Set the raw value
	inputRef.value.value = value

	// Trigger input event to let Maska process it
	const event = new Event('input', { bubbles: true })
	inputRef.value.dispatchEvent(event)

	// Wait for Maska to process
	await nextTick()
}

// Initialize the input value
onMounted(async () => {
	// Wait a tick for Maska to initialize
	await nextTick()
	isMaskaInitialized.value = true

	if (props.modelValue !== null) {
		const transformed = props.toView(props.modelValue)
		if (transformed !== null) {
			// Round to avoid floating point issues
			const rounded =
				typeof transformed === 'number'
					? roundToFraction(transformed, props.fraction).toFixed(props.fraction)
					: transformed
			await setInputValue(String(rounded))
		}
	}
})

// Watch for external changes
watch(
	() => props.modelValue,
	async (newValue) => {
		// Skip if focused or if it's our own update
		if (hasFocus.value) return

		if (newValue !== null) {
			const transformed = props.toView(newValue)
			if (transformed !== null) {
				// Round to avoid floating point issues
				const rounded =
					typeof transformed === 'number'
						? roundToFraction(transformed, props.fraction).toFixed(props.fraction)
						: transformed
				await setInputValue(String(rounded))
			} else {
				await setInputValue('')
			}
		} else {
			await setInputValue('')
		}
	},
)

// Configure Maska options based on props
const maskaOptions = computed(() => {
	const options: Record<string, any> = {}

	// If mask is provided, use it instead of number mode
	if (props.mask) {
		options.mask = props.mask
	} else {
		// Otherwise use number mode
		options.number = {
			locale: props.locale,
			fraction: props.fraction,
			unsigned: props.unsigned,
		}
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
	// Get unmasked value and convert to number
	const unmaskedNumericValue =
		event.detail.unmasked && event.detail.unmasked !== '' ? Number(event.detail.unmasked) : null

	if (unmaskedNumericValue !== null) {
		// Round to avoid floating point issues before conversion
		const rounded = roundToFraction(unmaskedNumericValue, props.fraction + 6) // Extra precision for intermediate values
		const modelCompatibleValue = props.fromView(rounded)
		emit('update:modelValue', modelCompatibleValue)
	} else {
		emit('update:modelValue', null)
	}
}

// Handle focus event
function onFocus(event: FocusEvent) {
	hasFocus.value = true
	emit('focus', event)
}

// Handle blur event
function onBlur(event: FocusEvent) {
	hasFocus.value = false

	// On blur, ensure the displayed value is properly formatted
	if (props.modelValue !== null) {
		const transformed = props.toView(props.modelValue)
		if (transformed !== null) {
			const rounded =
				typeof transformed === 'number'
					? roundToFraction(transformed, props.fraction).toFixed(props.fraction)
					: transformed
			setInputValue(String(rounded))
		}
	}

	emit('blur', event)
}
</script>

<template>
	<input
		:id="id"
		:name="name"
		type="text"
		inputmode="decimal"
		v-maska="maskaOptions"
		@maska="onMaska"
		:placeholder="placeholder"
		:disabled="disabled"
		@focus="onFocus"
		@blur="onBlur"
		:class="[
			'border-input bg-transparent dark:bg-input/30 text-foreground placeholder:text-muted-foreground h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
			inputClass,
		]"
		ref="inputRef"
	/>
</template>
