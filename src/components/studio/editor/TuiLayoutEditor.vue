<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
	NumberField,
	NumberFieldContent,
	NumberFieldDecrement,
	NumberFieldIncrement,
	NumberFieldInput,
} from '@/components/ui/number-field'
import TuiGridVisual from './TuiGridVisual.vue'
import TemplateEditor from '@/components/studio/tui/TemplateEditor.vue'
import { useTuiValidation } from '@/composables/useTuiValidation'

defineProps<{ step?: number }>()

const configStore = useConfigStore()
const previewStore = usePreviewStore()
const editorStore = useEditorStore()

const isOpen = ref(true)

const tui = computed(() => configStore.config.display.tui)
const breakpoints = computed(() => tui.value?.breakpoints ?? [])

const { errors, hasErrors } = useTuiValidation(() => tui.value)

// --- Breakpoint Management ---

// Use raw array index as selected breakpoint (simple, stable)
const selectedBpIndex = shallowRef(0)

// Clamp selected index when breakpoints change
watch(
	() => breakpoints.value.length,
	(len) => {
		if (selectedBpIndex.value >= len) {
			selectedBpIndex.value = Math.max(0, len - 1)
		}
	},
)

const selectedBreakpoint = computed(() => breakpoints.value[selectedBpIndex.value])

// Sorted breakpoints for display (maps to original indices)
const sortedBreakpoints = computed(() => {
	return breakpoints.value
		.map((bp, index) => ({ index, bp }))
		.sort((a, b) => a.bp.minWidth - b.bp.minWidth)
})

// Breakpoint-width sync: when user clicks a breakpoint tab,
// adjust terminalWidth only if needed to land within that breakpoint's range.
function selectBreakpoint(index: number) {
	selectedBpIndex.value = index
	const bp = breakpoints.value[index]
	if (!bp) return

	const sorted = [...breakpoints.value].sort((a, b) => a.minWidth - b.minWidth)
	const sortedIdx = sorted.indexOf(bp)
	const effectiveWidth = previewStore.terminalWidth - previewStore.reservedWidth
	const nextMin = sortedIdx < sorted.length - 1 ? sorted[sortedIdx + 1]!.minWidth : Infinity

	if (bp.minWidth > 0) {
		if (effectiveWidth < bp.minWidth) {
			const target =
				nextMin === Infinity
					? Math.max(bp.minWidth + previewStore.reservedWidth, 120)
					: bp.minWidth + previewStore.reservedWidth
			previewStore.setTerminalWidth(target)
		} else if (effectiveWidth >= nextMin) {
			previewStore.setTerminalWidth(Math.max(30, nextMin - 1) + previewStore.reservedWidth)
		}
	} else {
		// Default breakpoint: need to be below the next breakpoint's minWidth
		if (nextMin !== Infinity && effectiveWidth >= nextMin) {
			previewStore.setTerminalWidth(Math.max(30, nextMin - 1) + previewStore.reservedWidth)
		}
	}
}

function addBreakpoint() {
	configStore.addBreakpoint(selectedBpIndex.value)
	// Select the newly added breakpoint
	nextTick(() => {
		selectedBpIndex.value = breakpoints.value.length - 1
	})
}

function removeBreakpoint(index: number) {
	configStore.removeBreakpoint(index)
}

// --- Inline minWidth editing ---

const editingBpIndex = shallowRef<number | null>(null)
const editingMinWidth = shallowRef(0)

function startEditMinWidth(index: number, currentMinWidth: number) {
	editingBpIndex.value = index
	editingMinWidth.value = currentMinWidth
	nextTick(() => {
		const input = document.querySelector<HTMLInputElement>('.bp-minwidth-input')
		input?.select()
	})
}

function commitMinWidth() {
	if (editingBpIndex.value == null) return
	const clamped = Math.max(0, Math.round(editingMinWidth.value))
	configStore.updateBreakpointMinWidth(editingBpIndex.value, clamped)
	editingBpIndex.value = null
}

function cancelEditMinWidth() {
	editingBpIndex.value = null
}

// --- Title/Footer ---

const titlePopoverOpen = shallowRef(false)
const footerPopoverOpen = shallowRef(false)

const titleConfig = computed(() => configStore.config.display.tui?.title)
const footerConfig = computed(() => configStore.config.display.tui?.footer)

