<script setup lang="ts">
import type { AlignValue } from '@/types/tui'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const props = defineProps<{
	breakpointIndex: number
	align?: AlignValue[]
	columnCount: number
}>()

const configStore = useConfigStore()

const isEnabled = computed(() => !!props.align)
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<div class="text-xs font-medium text-muted-foreground">Column Alignment</div>
			<div class="flex items-center gap-2">
				<Label for="align-toggle" class="text-xs text-muted-foreground">Override</Label>
				<Switch
					id="align-toggle"
					:checked="isEnabled"
					@update:checked="configStore.toggleAlignOverrides(breakpointIndex, $event)"
				/>
			</div>
		</div>

		<div v-if="isEnabled && align" class="flex flex-wrap gap-2">
			<div
				v-for="(val, colIndex) in align"
				:key="colIndex"
				class="flex flex-col gap-1"
			>
				<span class="text-[10px] text-muted-foreground">Col {{ colIndex + 1 }}</span>
				<Select
					:model-value="val"
					@update:model-value="configStore.setColumnAlign(breakpointIndex, colIndex, $event as AlignValue)"
				>
					<SelectTrigger size="sm" class="h-7 w-24 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="left">
							<span class="flex items-center gap-1.5">
								<IconLucide-align-left class="size-3" />
								Left
							</span>
						</SelectItem>
						<SelectItem value="center">
							<span class="flex items-center gap-1.5">
								<IconLucide-align-center class="size-3" />
								Center
							</span>
						</SelectItem>
						<SelectItem value="right">
							<span class="flex items-center gap-1.5">
								<IconLucide-align-right class="size-3" />
								Right
							</span>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	</div>
</template>
