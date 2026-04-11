<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
	ColorAreaRoot,
	ColorAreaArea,
	ColorAreaThumb,
	ColorSliderRoot,
	ColorSliderTrack,
	ColorSliderThumb,
	ColorFieldRoot,
	ColorFieldInput,
} from 'reka-ui'

const props = defineProps<{
	color: string
	label: string
}>()

const emit = defineEmits<{
	'update:color': [hex: string]
}>()

const isOpen = ref(false)

const colorValue = computed({
	get: () => props.color,
	set: (val: string) => {
		if (/^#[0-9a-fA-F]{6}$/.test(val)) {
			emit('update:color', val)
		}
	},
})
</script>

<template>
	<Popover v-model:open="isOpen">
		<PopoverTrigger as-child>
			<button
				type="button"
				class="color-input-trigger flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-1.5 text-xs font-mono hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				:aria-label="label"
			>
				<span
					class="size-4 shrink-0 rounded border border-border/50"
					:style="{ backgroundColor: props.color }"
				/>
				<span class="text-muted-foreground select-none">{{ props.color }}</span>
			</button>
		</PopoverTrigger>
		<PopoverContent class="w-auto p-3" :side-offset="8" align="start">
			<div class="flex flex-col gap-3">
				<!-- Color Area (saturation + brightness) -->
				<ColorAreaRoot
					v-model="colorValue"
					color-space="hsb"
					x-channel="saturation"
					y-channel="brightness"
					class="relative h-[150px] w-[180px] rounded-md"
				>
					<template #default="{ style }">
						<ColorAreaArea class="size-full rounded-md" :style="style">
							<ColorAreaThumb
								class="size-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.3)]"
							/>
						</ColorAreaArea>
					</template>
				</ColorAreaRoot>

				<!-- Hue Slider -->
				<ColorSliderRoot
					v-model="colorValue"
					channel="hue"
					class="relative flex h-3 w-[180px] items-center"
				>
					<ColorSliderTrack class="h-3 w-full rounded-full" />
					<ColorSliderThumb
						class="block size-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.3)]"
					/>
				</ColorSliderRoot>

				<!-- Hex Input + Preview Swatch -->
				<div class="flex items-center gap-2">
					<span
						class="size-7 shrink-0 rounded-md border border-border"
						:style="{ backgroundColor: props.color }"
					/>
					<ColorFieldRoot v-model="colorValue" class="flex-1">
						<ColorFieldInput
							class="h-7 w-full rounded-md border border-border bg-background px-2 font-mono text-xs uppercase text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
						/>
					</ColorFieldRoot>
				</div>
			</div>
		</PopoverContent>
	</Popover>
</template>

<style scoped>
.color-input-trigger {
	transition: border-color 150ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
	.color-input-trigger {
		transition: none;
	}
}
</style>
