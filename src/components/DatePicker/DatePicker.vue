<script setup lang="ts">
import { cn } from '@/lib/utils'

import { Calendar } from '@/components/Calendar'
import { type MarkedDates } from '@/components/Calendar/marked-dates'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import {
	DateFormatter,
	type DateValue,
	type CalendarDate,
	type CalendarDateTime,
	type ZonedDateTime,
	getLocalTimeZone,
	parseDate,
	parseDateTime,
	parseAbsolute,
	CalendarDate as CalendarDateClass,
	CalendarDateTime as CalendarDateTimeClass,
	toZoned,
	today,
	fromAbsolute,
} from '@internationalized/date'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import type { AcceptableValue } from 'reka-ui'
import { useDateFormatter } from 'reka-ui'
import {
	createYear as rekaCreateYear,
	createDecade as rekaCreateDecade,
	toDate as rekaToDate,
} from 'reka-ui/date'

const createYear = rekaCreateYear
const createDecade = rekaCreateDecade
const toDate = rekaToDate

interface Props {
	modelValue?: Date | string | DateValue | null
	locale?: string
	dateFormat?: string
	date?: DateValue
	weekDays?: string[]
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
	fixedWeeks?: boolean
	timeZone?: string
	placeholder?: string
	class?: string
	disabled?: boolean
	timePicker?: boolean
	utc?: boolean
	assumeUtc?: boolean
	monthPicker?: boolean
	popoverAlign?: 'start' | 'center' | 'end'
	isDateUnavailable?: (date: DateValue) => boolean
	markedDates?: MarkedDates
}

const props = withDefaults(defineProps<Props>(), {
	locale: 'fi-FI',
	dateFormat: 'dd.MM.yyyy',
	placeholder: 'Valitse',
	timePicker: false,
	utc: false,
	assumeUtc: false,
	monthPicker: false,
	popoverAlign: 'start',
})

const emit = defineEmits<{
	'update:modelValue': [value: Date | undefined]
	'update:open': [value: boolean]
}>()

// Track last emission to prevent duplicates
let lastEmittedTime: number | null = null
let lastEmittedValue: string | null = null

// Helper to emit with deduplication
const emitModelValue = (value: Date | undefined) => {
	const now = Date.now()
	const valueStr = value?.toISOString ? value.toISOString() : String(value)

	// Check if this is a duplicate emission (same value within 50ms)
	if (lastEmittedValue === valueStr && lastEmittedTime && now - lastEmittedTime < 50) {
		return // Block duplicate emission
	}

	lastEmittedTime = now
	lastEmittedValue = valueStr

	emit('update:modelValue', value)
}

const getActiveTimeZone = () => {
	if (props.utc) return 'UTC'
	// Use props.timeZone only if it's a valid, non-empty string
	if (props.timeZone && typeof props.timeZone === 'string' && props.timeZone.trim() !== '') {
		return props.timeZone
	}
	return getLocalTimeZone()
}

