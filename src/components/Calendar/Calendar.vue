<script lang="ts" setup>
import { cn } from '@/lib/utils'
import {
	CalendarRoot,
	type CalendarRootEmits,
	type CalendarRootProps,
	useDateFormatter,
	useForwardPropsEmits,
} from 'reka-ui'
import { createDecade, createYear, toDate } from 'reka-ui/date'
import { computed, provide, type HTMLAttributes, type Ref } from 'vue'
import {
	CalendarCell,
	CalendarCellTrigger,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHead,
	CalendarGridRow,
	CalendarHeadCell,
	CalendarHeader,
	CalendarHeading,
	CalendarNextButton,
	CalendarPrevButton,
} from '.'
import { type DateValue, getLocalTimeZone, today } from '@internationalized/date'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select'
import { ChevronsLeft, ChevronsRight } from '@lucide/vue'
import { type MarkedDates, MARKED_DATES_KEY, useMarkedDatesMap } from './marked-dates'

const props = withDefaults(
	defineProps<CalendarRootProps & { class?: HTMLAttributes['class']; markedDates?: MarkedDates }>(),
	{
		placeholder() {
			return today(getLocalTimeZone())
		},
		weekdayFormat: 'short',
	},
)

const emits = defineEmits<
	CalendarRootEmits & { 'update:placeholder': [value: DateValue | undefined] }
>()

const delegatedProps = computed(() => {
	const {
		class: _,
		modelValue: __,
		placeholder: ___,
		locale: ____,
		markedDates: _____,
		...delegated
	} = props
	return delegated
})

const markedDatesMap = useMarkedDatesMap(() => props.markedDates)
provide(MARKED_DATES_KEY, markedDatesMap)

const forwarded = useForwardPropsEmits(delegatedProps, emits)

const formatter = useDateFormatter(props.locale ?? 'fi-FI')

const prevYear = (currentViewDate: DateValue) => {
	if (!currentViewDate) return
	emits('update:placeholder', currentViewDate.subtract({ years: 1 }))
}
const nextYear = (currentViewDate: DateValue) => {
	if (!currentViewDate) return
	emits('update:placeholder', currentViewDate.add({ years: 1 }))
}

const handleMonthSelect = (monthNumber: string | number, currentViewDate: DateValue) => {
	if (!monthNumber || !currentViewDate) return
	const numMonth = Number(monthNumber)
	if (numMonth === currentViewDate.month) return
	emits('update:placeholder', currentViewDate.set({ month: numMonth }))
}

const handleYearSelect = (yearNumber: string | number, currentViewDate: DateValue) => {
	if (!yearNumber || !currentViewDate) return
	const numYear = Number(yearNumber)
	if (numYear === currentViewDate.year) return
	emits('update:placeholder', currentViewDate.set({ year: numYear }))
}
</script>

<template>
	<CalendarRoot
		v-slot="{ date, grid, weekDays }"
		:model-value="props.modelValue"
		@update:model-value="(value: any) => emits('update:modelValue', value)"
		:placeholder="props.placeholder"
		@update:placeholder="(value: any) => emits('update:placeholder', value)"
		v-bind="forwarded"
		:locale="props.locale"
		:weekday-format="props.weekdayFormat"
		:class="cn('w-fit rounded-md bg-background text-foreground p-1', props.class)"
		:disabled="props.disabled"
	>
		<CalendarHeader class="items-center flex gap-1 w-full">
			<button
				type="button"
				:class="
					cn(
						'inline-flex text-muted-foreground items-center justify-center shrink-0 h-8 w-8 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground rounded-md',
						{
							'cursor-not-allowed opacity-50': props.disabled || !date || (date && date.year <= 1),
						},
					)
				"
				:disabled="props.disabled || !date || (date && date.year <= 1)"
				@click="date && prevYear(date)"
				aria-label="Previous year"
			>
				<ChevronsLeft class="h-4 w-4" />
			</button>
			<CalendarPrevButton class="text-muted-foreground" />

			<CalendarHeading class="flex w-full items-center justify-center gap-1">
				<Select
					v-if="date"
					:model-value="date.month.toString()"
					:disabled="props.disabled"
					@update:model-value="(v: any) => handleMonthSelect(v, date)"
				>
					<SelectTrigger
						aria-label="Select month"
						class="w-auto p-1 pr-2 pl-1 text-muted-foreground text-xs"
					>
						<SelectValue class="capitalize" placeholder="Select month" />
					</SelectTrigger>
					<SelectContent class="max-h-[200px]">
						<SelectItem
							class="capitalize"
							v-for="monthItem in createYear({ dateObj: date })"
							:key="monthItem.toString()"
							:value="monthItem.month.toString()"
						>
							{{ formatter.custom(toDate(monthItem), { month: 'long' }) }}
						</SelectItem>
					</SelectContent>
				</Select>
				<span v-else class="text-sm font-medium"></span>

				<Select
					v-if="date"
					:model-value="date.year.toString()"
					:disabled="props.disabled"
					@update:model-value="(v: any) => handleYearSelect(v, date)"
				>
					<SelectTrigger
						aria-label="Select year"
						class="w-auto p-1 pr-2 pl-1 text-muted-foreground text-xs"
					>
						<SelectValue placeholder="Select year" />
					</SelectTrigger>
					<SelectContent class="max-h-[200px]">
						<SelectItem
							v-for="yearValue in createDecade({ dateObj: date, startIndex: -10, endIndex: 10 })"
							:key="yearValue.toString()"
							:value="yearValue.year.toString()"
						>
							{{ yearValue.year }}
						</SelectItem>
					</SelectContent>
				</Select>
				<span v-else class="text-sm font-medium"></span>
			</CalendarHeading>

			<CalendarNextButton class="text-muted-foreground" />
			<button
				type="button"
				:class="
					cn(
						'inline-flex text-muted-foreground items-center justify-center shrink-0 h-8 w-8 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground rounded-md',
						{
							'cursor-not-allowed opacity-50':
								props.disabled || !date || (date && date.year >= 9999),
						},
					)
				"
				:disabled="props.disabled || !date || (date && date.year >= 9999)"
				@click="date && nextYear(date)"
				aria-label="Next year"
			>
				<ChevronsRight class="h-4 w-4" />
			</button>
		</CalendarHeader>

		<div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
			<CalendarGrid v-for="month in grid" :key="month.value.toString()">
				<CalendarGridHead>
					<CalendarGridRow>
						<CalendarHeadCell v-for="day in weekDays" :key="day">
							{{ day }}
						</CalendarHeadCell>
					</CalendarGridRow>
				</CalendarGridHead>
				<CalendarGridBody class="grid">
					<CalendarGridRow
						v-for="(weekDates, index) in month.rows"
						:key="`weekDate-${index}`"
						class="mt-2 w-full"
					>
						<CalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate">
							<CalendarCellTrigger :day="weekDate" :month="month.value" />
						</CalendarCell>
					</CalendarGridRow>
				</CalendarGridBody>
			</CalendarGrid>
		</div>
	</CalendarRoot>
</template>
