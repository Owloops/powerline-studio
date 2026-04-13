<script setup lang="ts">
import type { ParsedCell } from '@/types/tui'
import { parseGridAreas } from '@/types/tui'
import GridCell from './GridCell.vue'
import { Button } from '@/components/ui/button'

const props = defineProps<{
	breakpointIndex: number
	areas: string[]
	columns: string[]
	usedSegmentsByRow: (rowIndex: number) => Set<string>
	highlightedSegment?: string | null
}>()

const configStore = useConfigStore()

const parsedGrid = computed(() => {
	return parseGridAreas(props.areas, props.columns.length)
})

const gridTemplateColumns = computed(() => {
	return `repeat(${props.columns.length}, minmax(0, 1fr))`
})

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
}

function handleSingleCellUpdate(
	rowIndex: number,
	cell: ParsedCell,
	colOffset: number,
	newValue: string,
) {
	configStore.setAreaCell(props.breakpointIndex, rowIndex, cell.startCol + colOffset, newValue)
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="text-xs font-medium text-muted-foreground">Grid Areas</div>

		<!-- Grid -->
		<div class="flex flex-col gap-1">
			<div
				v-for="(row, rowIndex) in parsedGrid"
				:key="rowIndex"
				class="group/row flex items-center gap-1.5"
			>
				<div class="grid flex-1 gap-1" :style="{ gridTemplateColumns }">
					<template v-if="row.length === 1 && row[0]!.segment === '---'">
						<div
							class="flex items-center justify-center rounded-md border border-dashed border-muted-foreground/40 bg-muted/20 px-2 py-1 text-xs text-muted-foreground/60 font-mono"
							:style="{ gridColumn: `span ${columns.length}` }"
						>
							--- divider ---
						</div>
					</template>
					<template v-else>
						<GridCell
							v-for="cell in row"
							:key="`${rowIndex}-${cell.startCol}`"
							:value="cell.segment"
							:span="cell.span"
							:start-col="cell.startCol"
							:used-segments="usedSegmentsByRow(rowIndex)"
							:highlighted="highlightedSegment != null && cell.segment === highlightedSegment"
							@update="handleCellUpdate(rowIndex, cell, $event)"
							@update-single="
								(colOffset: number, val: string) =>
									handleSingleCellUpdate(rowIndex, cell, colOffset, val)
							"
						/>
					</template>
				</div>

				<!-- Per-row controls -->
				<div
					class="flex flex-col gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100"
				>
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
					<ConfirmPopover
						v-if="areas.length > 1"
						@confirm="configStore.removeAreaRow(breakpointIndex, rowIndex)"
					>
						<button
							class="flex size-5 items-center justify-center rounded text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
							title="Remove row"
						>
							<IconLucide-trash-2 class="size-3" />
						</button>
					</ConfirmPopover>
				</div>
			</div>
		</div>

		<!-- Add Row Controls -->
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				class="h-7 gap-1 text-xs"
				@click="configStore.addAreaRow(breakpointIndex, 'cells')"
			>
				<IconLucide-plus class="size-3" />
				Add Row
			</Button>
			<Button
				variant="outline"
				size="sm"
				class="h-7 gap-1 text-xs"
				@click="configStore.addAreaRow(breakpointIndex, 'divider')"
			>
				<IconLucide-minus class="size-3" />
				Add Divider
			</Button>
		</div>
	</div>
</template>