const df = computed(() => {
	const activeTZ = getActiveTimeZone()

	if (props.monthPicker) {
		// Formatter for "Month YYYY" for the trigger button when monthPicker is active
		const monthYearFormatter = new DateFormatter(props.locale, {
			month: 'long', // Using 'long' month name for the trigger button as per original behavior
			year: 'numeric',
			timeZone: activeTZ,
		})
		return {
			format: (date: Date): string => monthYearFormatter.format(date),
			parse: (value: string): Date | null => {
				try {
					const [monthName, yearNum] = value.split(' ')
					return new Date(`${monthName} 1, ${yearNum}`)
				} catch (e) {
					console.error('Error parsing month-year string:', e)
					return null
				}
			},
		}
	}

	// Existing logic for date and time formatting
	const timeFormattingOptions: Intl.DateTimeFormatOptions = props.timePicker
		? { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: activeTZ }
		: {}

	let mainFormatter: DateFormatter | undefined
	const validDateStyles = ['full', 'long', 'medium', 'short']

	// Check if dateFormat is one of the explicitly handled string formats for custom parsing/formatting
	const isSpecialFormatString =
		props.dateFormat === 'dd.MM.yyyy' ||
		props.dateFormat === 'MM/dd/yyyy' ||
		props.dateFormat === 'yyyy-MM-dd'

	if (isSpecialFormatString) {
		// These formats are handled by custom logic in df.format() below.
		// mainFormatter remains undefined for these, as they might not be valid `dateStyle` values.
	} else if (typeof props.dateFormat === 'string' && validDateStyles.includes(props.dateFormat)) {
		// props.dateFormat is a valid dateStyle string (e.g., "short", "medium")
		const dateStyleOption = { dateStyle: props.dateFormat as 'full' | 'long' | 'medium' | 'short' }
		const effectiveMainFormatterOptions: Intl.DateTimeFormatOptions = {
			...dateStyleOption,
			// If timePicker is active, timeFormattingOptions will include timeZone.
			// If not, we add timeZone for date-only formatting.
			...(props.timePicker ? timeFormattingOptions : { timeZone: activeTZ }),
		}
		mainFormatter = new DateFormatter(props.locale, effectiveMainFormatterOptions)
	} else {
		// props.dateFormat is some other string (e.g., "YYYY-MM-DD" from DateInput, or "DD.MM.YYYY HH:mm")
		// It's not one of the special string formats, nor a valid dateStyle.
		// mainFormatter remains undefined. df.format() will use its own fallback for the button display.
	}

	return {
		format: (date: Date): string => {
			let datePart: string
			const getDay = (d: Date) => (props.utc ? d.getUTCDate() : d.getDate())
			const getMonth = (d: Date) => (props.utc ? d.getUTCMonth() + 1 : d.getMonth() + 1)
			const getFullYear = (d: Date) => (props.utc ? d.getUTCFullYear() : d.getFullYear())

			if (props.dateFormat === 'dd.MM.yyyy') {
				const day = getDay(date).toString().padStart(2, '0')
				const month = getMonth(date).toString().padStart(2, '0')
				const year = getFullYear(date).toString()
				datePart = `${day}.${month}.${year}`
			} else if (props.dateFormat === 'MM/dd/yyyy') {
				const day = getDay(date).toString().padStart(2, '0')
				const month = getMonth(date).toString().padStart(2, '0')
				const year = getFullYear(date).toString()
				datePart = `${month}/${day}/${year}`
			} else if (props.dateFormat === 'yyyy-MM-dd') {
				const day = getDay(date).toString().padStart(2, '0')
				const month = getMonth(date).toString().padStart(2, '0')
				const year = getFullYear(date).toString()
				datePart = `${year}-${month}-${day}` // Corrected to use hyphens
			} else if (mainFormatter) {
				// If dateFormat was a valid dateStyle, mainFormatter handles everything including time.
				return mainFormatter.format(date)
			} else {
				// Fallback for other string formats (like "YYYY-MM-DD" from DateInput or custom like "DD.MM.YYYY HH:mm")
				// This provides a default display for the DatePicker's own trigger button.
				// It doesn't try to parse props.dateFormat itself as a complex pattern here.
				const fallbackFormatterOptions: Intl.DateTimeFormatOptions = {
					dateStyle: 'short',
					timeZone: activeTZ,
				}
				// If timePicker is enabled, and no mainFormatter was created (e.g. dateFormat = "YYYY-MM-DD HH:mm"),
				// then the button display should also include time.
				if (props.timePicker && !props.monthPicker) {
					Object.assign(fallbackFormatterOptions, timeFormattingOptions) // Add time parts
				}
				const fallbackFormatter = new DateFormatter(props.locale, fallbackFormatterOptions)
				return fallbackFormatter.format(date) // Use return here as time is included by fallbackFormatter if applicable
			}

			// This block is for isSpecialFormatString cases where datePart was constructed.
			// If mainFormatter existed, or fallbackFormatter was used (which now handles time),
			// this block won't be reached for time appending.
			if (props.timePicker && !props.monthPicker) {
				const timeOnlyFormatter = new DateFormatter(props.locale, timeFormattingOptions)
				const timePart = timeOnlyFormatter.format(date)
				return `${datePart} ${timePart}`
			}
			return datePart
		},
		parse: (value: string): Date | null => {
			try {
				const dateStringPart = value.split(' ')[0]

				if (props.dateFormat === 'dd.MM.yyyy') {
					const [day, month, year] = dateStringPart.split('.')
					return new Date(Number(year), Number(month) - 1, Number(day))
				} else if (props.dateFormat === 'MM/dd/yyyy') {
					const [month, day, year] = dateStringPart.split('/')
					return new Date(Number(year), Number(month) - 1, Number(day))
				} else if (props.dateFormat === 'yyyy-MM-dd') {
					// For 'yyyy-MM-dd', Date constructor should parse it correctly.
					// If time is involved, it should be an ISO string like "yyyy-MM-ddTHH:mm:ss".
					return new Date(value)
				} else {
					// For other formats (including valid dateStyle strings or custom patterns not explicitly handled)
					// attempt a generic parse. This is a fallback.
					return new Date(value)
				}
			} catch (e) {
				console.error('Error parsing date:', e)
				return null
			}
		},
	}
})

