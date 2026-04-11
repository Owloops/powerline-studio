<script lang="ts" setup>
import { cn } from '@/lib/utils'
import {
	RangeCalendarRoot,
	type RangeCalendarRootEmits,
	type RangeCalendarRootProps,
	useForwardPropsEmits,
} from 'reka-ui'
import { computed, provide, ref, type HTMLAttributes } from 'vue'
import {
	RangeCalendarCell,
	RangeCalendarCellTrigger,
	RangeCalendarGrid,
	RangeCalendarGridBody,
	RangeCalendarGridHead,
	RangeCalendarGridRow,
	RangeCalendarHeadCell,
	RangeCalendarHeader,
	RangeCalendarHeading,
	RangeCalendarNextButton,
	RangeCalendarPrevButton,
	RangeCalendarNextYearButton,
	RangeCalendarPrevYearButton,
} from '.'
import {
	type MarkedDates,
	MARKED_DATES_KEY,
	useMarkedDatesMap,
} from '@/components/Calendar/marked-dates'

interface Props extends RangeCalendarRootProps {
	class?: HTMLAttributes['class']
	numberOfMonths?: number
	markedDates?: MarkedDates
}

const props = withDefaults(defineProps<Props>(), {
	numberOfMonths: 1,
})

const emits = defineEmits<RangeCalendarRootEmits>()

const delegatedProps = computed(() => {
	const { class: _, numberOfMonths: __, markedDates: ___, ...delegated } = props

	return delegated
})

const markedDatesMap = useMarkedDatesMap(() => props.markedDates)
provide(MARKED_DATES_KEY, markedDatesMap)

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
	<RangeCalendarRoot
		v-slot="{ grid, weekDays }"
		:class="cn('w-fit rounded-md bg-background text-foreground p-1', props.class)"
		v-bind="forwarded"
	>
		<RangeCalendarHeader>
			<div class="flex items-center gap-1">
				<RangeCalendarPrevYearButton />
				<RangeCalendarPrevButton />
			</div>
			<RangeCalendarHeading />
			<div class="flex items-center gap-1">
				<RangeCalendarNextButton />
				<RangeCalendarNextYearButton />
			</div>
		</RangeCalendarHeader>

		<div class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
			<RangeCalendarGrid v-for="month in grid" :key="month.value.toString()">
				<RangeCalendarGridHead>
					<RangeCalendarGridRow>
						<RangeCalendarHeadCell v-for="day in weekDays" :key="day">
							{{ day }}
						</RangeCalendarHeadCell>
					</RangeCalendarGridRow>
				</RangeCalendarGridHead>
				<RangeCalendarGridBody>
					<RangeCalendarGridRow
						v-for="(weekDates, index) in month.rows"
						:key="`weekDate-${index}`"
						class="mt-2 w-full"
					>
						<RangeCalendarCell
							v-for="weekDate in weekDates"
							:key="weekDate.toString()"
							:date="weekDate"
						>
							<RangeCalendarCellTrigger :day="weekDate" :month="month.value" />
						</RangeCalendarCell>
					</RangeCalendarGridRow>
				</RangeCalendarGridBody>
			</RangeCalendarGrid>
		</div>
	</RangeCalendarRoot>
</template>
