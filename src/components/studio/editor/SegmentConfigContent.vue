<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
}>()

const emit = defineEmits<{
	remove: []
}>()

const configStore = useConfigStore()

provide('formCompact', true)

const meta = computed(() => SEGMENT_META[props.segmentKey])

const hasConfigOptions = computed(() => {
	return !!segmentConfigMap[props.segmentKey] && !NO_OPTIONS_SEGMENTS.has(props.segmentKey)
})

function handleRemove() {
	configStore.toggleSegment(props.lineIndex, props.segmentKey, false)
	emit('remove')
}
</script>

<template>
	<!-- Header -->
	<div class="flex items-center gap-3 px-4 pt-3" :class="hasConfigOptions ? 'pb-0' : 'pb-3'">
		<component :is="meta.icon" class="size-4 shrink-0 text-muted-foreground" />
		<span class="min-w-0 flex-1 text-sm font-semibold">{{ meta.name }}</span>
		<ConfirmPopover action="Remove" @confirm="handleRemove">
			<Button
				variant="ghost"
				size="icon-sm"
				class="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
			>
				<Trash2 class="size-3.5" />
				<span class="sr-only">Remove segment</span>
			</Button>
		</ConfirmPopover>
	</div>

	<!-- Config form (only for segments with real options) -->
	<template v-if="hasConfigOptions">
		<Separator class="mt-2" />
		<div class="max-h-[70vh] overflow-y-auto">
			<div class="compact-fields px-4 py-2.5">
				<component :is="segmentConfigMap[segmentKey]" :key="`${segmentKey}-${lineIndex}`" />
			</div>
		</div>
	</template>
</template>
