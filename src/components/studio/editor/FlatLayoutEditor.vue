<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Reorder, AnimatePresence } from 'motion-v'
import { useMediaQuery } from '@vueuse/core'
import { Sparkles, Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import SegmentPicker from '@/components/studio/SegmentPicker.vue'
import SegmentChip from './SegmentChip.vue'
import SegmentConfigPopover from './SegmentConfigPopover.vue'
import { isSegmentKey, type SegmentKey } from '@/components/studio/segments/segmentMeta'
import { normalizeSegments } from '@/components/studio/segments/segmentMeta'
import { SEGMENT_DEFAULTS } from '@/stores/config'
import { cn } from '@/lib/utils'

defineProps<{ step?: number }>()

const configStore = useConfigStore()
const editorStore = useEditorStore()

const isOpen = ref(true)

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const whileDragStyle = computed(() =>
	prefersReducedMotion.value
		? undefined
		: { scale: 1.05, boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.15)', zIndex: 10 },
)

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
const skipSync = ref(false)
let reorderCommitTimer: ReturnType<typeof setTimeout> | undefined

// Initialize and sync segment orders per line
watch(
	() => configStore.config.display.lines.map((line, i) => getLineEnabledKeys(i)),
	(allLineKeys) => {
		if (skipSync.value) return
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
	// Update local order immediately for smooth drag visuals
	segmentOrders.value[lineIndex] = newOrder
	// Debounce the store commit to avoid reactive avalanche during drag
	clearTimeout(reorderCommitTimer)
	reorderCommitTimer = setTimeout(() => {
		commitReorder(lineIndex)
	}, 150)
}

function commitReorder(lineIndex: number) {
	const order = segmentOrders.value[lineIndex]
	if (!order) return
	const lineEnabledSet = getLineEnabledKeySet(lineIndex)
	const line = configStore.config.display.lines[lineIndex]
	if (!line) return
	const normalized = normalizeSegments(line.segments, SEGMENT_DEFAULTS)
	const disabledKeys = (Object.keys(normalized) as SegmentKey[]).filter(
		(key) => !lineEnabledSet.has(key),
	)
	skipSync.value = true
	configStore.reorderSegments(lineIndex, [...order, ...disabledKeys])
	nextTick(() => {
		skipSync.value = false
	})
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
	// Cancel any pending reorder commit before line indices shift
	clearTimeout(reorderCommitTimer)
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
		<Collapsible v-model:open="isOpen">
			<CollapsibleTrigger
				class="relative flex cursor-pointer items-center rounded-md px-1 py-0.5 -ml-1 text-left transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
			>
				<span
					v-if="step"
					class="absolute -left-18 top-0.5 flex size-8 items-center justify-center rounded-full border border-muted-foreground/15 text-xs font-semibold tabular-nums text-muted-foreground/25"
					>{{ step }}</span
				>
				<IconLucide-chevron-right
					class="absolute -left-7 top-2 size-4 text-muted-foreground transition-transform duration-200"
					:class="isOpen && 'rotate-90'"
				/>
				<div>
					<h2 class="text-sm font-semibold">Layout Editor</h2>
					<p class="text-xs text-muted-foreground">Click segments to configure, drag to reorder</p>
				</div>
			</CollapsibleTrigger>

			<CollapsibleContent>
				<div class="flex flex-col gap-4 pt-4">
					<!-- All lines rendered simultaneously -->
					<div class="flex flex-col divide-y divide-dashed divide-border">
						<div
							v-for="(line, lineIndex) in lines"
							:key="lineIndex"
							class="flex flex-col gap-2 py-3 first:pt-0 last:pb-0"
						>
							<!-- Line header -->
							<div class="flex items-center justify-between gap-2">
								<span class="text-xs font-medium text-muted-foreground"
									>Line {{ lineIndex + 1 }}</span
								>
								<div class="flex items-center gap-1">
									<SegmentPicker
										:enabled-keys="getLineEnabledKeySet(lineIndex)"
										@add="handleAddSegment(lineIndex, $event)"
									/>
									<ConfirmPopover v-if="lineIndex > 0" @confirm="handleRemoveLine(lineIndex)">
										<Button
											variant="ghost"
											size="icon-sm"
											class="!size-6 text-muted-foreground hover:text-destructive"
										>
											<Trash2 class="size-3.5" />
											<span class="sr-only">Remove Line {{ lineIndex + 1 }}</span>
										</Button>
									</ConfirmPopover>
								</div>
							</div>

							<!-- Segment chips -->
							<Reorder.Group
								v-if="(segmentOrders[lineIndex] ?? []).length > 0"
								axis="x"
								:values="segmentOrders[lineIndex] ?? []"
								as="div"
								class="flex min-w-0 items-center gap-2 overflow-x-auto"
								@update:values="handleReorder(lineIndex, $event)"
							>
								<AnimatePresence>
									<Reorder.Item
										v-for="(key, segIndex) in segmentOrders[lineIndex] ?? []"
										:key="key"
										:value="key"
										as="div"
										:initial="{ opacity: 0, scale: 0.9 }"
										:animate="{ opacity: 1, scale: 1 }"
										:exit="{ opacity: 0, scale: 0.9 }"
										:transition="{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }"
										:class="
											cn(
												'reorder-chip cursor-grab active:cursor-grabbing',
												'rounded-md border border-border',
												'has-[:focus-visible]:border-ring has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50',
												openPopover === compositeKey(lineIndex, key) &&
													'border-r border-primary ring-2 ring-primary/20',
												highlightedChip === compositeKey(lineIndex, key) &&
													'segment-highlight-pulse',
											)
										"
										:style="
											openPopover === compositeKey(lineIndex, key) ? { zIndex: 10 } : undefined
										"
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
												:selected="openPopover === compositeKey(lineIndex, key)"
												:highlighted="highlightedChip === compositeKey(lineIndex, key)"
											/>
										</SegmentConfigPopover>
									</Reorder.Item>
								</AnimatePresence>
							</Reorder.Group>

							<!-- Empty state per line -->
							<div v-else class="flex flex-col items-center gap-3 py-6 text-center">
								<div class="flex size-8 items-center justify-center rounded-full bg-muted">
									<Sparkles class="size-4 text-muted-foreground" />
								</div>
								<div class="space-y-1">
									<p class="text-sm font-medium text-foreground">No segments</p>
									<p class="text-xs text-muted-foreground">Add segments to this line</p>
								</div>
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
							<TooltipContent v-if="!canAddLine"> Maximum of 5 lines reached. </TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</CollapsibleContent>
		</Collapsible>
		<Separator v-show="isOpen" />
	</section>
</template>

<style scoped>
.reorder-chip:hover,
.reorder-chip:focus {
	z-index: 10 !important;
}

.segment-highlight-pulse {
	animation: segment-pulse 2s ease-out;
}

@keyframes segment-pulse {
	0% {
		outline: 0px solid hsl(var(--primary) / 0.4);
		outline-offset: 0px;
	}
	20% {
		outline: 4px solid hsl(var(--primary) / 0.3);
		outline-offset: 0px;
	}
	100% {
		outline: 0px solid hsl(var(--primary) / 0);
		outline-offset: 0px;
	}
}

@media (prefers-reduced-motion: reduce) {
	.segment-highlight-pulse {
		animation: none;
		box-shadow: 0 0 0 3px hsl(var(--primary) / 0.3);
	}
}
</style>
