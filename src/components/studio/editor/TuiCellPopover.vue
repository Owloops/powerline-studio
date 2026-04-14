<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import TuiCellContent from './TuiCellContent.vue'

const props = defineProps<{
	cellSegment: string
	open: boolean
	span?: number
	maxSpan?: number
}>()

const emit = defineEmits<{
	'update:open': [value: boolean]
	'update:span': [value: number]
	swap: [newSegment: string]
}>()
</script>

<template>
	<Popover :open="open" @update:open="emit('update:open', $event)">
		<PopoverTrigger as-child>
			<slot />
		</PopoverTrigger>
		<PopoverContent
			:side-offset="8"
			align="start"
			class="w-[calc(100vw-2rem)] p-0 sm:w-92"
			@open-auto-focus.prevent
		>
			<TuiCellContent
				:cell-segment="cellSegment"
				:span="span"
				:max-span="maxSpan"
				@update:span="emit('update:span', $event)"
				@swap="emit('swap', $event)"
			/>
		</PopoverContent>
	</Popover>
</template>
