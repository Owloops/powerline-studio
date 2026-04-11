<script setup lang="ts">
import { Button } from '@/components/ui/button'
import ColorSwatch from './ColorSwatch.vue'

defineProps<{
	label: string
	bg: string
	fg: string
	showReset?: boolean
	isOverridden?: boolean
}>()

const emit = defineEmits<{
	'update:bg': [color: string]
	'update:fg': [color: string]
	reset: []
}>()
</script>

<template>
	<div class="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
		<span
			class="text-sm"
			:class="isOverridden ? 'font-medium text-foreground' : 'text-muted-foreground'"
		>
			{{ label }}
		</span>
		<ColorSwatch
			:color="bg"
			:label="`${label} background`"
			@update:color="emit('update:bg', $event)"
		/>
		<ColorSwatch
			:color="fg"
			:label="`${label} foreground`"
			@update:color="emit('update:fg', $event)"
		/>
		<Button
			v-if="showReset"
			variant="ghost"
			size="icon"
			class="size-6"
			:disabled="!isOverridden"
			:aria-label="`Reset ${label} to theme default`"
			@click="emit('reset')"
		>
			<IconLucide-x class="size-3.5" />
		</Button>
		<div v-else class="size-6" />
	</div>
</template>
