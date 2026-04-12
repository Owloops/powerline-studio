<script setup lang="ts">
import type { ParsedCell } from '@/types/tui'
import { SEGMENT_NAME_LIST, SEGMENT_PART_REFS } from '@/types/tui'
import {
	SEGMENT_META,
	isSegmentKey,
	type SegmentKey,
} from '@/components/studio/segments/segmentMeta'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import TuiCellPopover from './TuiCellPopover.vue'
import { useTuiValidation } from '@/composables/useTuiValidation'

const props = defineProps<{
	breakpointIndex: number
	areas: string[]
	columns: string[]
	highlightedSegment?: string | null
}>()

const configStore = useConfigStore()
const editorStore = useEditorStore()

const { usedSegmentsInOtherRows, errorsForPath } = useTuiValidation(
	() => configStore.config.display.tui,
)

// Track which cell's config popover is open
const openPopover = shallowRef<string | null>(null)

// Track which cell's segment picker is open
const openPicker = shallowRef<string | null>(null)
const pickerSearch = shallowRef('')

// Track which column header popover is open
const openColumnPopover = shallowRef<number | null>(null)

function handleRemoveColumn(colIdx: number) {
	configStore.removeColumn(props.breakpointIndex, colIdx)
	openColumnPopover.value = null
}

// Column definition parsing/editing helpers
function parseColumnDef(col: string): { type: 'auto' | 'fr' | 'fixed'; value: number } {
	if (col === 'auto') return { type: 'auto', value: 0 }
	if (col.endsWith('fr')) return { type: 'fr', value: Number.parseInt(col) || 1 }
	return { type: 'fixed', value: Number.parseInt(col) || 10 }
}

function handleColTypeChange(colIndex: number, type: string) {
	if (type === 'auto') {
		configStore.setColumnDef(props.breakpointIndex, colIndex, 'auto')
	} else if (type === 'fr') {
		configStore.setColumnDef(props.breakpointIndex, colIndex, '1fr')
	} else {
		configStore.setColumnDef(props.breakpointIndex, colIndex, '10')
	}
}

function handleColValueChange(colIndex: number, col: string, rawValue: string | number) {
	const parsed = parseColumnDef(col)
	const n = Number.parseInt(String(rawValue))
	if (Number.isNaN(n) || n < 1) return
	if (parsed.type === 'fr') {
		configStore.setColumnDef(props.breakpointIndex, colIndex, `${n}fr`)
	} else if (parsed.type === 'fixed') {
		configStore.setColumnDef(props.breakpointIndex, colIndex, `${n}`)
	}
}

// Watch for external segment focus (from preview clicks)
watch(
	() => editorStore.selectedTuiArea,
	(area) => {
		if (area?.kind === 'segment') {
			const key = area.cellSegment ?? area.name
			openPopover.value = key
		}
	},
)

// Parse grid areas into merged cells per row
const parsedGrid = computed(() => {
	return props.areas.map((row) => {
		const trimmed = row.trim()
		if (trimmed === '---') {
			return [{ segment: '---', span: props.columns.length, startCol: 0 }] as ParsedCell[]
		}
		const cells = trimmed.split(/\s+/)
		const merged: ParsedCell[] = []
		let i = 0
		while (i < cells.length) {
			const name = cells[i]!
			let span = 1
			while (i + span < cells.length && cells[i + span] === name) span++
			merged.push({ segment: name, span, startCol: i })
			i += span
		}
		return merged
	})
})

// Translate breakpoint column defs into a visual CSS grid-template-columns
// that proportionally represents auto/fr/fixed columns in the editor grid.
const gridTemplateColumns = computed(() => {
	return props.columns
		.map((col) => {
			if (col === 'auto') return 'minmax(0, 1fr)'
			if (col.endsWith('fr')) {
				const n = Number.parseInt(col) || 1
				return `minmax(0, ${n}fr)`
			}
			// Fixed column: use a proportional representation
			const n = Number.parseInt(col) || 10
			return `minmax(0, ${Math.max(1, Math.round(n / 5))}fr)`
		})
		.join(' ')
})