const internalValue = computed<DateValue | undefined>(() => {
	const mv = props.modelValue
	if (!mv) return undefined

	try {
		if (mv instanceof Date) {
			const d = mv
			if (Number.isNaN(d.getTime())) {
				console.warn('DatePicker: modelValue is an invalid Date object.', mv)
				return undefined
			}
			if (props.monthPicker) {
				const year = props.utc
					? d.getUTCFullYear()
					: fromAbsolute(d.getTime(), getActiveTimeZone()).year
				const month = props.utc
					? d.getUTCMonth() + 1
					: fromAbsolute(d.getTime(), getActiveTimeZone()).month
				return new CalendarDateClass(year, month, 1)
			}
			if (props.utc) {
				return props.timePicker && !props.monthPicker
					? new CalendarDateTimeClass(
							d.getUTCFullYear(),
							d.getUTCMonth() + 1,
							d.getUTCDate(),
							d.getUTCHours(),
							d.getUTCMinutes(),
							d.getUTCSeconds(),
							d.getUTCMilliseconds(),
						)
					: new CalendarDateClass(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())
			} else {
				const zdtFromEpoch = fromAbsolute(d.getTime(), getActiveTimeZone())
				if (props.timePicker && !props.monthPicker) {
					return zdtFromEpoch
				} else {
					return new CalendarDateClass(zdtFromEpoch.year, zdtFromEpoch.month, zdtFromEpoch.day)
				}
			}
		}

		if (typeof mv === 'string') {
			// Handle UTC assumption for timezone-less strings
			let processedString = mv
			if (props.assumeUtc && !mv.includes('Z') && !mv.includes('+') && !mv.includes('-', 10)) {
				// If assumeUtc is true and the string doesn't have timezone info, append 'Z'
				processedString = mv + 'Z'
			}

			if (props.monthPicker) {
				try {
					const dv = parseDate(processedString.split('T')[0])
					return new CalendarDateClass(dv.year, dv.month, 1)
				} catch (parseErr) {}
			} else if (props.timePicker) {
				try {
					// Use parseAbsolute for timezone-aware strings, parseDateTime for timezone-naive
					if (
						processedString.includes('Z') ||
						processedString.includes('+') ||
						processedString.includes('-', 10)
					) {
						// String has timezone info, use parseAbsolute and convert to active timezone
						const absoluteDateTime = parseAbsolute(processedString, getActiveTimeZone())
						return absoluteDateTime
					} else {
						// String has no timezone info, use parseDateTime (treats as local)
						return parseDateTime(processedString)
					}
				} catch (e) {}
				const dateOnly = parseDate(processedString.split('T')[0])
				return new CalendarDateTimeClass(dateOnly.year, dateOnly.month, dateOnly.day, 0, 0)
			} else {
				return parseDate(processedString.split('T')[0])
			}
		}

		if (typeof mv === 'object' && 'calendar' in mv) {
			if (props.monthPicker) {
				return new CalendarDateClass(mv.year, mv.month, 1)
			}
			if (props.timePicker) {
				if ('hour' in mv) return mv as CalendarDateTime | ZonedDateTime
				return new CalendarDateTimeClass(mv.year, mv.month, mv.day, 0, 0)
			} else {
				return 'hour' in mv
					? new CalendarDateClass(mv.year, mv.month, mv.day)
					: (mv as CalendarDate)
			}
		}
	} catch (e) {
		if (typeof mv === 'string') {
			const parsedDate = df.value.parse(mv)
			if (parsedDate) {
				if (props.monthPicker) {
					const year = props.utc
						? parsedDate.getUTCFullYear()
						: fromAbsolute(parsedDate.getTime(), getActiveTimeZone()).year
					const month = props.utc
						? parsedDate.getUTCMonth() + 1
						: fromAbsolute(parsedDate.getTime(), getActiveTimeZone()).month
					return new CalendarDateClass(year, month, 1)
				}
				if (props.utc) {
					return props.timePicker && !props.monthPicker
						? new CalendarDateTimeClass(
								parsedDate.getUTCFullYear(),
								parsedDate.getUTCMonth() + 1,
								parsedDate.getUTCDate(),
								parsedDate.getUTCHours(),
								parsedDate.getUTCMinutes(),
							)
						: new CalendarDateClass(
								parsedDate.getUTCFullYear(),
								parsedDate.getUTCMonth() + 1,
								parsedDate.getUTCDate(),
							)
				} else {
					const zdtFromParsedEpoch = fromAbsolute(parsedDate.getTime(), getActiveTimeZone())
					if (props.timePicker && !props.monthPicker) {
						return zdtFromParsedEpoch
					} else {
						return new CalendarDateClass(
							zdtFromParsedEpoch.year,
							zdtFromParsedEpoch.month,
							zdtFromParsedEpoch.day,
						)
					}
				}
			}
		}
		console.error('Error processing modelValue into DateValue:', mv, e)
	}
	return undefined
})

