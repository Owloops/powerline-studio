<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2 } from 'lucide-vue-next'
import { SEGMENT_META, type SegmentKey } from '@/components/studio/segments/segmentMeta'
import { segmentConfigMap } from '@/components/studio/segments'

/**
 * Segments whose config components show only a "no options" message.
 * These get a minimal popover without the config form chrome.
 */
const NO_OPTIONS_SEGMENTS = new Set<SegmentKey>(['model', 'version', 'tmux'])

const props = defineProps<{
	segmentKey: SegmentKey
	lineIndex: number
	open: boolean
}>()

const emit = defineEmits<{
	'update:open': [value: boolean]
	remove: []
}>()

const configStore = useConfigStore()

const meta = computed(() => SEGMENT_META[props.segmentKey])

const isEnabled = computed(() => {
	const seg = configStore.currentLineSegments[props.segmentKey]
	return seg?.enabled ?? false
})

const hasConfigOptions = computed(() => {
	return !!segmentConfigMap[props.segmentKey] && !NO_OPTIONS_SEGMENTS.has(props.segmentKey)
})

function handleToggleEnabled(checked: boolean) {
	configStore.toggleSegment(props.lineIndex, props.segmentKey, checked)
}

function handleRemove() {
	configStore.toggleSegment(props.lineIndex, props.segmentKey, false)
	emit('update:open', false)
	emit('remove')
}

function handleOpenChange(value: boolean) {
	emit('update:open', value)
}
</script>

<template>
	<Popover :open="open" @update:open="handleOpenChange">
		<PopoverTrigger as-child>
			<slot />
		</PopoverTrigger>
		<PopoverContent :side-offset="8" align="start" class="w-80 p-0" @open-auto-focus.prevent>
			<!-- Header -->
			<div class="flex items-center gap-3 px-4 pt-4" :class="hasConfigOptions ? 'pb-0' : 'pb-1'">
				<component :is="meta.icon" class="size-4 shrink-0 text-muted-foreground" />
				<span class="flex-1 text-sm font-semibold">{{ meta.name }}</span>
				<Switch :model-value="isEnabled" @update:model-value="handleToggleEnabled" />
			</div>

			<!-- Config form (only for segments with real options) -->
			<template v-if="hasConfigOptions">
				<Separator class="mt-3" />
				<ScrollArea class="max-h-72">
					<div class="px-4 py-3">
						<component :is="segmentConfigMap[segmentKey]" :key="`${segmentKey}-${lineIndex}`" />
					</div>
				</ScrollArea>
			</template>

			<Separator />

			<!-- Footer -->
			<div class="px-4 py-3">
				<Button
					variant="ghost"
					size="sm"
					class="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
					@click="handleRemove"
				>
					<Trash2 class="size-3.5" />
					Remove Segment
				</Button>
			</div>
		</PopoverContent>
	</Popover>
</template>
