<script setup lang="ts">
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { SegmentKey } from './segmentMeta'

const props = defineProps<{
	segmentName: SegmentKey
	disabled?: boolean
	disabledTooltip?: string
}>()

const UNSET = '__inherit__'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const compact = inject('formCompact', false)

const currentValue = computed<string>(() => {
	const seg = configStore.currentLineSegments[props.segmentName] as
		| { showIcon?: boolean }
		| undefined
	if (seg?.showIcon === true) return 'show'
	if (seg?.showIcon === false) return 'hide'
	return UNSET
})

function onValueChange(next: string) {
	if (props.disabled) return
	const value = next === 'show' ? true : next === 'hide' ? false : undefined
	configStore.setSegmentShowIcon(editorStore.activeLineIndex, props.segmentName, value)
}

const fieldId = `show-icon-${props.segmentName}`
</script>

<template>
	<div :class="compact ? 'flex items-center gap-2' : 'flex flex-col gap-1.5'">
		<div :class="compact ? 'flex w-32 shrink-0 items-center gap-1' : 'flex items-center gap-1'">
			<Label
				:for="fieldId"
				:class="compact ? 'text-xs text-muted-foreground' : 'text-sm font-medium text-foreground'"
			>
				Icon
			</Label>
			<TooltipProvider v-if="disabled && disabledTooltip" :delay-duration="200">
				<Tooltip>
					<TooltipTrigger as-child>
						<button
							type="button"
							class="inline-flex cursor-default rounded-sm outline-none focus-visible:outline-0 focus-visible:ring-[3px] focus-visible:ring-primary/50"
							aria-label="More info"
						>
							<IconLucide-info class="size-3 text-muted-foreground/50" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="top" class="max-w-64 text-xs">
						{{ disabledTooltip }}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
		<Select
			:model-value="currentValue"
			:disabled="disabled"
			@update:model-value="onValueChange(String($event))"
		>
			<SelectTrigger
				:id="fieldId"
				:size="compact ? 'sm' : undefined"
				:class="compact ? 'h-7 text-xs flex-1 min-w-0' : ''"
			>
				<SelectValue placeholder="Default (use global)" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem :value="UNSET" :class="compact ? 'text-xs' : ''">
					Default (use global)
				</SelectItem>
				<SelectItem value="show" :class="compact ? 'text-xs' : ''">Show</SelectItem>
				<SelectItem value="hide" :class="compact ? 'text-xs' : ''">Hide</SelectItem>
			</SelectContent>
		</Select>
	</div>
</template>
