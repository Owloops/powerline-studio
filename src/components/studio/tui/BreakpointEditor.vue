<script setup lang="ts">
import type { TuiGridBreakpoint } from '@/types/tui'
import { Separator } from '@/components/ui/separator'
import GridAreaEditor from './GridAreaEditor.vue'
import ColumnEditor from './ColumnEditor.vue'
import AlignmentEditor from './AlignmentEditor.vue'
import { useTuiValidation } from '@/composables/useTuiValidation'

const props = defineProps<{
	breakpointIndex: number
	breakpoint: TuiGridBreakpoint
	highlightedSegment?: string | null
}>()

const configStore = useConfigStore()

const { usedSegmentsInOtherRows } = useTuiValidation(() => configStore.config.display.tui)

function getUsedSegments(rowIndex: number): Set<string> {
	return usedSegmentsInOtherRows(props.breakpointIndex, rowIndex).value
}
</script>

<template>
	<div class="flex flex-col gap-4">
		<GridAreaEditor
			:breakpoint-index="breakpointIndex"
			:areas="breakpoint.areas"
			:columns="breakpoint.columns"
			:used-segments-by-row="getUsedSegments"
			:highlighted-segment="highlightedSegment"
		/>

		<Separator />

		<ColumnEditor :breakpoint-index="breakpointIndex" :columns="breakpoint.columns" />

		<Separator />

		<AlignmentEditor
			:breakpoint-index="breakpointIndex"
			:align="breakpoint.align"
			:column-count="breakpoint.columns.length"
		/>
	</div>
</template>
