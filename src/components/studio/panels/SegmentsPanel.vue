<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Reorder, useDragControls } from 'motion-v'
import { useMediaQuery } from '@vueuse/core'
import SegmentRow from '@/components/studio/SegmentRow.vue'
import LineSelector from '@/components/studio/LineSelector.vue'
import {
	SEGMENT_KEYS,
	isSegmentKey,
	type SegmentKey,
} from '@/components/studio/segments/segmentMeta'
import { segmentConfigMap } from '@/components/studio/segments'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const whileDragStyle = computed(() =>
	prefersReducedMotion.value
		? undefined
		: { scale: 1.02, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', zIndex: 10 },
)

// --- Segment order derived from config ---

const segmentOrder = ref<string[]>(Object.keys(configStore.currentLineSegments))

watch(
	() => Object.keys(configStore.currentLineSegments),
	(newKeys) => {
		// Only update if order actually changed (avoid clobbering during drag)
		if (JSON.stringify(newKeys) !== JSON.stringify(segmentOrder.value)) {
			segmentOrder.value = newKeys
		}
	},
)

// --- Drag controls per segment ---

const dragControlsMap = Object.fromEntries(
	SEGMENT_KEYS.map((key) => [key, useDragControls()]),
) as Record<SegmentKey, ReturnType<typeof useDragControls>>

// --- Expanded state (multi-open, keyed by segment key) ---

const expandedRows = ref<Record<string, boolean>>({})

function isExpanded(key: string): boolean {
	return expandedRows.value[key] ?? false
}

function setExpanded(key: string, value: boolean) {
	expandedRows.value[key] = value
}

// --- Row element refs for scrollIntoView ---

const rowRefs = ref<Record<string, HTMLElement | null>>({})

function setRowRef(key: string, el: HTMLElement | null) {
	rowRefs.value[key] = el
}

// --- Handlers ---

function handleReorder(newOrder: string[]) {
	segmentOrder.value = newOrder
	configStore.reorderSegments(editorStore.activeLineIndex, newOrder as SegmentKey[])
}

function handleSelect(key: string) {
	editorStore.selectSegment(key)
}

function handleToggleEnabled(key: string, enabled: boolean) {
	configStore.toggleSegment(editorStore.activeLineIndex, key as SegmentKey, enabled)
}

// --- Selection sync: external → list ---

watch(
	() => editorStore.selectedSegment,
	async (selectedKey) => {
		if (!selectedKey || !isSegmentKey(selectedKey)) return

		// Auto-expand if not already expanded
		if (!isExpanded(selectedKey)) {
			setExpanded(selectedKey, true)
		}

		// ScrollIntoView
		await nextTick()
		const el = rowRefs.value[selectedKey]
		if (el) {
			el.scrollIntoView({
				behavior: prefersReducedMotion.value ? 'auto' : 'smooth',
				block: 'nearest',
			})
		}
	},
)
</script>

<template>
	<div class="flex flex-col gap-1 p-2">
		<LineSelector />

		<Reorder.Group
			axis="y"
			:values="segmentOrder"
			as="div"
			class="flex flex-col gap-1"
			@update:values="handleReorder"
		>
			<Reorder.Item
				v-for="key in segmentOrder"
				:key="key"
				:value="key"
				:drag-listener="false"
				:drag-controls="dragControlsMap[key as SegmentKey]"
				as="div"
				:while-drag="whileDragStyle"
			>
				<div :ref="(el: any) => setRowRef(key, el as HTMLElement)">
					<SegmentRow
						:segment-key="key as SegmentKey"
						:enabled="configStore.currentLineSegments[key as SegmentKey]?.enabled ?? false"
						:selected="editorStore.selectedSegment === key"
						:drag-controls="dragControlsMap[key as SegmentKey]"
						v-model:expanded="expandedRows[key]"
						@select="handleSelect(key)"
						@toggle-enabled="(enabled: boolean) => handleToggleEnabled(key, enabled)"
					>
						<template #config>
							<component
								v-if="segmentConfigMap[key]"
								:is="segmentConfigMap[key]"
							/>
						</template>
					</SegmentRow>
				</div>
			</Reorder.Item>
		</Reorder.Group>
	</div>
</template>
