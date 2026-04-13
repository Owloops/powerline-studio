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

const props = defineProps<{
	label: string
	bg: string
	fg: string
	index?: number
	showReset?: boolean
	isOverridden?: boolean
}>()

const previewWord = computed(() => PREVIEW_WORDS[(props.index ?? 0) % PREVIEW_WORDS.length])

const emit = defineEmits<{
	'update:bg': [color: string]
	'update:fg': [color: string]
	reset: []
}>()
</script>

<template>
	<div class="grid grid-cols-[120px_1fr_1fr_1fr_auto] items-center gap-2">
		<span
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
			class="flex h-7 items-center justify-center truncate rounded-md border border-border px-1 text-[0.625rem] font-bold"
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
