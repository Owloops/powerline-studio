<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Reorder } from 'motion-v'
import { useMediaQuery } from '@vueuse/core'
import { Sparkles, Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import SegmentPicker from '@/components/studio/SegmentPicker.vue'
import SegmentChip from './SegmentChip.vue'
import SegmentConfigPopover from './SegmentConfigPopover.vue'
import { isSegmentKey, type SegmentKey } from '@/components/studio/segments/segmentMeta'
import { normalizeSegments } from '@/components/studio/segments/segmentMeta'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const whileDragStyle = computed(() =>
	prefersReducedMotion.value
		? undefined
		: { scale: 1.05, boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.15)', zIndex: 10 },
)

const displayStyle = computed(() => configStore.activeStyle as 'minimal' | 'powerline' | 'capsule')

const lines = computed(() => configStore.config.display.lines)
const lineCount = computed(() => lines.value.length)
const canAddLine = computed(() => lineCount.value < 5)

// --- Per-line enabled segment keys derived from config directly ---

function getLineEnabledKeys(lineIndex: number): SegmentKey[] {
	const line = configStore.config.display.lines[lineIndex]
	if (!line) return []
	const normalized = normalizeSegments(line.segments, SEGMENT_DEFAULTS)
	return (Object.keys(normalized) as SegmentKey[]).filter((key) => normalized[key]?.enabled)
}

function getLineEnabledKeySet(lineIndex: number): Set<string> {
	return new Set<string>(getLineEnabledKeys(lineIndex))
}

// Local order state per line for drag reorder
const segmentOrders = ref<Record<number, SegmentKey[]>>({})

// Initialize and sync segment orders per line
watch(
	() => configStore.config.display.lines.map((line, i) => getLineEnabledKeys(i)),
	(allLineKeys) => {
		const newOrders: Record<number, SegmentKey[]> = {}
		for (let i = 0; i < allLineKeys.length; i++) {
			const newKeys = allLineKeys[i]!
			const existing = segmentOrders.value[i] ?? []
			const newSet = new Set(newKeys)
			const kept = existing.filter((key) => newSet.has(key))
			const keptSet = new Set(kept)
			const added = newKeys.filter((key) => !keptSet.has(key))
			newOrders[i] = [...kept, ...added]
		}
		segmentOrders.value = newOrders
	},
	{ immediate: true, deep: true },
)

// --- Popover state using composite keys ---

const openPopover = ref<string | null>(null)

function compositeKey(lineIndex: number, segmentKey: string): string {
	return `${lineIndex}:${segmentKey}`
}

function setPopoverOpen(lineIndex: number, key: string, value: boolean) {
	const ck = compositeKey(lineIndex, key)
	if (value) {
		openPopover.value = ck
		editorStore.setActiveLineIndex(lineIndex)
	} else if (openPopover.value === ck) {
		openPopover.value = null
	}
}

// --- Chip element refs for scroll-into-view ---

const chipEls = ref<Record<string, Element | null>>({})

function setChipRef(lineIndex: number, key: string) {
	const ck = compositeKey(lineIndex, key)
	return (el: Element | ComponentPublicInstance | null) => {
		chipEls.value[ck] = el instanceof Element ? el : ((el as ComponentPublicInstance)?.$el ?? null)
	}
}

// --- Handlers ---

function handleReorder(lineIndex: number, newOrder: SegmentKey[]) {
	segmentOrders.value[lineIndex] = newOrder
	const lineEnabledSet = getLineEnabledKeySet(lineIndex)
	const line = configStore.config.display.lines[lineIndex]
	if (!line) return
	const normalized = normalizeSegments(line.segments, SEGMENT_DEFAULTS)
	const disabledKeys = (Object.keys(normalized) as SegmentKey[]).filter(
		(key) => !lineEnabledSet.has(key),
	)
	configStore.reorderSegments(lineIndex, [...newOrder, ...disabledKeys])
}

function handleAddSegment(lineIndex: number, key: SegmentKey) {
	editorStore.setActiveLineIndex(lineIndex)
	configStore.toggleSegment(lineIndex, key, true)
	nextTick(() => {
		openPopover.value = compositeKey(lineIndex, key)
	})
}

function handleRemoveSegment(lineIndex: number, key: string) {
	const ck = compositeKey(lineIndex, key)
	if (openPopover.value === ck) {
		openPopover.value = null
	}
	if (editorStore.selectedSegment === key) {
		editorStore.clearSelection()
	}
}

function handleAddLine() {
	configStore.addLine()
}

function handleRemoveLine(lineIndex: number) {
	// Clear stale composite-keyed state before indices shift
	openPopover.value = null
	highlightedChip.value = null
	chipEls.value = {}
	configStore.removeLine(lineIndex)
}

// --- Selection sync: external focusedSegment -> scroll + highlight ---

const highlightedChip = ref<string | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | undefined

watch(
	() => editorStore.focusedSegment,
	async (focused) => {
		if (!focused || !isSegmentKey(focused.name)) return
		if (focused.source !== 'preview') return

		const lineIndex = focused.lineIndex ?? 0
		const ck = compositeKey(lineIndex, focused.name)

		editorStore.setActiveLineIndex(lineIndex)
		openPopover.value = ck

		// Apply highlight animation
		clearTimeout(highlightTimer)
		highlightedChip.value = ck
		highlightTimer = setTimeout(() => {
			highlightedChip.value = null
		}, 2000)

		await nextTick()
		const el = chipEls.value[ck]
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
		<div>
			<h2 class="text-sm font-semibold">Layout Editor</h2>
			<p class="text-xs text-muted-foreground">Click segments to configure, drag to reorder</p>
		</div>

		<!-- All lines rendered simultaneously -->
		<div class="flex flex-col gap-3">
			<div
				v-for="(line, lineIndex) in lines"
				:key="lineIndex"
				class="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
			>
				<!-- Line header -->
				<div class="flex items-center justify-between gap-2">
					<span class="text-xs font-medium text-muted-foreground">Line {{ lineIndex + 1 }}</span>
					<Button
						v-if="lineIndex > 0"
						variant="ghost"
						size="icon-sm"
						class="!size-6 text-muted-foreground hover:text-destructive"
						@click="handleRemoveLine(lineIndex)"
					>
						<Trash2 class="size-3.5" />
						<span class="sr-only">Remove Line {{ lineIndex + 1 }}</span>
					</Button>
				</div>

				<!-- Segment chips -->
				<template v-if="(segmentOrders[lineIndex] ?? []).length > 0">
					<Reorder.Group
						axis="x"
						:values="segmentOrders[lineIndex] ?? []"
						as="div"
						class="flex flex-wrap items-center"
						:class="[
							displayStyle === 'minimal' && 'gap-2',
							displayStyle === 'capsule' && 'gap-2',
							displayStyle === 'powerline' && 'gap-0',
						]"
						@update:values="handleReorder(lineIndex, $event)"
					>
						<Reorder.Item
							v-for="(key, segIndex) in segmentOrders[lineIndex] ?? []"
							:key="key"
							:value="key"
							as="div"
							class="cursor-grab hover:z-10 active:cursor-grabbing"
							:while-drag="whileDragStyle"
						>
							<SegmentConfigPopover
								:ref="setChipRef(lineIndex, key)"
								:segment-key="key as SegmentKey"
								:line-index="lineIndex"
								:open="openPopover === compositeKey(lineIndex, key)"
								@update:open="setPopoverOpen(lineIndex, key, $event)"
								@remove="handleRemoveSegment(lineIndex, key)"
							>
								<SegmentChip
									:segment-key="key as SegmentKey"
									:display-style="displayStyle"
									:selected="openPopover === compositeKey(lineIndex, key)"
									:highlighted="highlightedChip === compositeKey(lineIndex, key)"
									:is-first="segIndex === 0"
									:is-last="segIndex === (segmentOrders[lineIndex] ?? []).length - 1"
								/>
							</SegmentConfigPopover>
						</Reorder.Item>
					</Reorder.Group>

					<SegmentPicker
						:enabled-keys="getLineEnabledKeySet(lineIndex)"
						@add="handleAddSegment(lineIndex, $event)"
					/>
				</template>

				<!-- Empty state per line -->
				<div v-else class="flex flex-col items-center gap-3 py-6 text-center">
					<div class="flex size-8 items-center justify-center rounded-full bg-muted">
						<Sparkles class="size-4 text-muted-foreground" />
					</div>
					<div class="space-y-1">
						<p class="text-sm font-medium text-foreground">No segments</p>
						<p class="text-xs text-muted-foreground">Add segments to this line</p>
					</div>
					<SegmentPicker
						:enabled-keys="getLineEnabledKeySet(lineIndex)"
						@add="handleAddSegment(lineIndex, $event)"
					/>
				</div>
			</div>
		</div>

		<!-- Add Line button -->
		<TooltipProvider :delay-duration="300">
			<Tooltip>
				<TooltipTrigger as-child>
					<div>
						<Button
							variant="outline"
							size="sm"
							:disabled="!canAddLine"
							class="w-full border-dashed"
							@click="handleAddLine"
						>
							<Plus class="size-4" />
							Add Line
						</Button>
					</div>
				</TooltipTrigger>
				<TooltipContent v-if="!canAddLine"> Maximum of 5 lines reached </TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</section>
</template>
