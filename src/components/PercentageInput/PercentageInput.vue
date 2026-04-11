<script setup lang="ts">
import { computed, type PropType } from 'vue'
import MaskNumberInput from '@/components/MaskNumberInput/MaskNumberInput.vue'

const props = defineProps({
	modelValue: {
		type: Number as PropType<number | null>,
		default: null,
	},
	fraction: {
		type: Number,
		default: 2, // Default decimal places for the percentage view
	},
	locale: {
		type: String,
		default: 'fi-FI', // Or your preferred default
	},
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
	inputClass: {
		type: String,
		default: '',
	},
	unsigned: {
		// Percentages are typically unsigned in view
		type: Boolean,
		default: true,
	},
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const toViewPercent = (val: number | null): number | null => {
	return val !== null ? val * 100 : null
}

const fromViewPercent = (val: number | null): number | null => {
	return val !== null ? val / 100 : null
}

const handleUpdateModelValue = (value: number | null) => {
	emit('update:modelValue', value)
}

const handleFocus = (event: FocusEvent) => {
	emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
	emit('blur', event)
}

// Pass all other attributes to MaskNumberInput
const MaskaInputProps = computed(() => {
	return {
		...props,
		// Override toView and fromView with percentage specific ones
		toView: toViewPercent,
		fromView: fromViewPercent,
		// fraction prop for PercentageInput controls the fraction for MaskNumberInput
		fraction: props.fraction,
	}
})
</script>

<template>
	<MaskNumberInput
		:id="id"
		:name="name"
		:model-value="modelValue === null ? undefined : modelValue"
		:locale="locale"
		:fraction="fraction"
		:unsigned="unsigned"
		:placeholder="placeholder"
		:disabled="disabled"
		:input-class="inputClass"
		:to-view="toViewPercent"
		:from-view="fromViewPercent"
		@update:model-value="handleUpdateModelValue"
		@focus="handleFocus"
		@blur="handleBlur"
	/>
</template>
