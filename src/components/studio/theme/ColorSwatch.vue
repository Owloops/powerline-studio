<script setup lang="ts">
const props = defineProps<{
	color: string
	label: string
}>()

const emit = defineEmits<{
	'update:color': [hex: string]
}>()

const inputRef = shallowRef<HTMLInputElement | null>(null)

function openPicker() {
	inputRef.value?.click()
}

function onInput(e: Event) {
	const target = e.target as HTMLInputElement
	emit('update:color', target.value)
}
</script>

<template>
	<button
		type="button"
		class="color-swatch relative size-6 shrink-0 rounded-md border border-border shadow-sm hover:ring-2 hover:ring-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		:style="{ backgroundColor: props.color }"
		:aria-label="props.label"
		@click="openPicker"
	>
		<input
			ref="inputRef"
			type="color"
			class="sr-only"
			:value="props.color"
			:aria-label="props.label"
			@input="onInput"
		/>
	</button>
</template>

<style scoped>
.color-swatch {
	transition: background-color 150ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
	.color-swatch {
		transition: opacity 0.01ms;
	}
}
</style>