const selectedHour = ref<AcceptableValue>(null)
const selectedMinute = ref<AcceptableValue>(null)

const hoursForSelect = Array.from({ length: 24 }, (_, i) => i)
const minutesForSelect = Array.from({ length: 60 }, (_, i) => i)

// Computed for month picker display
const monthsForDisplay = computed(() => {
	if (!calendarViewDate.value) return []
	const currentYear = calendarViewDate.value.year
	const shortMonthFormatter = new Intl.DateTimeFormat(props.locale, {
		month: 'short',
		timeZone: getActiveTimeZone(),
	})
	return Array.from({ length: 12 }, (_, i) => {
		const monthIndexForDate = i
		const monthValueForSelection = i + 1

		const dateForFormatting = new Date(Date.UTC(2021, monthIndexForDate, 1))

		return {
			value: monthValueForSelection,
			label: shortMonthFormatter.format(dateForFormatting),
			originalDate: new CalendarDateClass(currentYear, monthValueForSelection, 1),
			isSelected:
				internalValue.value &&
				internalValue.value.year === currentYear &&
				internalValue.value.month === monthValueForSelection,
		}
	})
})

watch(
	() => [props.modelValue, props.timePicker, props.utc, props.assumeUtc, props.monthPicker],
	() => {
		if (props.monthPicker || !props.timePicker) {
			selectedHour.value = null
			selectedMinute.value = null
			return
		}

		if (props.timePicker) {
			if (props.modelValue instanceof Date) {
				if (props.utc) {
					selectedHour.value = props.modelValue.getUTCHours()
					selectedMinute.value = props.modelValue.getUTCMinutes()
				} else {
					const jsDate = props.modelValue as Date
					const zdtFromEpochForWatcher = fromAbsolute(jsDate.getTime(), getActiveTimeZone())
					selectedHour.value = zdtFromEpochForWatcher.hour
					selectedMinute.value = zdtFromEpochForWatcher.minute
				}
			} else if (
				props.modelValue &&
				typeof props.modelValue === 'object' &&
				'hour' in props.modelValue &&
				'minute' in props.modelValue
			) {
				selectedHour.value = (props.modelValue as CalendarDateTime).hour
				selectedMinute.value = (props.modelValue as CalendarDateTime).minute
			} else if (typeof props.modelValue === 'string') {
				try {
					// Apply assumeUtc logic to string parsing for time picker consistency
					let processedString = props.modelValue
					if (
						props.assumeUtc &&
						!processedString.includes('Z') &&
						!processedString.includes('+') &&
						!processedString.includes('-', 10)
					) {
						processedString = processedString + 'Z'
					}

					// Use parseAbsolute for timezone-aware strings, parseDateTime for timezone-naive
					let dt
					if (
						processedString.includes('Z') ||
						processedString.includes('+') ||
						processedString.includes('-', 10)
					) {
						// String has timezone info, use parseAbsolute and convert to local timezone
						const absoluteDateTime = parseAbsolute(processedString, getActiveTimeZone())
						dt = absoluteDateTime
					} else {
						// String has no timezone info, use parseDateTime (treats as local)
						dt = parseDateTime(processedString)
					}

					selectedHour.value = dt.hour
					selectedMinute.value = dt.minute
				} catch (e) {
					selectedHour.value = null
					selectedMinute.value = null
				}
			} else {
				selectedHour.value = null
				selectedMinute.value = null
			}
		} else {
			selectedHour.value = null
			selectedMinute.value = null
		}
	},
	{ immediate: true, deep: true },
)

