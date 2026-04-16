<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { toast } from 'vue-sonner'
import { Reorder, AnimatePresence } from 'motion-v'
import { useMediaQuery } from '@vueuse/core'
import { Sparkles, Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import SegmentPicker from '@/components/studio/SegmentPicker.vue'
import SegmentChip from './SegmentChip.vue'
import SegmentConfigPopover from './SegmentConfigPopover.vue'
import { isSegmentKey, type SegmentKey } from '@/components/studio/segments/segmentMeta'
import { normalizeSegments } from '@/components/studio/segments/segmentMeta'
import { SEGMENT_DEFAULTS } from '@/stores/config'
import { FLAT_PRESETS } from '@/lib/flatPresets'
import { cn } from '@/lib/utils'

defineProps<{ step?: number }>()

const configStore = useConfigStore()
const editorStore = useEditorStore()

const isOpen = computed({
	get: () => editorStore.layoutEditorOpen,
	set: (v: boolean) => {
		editorStore.layoutEditorOpen = v
	},
})

// --- Preset / Import ---

const showImportDialog = ref(false)
const importText = ref('')
const importError = ref('')
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

watch(importText, () => {
	if (importError.value) {
		importError.value = ''
	}
})

const selectedPresetName = computed(() => {
	const entry = configStore.activePreset
	if (!entry) return undefined
	return entry.preset.name
})

function handlePresetSelect(value: string) {
	const preset = FLAT_PRESETS.find((p) => p.id === value)
	if (preset) {
		configStore.selectPreset(value)
		toast.success(`Applied "${preset.name}" preset`)
	}
}

function handleReset() {
	configStore.resetPreset()
	toast.success(`Reset to "${selectedPresetName.value}" preset`)
}

function validateConfig(value: unknown): value is Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
	const obj = value as Record<string, unknown>
	if ('theme' in obj && typeof obj.theme !== 'string') return false
	if ('display' in obj && (typeof obj.display !== 'object' || obj.display === null)) return false
	if ('colors' in obj && (typeof obj.colors !== 'object' || obj.colors === null)) return false
	if ('budget' in obj && (typeof obj.budget !== 'object' || obj.budget === null)) return false
	if (
		'modelContextLimits' in obj &&
		(typeof obj.modelContextLimits !== 'object' || obj.modelContextLimits === null)
	)
		return false
	return true
}

function resetToDefaults() {
	configStore.resetToDefaults()
	toast.success('Config reset to defaults')
}

function loadImportedConfig() {
	try {
		const parsed = JSON.parse(importText.value)
		if (!validateConfig(parsed)) {
			importError.value = 'Invalid config structure: top-level fields have incorrect types.'
			return
		}
		configStore.loadConfig(parsed)
		toast.success('Config loaded successfully')
		importText.value = ''
		importError.value = ''
		showImportDialog.value = false
	} catch (e) {
		importError.value =
			e instanceof SyntaxError ? `Invalid JSON: ${e.message}` : 'Failed to parse config.'
	}
}

function handleDragOver(e: DragEvent) {
	e.preventDefault()
	isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
	const target = e.currentTarget as HTMLElement
	if (!target.contains(e.relatedTarget as Node)) {
		isDragging.value = false
	}
}

function handleDrop(e: DragEvent) {
	e.preventDefault()
	isDragging.value = false
	const file = e.dataTransfer?.files[0]
	if (!file) return
	if (!file.name.endsWith('.json')) {
		importError.value = 'Only .json files are supported.'
		return
	}
	const reader = new FileReader()
	reader.onload = () => {
		importText.value = reader.result as string
		loadImportedConfig()
	}
	reader.onerror = () => {
		importError.value = 'Failed to read file.'
	}
	reader.readAsText(file)
}

