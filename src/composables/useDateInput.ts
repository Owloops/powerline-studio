import { computed, ref, watch, onMounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import {
	parseDate,
	parseDateTime,
	parseAbsolute,
	CalendarDate,
	CalendarDateTime,
	getLocalTimeZone,
	fromAbsolute,
} from '@internationalized/date'

import type { DateValue } from '@internationalized/date'

import {
	isISOFormat,
	isISOWithTimezone,
	getDateFormatOptions,
	parseFormatToSegments,
	clampDay,
	type SegmentType,
	type Segment,
} from './dateHelpers'

export interface DateInputProps {
	modelValue: string | Date | null
	locale: string
	format: string
	utc?: boolean
	timeZone?: string
	assumeUtc?: boolean
	isDateUnavailable?: (date: DateValue) => boolean
}

// Interface for the input refs - now using native HTMLInputElement
export interface DateInputRefs {
	dayInputRef: Ref<HTMLInputElement | null>
	monthInputRef: Ref<HTMLInputElement | null>
	yearInputRef: Ref<HTMLInputElement | null>
	hourInputRef?: Ref<HTMLInputElement | null>
	minuteInputRef?: Ref<HTMLInputElement | null>
}

type EmitFunc = (event: 'update:modelValue', value: string | Date | null) => void

export const useDateInput = (props: DateInputProps, emit: EmitFunc, refs?: DateInputRefs) => {
	const getActiveTimeZone = () => {
		if (props.utc) return 'UTC'
		// Use props.timeZone only if it's a valid, non-empty string
		if (props.timeZone && typeof props.timeZone === 'string' && props.timeZone.trim() !== '') {
			return props.timeZone
		}
		return getLocalTimeZone()
	}

	const inputIsDateObject = computed(() => props.modelValue instanceof Date)

	const daySegment = ref('')
	const monthSegment = ref('')
	const yearSegment = ref('')
	const hourSegment = ref('')
	const minuteSegment = ref('')

	// Debugging state
	const currentFocus = ref<SegmentType | null>(null) // Tracks which segment has focus
	const triggeringEvent = ref<string | null>(null) // Last event that triggered logic
	const decision = ref<string | null>(null) // Description of logic path taken
	const targetSegment = ref<SegmentType | null>(null) // Target segment for focus shifts
	const lastValidationType = ref<'strict' | 'basic' | 'skipped' | 'none'>('none') // Tracks the type of validation performed
	const isDateUnavailable = ref(false) // Tracks if the current input corresponds to an unavailable date

	const originalInputString = ref<string | null>(null)

	// Flag to track if last key press was backspace to prevent immediate re-padding on blur
	const lastKeyWasBackspace = ref(false)

	const dayInputRef = refs?.dayInputRef || ref<HTMLInputElement | null>(null)
	const monthInputRef = refs?.monthInputRef || ref<HTMLInputElement | null>(null)
	const yearInputRef = refs?.yearInputRef || ref<HTMLInputElement | null>(null)
	const hourInputRef = refs?.hourInputRef || ref<HTMLInputElement | null>(null)
	const minuteInputRef = refs?.minuteInputRef || ref<HTMLInputElement | null>(null)

	const parsedDate = computed(() => {
		try {
			if (!props.modelValue) {
				return null
			}
			const activeTZ = getActiveTimeZone()

			if (inputIsDateObject.value) {
				const date = props.modelValue as Date
				const zdtFromEpoch = fromAbsolute(date.getTime(), activeTZ)
				return hasTimeInFormat.value
					? new CalendarDateTime(
							zdtFromEpoch.year,
							zdtFromEpoch.month,
							zdtFromEpoch.day,
							zdtFromEpoch.hour,
							zdtFromEpoch.minute,
							zdtFromEpoch.second,
							zdtFromEpoch.millisecond,
						)
					: new CalendarDate(zdtFromEpoch.year, zdtFromEpoch.month, zdtFromEpoch.day)
			}

			// Handle string modelValue: Only ISO formats are parsed.
			let dateStr = props.modelValue as string

			// Handle UTC assumption for timezone-less strings
			if (
				props.assumeUtc &&
				!dateStr.includes('Z') &&
				!dateStr.includes('+') &&
				!dateStr.includes('-', 10)
			) {
				// If assumeUtc is true and the string doesn't have timezone info, append 'Z'
				dateStr = dateStr + 'Z'
			}

			if (isISOWithTimezone(dateStr)) {
				try {
					const zonedDateTime = parseAbsolute(dateStr, activeTZ)
					return new CalendarDateTime(
						zonedDateTime.year,
						zonedDateTime.month,
						zonedDateTime.day,
						zonedDateTime.hour,
						zonedDateTime.minute,
						zonedDateTime.second,
						zonedDateTime.millisecond,
					)
				} catch (e) {
					console.warn(
						`DateInput: Failed to parse modelValue "${dateStr}" as an absolute ISO date with timezone:`,
						e,
					)
					return null
				}
			} else if (isISOFormat(dateStr)) {
				// For "YYYY-MM" or "YYYY" ISO partials, parseDate handles them correctly
				// by defaulting day/month to 1.
				const hasTimeComponent = /T\d{2}:\d{2}/.test(dateStr)
				try {
					return hasTimeComponent ? parseDateTime(dateStr) : parseDate(dateStr)
				} catch (e) {
					// Attempt to parse partial ISO date strings (YYYY or YYYY-MM)
					if (!hasTimeComponent) {
						let completedDateStr = dateStr
						if (/^\d{4}$/.test(dateStr)) {
							// YYYY
							completedDateStr = `${dateStr}-01-01`
						} else if (/^\d{4}-\d{2}$/.test(dateStr)) {
							// YYYY-MM
							completedDateStr = `${dateStr}-01`
						}

						if (completedDateStr !== dateStr) {
							// If we modified it, try parsing again
							try {
								return parseDate(completedDateStr)
							} catch (e2) {
								console.warn(
									`DateInput: Failed to parse partially completed ISO modelValue "${completedDateStr}" (from "${dateStr}"):`,
									e2,
								)
								return null
							}
						}
					}
					console.warn(`DateInput: Failed to parse modelValue "${dateStr}" as an ISO date:`, e)
					return null
				}
			} else {
				// Non-ISO string modelValues are not parsed.
				console.warn(
					`DateInput: modelValue string "${dateStr}" is not a valid ISO 8601 format and will not be parsed. Please provide a Date object or an ISO 8601 compliant string.`,
				)
				return null
			}
		} catch (e) {
			console.error('DateInput: Error parsing modelValue:', e)
			return null
		}
	})

	// Parse the format string into segments
	const formatSegments = computed<Segment[]>(() => {
		return parseFormatToSegments(props.format)
	})

	const hasTimeInFormat = computed(() => {
		return formatSegments.value.some((s) => s.type === 'hour' || s.type === 'minute')
	})

	const updateSegmentValues = () => {
		if (!parsedDate.value) {
			daySegment.value = ''
			monthSegment.value = ''
			yearSegment.value = ''
			hourSegment.value = ''
			minuteSegment.value = ''
			return
		}
		const date = parsedDate.value
		const formatIncludesDD = props.format.includes('DD')
		const formatIncludesMM = props.format.includes('MM')
		const formatIncludesYYYY = props.format.includes('YYYY')
		const formatIncludesDaySegment = formatSegments.value.some((s) => s.type === 'day')

		if (formatIncludesDaySegment) {
			daySegment.value = formatIncludesDD
				? date.day.toString().padStart(2, '0')
				: date.day.toString()
		} else {
			daySegment.value = '' // Clear day segment if not in format
		}

		// Ensure month segment is populated if month is in format
		if (formatSegments.value.some((s) => s.type === 'month')) {
			monthSegment.value = formatIncludesMM
				? date.month.toString().padStart(2, '0')
				: date.month.toString()
		} else {
			monthSegment.value = ''
		}

		// Ensure year segment is populated if year is in format
		if (formatSegments.value.some((s) => s.type === 'year')) {
			yearSegment.value = formatIncludesYYYY
				? date.year.toString()
				: (date.year % 100).toString().padStart(2, '0')
		} else {
			yearSegment.value = ''
		}

		if (date instanceof CalendarDateTime && hasTimeInFormat.value) {
			const formatIncludesHH = props.format.includes('HH')
			const formatIncludesmm = props.format.includes('mm')

			hourSegment.value = formatIncludesHH
				? date.hour.toString().padStart(2, '0')
				: date.hour.toString()
			minuteSegment.value = formatIncludesmm
				? date.minute.toString().padStart(2, '0')
				: date.minute.toString()
		} else {
			hourSegment.value = ''
			minuteSegment.value = ''
		}
	}

	const performFinalClampingAndEmit = () => {
		currentFocus.value = null
		triggeringEvent.value = 'focusout-group'
		decision.value = 'Starting validation...'
		isDateUnavailable.value = false // Reset unavailable state
		lastValidationType.value = 'none'

		const dayStr = daySegment.value
		const monthStr = monthSegment.value
		const yearStr = yearSegment.value
		const hourStr = hourSegment.value
		const minuteStr = minuteSegment.value

		const hasYearToken = formatSegments.value.some((s) => s.type === 'year')
		const hasMonthToken = formatSegments.value.some((s) => s.type === 'month')
		const hasDayToken = formatSegments.value.some((s) => s.type === 'day')
		const hasHourToken = formatSegments.value.some((s) => s.type === 'hour')
		const hasMinuteToken = formatSegments.value.some((s) => s.type === 'minute')

		let allEmpty = true
		// Only consider segments that are part of the current format
		if (hasYearToken && yearStr) allEmpty = false
		if (hasMonthToken && monthStr) allEmpty = false
		if (hasDayToken && dayStr) allEmpty = false
		if (hasHourToken && hourStr) allEmpty = false
		if (hasMinuteToken && minuteStr) allEmpty = false

		// If all *expected* segments are empty, then it's truly all empty
		if (
			(!hasYearToken || !yearStr) &&
			(!hasMonthToken || !monthStr) &&
			(!hasDayToken || !dayStr) &&
			(!hasHourToken || !hourStr) &&
			(!hasMinuteToken || !minuteStr)
		) {
			allEmpty = true
		}

		if (allEmpty) {
			decision.value = 'All relevant segments empty, skipping validation.'
			lastValidationType.value = 'skipped'
			if (props.modelValue !== null) {
				emit('update:modelValue', null)
			}
			return
		}

		let year = parseInt(yearStr, 10)
		let month = parseInt(monthStr, 10)
		let day = parseInt(dayStr, 10) // Will be NaN if dayStr is empty because daySegment would be ''
		let hour = parseInt(hourStr, 10)
		let minute = parseInt(minuteStr, 10)

		const hasYear = hasYearToken && !isNaN(year) && yearStr.length > 0
		const hasMonth = hasMonthToken && !isNaN(month) && monthStr.length > 0
		const hasDay = hasDayToken && !isNaN(day) && dayStr.length > 0 // True only if day token AND valid day string
		const hasHour = hasHourToken && !isNaN(hour) && hourStr.length > 0
		const hasMinute = hasMinuteToken && !isNaN(minute) && minuteStr.length > 0

		let isComplete = true
		if (hasYearToken && !hasYear) isComplete = false
		if (hasMonthToken && !hasMonth) isComplete = false
		if (hasDayToken && !hasDay) isComplete = false // If day token exists, day value must be provided
		if (hasHourToken && !hasHour) isComplete = false
		if (hasMinuteToken && !hasMinute) isComplete = false

		if (hasYear) {
			if (yearStr.length <= 2 && !props.format.includes('YYYY')) {
				year = year < 50 ? 2000 + year : 1900 + year
			}
		}
		if (hasMonth) month = Math.min(Math.max(1, month), 12)

		// If day is part of the format, clamp it. Otherwise, it will be set to 1 later during date construction.
		if (hasDayToken && hasDay) {
			day = Math.min(Math.max(1, day), 31) // Initial day clamp
		}

		if (hasHour) hour = Math.min(Math.max(0, hour), 23)
		if (hasMinute) minute = Math.min(Math.max(0, minute), 59)

		if (isComplete) {
			lastValidationType.value = 'strict'
			decision.value = 'Complete input, performing strict clamping.'
			// If day is part of format, and all date parts are available for CalendarDate, then strict clamp day
			if (hasDayToken && hasYear && hasMonth && hasDay) {
				day = clampDay(day, month, year)
			}
		} else {
			lastValidationType.value = 'basic'
			decision.value = 'Incomplete input, basic clamping only.'
		}

		// Update segment visual values
		if (hasYearToken) {
			yearSegment.value = hasYear
				? year
						.toString()
						.padStart(props.format.includes('YYYY') ? 4 : yearStr.length === 2 ? 2 : 1, '0')
				: ''
		} else {
			yearSegment.value = ''
		}
		if (hasMonthToken) {
			monthSegment.value = hasMonth
				? month.toString().padStart(props.format.includes('MM') ? 2 : 1, '0')
				: ''
		} else {
			monthSegment.value = ''
		}

		if (hasDayToken) {
			daySegment.value = hasDay
				? day.toString().padStart(props.format.includes('DD') ? 2 : 1, '0')
				: ''
		} else {
			daySegment.value = '' // Ensure day segment is cleared if not in format
		}

		if (hasHourToken) {
			hourSegment.value = hasHour
				? hour.toString().padStart(props.format.includes('HH') ? 2 : 1, '0')
				: ''
		} else {
			hourSegment.value = ''
		}
		if (hasMinuteToken) {
			minuteSegment.value = hasMinute
				? minute.toString().padStart(props.format.includes('mm') ? 2 : 1, '0')
				: ''
		} else {
			minuteSegment.value = ''
		}

		if (isComplete) {
			try {
				let newDate: CalendarDate | CalendarDateTime
				const dayForConstructor = hasDayToken ? day : 1 // Use 1 if day is not in format

				if (hasHourToken || hasMinuteToken) {
					// If any time part is in format
					const finalHour = hasHour ? hour : 0
					const finalMinute = hasMinute ? minute : 0
					newDate = new CalendarDateTime(year, month, dayForConstructor, finalHour, finalMinute)
				} else {
					newDate = new CalendarDate(year, month, dayForConstructor)
				}

				const dateIsUnavailableCheck = props.isDateUnavailable && props.isDateUnavailable(newDate)
				isDateUnavailable.value = !!dateIsUnavailableCheck // Set reactive state

				if (dateIsUnavailableCheck) {
					decision.value = 'Date is unavailable, reverting input.'
					// Revert segments to the last valid modelValue
					updateSegmentValues()
					// Clear the unavailable flag after reverting
					isDateUnavailable.value = false
					return // Do not proceed to emit
				}

				let currentModelDate: CalendarDate | CalendarDateTime | null = parsedDate.value

				if (!currentModelDate || newDate.compare(currentModelDate) !== 0) {
					decision.value += ' Emitting update.'
					// Always emit JS Date object based on the active timezone
					// Note: toDate() already returns the date at 00:00 in the target timezone for CalendarDate
					emit('update:modelValue', newDate.toDate(getActiveTimeZone()))
				} else {
					decision.value += ' No change detected, not emitting.'
				}
			} catch (e) {
				console.error('Error creating or emitting date:', e)
				decision.value = 'Error during final date creation/emit.'
				if (props.modelValue !== null) emit('update:modelValue', null)
			}
		} else {
			if (props.modelValue !== null) {
				decision.value += ' Input incomplete, ensuring model is null.'
				emit('update:modelValue', null)
			} else {
				decision.value += ' Input incomplete, model already null.'
			}
		}
	}

	const formattedString = computed(() => {
		if (!parsedDate.value) return ''
		try {
			const options = getDateFormatOptions(props.format)
			// Ensure timezone is included for formatting if needed
			if (!options.timeZone) {
				options.timeZone = getActiveTimeZone()
			}
			const dateTimeFormatter = new Intl.DateTimeFormat(props.locale, options)
			// Convert internal DateValue to JS Date using the active timezone for correct display
			const jsDate = parsedDate.value.toDate(getActiveTimeZone())
			return dateTimeFormatter.format(jsDate)
		} catch (e) {
			console.error('Error formatting date:', e)
			return ''
		}
	})

	const isoString = computed(() => {
		if (!parsedDate.value) return ''
		return parsedDate.value.toString()
	})

	const onSegmentInput = (type: SegmentType, value: string) => {
		const cleanValue = value.replace(/[^0-9]/g, '')
		let validatedValue = validateSegmentInput(type, cleanValue)

		if (type === 'day') daySegment.value = validatedValue
		else if (type === 'month') monthSegment.value = validatedValue
		else if (type === 'year') yearSegment.value = validatedValue
		else if (type === 'hour') hourSegment.value = validatedValue
		else if (type === 'minute') minuteSegment.value = validatedValue
	}

	const validateSegmentInput = (type: SegmentType, value: string): string => {
		if (!value) return ''
		const digits = value.replace(/[^0-9]/g, '')
		let maxLength = 2

		const segmentInfo = formatSegments.value.find((s) => s.type === type)

		if (type === 'year') {
			maxLength = segmentInfo?.value === 'YYYY' ? 4 : 2
		} else if (type === 'day' || type === 'month' || type === 'hour' || type === 'minute') {
			maxLength = segmentInfo?.value?.length === 1 ? 1 : 2
		}

		let processedValue = digits
		if (digits.length > maxLength) {
			processedValue = digits.slice(0, maxLength)
		}

		if (processedValue.length === maxLength) {
			const num = parseInt(processedValue, 10)
			if (type === 'month' && ((num < 1 && maxLength > 1) || num > 12)) {
				/* defer full clamp */
			} else if (type === 'day' && ((num < 1 && maxLength > 1) || num > 31)) {
				/* defer full clamp */
			} else if (type === 'hour' && (num < 0 || num > 23)) {
				/* defer full clamp */
			} else if (type === 'minute' && (num < 0 || num > 59)) {
				/* defer full clamp */
			}
		}
		return processedValue
	}

	const onSegmentFocus = (type: SegmentType, event: FocusEvent) => {
		currentFocus.value = type
		triggeringEvent.value = 'focus'
		decision.value = `Focused on ${type}`
		targetSegment.value = type

		const input = event.target as HTMLInputElement
		void nextTick(() => {
			input.select()
		})
	}

	const onSegmentBlur = (type: SegmentType) => {
		triggeringEvent.value = 'blur'
		decision.value = `Blurred from ${type}, checking padding...`

		if (!lastKeyWasBackspace.value) {
			const padIfNeeded = (
				segmentRef: Ref<string>,
				formatToken: string,
				isTimeSegment: boolean = false,
			) => {
				if (props.format.includes(formatToken) && segmentRef.value.length === 1) {
					const num = parseInt(segmentRef.value, 10)
					if (!isNaN(num) && (isTimeSegment ? num >= 0 : num > 0)) {
						segmentRef.value = segmentRef.value.padStart(2, '0')
						decision.value += ` Padded ${type}.`
					}
				}
			}

			if (type === 'month') padIfNeeded(monthSegment, 'MM')
			else if (type === 'day') padIfNeeded(daySegment, 'DD')
			else if (type === 'hour') padIfNeeded(hourSegment, 'HH', true)
			else if (type === 'minute') padIfNeeded(minuteSegment, 'mm', true)
			else decision.value += ' No padding needed.'
		} else {
			decision.value += ' Skipping padding due to backspace.'
		}
		lastKeyWasBackspace.value = false
	}

	const getInputElementRef = (segmentType: SegmentType): Ref<HTMLInputElement | null> | null => {
		if (segmentType === 'day') return dayInputRef
		if (segmentType === 'month') return monthInputRef
		if (segmentType === 'year') return yearInputRef
		if (segmentType === 'hour') return hourInputRef
		if (segmentType === 'minute') return minuteInputRef
		return null
	}

	const handleOverwriteInput = (
		event: KeyboardEvent,
		type: SegmentType,
		inputElement: HTMLInputElement,
		currentValue: string,
		maxLength: number,
		caretPosition: number,
	) => {
		triggeringEvent.value = `${event.key} (Overwrite)`
		decision.value = 'OverwriteDigit'
		event.preventDefault()
		const typedDigit = event.key
		const valueBeforeCaret = currentValue.substring(0, caretPosition)
		const valueAfterCaret = currentValue.substring(caretPosition + 1)
		let newValue = (valueBeforeCaret + typedDigit + valueAfterCaret).substring(0, maxLength)

		let validatedValue = validateSegmentInput(type, newValue)
		if (type === 'day') daySegment.value = validatedValue
		else if (type === 'month') monthSegment.value = validatedValue
		else if (type === 'year') yearSegment.value = validatedValue
		else if (type === 'hour') hourSegment.value = validatedValue
		else if (type === 'minute') minuteSegment.value = validatedValue

		void nextTick(() => {
			inputElement.setSelectionRange(caretPosition + 1, caretPosition + 1)
		})
	}

	const onSegmentKeydown = (event: KeyboardEvent, type: SegmentType, _index: number) => {
		triggeringEvent.value = event.key
		decision.value = 'Evaluating...'
		targetSegment.value = null
		lastKeyWasBackspace.value = event.key === 'Backspace'

		const inputSegments = formatSegments.value.filter((s) => s.type !== 'literal')
		const currentSegmentDefinition = inputSegments.find((s) => s.type === type)
		if (!currentSegmentDefinition) return

		const currentSegmentIndex = inputSegments.indexOf(currentSegmentDefinition)

		let targetInputRef: Ref<HTMLInputElement | null> | null = null
		const input = event.target as HTMLInputElement
		const cursorPosition = input.selectionStart || 0
		const inputValue = input.value
		const selectionEnd = input.selectionEnd || 0
		const hasSelection = selectionEnd !== cursorPosition
		const isDigit = /^[0-9]$/.test(event.key)

		const segmentFormatDetails = formatSegments.value.find((s) => s.type === type)
		let maxLength = 2
		if (segmentFormatDetails) {
			if (type === 'year') maxLength = segmentFormatDetails.value === 'YYYY' ? 4 : 2
			else maxLength = segmentFormatDetails.value?.length === 1 ? 1 : 2
		}
		const fieldIsFull = inputValue.length >= maxLength

		if (isDigit && fieldIsFull && !hasSelection) {
			if (cursorPosition === maxLength && currentSegmentIndex < inputSegments.length - 1) {
				const nextSegmentDef = inputSegments[currentSegmentIndex + 1]!
				targetInputRef = getInputElementRef(nextSegmentDef.type)
				targetSegment.value = nextSegmentDef.type
				decision.value = 'TypeOverToNextSegment'
				event.preventDefault()

				const validatedNextValue = validateSegmentInput(nextSegmentDef.type, event.key)
				if (nextSegmentDef.type === 'day') daySegment.value = validatedNextValue
				else if (nextSegmentDef.type === 'month') monthSegment.value = validatedNextValue
				else if (nextSegmentDef.type === 'year') yearSegment.value = validatedNextValue
				else if (nextSegmentDef.type === 'hour') hourSegment.value = validatedNextValue
				else if (nextSegmentDef.type === 'minute') minuteSegment.value = validatedNextValue

				if (targetInputRef && targetInputRef.value) {
					const nextValueLength = validatedNextValue.length
					targetInputRef.value.focus()
					void nextTick(() => {
						if (targetInputRef && targetInputRef.value instanceof HTMLInputElement) {
							;(targetInputRef.value as HTMLInputElement).setSelectionRange(
								nextValueLength,
								nextValueLength,
							)
						}
					})
				}
				return
			} else if (cursorPosition < maxLength) {
				handleOverwriteInput(event, type, input, inputValue, maxLength, cursorPosition)
				return
			} else if (cursorPosition === maxLength && currentSegmentIndex === inputSegments.length - 1) {
				decision.value = 'IgnoreDigit (Full Last Segment)'
				event.preventDefault()
				return
			}
		}

		const navigate = (direction: 'prev' | 'next') => {
			let targetIdx = direction === 'prev' ? currentSegmentIndex - 1 : currentSegmentIndex + 1
			if (targetIdx >= 0 && targetIdx < inputSegments.length) {
				const targetSegDef = inputSegments[targetIdx]!
				targetInputRef = getInputElementRef(targetSegDef.type)
				targetSegment.value = targetSegDef.type
				decision.value = direction === 'prev' ? 'MoveToPreviousSegment' : 'MoveToNextSegment'
				return true
			}
			decision.value =
				direction === 'prev' ? 'StayInCurrentSegment (First)' : 'StayInCurrentSegment (Last)'
			return false
		}

		if (event.key === 'Backspace' && cursorPosition === 0 && !hasSelection) {
			navigate('prev')
		} else if (event.key === 'ArrowLeft' && cursorPosition === 0 && !hasSelection) {
			if (navigate('prev')) event.preventDefault()
		} else if (
			event.key === 'ArrowRight' &&
			cursorPosition === inputValue.length &&
			!hasSelection
		) {
			if (navigate('next')) event.preventDefault()
		} else if (
			!isDigit &&
			!['Tab', 'ArrowUp', 'ArrowDown', 'Delete', 'Home', 'End'].includes(event.key) &&
			!(event.metaKey || event.ctrlKey)
		) {
			decision.value = 'RegularKeypress/Navigation'
		}

		if (
			targetInputRef &&
			(targetInputRef as Ref<HTMLInputElement>).value &&
			decision.value.startsWith('MoveTo')
		) {
			event.preventDefault()
			const targetInput = (targetInputRef as Ref<HTMLInputElement>).value
			targetInput.focus()
			void nextTick(() => {
				if (targetInput instanceof HTMLInputElement) {
					const targetLength = targetInput.value.length
					if (decision.value === 'MoveToPreviousSegment') {
						targetInput.setSelectionRange(targetLength, targetLength)
						if (lastKeyWasBackspace.value) {
							const prevType = inputSegments[currentSegmentIndex - 1]!.type
							if (prevType === 'day' && daySegment.value)
								daySegment.value = daySegment.value.slice(0, -1)
							else if (prevType === 'month' && monthSegment.value)
								monthSegment.value = monthSegment.value.slice(0, -1)
							else if (prevType === 'year' && yearSegment.value)
								yearSegment.value = yearSegment.value.slice(0, -1)
							else if (prevType === 'hour' && hourSegment.value)
								hourSegment.value = hourSegment.value.slice(0, -1)
							else if (prevType === 'minute' && minuteSegment.value)
								minuteSegment.value = minuteSegment.value.slice(0, -1)
						}
					} else if (decision.value === 'MoveToNextSegment') {
						targetInput.setSelectionRange(0, 0)
					}
				}
			})
		}
	}

	const onSegmentComplete = (type: SegmentType) => {
		triggeringEvent.value = 'SegmentComplete'
		decision.value = 'Evaluating...'
		targetSegment.value = null

		const inputSegments = formatSegments.value.filter((s) => s.type !== 'literal')
		const currentSegmentDefinition = inputSegments.find((s) => s.type === type)
		if (!currentSegmentDefinition) return
		const currentSegmentIndex = inputSegments.indexOf(currentSegmentDefinition)

		if (currentSegmentIndex < inputSegments.length - 1) {
			const nextSegmentDef = inputSegments[currentSegmentIndex + 1]!
			targetSegment.value = nextSegmentDef.type
			decision.value = 'AutoAdvanceToNextSegment'
			const targetInputRef = getInputElementRef(nextSegmentDef.type)
			if (targetInputRef?.value) {
				void nextTick(() => {
					if (targetInputRef.value instanceof HTMLInputElement) {
						targetInputRef.value.focus()
					}
				})
			}
		} else {
			decision.value = 'SegmentCompleteButIsLastSegment'
		}
	}

	watch(
		() => props.format,
		() => {
			updateSegmentValues()
		},
	)

	onMounted(() => {
		if (props.modelValue && typeof props.modelValue === 'string') {
			originalInputString.value = props.modelValue
		}
		updateSegmentValues()
	})

	watch(
		() => props.modelValue,
		(newVal) => {
			if (newVal && typeof newVal === 'string') {
				originalInputString.value = newVal
			} else if (!newVal) {
				originalInputString.value = null
			}
			updateSegmentValues()

			// Clear unavailable flag when modelValue changes (e.g., from date picker)
			// Check if the new date is valid and available
			if (parsedDate.value && props.isDateUnavailable) {
				const dateIsStillUnavailable = props.isDateUnavailable(parsedDate.value)
				isDateUnavailable.value = !!dateIsStillUnavailable
			} else {
				// Clear the flag if no date or no validation function
				isDateUnavailable.value = false
			}
		},
		{ immediate: true },
	)

	// Watch for changes in timezone or UTC props to re-emit the date object
	watch([() => props.utc, () => props.timeZone], () => {
		// Only re-emit when modelValue is already a Date (user has interacted).
		// Skip when it's still an ISO string from initial load to prevent
		// the watcher from converting string→Date during prop initialization.
		if (props.modelValue != null && props.modelValue instanceof Date && parsedDate.value) {
			// Re-emit the current date value using the new timezone context
			// Note: toDate() already returns the date at 00:00 in the target timezone for CalendarDate
			emit('update:modelValue', parsedDate.value.toDate(getActiveTimeZone()))
		}
	})

	return {
		daySegment,
		monthSegment,
		yearSegment,
		hourSegment,
		minuteSegment,

		formatSegments,
		parsedDate,
		formattedString,
		isoString,
		inputIsDateObject,
		originalInputString,
		hasTimeInFormat,

		dayInputRef,
		monthInputRef,
		yearInputRef,
		hourInputRef,
		minuteInputRef,

		currentFocus,
		triggeringEvent,
		decision,
		targetSegment,
		lastValidationType,
		isDateUnavailable, // Expose the state

		onSegmentInput,
		onSegmentKeydown,
		onSegmentComplete,
		onSegmentFocus,
		onSegmentBlur,

		updateSegmentValues,
		performFinalClampingAndEmit,

		lastKeyWasBackspace,
	}
}