// Watch for external title/footer focus (from preview clicks)
watch(
	() => editorStore.selectedTuiArea,
	(area) => {
		if (area?.kind === 'title') {
			titlePopoverOpen.value = true
		} else if (area?.kind === 'footer') {
			footerPopoverOpen.value = true
		}
	},
)

function updateTitleLeft(value: string | undefined) {
	configStore.setTuiTitle({ left: value })
}

function updateTitleRight(value: string | undefined) {
	configStore.setTuiTitle({ right: value })
}

function updateFooterLeft(value: string | undefined) {
	configStore.setTuiFooter({ left: value })
}

function updateFooterRight(value: string | undefined) {
	configStore.setTuiFooter({ right: value })
}

// Title/footer display text for the clickable strips — split into left/right for independent truncation
const titlePreview = computed(() => {
	const left = titleConfig.value?.left ?? '{model}'
	const right = titleConfig.value?.right
	if (!left && !right) return { left: '(no title configured)', right: '' }
	return { left: left || '(empty)', right: right || '(empty)' }
})

const footerPreview = computed(() => {
	const left = footerConfig.value?.left
	const right = footerConfig.value?.right
	if (!left && !right) return { left: '(no footer configured)', right: '' }
	return { left: left || '(empty)', right: right || '(empty)' }
})

// --- Highlighted segment from preview click ---

const highlightedSegment = ref<string | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | undefined

// Watch focusedSegment from preview clicks — scroll to cell, open popover, highlight
watch(
	() => editorStore.focusedSegment,
	async (focused) => {
		if (!focused || focused.source !== 'preview') return
		const key = focused.cellSegment ?? focused.name

		// Apply highlight animation
		clearTimeout(highlightTimer)
		highlightedSegment.value = key
		highlightTimer = setTimeout(() => {
			highlightedSegment.value = null
		}, 2000)

		// Delegate popover opening to TuiGridVisual via selectedTuiArea
		editorStore.selectTuiArea({
			kind: 'segment',
			name: focused.name,
			cellSegment: focused.cellSegment,
		})

		await nextTick()
		// Scroll the grid section into view
		const gridEl = gridRef.value
		if (gridEl) {
			gridEl.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
			})
		}
	},
)

// Watch focusedTuiArea from preview clicks — open title/footer popover and scroll
watch(
	() => editorStore.focusedTuiArea,
	async (area) => {
		if (!area) return
		if (area === 'title') {
			titlePopoverOpen.value = true
			await nextTick()
			titleTriggerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
		} else if (area === 'footer') {
			footerPopoverOpen.value = true
			await nextTick()
			footerTriggerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
		}
	},
)

