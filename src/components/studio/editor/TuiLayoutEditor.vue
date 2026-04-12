<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import TuiGridVisual from './TuiGridVisual.vue'
import ColumnSettings from '@/components/studio/tui/ColumnSettings.vue'
import TemplateEditor from '@/components/studio/tui/TemplateEditor.vue'
import TuiGlobalOptions from '@/components/studio/tui/TuiGlobalOptions.vue'
import TuiStylingSection from '@/components/studio/tui/TuiStylingSection.vue'
import { useTuiValidation } from '@/composables/useTuiValidation'

const configStore = useConfigStore()
const previewStore = usePreviewStore()
const editorStore = useEditorStore()

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
// set terminalWidth to show that breakpoint's range in the preview
function selectBreakpoint(index: number) {
	selectedBpIndex.value = index
	const bp = breakpoints.value[index]
	if (!bp) return
	// Set terminal width so the preview renders at this breakpoint's range.
	// For the default (minWidth=0) breakpoint, use a modest width that
	// stays below any other breakpoint's minWidth.
	if (bp.minWidth > 0) {
		const targetWidth = bp.minWidth + previewStore.reservedWidth
		previewStore.setTerminalWidth(targetWidth)
	} else {
		// Default breakpoint: find the smallest non-zero minWidth and go below it
		const smallestNonZero = breakpoints.value
			.filter((b) => b.minWidth > 0)
			.reduce((min, b) => Math.min(min, b.minWidth), Infinity)
		if (smallestNonZero !== Infinity) {
			const targetWidth = Math.max(30, smallestNonZero - 1) + previewStore.reservedWidth
			previewStore.setTerminalWidth(targetWidth)
		}
	}
}

function addBreakpoint() {
	configStore.addBreakpoint()
	// Select the newly added breakpoint
	nextTick(() => {
		selectedBpIndex.value = breakpoints.value.length - 1
	})
}

