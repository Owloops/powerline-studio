<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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

const hasConfigOptions = computed(() => {
	return !!segmentConfigMap[props.segmentKey] && !NO_OPTIONS_SEGMENTS.has(props.segmentKey)
})

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
		<PopoverContent :side-offset="8" align="start" class="w-96 p-0" @open-auto-focus.prevent>
			<!-- Header -->
			<div class="flex items-center gap-3 px-4 pt-3" :class="hasConfigOptions ? 'pb-0' : 'pb-3'">
				<component :is="meta.icon" class="size-4 shrink-0 text-muted-foreground" />
				<span class="min-w-0 flex-1 text-sm font-semibold">{{ meta.name }}</span>
				<Button
					variant="ghost"
					size="icon-sm"
					class="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
					@click="handleRemove"
				>
					<Trash2 class="size-3.5" />
					<span class="sr-only">Remove segment</span>
				</Button>
			</div>

			<!-- Config form (only for segments with real options) -->
			<template v-if="hasConfigOptions">
				<Separator class="mt-2" />
				<ScrollArea class="max-h-72">
					<div class="compact-fields px-4 py-2.5">
						<component :is="segmentConfigMap[segmentKey]" :key="`${segmentKey}-${lineIndex}`" />
					</div>
				</ScrollArea>
			</template>
		</PopoverContent>
	</Popover>
</template>

<style scoped>
/*
 * Compact form layout for popover config panels.
 * Flips vertical form field containers to horizontal rows.
 * FormSwitchField already uses horizontal layout — no change needed.
 */
.compact-fields :deep(> .flex.flex-col) {
	gap: 0.5rem;
}

.compact-fields :deep(.flex.flex-col.gap-1\.5) {
	flex-direction: row;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.375rem;
}

.compact-fields :deep(.flex.flex-col.gap-1\.5 > label) {
	flex-shrink: 0;
	width: 5.5rem;
	font-size: 0.75rem;
}

.compact-fields :deep(.flex.flex-col.gap-1\.5 > input),
.compact-fields :deep(.flex.flex-col.gap-1\.5 > button[role='combobox']) {
	flex: 1;
	min-width: 0;
}

/* Error/description text takes full width below */
.compact-fields :deep(.flex.flex-col.gap-1\.5 > p) {
	width: 100%;
	font-size: 0.75rem;
}

/* Smaller input heights */
.compact-fields :deep(input) {
	height: 2rem;
	font-size: 0.75rem;
}

.compact-fields :deep(button[role='combobox']) {
	height: 2rem;
	font-size: 0.75rem;
}

/* Reduce switch field gap in compact mode */
.compact-fields :deep(.flex.flex-col.gap-1 > .flex.items-center.gap-3 > label) {
	font-size: 0.75rem;
}
</style>
