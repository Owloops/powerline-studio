<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import NumberFlow from '@number-flow/vue'
import type { Format } from '@number-flow/vue'
import {
	SliderRange,
	SliderRoot,
	SliderThumb,
	SliderTrack,
	TooltipProvider,
	TooltipRoot,
	TooltipTrigger,
	TooltipContent,
	TooltipPortal,
	TooltipArrow,
	useForwardPropsEmits,
} from 'reka-ui'
import type { SliderRootEmits, SliderRootProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'vue'

const props = defineProps<
	SliderRootProps & {
		class?: HTMLAttributes['class']
		classThumb?: HTMLAttributes['class']
		classTrack?: HTMLAttributes['class']
		classRange?: HTMLAttributes['class']
		tooltipFormat?: (value: number) => string
		format?: Format
		suffix?: string
		prefix?: string
		locales?: Intl.LocalesArgument
	}
>()

const emits = defineEmits<SliderRootEmits>()

const delegatedProps = computed(() => {
	const {
		class: _,
		classThumb: __,
		classTrack: ___,
		classRange: ____,
		tooltipFormat: _____,
		format: ______,
		suffix: _______,
		prefix: ________,
		...delegated
	} = props
	return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
	<TooltipProvider :disableClosingTrigger="true">
		<SliderRoot
			:class="
				cn(
					'relative flex w-full touch-none select-none items-center data-[orientation=vertical]:flex-col data-[orientation=vertical]:w-2 data-[orientation=vertical]:h-full',
					props.class,
				)
			"
			v-bind="forwarded"
		>
			<SliderTrack
				:class="
					cn(
						'relative h-2 w-full data-[orientation=vertical]:w-2 grow overflow-hidden rounded-full bg-primary/20',
						props.classTrack,
					)
				"
			>
				<SliderRange
					:class="
						cn('absolute h-full data-[orientation=vertical]:w-full bg-primary', props.classRange)
					"
				/>
			</SliderTrack>
			<template v-for="(_, key) in modelValue" :key="key">
				<TooltipRoot :delay-duration="0">
					<TooltipTrigger as-child>
						<SliderThumb
							:class="
								cn(
									'block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
									props.classThumb,
									// Class for the last thumb to better position it for max value selection
									{
										'ml-[2px]':
											key === (modelValue?.length ?? 0) - 1 && (modelValue?.length ?? 0) > 1,
									},
								)
							"
						/>
					</TooltipTrigger>
					<TooltipPortal>
						<TooltipContent
							class="bg-primary text-primary-foreground px-2 py-1 text-xs rounded shadow-sm z-20"
							side="top"
							:side-offset="5"
							:updatePositionStrategy="'optimized'"
						>
							<NumberFlow
								:transformTiming="{
									duration: 250,
								}"
								:spinTiming="{
									duration: 250,
								}"
								:opacityTiming="{
									duration: 250,
								}"
								:locales="props.locales || 'fi-FI'"
								:value="modelValue && modelValue[key] ? modelValue[key] : 0"
								:format="props.format"
								:suffix="props.suffix"
								:prefix="props.prefix"
								:will-change="true"
							/>
							<TooltipArrow :width="11" :height="5" class="fill-current text-primary" />
						</TooltipContent>
					</TooltipPortal>
				</TooltipRoot>
			</template>
		</SliderRoot>
	</TooltipProvider>
</template>