function removeBreakpoint(index: number) {
	configStore.removeBreakpoint(index)
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

function updateTitleRight(value: string | false | undefined) {
	configStore.setTuiTitle({ right: value })
}

function updateFooterLeft(value: string | undefined) {
	configStore.setTuiFooter({ left: value })
}

function updateFooterRight(value: string | false | undefined) {
	configStore.setTuiFooter({ right: value === false ? undefined : value })
}

// Title/footer display text for the clickable strips
const titlePreview = computed(() => {
	const left = titleConfig.value?.left ?? '{model}'
	const right = titleConfig.value?.right
	if (right === false) return left || '(no title)'
	const rightText = right ?? 'claude-powerline'
	return `${left || '(empty)'}  ...  ${rightText || '(empty)'}`
})

const footerPreview = computed(() => {
	const left = footerConfig.value?.left
	const right = footerConfig.value?.right
	if (!left && !right) return '(no footer configured)'
	return `${left || '(empty)'}  ...  ${right || '(empty)'}`
})

// --- TUI Options ---

const optionsOpen = shallowRef(false)

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
		<div>
			<h2 class="text-sm font-semibold">TUI Layout Editor</h2>
			<p class="text-xs text-muted-foreground">
				Configure your TUI grid layout, title, footer, and breakpoints
			</p>
		</div>

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
							Add a new breakpoint for wider terminals
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<div class="flex flex-wrap gap-1.5">
				<button
					v-for="(item, sortIdx) in sortedBreakpoints"
					:key="item.index"
					class="group relative flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors"
					:class="
						selectedBpIndex === item.index
							? 'border-primary bg-primary/5 ring-1 ring-primary/30'
							: 'border-border hover:border-primary/30 hover:bg-muted/50'
					"
					@click="selectBreakpoint(item.index)"
				>
					<span
						class="flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold tabular-nums"
						:class="
							selectedBpIndex === item.index
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground'
						"
					>
						{{ sortIdx + 1 }}
					</span>
					<span class="tabular-nums">
						<template v-if="item.bp.minWidth === 0">Default</template>
						<template v-else>&#x2265; {{ item.bp.minWidth }}col</template>
					</span>

					<!-- Remove button -->
					<button
						v-if="breakpoints.length > 1"
						class="ml-1 rounded p-0.5 text-muted-foreground/50 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
						title="Remove breakpoint"
						@click.stop="removeBreakpoint(item.index)"
					>
						<IconLucide-x class="size-3" />
					</button>
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
			<span v-if="errors.length > 3" class="text-[10px] text-destructive/70 pl-1">
				+{{ errors.length - 3 }} more errors
			</span>
		</div>

		<!-- Title Bar (clickable strip) -->
		<Popover v-model:open="titlePopoverOpen">
			<PopoverTrigger as-child>
				<button
					ref="titleTriggerRef"
					class="flex items-center gap-2 rounded-t-lg border border-b-0 border-border bg-muted/30 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
					:class="titlePopoverOpen ? 'ring-1 ring-primary/30 border-primary/40' : ''"
				>
					<IconLucide-panel-top class="size-3.5 shrink-0 text-muted-foreground" />
					<span class="flex-1 truncate font-mono text-muted-foreground">
						{{ titlePreview }}
					</span>
					<IconLucide-pencil class="size-3 text-muted-foreground/50" />
				</button>
			</PopoverTrigger>
			<PopoverContent class="w-96 p-4" align="start" @open-auto-focus.prevent>
				<div class="flex items-center gap-1.5 pb-3">
					<IconLucide-panel-top class="size-3.5 text-muted-foreground" />
					<span class="text-xs font-medium">Title Bar</span>
				</div>
				<TemplateEditor
					label="Title Bar"
					:left="titleConfig?.left"
					:right="titleConfig?.right"
					:allow-disable-right="true"
					left-placeholder="{model}"
					right-placeholder="claude-powerline"
					@update:left="updateTitleLeft"
					@update:right="updateTitleRight"
				/>
			</PopoverContent>
		</Popover>

		<!-- Grid Visual -->
		<div
			v-if="selectedBreakpoint"
			ref="gridRef"
			class="rounded-lg border border-border bg-background p-3"
		>
			<TuiGridVisual
				:breakpoint-index="selectedBpIndex"
				:areas="selectedBreakpoint.areas"
				:columns="selectedBreakpoint.columns"
				:highlighted-segment="highlightedSegment"
			/>
		</div>

		<!-- Footer (clickable strip) -->
		<Popover v-model:open="footerPopoverOpen">
			<PopoverTrigger as-child>
				<button
					ref="footerTriggerRef"
					class="flex items-center gap-2 rounded-b-lg border border-t-0 border-border bg-muted/30 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
					:class="footerPopoverOpen ? 'ring-1 ring-primary/30 border-primary/40' : ''"
				>
					<IconLucide-panel-bottom class="size-3.5 shrink-0 text-muted-foreground" />
					<span class="flex-1 truncate font-mono text-muted-foreground">
						{{ footerPreview }}
					</span>
					<IconLucide-pencil class="size-3 text-muted-foreground/50" />
				</button>
			</PopoverTrigger>
			<PopoverContent class="w-96 p-4" align="start" @open-auto-focus.prevent>
				<div class="flex items-center gap-1.5 pb-3">
					<IconLucide-panel-bottom class="size-3.5 text-muted-foreground" />
					<span class="text-xs font-medium">Footer</span>
				</div>
				<TemplateEditor
					label="Footer"
					:left="footerConfig?.left"
					:right="footerConfig?.right ?? undefined"
					:allow-disable-right="false"
					@update:left="updateFooterLeft"
					@update:right="updateFooterRight"
				/>
			</PopoverContent>
		</Popover>

		<Separator />

		<!-- Column Settings -->
		<Collapsible>
			<CollapsibleTrigger class="flex w-full items-center justify-between py-1 text-left">
				<div class="flex items-center gap-1.5">
					<IconLucide-columns-3 class="size-3.5 text-muted-foreground" />
					<span class="text-xs font-medium">Column Settings</span>
					<span v-if="selectedBreakpoint" class="text-[10px] text-muted-foreground">
						({{ selectedBreakpoint.columns.length }})
					</span>
				</div>
				<IconLucide-chevron-right
					class="size-3.5 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-90"
				/>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div v-if="selectedBreakpoint" class="pt-2 pb-1">
					<ColumnSettings
						:breakpoint-index="selectedBpIndex"
						:columns="selectedBreakpoint.columns"
						:align="selectedBreakpoint.align"
					/>
				</div>
			</CollapsibleContent>
		</Collapsible>

		<Separator />

		<!-- TUI Options (collapsible) -->
		<Collapsible v-model:open="optionsOpen">
			<CollapsibleTrigger class="flex w-full items-center justify-between py-1 text-left">
				<div class="flex items-center gap-1.5">
					<IconLucide-settings class="size-3.5 text-muted-foreground" />
					<span class="text-xs font-medium">TUI Options</span>
				</div>
				<IconLucide-chevron-right
					class="size-3.5 text-muted-foreground transition-transform duration-200"
					:class="{ 'rotate-90': optionsOpen }"
				/>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div class="flex flex-col gap-4 pt-3 pb-1">
					<TuiGlobalOptions />
					<Separator />
					<TuiStylingSection />
				</div>
			</CollapsibleContent>
		</Collapsible>
	</section>
</template>