const gridRef = ref<HTMLElement | null>(null)
const titleTriggerRef = ref<HTMLElement | null>(null)
const footerTriggerRef = ref<HTMLElement | null>(null)
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
					<h2 class="flex items-center gap-1.5 text-sm font-semibold">
						TUI Layout Editor
						<TooltipProvider :delay-duration="200">
							<Tooltip>
								<TooltipTrigger as-child>
									<IconLucide-info class="size-3.5 shrink-0 text-muted-foreground/50" />
								</TooltipTrigger>
								<TooltipContent side="right" class="max-w-xs text-xs font-normal">
									TUI style renders a box-drawn grid in the terminal. Use breakpoints to define
									different layouts at different terminal widths. Each breakpoint has columns with
									segment rows, and you can customize box-drawing characters, title bar, and footer.
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</h2>
					<p class="text-xs text-muted-foreground">
						Configure your TUI grid layout, title, footer, and breakpoints
					</p>
				</div>
			</CollapsibleTrigger>

			<CollapsibleContent>
				<div class="flex flex-col gap-4 pt-4">
					<!-- Breakpoint Switcher -->
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between">
							<span class="text-xs font-medium text-muted-foreground">Breakpoints</span>
							<TooltipProvider :delay-duration="300">
								<Tooltip>
									<TooltipTrigger as-child>
										<Button variant="outline" size="sm" class="h-7 text-xs" @click="addBreakpoint">
											<IconLucide-plus class="size-3" />
											Add
										</Button>
									</TooltipTrigger>
									<TooltipContent side="left" class="text-xs">
										Add a new breakpoint for wider terminals.
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						<div class="flex flex-wrap gap-1.5">
							<button
								v-for="(item, sortIdx) in sortedBreakpoints"
								:key="item.index"
								class="group relative flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-[border-color,background-color,box-shadow] duration-150"
								:class="
									selectedBpIndex === item.index
										? 'border-primary bg-primary/5 ring-1 ring-primary/30'
										: 'border-border hover:border-primary/30 hover:bg-muted/50'
								"
								@click="selectBreakpoint(item.index)"
							>
								<span
									class="flex size-5 shrink-0 items-center justify-center rounded text-[0.625rem] font-semibold tabular-nums transition-colors duration-150"
									:class="
										selectedBpIndex === item.index
											? 'bg-primary text-primary-foreground'
											: 'bg-muted text-muted-foreground'
									"
								>
									{{ sortIdx + 1 }}
								</span>
								<span
									v-if="editingBpIndex === item.index"
									class="flex items-center gap-0.5 tabular-nums"
									@click.stop
									@keydown.enter="commitMinWidth"
									@keydown.escape="cancelEditMinWidth"
								>
									&#x2265;
									<NumberField
										:model-value="editingMinWidth"
										:min="0"
										class="w-18 gap-0"
										@update:model-value="editingMinWidth = $event ?? 0"
									>
										<NumberFieldContent>
											<NumberFieldDecrement class="p-1">
												<IconLucide-minus class="size-2.5" />
											</NumberFieldDecrement>
											<NumberFieldInput
												class="bp-minwidth-input h-6 text-xs tabular-nums border-primary"
												@blur="commitMinWidth"
											/>
											<NumberFieldIncrement class="p-1">
												<IconLucide-plus class="size-2.5" />
											</NumberFieldIncrement>
										</NumberFieldContent>
									</NumberField>
									col
								</span>
								<span v-else class="tabular-nums">
									<template v-if="item.bp.minWidth === 0">Default</template>
									<template v-else>&#x2265; {{ item.bp.minWidth }}col</template>
								</span>

								<!-- Edit minWidth button -->
								<TooltipProvider
									v-if="item.bp.minWidth > 0 && editingBpIndex !== item.index"
									:delay-duration="400"
								>
									<Tooltip>
										<TooltipTrigger as-child>
											<button
												class="rounded p-0.5 text-muted-foreground/50 opacity-0 transition-opacity hover:bg-primary/10 hover:text-primary group-hover:opacity-100 group-focus-within:opacity-100"
												@click.stop="startEditMinWidth(item.index, item.bp.minWidth)"
											>
												<IconLucide-pencil class="size-3" />
											</button>
										</TooltipTrigger>
										<TooltipContent side="top" class="text-xs">Edit min width</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<!-- Remove button -->
								<ConfirmPopover
									v-if="breakpoints.length > 1"
									@confirm="removeBreakpoint(item.index)"
								>
									<button
										class="rounded p-0.5 text-muted-foreground/50 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 group-focus-within:opacity-100"
										@click.stop
									>
										<IconLucide-trash-2 class="size-3" />
									</button>
								</ConfirmPopover>
							</button>
						</div>
					</div>

					<!-- Validation Errors (global) -->
					<div v-if="hasErrors" class="flex flex-col gap-1">
						<div
							v-for="err in errors.slice(0, 3)"
							:key="err.path"
							class="flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-xs text-destructive"
						>
							<IconLucide-alert-circle class="size-3 shrink-0" />
							{{ err.message }}
						</div>
						<span v-if="errors.length > 3" class="text-[0.625rem] text-destructive/70 pl-1">
							+{{ errors.length - 3 }} more errors
						</span>
					</div>

					<!-- Seamless Title / Grid / Footer unit -->
					<div class="rounded-lg border border-border overflow-hidden">
						<!-- Title Bar (clickable strip) -->
						<TooltipProvider :delay-duration="400">
							<Tooltip :disabled="titlePopoverOpen">
								<Popover v-model:open="titlePopoverOpen">
									<TooltipTrigger as-child>
										<PopoverTrigger as-child>
											<button
												ref="titleTriggerRef"
												class="flex w-full items-center gap-2 rounded-t-lg border-b border-border bg-muted/30 px-3 py-2 text-left text-xs hover:bg-muted/50"
												:class="titlePopoverOpen ? 'ring-1 ring-inset ring-primary/30' : ''"
											>
												<IconLucide-panel-top class="size-3.5 shrink-0 text-muted-foreground" />
												<span
													class="flex min-w-0 flex-1 items-center gap-0 font-mono text-xs text-muted-foreground"
												>
													<span class="truncate min-w-0">{{ titlePreview.left }}</span>
													<span
														v-if="titlePreview.right"
														class="shrink-0 px-1.5 text-muted-foreground/40"
														>...</span
													>
													<span v-if="titlePreview.right" class="truncate min-w-0 text-right">{{
														titlePreview.right
													}}</span>
												</span>
												<IconLucide-pencil class="size-3 shrink-0 text-muted-foreground/50" />
											</button>
										</PopoverTrigger>
									</TooltipTrigger>
									<PopoverContent class="w-96 p-4" align="start" @open-auto-focus.prevent>
										<div class="flex items-center gap-1.5 pb-3">
											<IconLucide-panel-top class="size-3.5 text-muted-foreground" />
											<span class="text-xs font-medium">Title Bar</span>
										</div>
										<TemplateEditor
											label="Title Bar"
											:left="titleConfig?.left"
											:right="titleConfig?.right"
											left-placeholder="{model}"
											@update:left="updateTitleLeft"
											@update:right="updateTitleRight"
										/>
									</PopoverContent>
								</Popover>
								<TooltipContent side="bottom" align="start" class="max-w-sm font-mono text-xs">
									<div>Left: {{ titlePreview.left }}</div>
									<div v-if="titlePreview.right">Right: {{ titlePreview.right }}</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<!-- Grid Visual -->
						<div v-if="selectedBreakpoint" ref="gridRef" class="bg-background p-3">
							<TuiGridVisual
								:breakpoint-index="selectedBpIndex"
								:areas="selectedBreakpoint.areas"
								:columns="selectedBreakpoint.columns"
								:align="selectedBreakpoint.align"
								:highlighted-segment="highlightedSegment"
							/>
						</div>

						<!-- Footer (clickable strip) -->
						<TooltipProvider :delay-duration="400">
							<Tooltip :disabled="footerPopoverOpen">
								<Popover v-model:open="footerPopoverOpen">
									<TooltipTrigger as-child>
										<PopoverTrigger as-child>
											<button
												ref="footerTriggerRef"
												class="flex w-full items-center gap-2 rounded-b-lg border-t border-border bg-muted/30 px-3 py-2 text-left text-xs hover:bg-muted/50"
												:class="footerPopoverOpen ? 'ring-1 ring-inset ring-primary/30' : ''"
											>
												<IconLucide-panel-bottom class="size-3.5 shrink-0 text-muted-foreground" />
												<span
													class="flex min-w-0 flex-1 items-center gap-0 font-mono text-xs text-muted-foreground"
												>
													<span class="truncate min-w-0">{{ footerPreview.left }}</span>
													<span
														v-if="footerPreview.right"
														class="shrink-0 px-1.5 text-muted-foreground/40"
														>...</span
													>
													<span v-if="footerPreview.right" class="truncate min-w-0 text-right">{{
														footerPreview.right
													}}</span>
												</span>
												<IconLucide-pencil class="size-3 shrink-0 text-muted-foreground/50" />
											</button>
										</PopoverTrigger>
									</TooltipTrigger>
									<PopoverContent class="w-96 p-4" align="start" @open-auto-focus.prevent>
										<div class="flex items-center gap-1.5 pb-3">
											<IconLucide-panel-bottom class="size-3.5 text-muted-foreground" />
											<span class="text-xs font-medium">Footer</span>
										</div>
										<TemplateEditor
											label="Footer"
											:left="footerConfig?.left"
											:right="footerConfig?.right"
											@update:left="updateFooterLeft"
											@update:right="updateFooterRight"
										/>
									</PopoverContent>
								</Popover>
								<TooltipContent side="bottom" align="start" class="max-w-sm font-mono text-xs">
									<div>Left: {{ footerPreview.left }}</div>
									<div v-if="footerPreview.right">Right: {{ footerPreview.right }}</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
		<Separator v-show="isOpen" />
	</section>
</template>
