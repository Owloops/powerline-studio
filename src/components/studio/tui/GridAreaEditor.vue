<script setup lang="ts">
import type { ParsedCell } from '@/types/tui'
import GridCell from './GridCell.vue'
import { Button } from '@/components/ui/button'
import { normalizeSegmentName } from '@/lib/segmentHitboxes'

const props = defineProps<{
	breakpointIndex: number
	areas: string[]
	columns: string[]
	usedSegmentsByRow: (rowIndex: number) => Set<string>
	highlightedSegment?: string | null
}>()

const configStore = useConfigStore()

const parsedGrid = computed(() => {
	return props.areas.map((row, rowIndex) => {
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
				class="grid gap-1"
				:style="{ gridTemplateColumns }"
			>
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
						:highlighted="
							highlightedSegment != null &&
							normalizeSegmentName(cell.segment) === highlightedSegment
						"
						@update="handleCellUpdate(rowIndex, cell, $event)"
						@update-single="
							(colOffset: number, val: string) =>
								handleSingleCellUpdate(rowIndex, cell, colOffset, val)
						"
					/>
				</template>
			</div>
		</div>

		<!-- Row Controls -->
		<div class="flex items-center gap-2">
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
			<div class="flex-1" />
			<Button
				v-if="areas.length > 1"
				variant="ghost"
				size="sm"
				class="h-7 text-xs text-destructive hover:text-destructive"
				@click="configStore.removeAreaRow(breakpointIndex, areas.length - 1)"
			>
				<IconLucide-trash-2 class="mr-1 size-3" />
				Remove Last Row
			</Button>
		</div>
	</div>
</template>
