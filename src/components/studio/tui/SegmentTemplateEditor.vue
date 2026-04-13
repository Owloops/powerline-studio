<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import SegmentTemplateItem from './SegmentTemplateItem.vue'
import { SEGMENT_PARTS } from '@owloops/claude-powerline/browser'
import type { SegmentName, SegmentTemplate } from '@owloops/claude-powerline/browser'

defineProps<{
	segmentRefs: string[]
}>()

const configStore = useConfigStore()

// Late-resolved refs that should not be templateable
const LATE_RESOLVE_REFS = new Set(['context.bar', 'block.bar', 'weekly.bar'])

function getTemplate(segRef: string): SegmentTemplate | undefined {
	return configStore.config.display.tui?.segments?.[segRef]
}

function getBaseSegment(segRef: string): string {
	const dotIdx = segRef.indexOf('.')
	return dotIdx > 0 ? segRef.slice(0, dotIdx) : segRef
}

function seedTemplate(segRef: string): SegmentTemplate {
	const dotIdx = segRef.indexOf('.')
	if (dotIdx > 0) {
		// Part-qualified ref like git.branch — seed with just that part
		const part = segRef.slice(dotIdx + 1)
		return { items: [`{${part}}`] }
	}
	// Base segment — seed with all default parts
	const parts = SEGMENT_PARTS[segRef as SegmentName]
	if (parts) {
		return { items: parts.map((p) => `{${p}}`) }
	}
	return { items: [] }
}

function createTemplate(segRef: string) {
	configStore.setTuiSegmentTemplate(segRef, seedTemplate(segRef))
}

function updateTemplate(segRef: string, template: SegmentTemplate) {
	configStore.setTuiSegmentTemplate(segRef, template)
}

function resetTemplate(segRef: string) {
	configStore.setTuiSegmentTemplate(segRef, undefined)
}

function isLateResolved(segRef: string): boolean {
	return LATE_RESOLVE_REFS.has(segRef)
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<p class="text-[0.625rem] text-muted-foreground italic">Applies to all breakpoints</p>

		<div v-if="segmentRefs.length === 0" class="text-xs text-muted-foreground">
			No segments placed in the grid
		</div>

		<template v-for="segRef in segmentRefs" :key="segRef">
			<!-- Late-resolved: read-only notice -->
			<div
				v-if="isLateResolved(segRef)"
				class="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2"
			>
				<span class="text-xs font-mono">{{ segRef }}</span>
				<span class="text-[0.625rem] text-muted-foreground">Width-dependent, not templateable</span>
			</div>

			<!-- Normal segments -->
			<Collapsible v-else>
				<div class="flex items-center gap-2 rounded-md border border-border px-3 py-1.5">
					<CollapsibleTrigger class="flex items-center gap-1.5 flex-1 text-left">
						<IconLucide-chevron-right
							class="size-3 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-90"
						/>
						<span class="text-xs font-mono">{{ segRef }}</span>
					</CollapsibleTrigger>
					<template v-if="!getTemplate(segRef)">
						<span class="text-[0.625rem] text-muted-foreground">Default</span>
						<Button
							variant="ghost"
							size="sm"
							class="h-6 px-2 text-[0.625rem]"
							@click="createTemplate(segRef)"
						>
							Customize
						</Button>
					</template>
				</div>
				<CollapsibleContent>
					<div v-if="getTemplate(segRef)" class="pl-4 pt-2 pb-1">
						<SegmentTemplateItem
							:seg-ref="segRef"
							:template="getTemplate(segRef)!"
							@update:template="updateTemplate(segRef, $event)"
							@reset="resetTemplate(segRef)"
						/>
					</div>
				</CollapsibleContent>
			</Collapsible>
		</template>
	</div>
</template>