// Cell display helpers
function getCellMeta(segment: string) {
	const base = segment.indexOf('.') > 0 ? segment.slice(0, segment.indexOf('.')) : segment
	if (isSegmentKey(base)) {
		return SEGMENT_META[base as SegmentKey]
	}
	return null
}

function getCellDisplay(segment: string) {
	if (segment === '.') return { label: '\u00B7', isEmpty: true, isDivider: false }
	if (segment === '---') return { label: '--- divider ---', isEmpty: false, isDivider: true }
	const meta = getCellMeta(segment)
	return {
		label: meta?.name ?? segment,
		isEmpty: false,
		isDivider: false,
	}
}

function getCellKey(rowIndex: number, cell: ParsedCell) {
	return `${rowIndex}-${cell.startCol}`
}

function getCellPopoverKey(cell: ParsedCell) {
	return cell.segment
}

function isCellHighlighted(segment: string): boolean {
	if (!props.highlightedSegment) return false
	return segment === props.highlightedSegment
}

// Row validation errors
function rowErrors(rowIndex: number) {
	return errorsForPath(`breakpoints[${props.breakpointIndex}].areas[${rowIndex}]`).value
}

// Used segments in other rows (for segment picker)
function getUsedSegments(rowIndex: number): Set<string> {
	return usedSegmentsInOtherRows(props.breakpointIndex, rowIndex).value
}

// Cell updates
function handleCellUpdate(rowIndex: number, cell: ParsedCell, newValue: string) {
	if (cell.span > 1) {
		configStore.setAreaSpan(
			props.breakpointIndex,
			rowIndex,
			cell.startCol,
			cell.startCol + cell.span - 1,
			newValue,
		)
	} else {
		configStore.setAreaCell(props.breakpointIndex, rowIndex, cell.startCol, newValue)
	}
	openPicker.value = null
	pickerSearch.value = ''
}

// Segment picker groups
function getPickerGroups(usedSegments: Set<string>) {
	const q = pickerSearch.value.toLowerCase()
	const filter = (items: string[]) => items.filter((s) => s.toLowerCase().includes(q))

	return [
		{ label: 'Special', items: filter(['.']) },
		{ label: 'Segments', items: filter(SEGMENT_NAME_LIST as unknown as string[]) },
		{ label: 'Segment Parts', items: filter(SEGMENT_PART_REFS) },
	].filter((g) => g.items.length > 0)
}

function openSegmentPicker(rowIndex: number, cell: ParsedCell) {
	openPicker.value = getCellKey(rowIndex, cell)
	pickerSearch.value = ''
}

function selectFromPicker(rowIndex: number, cell: ParsedCell, seg: string) {
	handleCellUpdate(rowIndex, cell, seg)
}

// Row management
function insertRowAbove(rowIndex: number, type: 'cells' | 'divider') {
	configStore.ensureTuiConfig()
	const bp = configStore.config.display.tui!.breakpoints[props.breakpointIndex]
	if (!bp) return
	const newRow = type === 'divider' ? '---' : Array(bp.columns.length).fill('.').join(' ')
	bp.areas.splice(rowIndex, 0, newRow)
}

function insertRowBelow(rowIndex: number, type: 'cells' | 'divider') {
	configStore.ensureTuiConfig()
	const bp = configStore.config.display.tui!.breakpoints[props.breakpointIndex]
	if (!bp) return
	const newRow = type === 'divider' ? '---' : Array(bp.columns.length).fill('.').join(' ')
	bp.areas.splice(rowIndex + 1, 0, newRow)
}
</script>

