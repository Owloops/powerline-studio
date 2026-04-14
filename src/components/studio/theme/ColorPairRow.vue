<script setup lang="ts">
import { Button } from '@/components/ui/button'
import ColorInput from './ColorInput.vue'

const PREVIEW_WORDS = [
	'Sphinx',
	'of black',
	'quartz',
	'judge',
	'my vow',
	'The quick',
	'brown fox',
	'jumps',
	'over the',
	'lazy dog',
	'Amazingly few',
	'discotheques',
	'provide',
	'jukeboxes',
]

const props = withDefaults(
	defineProps<{
		label: string
		bg: string
		fg: string
		index?: number
		showLabel?: boolean
		showPreview?: boolean
		showReset?: boolean
		isOverridden?: boolean
	}>(),
	{ showLabel: true, showPreview: true },
)

const gridClass = computed(() => {
	if (props.showLabel && props.showPreview)
		return 'grid-cols-[1fr_auto_auto_auto] @min-[440px]:grid-cols-[80px_1fr_1fr_0.6fr_auto] sm:grid-cols-[120px_1fr_1fr_1fr_auto]'
	if (props.showLabel) return 'grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[120px_1fr_1fr_auto]'
	if (props.showPreview)
		return 'grid-cols-[1fr_1fr_auto] @min-[440px]:grid-cols-[1fr_1fr_0.6fr_auto] sm:grid-cols-[1fr_1fr_1fr_auto]'
	return 'grid-cols-[1fr_1fr_auto]'
})

const previewWord = computed(() =>
	props.index != null ? PREVIEW_WORDS[props.index % PREVIEW_WORDS.length] : 'Abcdef',
)

const emit = defineEmits<{
	'update:bg': [color: string]
	'update:fg': [color: string]
	reset: []
}>()
</script>

<template>
	<div class="grid items-center gap-2" :class="gridClass">
		<span
			v-if="showLabel"
			class="truncate text-xs"
			:class="isOverridden ? 'font-medium text-foreground' : 'text-muted-foreground'"
		>
			{{ label }}
		</span>
		<ColorInput
			:color="bg"
			:label="`${label} background`"
			@update:color="emit('update:bg', $event)"
		/>
		<ColorInput
			:color="fg"
			:label="`${label} foreground`"
			@update:color="emit('update:fg', $event)"
		/>
		<span
			v-if="showPreview"
			class="hidden h-7 min-w-0 items-center justify-center truncate rounded-md border border-border px-1 text-[0.625rem] font-bold @min-[440px]:flex"
			:style="{ backgroundColor: bg, color: fg }"
		>
			{{ previewWord }}
		</span>
		<ConfirmPopover
			v-if="showReset"
			action="Reset"
			:disabled="!isOverridden"
			@confirm="emit('reset')"
		>
			<Button
				variant="ghost"
				size="icon"
				class="size-6"
				:disabled="!isOverridden"
				:aria-label="`Reset ${label} to theme default`"
			>
				<IconLucide-undo-2 class="size-3.5" />
			</Button>
		</ConfirmPopover>
		<div v-else class="size-6" />
	</div>
</template>
