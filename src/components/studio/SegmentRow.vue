<script setup lang="ts">
import { ChevronDown, GripVertical, X } from 'lucide-vue-next'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { SEGMENT_META, type SegmentKey } from '@/components/studio/segments/segmentMeta'
import { cn } from '@/lib/utils'

defineProps<{
	segmentKey: SegmentKey
	selected: boolean
}>()

const expanded = defineModel<boolean>('expanded', { required: true })

const emit = defineEmits<{
	select: []
	remove: []
}>()

function handleRowClick() {
	emit('select')
	expanded.value = !expanded.value
}

function handleRemove(event: MouseEvent) {
	event.stopPropagation()
	emit('remove')
}
</script>

<template>
	<Collapsible v-model:open="expanded">
		<div
			:class="
				cn(
					'group rounded-md border border-transparent transition-colors',
					selected && 'border-border bg-accent',
				)
			"
		>
			<!-- Row header — entire row is draggable -->
			<div
				role="button"
				tabindex="0"
				:class="
					cn(
						'flex h-10 select-none items-center gap-2 rounded-md px-2 transition-colors',
						'cursor-grab active:cursor-grabbing',
						'hover:bg-accent/50',
						selected && 'hover:bg-accent',
					)
				"
				@click.prevent="handleRowClick"
				@keydown.enter.prevent="handleRowClick"
				@keydown.space.prevent="handleRowClick"
			>
				<!-- Drag handle indicator -->
				<GripVertical class="size-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />

				<!-- Segment icon + name -->
				<component
					:is="SEGMENT_META[segmentKey].icon"
					class="size-4 shrink-0 text-muted-foreground"
				/>
				<span class="flex-1 truncate text-sm font-medium">
					{{ SEGMENT_META[segmentKey].name }}
				</span>

				<!-- Expand chevron -->
				<ChevronDown
					:class="
						cn(
							'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
							expanded && 'rotate-180',
						)
					"
				/>

				<!-- Remove button -->
				<button
					class="inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
					tabindex="-1"
					@click="handleRemove"
					@pointerdown.stop
				>
					<X class="size-3.5" />
					<span class="sr-only">Remove {{ SEGMENT_META[segmentKey].name }}</span>
				</button>
			</div>

			<!-- Config section with left border indicator -->
			<CollapsibleContent>
				<div class="ml-4 border-l-2 border-border/50 py-2 pr-2 pl-4">
					<slot name="config">
						<div class="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
							No configuration options for this segment
						</div>
					</slot>
				</div>
			</CollapsibleContent>
		</div>
	</Collapsible>
</template>