const updateValueFromCalendar = (calendarDateValue: DateValue | undefined) => {
	if (!calendarDateValue) {
		emitModelValue(undefined)
		if (props.timePicker && !props.monthPicker) {
			selectedHour.value = null
			selectedMinute.value = null
		}
		return
	}

	if (props.timePicker && !props.monthPicker) {
		const hourToSet = selectedHour.value ?? 0
		const minuteToSet = selectedMinute.value ?? 0

		if (selectedHour.value === null) selectedHour.value = hourToSet
		if (selectedMinute.value === null) selectedMinute.value = minuteToSet

		const newDateTime = new CalendarDateTimeClass(
			calendarDateValue.year,
			calendarDateValue.month,
			calendarDateValue.day,
			hourToSet as number,
			minuteToSet as number,
		)
		emitModelValue(newDateTime.toDate(getActiveTimeZone()))
	} else {
		// For date-only mode, CalendarDate.toDate() already gives us the date at 00:00 in the target timezone
		emitModelValue(calendarDateValue.toDate(getActiveTimeZone()))
	}
}

const handleTimeChange = () => {
	if (
		!internalValue.value ||
		!props.timePicker ||
		props.monthPicker ||
		selectedHour.value === null ||
		selectedMinute.value === null
	) {
		return
	}

	const newDateTime = new CalendarDateTimeClass(
		internalValue.value.year,
		internalValue.value.month,
		internalValue.value.day,
		selectedHour.value as number,
		selectedMinute.value as number,
	)
	emitModelValue(newDateTime.toDate(getActiveTimeZone()))
}

const handleMonthSelectInPicker = (monthDate: CalendarDate) => {
	// For month picker, CalendarDate.toDate() already gives us the date at 00:00 in the target timezone
	emitModelValue(monthDate.toDate(getActiveTimeZone()))
	popoverOpen.value = false
}

const prevYearForMonthPicker = () => {
	if (calendarViewDate.value) {
		calendarViewDate.value = calendarViewDate.value.subtract({ years: 1 })
	}
}
const nextYearForMonthPicker = () => {
	if (calendarViewDate.value) {
		calendarViewDate.value = calendarViewDate.value.add({ years: 1 })
	}
}

const handleYearSelectInMonthPickerHeader = (yearNumber: string | number) => {
	if (!yearNumber || !calendarViewDate.value) return
	const numYear = Number(yearNumber)
	if (numYear === calendarViewDate.value.year) return
	calendarViewDate.value = calendarViewDate.value.set({ year: numYear })
}

const getFormattedDate = () => {
	if (!internalValue.value) return props.placeholder
	return df.value.format(internalValue.value.toDate(getActiveTimeZone()))
}

const popoverOpen = ref(false)
const calendarViewDate = ref<DateValue | undefined>()

watch(popoverOpen, (isOpen) => {
	if (isOpen) {
		calendarViewDate.value = internalValue.value || today(getActiveTimeZone())
	}
	// Emit the open state change
	emit('update:open', isOpen)
})

watch(
	internalValue,
	(newValForView) => {
		// Sync calendarViewDate with internalValue (which reflects modelValue)
		// This ensures calendar view is updated if modelValue changes externally.
		if (!popoverOpen.value) {
			calendarViewDate.value = newValForView || today(getActiveTimeZone())
		} else {
			if (newValForView) {
				calendarViewDate.value = newValForView
			} else if (calendarViewDate.value) {
			}
		}
	},
	{ immediate: true },
)

const handleCalendarViewUpdate = (newViewDate: unknown) => {
	calendarViewDate.value = newViewDate as DateValue | undefined
}
</script>