<template>
	<div class="flex flex-col gap-1.5">
		<!-- Column headers (clickable for settings) -->
		<div class="grid gap-1.5" :style="{ gridTemplateColumns }">
			<Popover
				v-for="(col, colIdx) in columns"
				:key="colIdx"
				:open="openColumnPopover === colIdx"
				@update:open="
					(val: boolean) => {
						openColumnPopover = val ? colIdx : null
					}
				"
			>
				<PopoverTrigger as-child>
					<button
						class="flex items-center justify-center rounded-md bg-muted/50 px-2 py-1 text-[10px] font-mono text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						<span class="truncate">{{ col }}</span>
					</button>
				</PopoverTrigger>
				<PopoverContent class="w-48 p-3" align="center" @open-auto-focus.prevent>
					<div class="flex flex-col gap-2">
						<div class="text-xs font-medium">Column {{ colIdx + 1 }}</div>
						<div class="flex flex-col gap-1.5">
							<Select
								:model-value="parseColumnDef(col).type"
								@update:model-value="handleColTypeChange(colIdx, $event)"
							>
								<SelectTrigger size="sm" class="h-7 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="auto">auto</SelectItem>
									<SelectItem value="fr">fr</SelectItem>
									<SelectItem value="fixed">fixed</SelectItem>
								</SelectContent>
							</Select>
							<Input
								v-if="parseColumnDef(col).type === 'fr' || parseColumnDef(col).type === 'fixed'"
								type="number"
								:model-value="String(parseColumnDef(col).value)"
								class="h-7 text-xs tabular-nums"
								:min="1"
								:placeholder="parseColumnDef(col).type === 'fixed' ? 'ch' : 'fr'"
								@update:model-value="handleColValueChange(colIdx, col, $event)"
							/>
						</div>
						<button
							v-if="columns.length > 1"
							class="flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
							@click="handleRemoveColumn(colIdx)"
						>
							<IconLucide-x class="size-3" />
							Remove column
						</button>
					</div>
				</PopoverContent>
			</Popover>
		</div>

		<!-- Grid rows -->
		<div
			v-for="(row, rowIndex) in parsedGrid"
			:key="rowIndex"
			class="group/row flex items-center gap-1.5"
		>
			<!-- Grid cells -->
			<div class="grid flex-1 gap-1.5" :style="{ gridTemplateColumns }">
				<!-- Divider row -->
				<template v-if="row.length === 1 && row[0]!.segment === '---'">
					<div
						class="flex items-center justify-center rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 px-2 py-2 text-xs font-mono text-muted-foreground/50"
						:style="{ gridColumn: `span ${columns.length}` }"
					>
						--- divider ---
					</div>
				</template>

				<!-- Normal cells -->
				<template v-else>
					<template v-for="cell in row" :key="getCellKey(rowIndex, cell)">
						<!-- Empty cell: shows "+" button opening segment picker -->
						<template v-if="cell.segment === '.'">
							<Popover
								:open="openPicker === getCellKey(rowIndex, cell)"
								@update:open="
									(val: boolean) => {
										if (!val) {
											openPicker = null
											pickerSearch = ''
										}
									}
								"
							>
								<PopoverTrigger as-child>
									<button
										class="flex items-center justify-center rounded-md border border-dashed border-muted-foreground/25 bg-muted/20 px-2 py-3 text-muted-foreground/40 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary/60"
										:style="cell.span > 1 ? { gridColumn: `span ${cell.span}` } : undefined"
										@click="openSegmentPicker(rowIndex, cell)"
									>
										<IconLucide-plus class="size-4" />
									</button>
								</PopoverTrigger>
								<PopoverContent class="w-56 p-0" @open-auto-focus.prevent>
									<div class="p-2">
										<Input
											v-model="pickerSearch"
											placeholder="Search segments..."
											class="h-8 text-xs"
											autofocus
											@keydown.escape="openPicker = null"
										/>
									</div>
									<ScrollArea class="max-h-48">
										<div class="px-1 py-0.5">
											<div
												v-for="group in getPickerGroups(getUsedSegments(rowIndex))"
												:key="group.label"
												class="py-0.5"
											>
												<div
													class="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
												>
													{{ group.label }}
												</div>
												<button
													v-for="seg in group.items"
													:key="seg"
													class="flex w-full items-center rounded-sm px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed"
													:disabled="getUsedSegments(rowIndex).has(seg) && seg !== '.'"
													@click="selectFromPicker(rowIndex, cell, seg)"
												>
													<span class="font-mono">{{ seg === '.' ? '\u00B7 (empty)' : seg }}</span>
													<span
														v-if="getUsedSegments(rowIndex).has(seg) && seg !== '.'"
														class="ml-auto text-[10px] text-muted-foreground"
													>
														(used)
													</span>
												</button>
											</div>
										</div>
									</ScrollArea>
								</PopoverContent>
							</Popover>
						</template>

						<!-- Filled cell: clickable with config popover -->
						<template v-else>
							<TuiCellPopover
								:cell-segment="cell.segment"
								:open="openPopover === getCellPopoverKey(cell)"
								@update:open="
									(val: boolean) => {
										openPopover = val ? getCellPopoverKey(cell) : null
									}
								"
							>
								<button
									class="group/cell relative flex items-center gap-1.5 rounded-md border px-3 py-3 text-left text-xs transition-all duration-150"
									:class="[
										isCellHighlighted(cell.segment)
											? 'border-primary bg-primary/10 ring-2 ring-primary/40 tui-cell-highlight-pulse'
											: 'border-border bg-card hover:border-primary/40 hover:ring-1 hover:ring-primary/20',
										openPopover === getCellPopoverKey(cell)
											? 'border-primary ring-2 ring-primary/40'
											: '',
									]"
									:style="cell.span > 1 ? { gridColumn: `span ${cell.span}` } : undefined"
								>
									<component
										v-if="getCellMeta(cell.segment)?.icon"
										:is="getCellMeta(cell.segment)!.icon"
										class="size-3.5 shrink-0 text-muted-foreground"
									/>
									<span class="truncate font-medium">
										{{ getCellDisplay(cell.segment).label }}
									</span>
									<span
										v-if="cell.span > 1"
										class="ml-auto text-[10px] text-muted-foreground/50 tabular-nums"
									>
										{{ cell.span }}col
									</span>

									<!-- Inline change button -->
									<div
										role="button"
										tabindex="0"
										class="absolute -right-1 -top-1 flex size-5 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover/cell:opacity-100 hover:text-foreground"
										title="Change segment"
										@click.stop="openSegmentPicker(rowIndex, cell)"
										@keydown.enter.stop="openSegmentPicker(rowIndex, cell)"
									>
										<IconLucide-replace class="size-2.5" />
									</div>
								</button>
							</TuiCellPopover>

							<!-- Segment picker for changing existing cell -->
							<Popover
								v-if="openPicker === getCellKey(rowIndex, cell)"
								:open="true"
								@update:open="
									(val: boolean) => {
										if (!val) {
											openPicker = null
											pickerSearch = ''
										}
									}
								"
							>
								<PopoverTrigger as-child>
									<span class="hidden" />
								</PopoverTrigger>
								<PopoverContent class="w-56 p-0" @open-auto-focus.prevent>
									<div class="p-2">
										<Input
											v-model="pickerSearch"
											placeholder="Search segments..."
											class="h-8 text-xs"
											autofocus
											@keydown.escape="openPicker = null"
										/>
									</div>
									<ScrollArea class="max-h-48">
										<div class="px-1 py-0.5">
											<div
												v-for="group in getPickerGroups(getUsedSegments(rowIndex))"
												:key="group.label"
												class="py-0.5"
											>
												<div
													class="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
												>
													{{ group.label }}
												</div>
												<button
													v-for="seg in group.items"
													:key="seg"
													class="flex w-full items-center rounded-sm px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed"
													:disabled="
														getUsedSegments(rowIndex).has(seg) &&
														seg !== '.' &&
														seg !== cell.segment
													"
													@click="selectFromPicker(rowIndex, cell, seg)"
												>
													<span class="font-mono">{{ seg === '.' ? '\u00B7 (empty)' : seg }}</span>
													<span
														v-if="seg === cell.segment"
														class="ml-auto text-[10px] text-primary"
													>
														current
													</span>
													<span
														v-else-if="getUsedSegments(rowIndex).has(seg) && seg !== '.'"
														class="ml-auto text-[10px] text-muted-foreground"
													>
														(used)
													</span>
												</button>
											</div>
										</div>
									</ScrollArea>
								</PopoverContent>
							</Popover>
						</template>
					</template>
				</template>
			</div>

			<!-- Per-row controls -->
			<div class="flex flex-col gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100">
				<button
					v-if="rowIndex > 0"
					class="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
					title="Move row up"
					@click="configStore.moveAreaRow(breakpointIndex, rowIndex, rowIndex - 1)"
				>
					<IconLucide-chevron-up class="size-3" />
				</button>
				<button
					v-if="rowIndex < parsedGrid.length - 1"
					class="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
					title="Move row down"
					@click="configStore.moveAreaRow(breakpointIndex, rowIndex, rowIndex + 1)"
				>
					<IconLucide-chevron-down class="size-3" />
				</button>
				<Popover>
					<PopoverTrigger as-child>
						<button
							class="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
							title="Insert row"
						>
							<IconLucide-plus class="size-3" />
						</button>
					</PopoverTrigger>
					<PopoverContent class="w-36 p-1" align="start" @open-auto-focus.prevent>
						<button
							class="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
							@click="insertRowAbove(rowIndex, 'cells')"
						>
							<IconLucide-arrow-up class="size-3" />
							Row above
						</button>
						<button
							class="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
							@click="insertRowBelow(rowIndex, 'cells')"
						>
							<IconLucide-arrow-down class="size-3" />
							Row below
						</button>
						<button
							class="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
							@click="insertRowAbove(rowIndex, 'divider')"
						>
							<IconLucide-minus class="size-3" />
							Divider above
						</button>
						<button
							class="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
							@click="insertRowBelow(rowIndex, 'divider')"
						>
							<IconLucide-minus class="size-3" />
							Divider below
						</button>
					</PopoverContent>
				</Popover>
				<button
					v-if="areas.length > 1"
					class="flex size-5 items-center justify-center rounded text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
					title="Remove row"
					@click="configStore.removeAreaRow(breakpointIndex, rowIndex)"
				>
					<IconLucide-x class="size-3" />
				</button>
			</div>
		</div>

		<!-- Validation errors for this breakpoint's areas -->
		<template v-for="(row, rowIndex) in parsedGrid" :key="`err-${rowIndex}`">
			<div
				v-for="err in rowErrors(rowIndex)"
				:key="err.path"
				class="flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-xs text-destructive"
			>
				<IconLucide-alert-circle class="size-3 shrink-0" />
				{{ err.message }}
			</div>
		</template>

		<!-- Add Row Controls -->
		<div class="flex items-center gap-2 pt-1">
			<Button
				variant="outline"
				size="sm"
				class="h-7 text-xs"
				@click="configStore.addAreaRow(breakpointIndex, 'cells')"
			>
				<IconLucide-plus class="mr-1 size-3" />
				Add Row
			</Button>
			<Button
				variant="outline"
				size="sm"
				class="h-7 text-xs"
				@click="configStore.addAreaRow(breakpointIndex, 'divider')"
			>
				<IconLucide-minus class="mr-1 size-3" />
				Add Divider
			</Button>
		</div>
	</div>
</template>

<style scoped>
.tui-cell-highlight-pulse {
	animation: tui-cell-pulse 2s ease-out;
}

@keyframes tui-cell-pulse {
	0% {
		box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4);
	}
	20% {
		box-shadow: 0 0 0 4px hsl(var(--primary) / 0.3);
	}
	100% {
		box-shadow: 0 0 0 0 hsl(var(--primary) / 0);
	}
}

@media (prefers-reduced-motion: reduce) {
	.tui-cell-highlight-pulse {
		animation: none;
	}
}
</style>
