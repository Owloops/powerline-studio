<script lang="ts" setup>
import { cn } from '@/lib/utils'
import { CalendarCellTrigger, type CalendarCellTriggerProps, useForwardProps } from 'reka-ui'
import { computed, inject, type HTMLAttributes } from 'vue'
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip.vue'
import { MARKED_DATES_KEY, dateValueToKey } from './marked-dates'

const props = defineProps<CalendarCellTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	return delegated
})

const forwardedProps = useForwardProps(delegatedProps)

const markedDatesMap = inject(MARKED_DATES_KEY, undefined)

const mark = computed(() => {
	if (!markedDatesMap?.value || !props.day) return undefined
	const key = dateValueToKey(props.day.year, props.day.month, props.day.day)
	return markedDatesMap.value.get(key)
})
</script>

<template>
	<CalendarCellTrigger
		:class="
			cn(
				'bg-transparent hover:bg-accent hover:text-accent-foreground text-foreground font-normal rounded-lg',
				'h-9 w-9 p-0 flex items-center justify-center relative',
				'[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground',
				// Selected
				'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:opacity-100 data-[selected]:hover:bg-primary/90 data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-primary data-[selected]:focus:hover:bg-primary/90 data-[selected]:focus:text-primary-foreground',
				// Disabled
				'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
				// Unavailable
				'data-[unavailable]:text-muted-foreground data-[unavailable]:line-through',
				// Outside months
				'data-[outside-view]:text-muted-foreground data-[outside-view]:opacity-50 [&[data-outside-view][data-selected]]:bg-primary/50 [&[data-outside-view][data-selected]]:text-muted-foreground [&[data-outside-view][data-selected]]:opacity-30',
				props.class,
			)
		"
		v-bind="forwardedProps"
	>
		<template #default="{ dayValue }">
			<CustomTooltip v-if="mark?.reason" :provider="{ delayDuration: 300 }">
				<span class="w-full h-full flex items-center justify-center">
					<span>{{ dayValue }}</span>
					<span
						:class="
							cn(
								'absolute bottom-1 w-1 h-1 rounded-full pointer-events-none',
								mark.class || 'bg-muted-foreground',
							)
						"
					/>
				</span>
				<template #content>{{ mark.reason }}</template>
			</CustomTooltip>
			<template v-else>
				<span>{{ dayValue }}</span>
				<span
					v-if="mark"
					:class="
						cn(
							'absolute bottom-1 w-1 h-1 rounded-full pointer-events-none',
							mark.class || 'bg-muted-foreground',
						)
					"
				/>
			</template>
		</template>
	</CalendarCellTrigger>
</template>
