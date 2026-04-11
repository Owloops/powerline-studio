<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
	NumberField,
	NumberFieldContent,
	NumberFieldDecrement,
	NumberFieldIncrement,
	NumberFieldInput,
} from '@/components/ui/number-field'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'

const configStore = useConfigStore()

const tui = computed(() => configStore.config.display.tui)
const fitContent = computed(() => tui.value?.fitContent ?? false)
</script>

<template>
	<TooltipProvider :delay-duration="300">
		<div class="grid grid-cols-2 gap-x-4 gap-y-3">
			<!-- fitContent -->
			<div class="flex items-center justify-between col-span-2">
				<div class="flex items-center gap-1.5">
					<Label for="fit-content" class="text-xs">Fit Content</Label>
					<Tooltip>
						<TooltipTrigger as-child>
							<IconLucide-info class="size-3 text-muted-foreground/50" />
						</TooltipTrigger>
						<TooltipContent side="right" class="max-w-56 text-xs">
							Shrink the panel to fit its content width instead of filling available space
						</TooltipContent>
					</Tooltip>
				</div>
				<Switch
					id="fit-content"
					:checked="fitContent"
					@update:checked="configStore.setTuiOption('fitContent', $event)"
				/>
			</div>

			<!-- minWidth -->
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-1.5">
					<Label for="tui-min-width" class="text-xs">Min Width</Label>
					<Tooltip>
						<TooltipTrigger as-child>
							<IconLucide-info class="size-3 text-muted-foreground/50" />
						</TooltipTrigger>
						<TooltipContent side="right" class="max-w-56 text-xs">
							Minimum panel width in characters
						</TooltipContent>
					</Tooltip>
				</div>
				<NumberField
					id="tui-min-width"
					:model-value="tui?.minWidth"
					:min="0"
					:step="1"
					@update:model-value="configStore.setTuiOption('minWidth', $event)"
				>
					<NumberFieldContent>
						<NumberFieldDecrement />
						<NumberFieldInput placeholder="32" />
						<NumberFieldIncrement />
					</NumberFieldContent>
				</NumberField>
			</div>

			<!-- maxWidth -->
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-1.5">
					<Label for="tui-max-width" class="text-xs">Max Width</Label>
					<Tooltip>
						<TooltipTrigger as-child>
							<IconLucide-info class="size-3 text-muted-foreground/50" />
						</TooltipTrigger>
						<TooltipContent side="right" class="max-w-56 text-xs">
							Maximum panel width in characters
						</TooltipContent>
					</Tooltip>
				</div>
				<NumberField
					id="tui-max-width"
					:model-value="tui?.maxWidth"
					:min="0"
					:step="1"
					@update:model-value="configStore.setTuiOption('maxWidth', $event)"
				>
					<NumberFieldContent>
						<NumberFieldDecrement />
						<NumberFieldInput />
						<NumberFieldIncrement />
					</NumberFieldContent>
				</NumberField>
			</div>

			<!-- widthReserve -->
			<div class="flex flex-col gap-1 col-span-2">
				<div class="flex items-center gap-1.5">
					<Label for="tui-width-reserve" class="text-xs">Width Reserve</Label>
					<Tooltip>
						<TooltipTrigger as-child>
							<IconLucide-info class="size-3 text-muted-foreground/50" />
						</TooltipTrigger>
						<TooltipContent side="right" class="max-w-56 text-xs">
							<template v-if="fitContent">
								Ignored when Fit Content is enabled
							</template>
							<template v-else>
								Characters reserved for the prompt (subtracted from terminal width to determine panel width)
							</template>
						</TooltipContent>
					</Tooltip>
				</div>
				<NumberField
					id="tui-width-reserve"
					:model-value="tui?.widthReserve"
					:min="0"
					:step="1"
					:disabled="fitContent"
					@update:model-value="configStore.setTuiOption('widthReserve', $event)"
				>
					<NumberFieldContent>
						<NumberFieldDecrement />
						<NumberFieldInput placeholder="45" />
						<NumberFieldIncrement />
					</NumberFieldContent>
				</NumberField>
			</div>
		</div>
	</TooltipProvider>
</template>
