<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Reorder } from 'motion-v'
import { useMediaQuery } from '@vueuse/core'
import SegmentRow from '@/components/studio/SegmentRow.vue'
import LineSelector from '@/components/studio/LineSelector.vue'
import SegmentPicker from '@/components/studio/SegmentPicker.vue'
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

// --- Enabled segment keys derived from config ---

const enabledSegmentKeys = computed<SegmentKey[]>(() => {
	const segments = configStore.currentLineSegments
	return (Object.keys(segments) as SegmentKey[]).filter((key) => segments[key]?.enabled)
})

const enabledKeySet = computed(() => new Set<string>(enabledSegmentKeys.value))

// Local order state — tracks enabled keys for drag reorder
const segmentOrder = ref<SegmentKey[]>([...enabledSegmentKeys.value])

watch(enabledSegmentKeys, (newKeys) => {
	// Rebuild order: keep existing order for keys still present, append new keys at the end
	const newSet = new Set(newKeys)
	const kept = segmentOrder.value.filter((key) => newSet.has(key))
	const keptSet = new Set(kept)
	const added = newKeys.filter((key) => !keptSet.has(key))
	const merged = [...kept, ...added]
	if (JSON.stringify(merged) !== JSON.stringify(segmentOrder.value)) {
		segmentOrder.value = merged
	}
})

// --- Expanded state (multi-open, keyed by segment key) ---

const expandedRows = ref<Record<string, boolean>>(
	Object.fromEntries(SEGMENT_KEYS.map((key) => [key, false])),
)

function isExpanded(key: string): boolean {
	return expandedRows.value[key] ?? false
}

// --- Row element refs for scrollIntoView ---

const rowRefs = ref<Record<string, HTMLElement | null>>({})

function setRowRef(key: string, el: HTMLElement | null) {
	rowRefs.value[key] = el
}

// --- Handlers ---

let reorderCommitTimer: ReturnType<typeof setTimeout> | undefined

function commitReorder(order: SegmentKey[]) {
	const disabledKeys = (Object.keys(configStore.currentLineSegments) as SegmentKey[]).filter(
		(key) => !enabledKeySet.value.has(key),
	)
	configStore.reorderSegments(editorStore.activeLineIndex, [...order, ...disabledKeys])
}

function handleReorder(newOrder: SegmentKey[]) {
	segmentOrder.value = newOrder
	// Debounce the store commit to avoid reactive avalanche during drag
	clearTimeout(reorderCommitTimer)
	reorderCommitTimer = setTimeout(() => {
		commitReorder(newOrder)
	}, 150)
}

function handleSelect(key: string) {
	editorStore.selectSegment(key)
}

function handleRemoveSegment(key: string) {
	// Collapse the row first
	expandedRows.value[key] = false
	configStore.toggleSegment(editorStore.activeLineIndex, key as SegmentKey, false)
	// Clear selection if the removed segment was selected
	if (editorStore.selectedSegment === key) {
		editorStore.clearSelection()
	}
}

function handleAddSegment(key: SegmentKey) {
	configStore.toggleSegment(editorStore.activeLineIndex, key, true)
	// Auto-select and expand the newly added segment
	editorStore.selectSegment(key)
	expandedRows.value[key] = true
}

// --- Selection sync: external -> list ---

watch(
	() => editorStore.selectedSegment,
	async (selectedKey) => {
		if (!selectedKey || !isSegmentKey(selectedKey)) return

		// Auto-expand if not already expanded
		if (!isExpanded(selectedKey)) {
			expandedRows.value[selectedKey] = true
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
	<div class="flex flex-col gap-3 p-2">
		<LineSelector />

		<!-- Enabled segments reorder list -->
		<Reorder.Group
			v-if="segmentOrder.length > 0"
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
				as="div"
				:while-drag="whileDragStyle"
			>
				<div :ref="(el: any) => setRowRef(key, el as HTMLElement)">
					<SegmentRow
						:segment-key="key as SegmentKey"
						:selected="editorStore.selectedSegment === key"
						v-model:expanded="expandedRows[key]"
						@select="handleSelect(key)"
						@remove="handleRemoveSegment(key)"
					>
						<template #config>
							<component
								v-if="segmentConfigMap[key]"
								:is="segmentConfigMap[key]"
								:key="`${key}-${editorStore.activeLineIndex}`"
							/>
						</template>
					</SegmentRow>
				</div>
			</Reorder.Item>
		</Reorder.Group>

		<!-- Empty state -->
		<div
			v-else
			class="flex flex-col items-center gap-2 rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground"
		>
			<span>No segments in this line</span>
			<span class="text-xs">Add segments using the button below</span>
		</div>

		<!-- Add Segment picker -->
		<SegmentPicker :enabled-keys="enabledKeySet" @add="handleAddSegment" />
	</div>
</template>