function handleFileInput(e: Event) {
	const input = e.target as HTMLInputElement
	const file = input.files?.[0]
	if (!file) return
	if (!file.name.endsWith('.json')) {
		importError.value = 'Only .json files are supported.'
		input.value = ''
		return
	}
	const reader = new FileReader()
	reader.onload = () => {
		importText.value = reader.result as string
		loadImportedConfig()
	}
	reader.onerror = () => {
		importError.value = 'Failed to read file.'
	}
	reader.readAsText(file)
	input.value = ''
}

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
				class="relative flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 -ml-1 text-left transition-colors hover:bg-accent/50 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50"
			>
				<span
					v-if="step"
					class="absolute -left-18 top-0.5 hidden size-8 items-center justify-center rounded-full border border-muted-foreground/15 text-xs font-semibold tabular-nums text-muted-foreground/25 min-[1048px]:flex"
					>{{ step }}</span
				>
				<IconLucide-chevron-right
					class="size-4 shrink-0 self-start mt-0.5 text-muted-foreground transition-transform duration-200 min-[960px]:absolute min-[960px]:-left-7 min-[960px]:top-2 min-[960px]:mt-0"
					:class="isOpen && 'rotate-90'"
				/>
				<div>
					<h2 class="text-sm font-semibold">Layout Editor</h2>
					<p class="text-xs text-muted-foreground">Click segments to configure, drag to reorder</p>
				</div>
			</CollapsibleTrigger>

			<CollapsibleContent>
				<div class="flex flex-col gap-4 pt-4">
					<!-- Preset / Import / Reset -->
					<TooltipProvider :delay-duration="300">
						<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
							<div class="flex min-w-0 flex-col gap-1.5">
								<div class="flex items-center gap-1.5">
									<Label class="text-xs font-medium text-muted-foreground">Preset</Label>
									<Transition
										enter-active-class="transition-[opacity,transform] duration-150 ease-out"
										leave-active-class="transition-[opacity,transform] duration-100 ease-in"
										enter-from-class="opacity-0 scale-95"
										leave-to-class="opacity-0 scale-95"
									>
										<span v-if="configStore.isPresetModified" class="flex items-center gap-0.5">
											<span
												class="rounded bg-muted px-1 py-0.5 text-[0.5625rem] leading-none text-muted-foreground"
												>modified</span
											>
											<Tooltip>
												<TooltipTrigger as-child>
													<button
														class="flex size-4 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50"
														aria-label="Reset to preset"
														@click="handleReset"
													>
														<IconLucide-rotate-ccw class="size-2.5" />
													</button>
												</TooltipTrigger>
												<TooltipContent side="top" class="text-xs">Reset to preset</TooltipContent>
											</Tooltip>
										</span>
									</Transition>
								</div>
								<Select
									:model-value="configStore.activePresetId ?? undefined"
									@update:model-value="handlePresetSelect"
								>
									<SelectTrigger class="h-8 w-full sm:w-auto sm:min-w-[200px]" size="sm">
										<span
											class="flex items-center gap-1.5"
											:class="selectedPresetName ? 'text-foreground' : 'text-muted-foreground'"
										>
											<IconLucide-layers class="size-3.5 shrink-0 text-muted-foreground" />
											{{ selectedPresetName || 'Choose Preset' }}
										</span>
									</SelectTrigger>
									<SelectContent position="popper" side="bottom" class="min-w-[240px]">
										<SelectItem v-for="preset in FLAT_PRESETS" :key="preset.id" :value="preset.id">
											<div class="flex flex-col">
												<span>{{ preset.name }}</span>
												<span class="text-xs text-muted-foreground">{{ preset.description }}</span>
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<span class="hidden pb-2 text-xs text-muted-foreground sm:inline">or</span>

							<div class="flex flex-col gap-1.5">
								<Label class="hidden text-xs font-medium text-muted-foreground sm:block"
									>&nbsp;</Label
								>
								<Dialog v-model:open="showImportDialog">
									<DialogTrigger as-child>
										<Button variant="outline" size="sm" class="h-8">
											<IconLucide-upload class="size-3.5" />
											Import
										</Button>
									</DialogTrigger>
									<DialogContent
										class="sm:max-w-lg"
										@dragover="handleDragOver"
										@dragleave="handleDragLeave"
										@drop="handleDrop"
									>
										<div
											v-if="isDragging"
											class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5"
										>
											<div class="flex flex-col items-center gap-1.5 text-primary">
												<IconLucide-file-json class="size-8" />
												<span class="text-sm font-medium">Drop JSON file</span>
											</div>
										</div>
										<DialogHeader>
											<DialogTitle>Import Config</DialogTitle>
											<DialogDescription>
												Paste JSON, drop a file, or
												<button
													type="button"
													class="cursor-pointer font-medium text-primary underline underline-offset-2 hover:text-primary/80"
													@click="fileInputRef?.click()"
												>
													upload a file</button
												>.
											</DialogDescription>
										</DialogHeader>
										<input
											ref="fileInputRef"
											type="file"
											accept=".json"
											class="hidden"
											@change="handleFileInput"
										/>
										<div class="flex flex-col gap-4">
											<Textarea
												v-model="importText"
												placeholder='{ "theme": "dark", "display": { ... } }'
												class="min-h-48 font-mono text-xs"
											/>
											<p v-if="importError" class="text-sm text-destructive">
												{{ importError }}
											</p>
											<Button
												variant="outline"
												size="sm"
												class="w-full"
												:disabled="!importText.trim()"
												@click="loadImportedConfig"
											>
												<IconLucide-upload class="size-4" />
												Load Config
											</Button>
										</div>
									</DialogContent>
								</Dialog>
							</div>

							<div class="flex flex-col gap-1.5 sm:ml-auto">
								<Label class="hidden text-xs font-medium text-muted-foreground sm:block"
									>&nbsp;</Label
								>
								<ConfirmPopover action="Reset" @confirm="resetToDefaults">
									<Button variant="destructive" size="sm" class="h-8">
										<IconLucide-rotate-ccw class="size-3.5" />
										Reset to Default
									</Button>
								</ConfirmPopover>
							</div>
						</div>
					</TooltipProvider>

					<Separator />

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
								class="flex min-w-0 items-center gap-2 overflow-x-auto p-1.5 -m-1.5"
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
												'has-[:focus-visible]:border-primary has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-primary/50',
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
