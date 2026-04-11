<script setup lang="ts">
import type { DragControls } from 'motion-v'
import { useAutoAnimate } from '@formkit/auto-animate/vue'
import { GripVertical } from 'lucide-vue-next'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Switch } from '@/components/ui/switch'
import { SEGMENT_META, type SegmentKey } from '@/components/studio/segments/segmentMeta'
import { cn } from '@/lib/utils'

defineProps<{
	segmentKey: SegmentKey
	enabled: boolean
	selected: boolean
	dragControls: DragControls
}>()

const expanded = defineModel<boolean>('expanded', { required: true })

const emit = defineEmits<{
	select: []
	toggleEnabled: [enabled: boolean]
}>()

const [autoAnimateRef] = useAutoAnimate({ duration: 150 })

function handlePointerDown(event: PointerEvent, controls: DragControls) {
	controls.start(event)
}

function handleRowClick() {
	emit('select')
	expanded.value = !expanded.value
}

function handleSwitchUpdate(checked: boolean) {
	emit('toggleEnabled', checked)
}
</script>

<template>
	<Collapsible v-model:open="expanded">
		<div
			:class="
				cn(
					'group rounded-md border border-transparent transition-colors',
					selected && 'border-border bg-accent',
					!enabled && 'opacity-50',
				)
			"
		>
			<div
				role="button"
				tabindex="0"
				:class="
					cn(
						'flex h-12 cursor-pointer items-center gap-2 rounded-md px-2 transition-colors',
						'hover:bg-accent/50',
						selected && 'hover:bg-accent',
					)
				"
				@click.prevent="handleRowClick"
				@keydown.enter.prevent="handleRowClick"
				@keydown.space.prevent="handleRowClick"
			>
				<!-- Drag handle -->
				<div
					class="flex cursor-grab items-center text-muted-foreground active:cursor-grabbing"
					@pointerdown.stop="(e: PointerEvent) => handlePointerDown(e, dragControls)"
					@click.stop
				>
					<GripVertical class="size-4" />
				</div>

				<!-- Segment icon + name -->
				<component
					:is="SEGMENT_META[segmentKey].icon"
					class="size-4 shrink-0 text-muted-foreground"
				/>
				<span class="flex-1 truncate text-sm font-medium">
					{{ SEGMENT_META[segmentKey].name }}
				</span>

				<!-- Enable/disable toggle -->
				<Switch :checked="enabled" @click.stop @update:checked="handleSwitchUpdate" />
			</div>

			<CollapsibleContent>
				<div ref="autoAnimateRef" class="px-2 pb-3 pt-1">
					<slot name="config">
						<div class="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
							Configuration options coming soon
						</div>
					</slot>
				</div>
			</CollapsibleContent>
		</div>
	</Collapsible>
</template>