<template>
	<Popover v-model:open="popoverOpen">
		<PopoverTrigger as-child>
			<slot :df="df" :value="modelValue">
				<button
					type="button"
					:class="[
						'inline-flex cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-md text-sm font-normal transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-3',
						props.monthPicker ? 'capitalize' : '',
						props.class,
					]"
					:disabled="props.disabled"
				>
					{{ getFormattedDate() }}
					<CalendarIcon class="text-muted-foreground ml-2 h-4 w-4" />
				</button>
			</slot>
		</PopoverTrigger>
		<PopoverContent class="w-auto p-0 bg-background" :align="props.popoverAlign">
			<!-- Month Picker View -->
			<div v-if="props.monthPicker">
				<div class="flex items-center justify-between p-2 border-b">
					<button
						@click="prevYearForMonthPicker"
						aria-label="Previous year"
						:disabled="!calendarViewDate || calendarViewDate.year <= 1"
						:class="
							cn(
								'inline-flex text-muted-foreground items-center justify-center shrink-0 h-8 w-8 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground rounded-md',
								{
									'cursor-not-allowed opacity-50': !calendarViewDate || calendarViewDate.year <= 1,
								},
							)
						"
					>
						<ChevronLeftIcon class="h-5 w-5" />
					</button>
					<div class="flex w-full items-center justify-center gap-1">
						<Select
							v-if="calendarViewDate"
							:model-value="calendarViewDate.year.toString()"
							:disabled="props.disabled"
							@update:model-value="(v: any) => handleYearSelectInMonthPickerHeader(v)"
						>
							<SelectTrigger aria-label="Select year" class="py-1 text-foreground w-min">
								<SelectValue placeholder="Select year" />
							</SelectTrigger>
							<SelectContent class="max-h-[200px]">
								<SelectItem
									v-for="yearValue in createDecade({
										dateObj: calendarViewDate,
										startIndex: -10,
										endIndex: 10,
									})"
									:key="yearValue.toString()"
									:value="yearValue.year.toString()"
								>
									{{ yearValue.year }}
								</SelectItem>
							</SelectContent>
						</Select>
						<span v-else class="text-sm font-medium"></span>
					</div>
					<button
						@click="nextYearForMonthPicker"
						aria-label="Next year"
						:disabled="!calendarViewDate || calendarViewDate.year >= 9999"
						:class="
							cn(
								'inline-flex text-muted-foreground items-center justify-center shrink-0 h-8 w-8 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground rounded-md',
								{
									'cursor-not-allowed opacity-50':
										!calendarViewDate || calendarViewDate.year >= 9999,
								},
							)
						"
					>
						<ChevronRightIcon class="h-5 w-5" />
					</button>
				</div>
				<div class="grid grid-cols-3 gap-1 p-2">
					<button
						v-for="month in monthsForDisplay"
						:key="month.value"
						type="button"
						@click="handleMonthSelectInPicker(month.originalDate)"
						:class="
							cn(
								'bg-transparent hover:bg-accent hover:text-accent-foreground text-foreground font-normal rounded-lg',
								'p-2 text-sm text-center capitalize',
								'h-9 w-full',
								'focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]',
								month.isSelected
									? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary'
									: 'hover:bg-accent hover:text-accent-foreground',
								props.disabled
									? 'text-muted-foreground opacity-50 cursor-not-allowed hover:bg-transparent'
									: '',
							)
						"
						:disabled="props.disabled"
					>
						{{ month.label }}
					</button>
				</div>
			</div>

			<!-- Standard Calendar View -->
			<Calendar
				v-else
				:model-value="internalValue"
				@update:model-value="updateValueFromCalendar"
				:placeholder="calendarViewDate"
				@update:placeholder="handleCalendarViewUpdate"
				:locale="locale"
				:week-days="weekDays"
				:week-starts-on="weekStartsOn"
				:fixed-weeks="fixedWeeks"
				:disabled="props.disabled"
				:is-date-disabled="props.isDateUnavailable"
				:marked-dates="props.markedDates"
				initial-focus
				class="bg-transparent"
			/>

			<!-- Time Picker (conditionally rendered) -->
			<div
				v-if="props.timePicker && !props.monthPicker"
				class="flex items-center justify-center gap-1 pt-2 mt-2 border-t"
			>
				<Select
					:model-value="selectedHour"
					@update:model-value="
						(h) => {
							selectedHour = h
							handleTimeChange()
						}
					"
				>
					<SelectTrigger class="w-[80px] h-auto focus:ring-0 focus:ring-offset-0 border-input">
						<SelectValue placeholder="HH" class="text-foreground">
							<template v-if="selectedHour !== null">{{
								String(selectedHour).padStart(2, '0')
							}}</template>
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem v-for="h_opt in hoursForSelect" :key="h_opt" :value="h_opt"
							>{{ String(h_opt).padStart(2, '0') }}
						</SelectItem>
					</SelectContent>
				</Select>
				<span class="text-sm font-medium">:</span>
				<Select
					:model-value="selectedMinute"
					@update:model-value="
						(m) => {
							selectedMinute = m
							handleTimeChange()
						}
					"
				>
					<SelectTrigger class="w-[80px] h-auto focus:ring-0 focus:ring-offset-0 border-input">
						<SelectValue placeholder="MM" class="text-foreground" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem v-for="m_opt in minutesForSelect" :key="m_opt" :value="m_opt">{{
							String(m_opt).padStart(2, '0')
						}}</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</PopoverContent>
	</Popover>
</template>
