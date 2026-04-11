<script setup lang="ts">
import type { TuiGridBreakpoint } from '@/types/tui'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import GridAreaEditor from './GridAreaEditor.vue'
import ColumnSettings from './ColumnSettings.vue'
import TemplateEditor from './TemplateEditor.vue'
import SegmentTemplateEditor from './SegmentTemplateEditor.vue'
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

// --- Title/Footer handlers ---

const titleConfig = computed(() => configStore.config.display.tui?.title)
const footerConfig = computed(() => configStore.config.display.tui?.footer)

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

// --- Segment refs from this breakpoint ---

const activeSegmentRefs = computed(() => {
	const bp = props.breakpoint
	if (!bp) return []
	const refs = new Set<string>()
	for (const row of bp.areas) {
		if (row.trim() === '---') continue
		for (const cell of row.trim().split(/\s+/)) {
			if (cell !== '.' && cell !== '---') {
				refs.add(cell)
			}
		}
	}
	return [...refs]
})

// --- Collapsible state ---

const titleSectionOpen = shallowRef(false)
const footerSectionOpen = shallowRef(false)
const templateSectionOpen = shallowRef(false)
</script>

<template>
	<div class="flex flex-col gap-4">
		<!-- Title Bar (above the grid) -->
		<Collapsible v-model:open="titleSectionOpen">
			<CollapsibleTrigger class="flex items-center justify-between w-full py-1 text-left">
				<div class="flex items-center gap-1.5">
					<IconLucide-panel-top class="size-3.5 text-muted-foreground" />
					<span class="text-xs font-medium">Title Bar</span>
				</div>
				<IconLucide-chevron-right
					class="size-3.5 text-muted-foreground transition-transform duration-200"
					:class="{ 'rotate-90': titleSectionOpen }"
				/>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div class="pt-2 pb-1">
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
				</div>
			</CollapsibleContent>
		</Collapsible>

		<Separator />

		<!-- Grid Areas -->
		<GridAreaEditor
			:breakpoint-index="breakpointIndex"
			:areas="breakpoint.areas"
			:columns="breakpoint.columns"
			:used-segments-by-row="getUsedSegments"
			:highlighted-segment="highlightedSegment"
		/>

		<Separator />

		<!-- Footer (below the grid) -->
		<Collapsible v-model:open="footerSectionOpen">
			<CollapsibleTrigger class="flex items-center justify-between w-full py-1 text-left">
				<div class="flex items-center gap-1.5">
					<IconLucide-panel-bottom class="size-3.5 text-muted-foreground" />
					<span class="text-xs font-medium">Footer</span>
				</div>
				<IconLucide-chevron-right
					class="size-3.5 text-muted-foreground transition-transform duration-200"
					:class="{ 'rotate-90': footerSectionOpen }"
				/>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div class="pt-2 pb-1">
					<TemplateEditor
						label="Footer"
						:left="footerConfig?.left"
						:right="footerConfig?.right ?? undefined"
						:allow-disable-right="false"
						@update:left="updateFooterLeft"
						@update:right="updateFooterRight"
					/>
				</div>
			</CollapsibleContent>
		</Collapsible>

		<Separator />

		<!-- Column Settings (merged columns + alignment) -->
		<ColumnSettings
			:breakpoint-index="breakpointIndex"
			:columns="breakpoint.columns"
			:align="breakpoint.align"
		/>

		<!-- Segment Templates (for segments in this breakpoint) -->
		<template v-if="activeSegmentRefs.length > 0">
			<Separator />

			<Collapsible v-model:open="templateSectionOpen">
				<CollapsibleTrigger class="flex items-center justify-between w-full py-1 text-left">
					<div class="flex items-center gap-1.5">
						<IconLucide-layout-template class="size-3.5 text-muted-foreground" />
						<span class="text-xs font-medium">Segment Templates</span>
						<span class="text-[10px] text-muted-foreground">({{ activeSegmentRefs.length }})</span>
					</div>
					<IconLucide-chevron-right
						class="size-3.5 text-muted-foreground transition-transform duration-200"
						:class="{ 'rotate-90': templateSectionOpen }"
					/>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div class="pt-2 pb-1">
						<SegmentTemplateEditor :segment-refs="activeSegmentRefs" />
					</div>
				</CollapsibleContent>
			</Collapsible>
		</template>
	</div>
</template>
