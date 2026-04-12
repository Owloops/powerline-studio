<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Reorder } from 'motion-v'
import { useMediaQuery } from '@vueuse/core'
import { Sparkles } from 'lucide-vue-next'
import LineSelector from '@/components/studio/LineSelector.vue'
import SegmentPicker from '@/components/studio/SegmentPicker.vue'
import SegmentChip from './SegmentChip.vue'
import SegmentConfigPopover from './SegmentConfigPopover.vue'
import { isSegmentKey, type SegmentKey } from '@/components/studio/segments/segmentMeta'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const whileDragStyle = computed(() =>
	prefersReducedMotion.value
		? undefined
		: { scale: 1.05, boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.15)', zIndex: 10 },
)

const displayStyle = computed(() => configStore.activeStyle as 'minimal' | 'powerline' | 'capsule')

// --- Enabled segment keys derived from config ---

const enabledSegmentKeys = computed<SegmentKey[]>(() => {
	const segments = configStore.currentLineSegments
	return (Object.keys(segments) as SegmentKey[]).filter((key) => segments[key]?.enabled)
})

const enabledKeySet = computed(() => new Set<string>(enabledSegmentKeys.value))

// Local order state for drag reorder
const segmentOrder = ref<SegmentKey[]>([...enabledSegmentKeys.value])

watch(enabledSegmentKeys, (newKeys) => {
	const newSet = new Set(newKeys)
	const kept = segmentOrder.value.filter((key) => newSet.has(key))
	const keptSet = new Set(kept)
	const added = newKeys.filter((key) => !keptSet.has(key))
	const merged = [...kept, ...added]
	if (JSON.stringify(merged) !== JSON.stringify(segmentOrder.value)) {
		segmentOrder.value = merged
	}
})

// --- Popover state ---

const openPopover = ref<string | null>(null)

function togglePopover(key: string) {
	openPopover.value = openPopover.value === key ? null : key
}

function setPopoverOpen(key: string, value: boolean) {
	if (value) {
		openPopover.value = key
	} else if (openPopover.value === key) {
		openPopover.value = null
	}
}

// --- Chip element refs for scroll-into-view ---

const chipEls = ref<Record<string, Element | null>>({})

function setChipRef(key: string) {
	return (el: Element | ComponentPublicInstance | null) => {
		chipEls.value[key] = el instanceof Element ? el : ((el as ComponentPublicInstance)?.$el ?? null)
	}
}

// --- Handlers ---

function handleReorder(newOrder: SegmentKey[]) {
	segmentOrder.value = newOrder
	const disabledKeys = (Object.keys(configStore.currentLineSegments) as SegmentKey[]).filter(
		(key) => !enabledKeySet.value.has(key),
	)
	configStore.reorderSegments(editorStore.activeLineIndex, [...newOrder, ...disabledKeys])
}

function handleAddSegment(key: SegmentKey) {
	configStore.toggleSegment(editorStore.activeLineIndex, key, true)
	nextTick(() => {
		openPopover.value = key
	})
}

function handleRemoveSegment(key: string) {
	if (editorStore.selectedSegment === key) {
		editorStore.clearSelection()
	}
}

// --- Selection sync: external focusedSegment -> scroll + highlight ---

const highlightedChip = ref<string | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | undefined

watch(
	() => editorStore.focusedSegment,
	async (focused) => {
		if (!focused || !isSegmentKey(focused.name)) return
		if (focused.source !== 'preview') return

		openPopover.value = focused.name

		// Apply highlight animation
		clearTimeout(highlightTimer)
		highlightedChip.value = focused.name
		highlightTimer = setTimeout(() => {
			highlightedChip.value = null
		}, 2000)

		await nextTick()
		const el = chipEls.value[focused.name]
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
	<section class="flex flex-col gap-4">
		<div class="flex items-center justify-between gap-4">
			<div>
				<h2 class="text-sm font-semibold">Layout Editor</h2>
				<p class="text-xs text-muted-foreground">Click segments to configure, drag to reorder</p>
			</div>
			<LineSelector />
		</div>

		<!-- Segment chips layout -->
		<div class="rounded-lg border border-border bg-card p-4">
			<template v-if="segmentOrder.length > 0">
				<Reorder.Group
					axis="x"
					:values="segmentOrder"
					as="div"
					class="flex flex-wrap items-center"
					:class="[
						displayStyle === 'minimal' && 'gap-2',
						displayStyle === 'capsule' && 'gap-2',
						displayStyle === 'powerline' && 'gap-0',
					]"
					@update:values="handleReorder"
				>
					<Reorder.Item
						v-for="(key, index) in segmentOrder"
						:key="key"
						:value="key"
						as="div"
						class="cursor-grab active:cursor-grabbing"
						:while-drag="whileDragStyle"
					>
						<SegmentConfigPopover
							:ref="setChipRef(key)"
							:segment-key="key as SegmentKey"
							:line-index="editorStore.activeLineIndex"
							:open="openPopover === key"
							@update:open="setPopoverOpen(key, $event)"
							@remove="handleRemoveSegment(key)"
						>
							<SegmentChip
								:segment-key="key as SegmentKey"
								:display-style="displayStyle"
								:selected="openPopover === key"
								:highlighted="highlightedChip === key"
								:is-first="index === 0"
								:is-last="index === segmentOrder.length - 1"
							/>
						</SegmentConfigPopover>
					</Reorder.Item>
				</Reorder.Group>

				<!-- Add Segment inline at end -->
				<div class="mt-3">
					<SegmentPicker :enabled-keys="enabledKeySet" @add="handleAddSegment" />
				</div>
			</template>

			<!-- Empty state -->
			<div v-else class="flex flex-col items-center gap-3 py-8 text-center">
				<div class="flex size-10 items-center justify-center rounded-full bg-muted">
					<Sparkles class="size-5 text-muted-foreground" />
				</div>
				<div class="space-y-1">
					<p class="text-sm font-medium text-foreground">No segments yet</p>
					<p class="text-xs text-muted-foreground">
						Add segments to build your statusline, or choose a preset above
					</p>
				</div>
				<div class="pt-1">
					<SegmentPicker :enabled-keys="enabledKeySet" @add="handleAddSegment" />
				</div>
			</div>
		</div>
	</section>
</template>
