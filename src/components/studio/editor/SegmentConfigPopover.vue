<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { SegmentKey } from '@/components/studio/segments/segmentMeta'
import SegmentConfigContent from './SegmentConfigContent.vue'

const props = defineProps<{
	segmentKey: SegmentKey
	lineIndex: number
	open: boolean
}>()

const emit = defineEmits<{
	'update:open': [value: boolean]
	remove: []
}>()

function handleOpenChange(value: boolean) {
	emit('update:open', value)
}

function handleRemove() {
	emit('update:open', false)
	emit('remove')
}
</script>

<template>
	<Popover :open="open" @update:open="handleOpenChange">
		<PopoverTrigger as-child>
			<slot />
		</PopoverTrigger>
		<PopoverContent :side-offset="8" align="start" class="w-96 p-0">
			<SegmentConfigContent
				:segment-key="segmentKey"
				:line-index="lineIndex"
				@remove="handleRemove"
			/>
		</PopoverContent>
	</Popover>
</template>
