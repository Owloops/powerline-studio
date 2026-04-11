<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import type { DateValue } from '@internationalized/date'
import DatePicker from '@/components/DatePicker/DatePicker.vue'
import { type MarkedDates } from '@/components/Calendar/marked-dates'
import { CalendarIcon } from '@lucide/vue'
import { useDateInput, type DateInputRefs } from '@/composables/useDateInput'
import type { SegmentType } from '@/composables/dateHelpers'

const props = defineProps({
	modelValue: {
		type: [String, Date, null],
		default: null,
	},
	locale: {
		type: String,
		default: 'en-US',
	},
	format: {
		type: String,
		default: 'YYYY-MM-DD',
	},
	utc: {
		type: Boolean,
		default: false,
	},
	timeZone: {
		type: String,
		default: undefined,
	},
	assumeUtc: {
		type: Boolean,
		default: false,
	},
	debug: {
		type: Boolean,
		default: false,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	isDateUnavailable: {
		type: Function as PropType<(date: DateValue) => boolean>,
		default: undefined,
	},
	markedDates: {
		type: Array as PropType<MarkedDates>,
		default: undefined,
	},
})

const emit = defineEmits(['update:modelValue', 'blur'])

const dayEl = ref<HTMLInputElement | null>(null)
const monthEl = ref<HTMLInputElement | null>(null)
const yearEl = ref<HTMLInputElement | null>(null)
const hourEl = ref<HTMLInputElement | null>(null)
const minuteEl = ref<HTMLInputElement | null>(null)

// Create refs object to pass to the composable, explicitly typed
const inputRefs: DateInputRefs = {
	dayInputRef: dayEl,
	monthInputRef: monthEl,
	yearInputRef: yearEl,
	hourInputRef: hourEl,
	minuteInputRef: minuteEl,
}

const dateInput = useDateInput(props, emit, inputRefs)

const {
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
	hasTimeInFormat, // Still useful for general time block in debug
	onSegmentInput,
	onSegmentKeydown,
	onSegmentComplete,
	onSegmentFocus,
	onSegmentBlur, // Still used for padding
	updateSegmentValues,
	performFinalClampingAndEmit, // Called on focusout
	// Debug state
	currentFocus,
	triggeringEvent,
	decision,
	targetSegment,
	lastValidationType, // Added for debugging
	isDateUnavailable, // Get unavailable state
} = dateInput

// Computed properties for DatePicker modes
const isMonthPickerMode = computed(() => {
	const segments = formatSegments.value
	const hasYear = segments.some((s) => s.type === 'year')
	const hasMonth = segments.some((s) => s.type === 'month')
	const hasDay = segments.some((s) => s.type === 'day')
	// hasTimeInFormat is already available from dateInput
	return hasYear && hasMonth && !hasDay && !hasTimeInFormat.value
})

const effectiveTimePickerForDatePicker = computed(() => {
	return hasTimeInFormat.value && !isMonthPickerMode.value
})

function handleDatePickerUpdate(newValue: Date | undefined) {
	// Simply pass through the picker's update - the watcher in useDateInput will handle segment updates
	emit('update:modelValue', newValue === undefined ? null : newValue)
}

// Computed properties to check for segment presence in format for debug display
const hasDaySegmentInFormat = computed(() => formatSegments.value.some((s) => s.type === 'day'))
const hasMonthSegmentInFormat = computed(() => formatSegments.value.some((s) => s.type === 'month'))
const hasYearSegmentInFormat = computed(() => formatSegments.value.some((s) => s.type === 'year'))
const hasHourSegmentInFormat = computed(() => formatSegments.value.some((s) => s.type === 'hour'))
const hasMinuteSegmentInFormat = computed(() =>
	formatSegments.value.some((s) => s.type === 'minute'),
)

// Track the value when focus enters the component group
const valueOnFocusIn = ref<any>(null)
const hasFocusInGroup = ref(false)
const isPickerOpen = ref(false)

// Handle focus entering the component group
const handleFocusIn = () => {
	if (!hasFocusInGroup.value) {
		// First focus into the component group
		hasFocusInGroup.value = true
		valueOnFocusIn.value = props.modelValue
	}
}

// Handle picker open/close state
const handlePickerOpenChange = (open: boolean) => {
	isPickerOpen.value = open

	// When picker closes, check if we should trigger blur
	if (!open) {
		// Use nextTick to let any value updates complete first
		nextTick(() => {
			// Check if focus is still within the component
			const activeEl = document.activeElement
			const isStillFocusedInside =
				activeEl === dayEl.value ||
				activeEl === monthEl.value ||
				activeEl === yearEl.value ||
				activeEl === hourEl.value ||
				activeEl === minuteEl.value

			// If focus is not on any input and we had focus before, trigger blur logic
			if (!isStillFocusedInside && hasFocusInGroup.value) {
				hasFocusInGroup.value = false

				// Don't call performFinalClampingAndEmit here - it might cause double emission
				// The DatePicker has already updated the value directly

				// Always emit blur for touched state
				emit('blur')

				// Clear the stored value
				valueOnFocusIn.value = null
			}
		})
	}
}

// Helper to normalize dates for comparison
const normalizeDateForComparison = (value: any): string | null => {
	if (!value) return null

	let date: Date | null = null

	if (value instanceof Date) {
		date = new Date(value)
	} else if (typeof value === 'string') {
		date = new Date(value)
	}

	if (date && !isNaN(date.getTime())) {
		// For date-only formats, compare just the date part
		if (!hasTimeInFormat.value) {
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			return `${year}-${month}-${day}`
		} else {
			// For datetime formats, include time in comparison
			return date.toISOString()
		}
	}

	return null
}

// Handle focus leaving the entire component group
const handleFocusOut = (event: FocusEvent) => {
	// Use requestAnimationFrame to ensure focus has settled
	requestAnimationFrame(() => {
		// If the picker is open, don't trigger blur - the picker will handle it when it closes
		if (isPickerOpen.value) {
			return
		}

		const container = event.currentTarget as HTMLElement
		// Check if the newly focused element (document.activeElement) is still one of the inputs
		const activeEl = document.activeElement
		const isStillFocusedInside =
			activeEl === dayEl.value ||
			activeEl === monthEl.value ||
			activeEl === yearEl.value ||
			activeEl === hourEl.value ||
			activeEl === minuteEl.value ||
			(container && container.contains(activeEl as Node))

		if (!isStillFocusedInside) {
			// Focus has truly left the component group
			hasFocusInGroup.value = false

			// Trigger final clamping
			performFinalClampingAndEmit()

			// Always emit blur for touched state
			emit('blur')

			// Clear the stored value
			valueOnFocusIn.value = null
		}
	})
}

// Track caret positions for overwrite mode
const dayCaretPos = ref(0)
const monthCaretPos = ref(0)
const yearCaretPos = ref(0)
const hourCaretPos = ref(0)
const minuteCaretPos = ref(0)

// Handle input events with insert/overwrite mode
const handleInput = (event: Event, type: SegmentType, index: number) => {
	const input = event.target as HTMLInputElement
	const value = input.value
	const segment = formatSegments.value.find((s) => s.type === type)
	// Use segment.value.length for maxlength which corresponds to token length (e.g., 'YYYY' -> 4, 'DD' -> 2, 'D' -> 1)
	const maxLength = segment?.value?.length || 2
	const caretPos = input.selectionStart || 0

	// Store caret position for maintaining after model update
	if (type === 'day') dayCaretPos.value = caretPos
	else if (type === 'month') monthCaretPos.value = caretPos
	else if (type === 'year') yearCaretPos.value = caretPos
	else if (type === 'hour') hourCaretPos.value = caretPos
	else if (type === 'minute') minuteCaretPos.value = caretPos

	onSegmentInput(type, value)

	// Apply overwrite mode logic for full fields
	// We need to use nextTick to get the updated values after onSegmentInput has processed them
	nextTick(() => {
		let segmentValue = ''
		if (type === 'day') segmentValue = daySegment.value
		else if (type === 'month') segmentValue = monthSegment.value
		else if (type === 'year') segmentValue = yearSegment.value
		else if (type === 'hour') segmentValue = hourSegment.value
		else if (type === 'minute') segmentValue = minuteSegment.value

		// If segment is full, set the caret position for overwrite mode
		if (segmentValue.length === maxLength && input === document.activeElement) {
			// Set the caret position to where it was before the update,
			// allowing for overwrite mode where the next typed digit will replace the character at the caret
			input.setSelectionRange(caretPos, caretPos)
			// Reset the backspace flag here if needed after caret logic
			dateInput.lastKeyWasBackspace.value = false
		}
	})

	// Check auto-advance conditions
	if (!dateInput.lastKeyWasBackspace.value) {
		const formatSegment = formatSegments.value.find((s) => s.type === type)
		// Check if the segment definition implies a two-digit format (e.g., "DD", "MM", "HH", "mm")
		// For single-digit formats ("D", "M"), length will be 1.
		const isSingleDigitToken = formatSegment?.value?.length === 1
		const isTwoDigitToken = formatSegment?.value?.length === 2
		const isFourDigitToken = formatSegment?.value?.length === 4 // Specifically for YYYY

		if (type === 'day') {
			if (
				(isTwoDigitToken && daySegment.value.length === 2) ||
				(isSingleDigitToken && daySegment.value.length === 1) ||
				(daySegment.value.length === 1 && parseInt(daySegment.value, 10) > 3 && isTwoDigitToken)
			) {
				// Heuristic for DD
				onSegmentComplete('day')
			}
		} else if (type === 'month') {
			if (
				(isTwoDigitToken && monthSegment.value.length === 2) ||
				(isSingleDigitToken && monthSegment.value.length === 1) ||
				(monthSegment.value.length === 1 && parseInt(monthSegment.value, 10) > 1 && isTwoDigitToken)
			) {
				// Heuristic for MM
				onSegmentComplete('month')
			}
		} else if (type === 'year') {
			if (
				(isFourDigitToken && yearSegment.value.length === 4) || // YYYY
				(isTwoDigitToken && yearSegment.value.length === 2)
			) {
				// YY
				onSegmentComplete('year')
			}
		} else if (type === 'hour') {
			// Assuming "HH" (isTwoDigitToken) or "H" (isSingleDigitToken)
			if (
				(isTwoDigitToken && hourSegment.value.length === 2) ||
				(isSingleDigitToken && hourSegment.value.length === 1) ||
				(hourSegment.value.length === 1 && parseInt(hourSegment.value, 10) > 2 && isTwoDigitToken)
			) {
				// Heuristic for HH (e.g. typing '3' for '03')
				onSegmentComplete('hour')
			}
		} else if (type === 'minute') {
			// Assuming "mm" (isTwoDigitToken) or "m" (isSingleDigitToken)
			if (
				(isTwoDigitToken && minuteSegment.value.length === 2) ||
				(isSingleDigitToken && minuteSegment.value.length === 1) ||
				(minuteSegment.value.length === 1 &&
					parseInt(minuteSegment.value, 10) > 5 &&
					isTwoDigitToken)
			) {
				// Heuristic for mm (e.g. typing '6' for '06')
				onSegmentComplete('minute')
			}
		}
	}
}

// Handle keydown for navigation and overwrite mode
const handleKeyDown = (event: KeyboardEvent, type: SegmentType, index: number) => {
	// Define allowed keys: digits and essential navigation/editing keys
	const allowedKeys = ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab']
	const isDigit = /^[0-9]$/.test(event.key)

	// If the key is not a digit AND not in the allowed list, prevent default and stop processing
	if (!isDigit && !allowedKeys.includes(event.key) && !(event.metaKey || event.ctrlKey)) {
		// Allow specific function keys if needed, e.g. F5 for refresh
		if (!event.key.startsWith('F')) {
			event.preventDefault()
		}
		return
	}

	// Pass allowed keys (digits, arrows, backspace, delete, tab) to the composable handler
	onSegmentKeydown(event, type, index)
}
</script>

<template>
	<div
		@focusin="handleFocusIn"
		@focusout="handleFocusOut"
		:data-unavailable="dateInput.isDateUnavailable.value ? '' : undefined"
		class="eui__date-input border-input bg-transparent dark:bg-input/30 text-foreground inline-flex items-center pl-2.5 justify-between rounded-md border shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]"
		:class="[dateInput.isDateUnavailable.value ? 'data-unavailable' : '']"
	>
		<!-- Segmented inputs -->
		<div class="flex items-center space-x-0">
			<template v-for="(segment, index) in formatSegments" :key="index">
				<!-- Day segment -->
				<template v-if="segment.type === 'day'">
					<input
						:ref="
							(el) => {
								if (segment.type === 'day') dayEl = el as HTMLInputElement
							}
						"
						type="text"
						inputmode="numeric"
						pattern="[0-9]*"
						v-model="daySegment"
						:placeholder="segment.placeholder"
						:maxlength="segment.value.length"
						:disabled="props.disabled"
						class="w-5 text-sm text-foreground bg-transparent text-center focus:outline-none rounded border-none p-0 disabled:opacity-50 disabled:cursor-not-allowed"
						@input="(e) => handleInput(e, 'day', index)"
						@keydown="(e) => handleKeyDown(e, 'day', index)"
						@focus="(e) => onSegmentFocus('day', e)"
						@blur="() => onSegmentBlur('day')"
					/>
				</template>

				<!-- Month segment -->
				<template v-else-if="segment.type === 'month'">
					<input
						:ref="
							(el) => {
								if (segment.type === 'month') monthEl = el as HTMLInputElement
							}
						"
						type="text"
						inputmode="numeric"
						pattern="[0-9]*"
						v-model="monthSegment"
						:placeholder="segment.placeholder"
						:maxlength="segment.value.length"
						:disabled="props.disabled"
						class="w-5 text-sm text-foreground bg-transparent text-center focus:outline-none rounded border-none p-0 disabled:opacity-50 disabled:cursor-not-allowed"
						@input="(e) => handleInput(e, 'month', index)"
						@keydown="(e) => handleKeyDown(e, 'month', index)"
						@focus="(e) => onSegmentFocus('month', e)"
						@blur="() => onSegmentBlur('month')"
					/>
				</template>

				<!-- Year segment -->
				<template v-else-if="segment.type === 'year'">
					<input
						:ref="
							(el) => {
								if (segment.type === 'year') yearEl = el as HTMLInputElement
							}
						"
						type="text"
						inputmode="numeric"
						pattern="[0-9]*"
						v-model="yearSegment"
						:placeholder="segment.placeholder"
						:maxlength="segment.value.length"
						:disabled="props.disabled"
						class="w-9 text-sm text-foreground bg-transparent text-center focus:outline-none rounded border-none p-0 disabled:opacity-50 disabled:cursor-not-allowed"
						@input="(e) => handleInput(e, 'year', index)"
						@keydown="(e) => handleKeyDown(e, 'year', index)"
						@focus="(e) => onSegmentFocus('year', e)"
						@blur="() => onSegmentBlur('year')"
					/>
				</template>

				<!-- Hour segment -->
				<template v-else-if="segment.type === 'hour'">
					<input
						:ref="
							(el) => {
								if (segment.type === 'hour') hourEl = el as HTMLInputElement
							}
						"
						type="text"
						inputmode="numeric"
						pattern="[0-9]*"
						v-model="hourSegment"
						:placeholder="segment.placeholder"
						:maxlength="segment.value.length"
						:disabled="props.disabled"
						class="w-5 text-sm text-foreground bg-transparent text-center focus:outline-none rounded border-none p-0 disabled:opacity-50 disabled:cursor-not-allowed"
						@input="(e) => handleInput(e, 'hour', index)"
						@keydown="(e) => handleKeyDown(e, 'hour', index)"
						@focus="(e) => onSegmentFocus('hour', e)"
						@blur="() => onSegmentBlur('hour')"
					/>
				</template>

				<!-- Minute segment -->
				<template v-else-if="segment.type === 'minute'">
					<input
						:ref="
							(el) => {
								if (segment.type === 'minute') minuteEl = el as HTMLInputElement
							}
						"
						type="text"
						inputmode="numeric"
						pattern="[0-9]*"
						v-model="minuteSegment"
						:placeholder="segment.placeholder"
						:maxlength="segment.value.length"
						:disabled="props.disabled"
						class="w-5 text-sm text-foreground bg-transparent text-center focus:outline-none rounded border-none p-0 disabled:opacity-50 disabled:cursor-not-allowed"
						@input="(e) => handleInput(e, 'minute', index)"
						@keydown="(e) => handleKeyDown(e, 'minute', index)"
						@focus="(e) => onSegmentFocus('minute', e)"
						@blur="() => onSegmentBlur('minute')"
					/>
				</template>

				<!-- Literal segment (separator) -->
				<template v-else-if="segment.type === 'literal'">
					<span class="text-sm whitespace-pre text-muted-foreground mx-1 min-w-1">{{
						segment.value
					}}</span>
				</template>
			</template>
		</div>

		<DatePicker
			:model-value="props.modelValue"
			@update:model-value="handleDatePickerUpdate"
			@update:open="handlePickerOpenChange"
			:locale="props.locale"
			:popover-align="'end'"
			:date-format="props.format"
			:month-picker="isMonthPickerMode"
			:time-picker="effectiveTimePickerForDatePicker"
			:utc="props.utc"
			:time-zone="props.timeZone"
			:disabled="props.disabled"
			:is-date-unavailable="props.isDateUnavailable"
			:marked-dates="props.markedDates"
		>
			<template #default>
				<button
					type="button"
					aria-label="Open date picker"
					:disabled="props.disabled"
					class="p-2.5 ml-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
				>
					<CalendarIcon class="h-4 w-4" />
				</button>
			</template>
		</DatePicker>
	</div>

	<!-- Temporary debugging display -->
	<!-- <div class="mt-4 flex flex-col space-y-2 text-sm text-gray-600">
      <div class="font-bold text-base">Data Values:</div>
      <div>Input type: {{ inputIsDateObject ? 'Date' : 'String' }}</div>
      <div>Format: {{ props.format }}</div>
      <div>Original input: {{ originalInputString }}</div>
      <div>Parsed date: {{ parsedDate?.toString() }}</div>
      <div>Formatted: {{ formattedString }}</div>
      <div>ISO: {{ isoString }}</div>
      <div>Has time in format prop: {{ hasTimeInFormat }}</div>
      <div class="grid grid-cols-3 max-w-screen-lg gap-x-1 gap-y-0.5">
        <template v-if="hasDaySegmentInFormat">
          <div>Day Raw: <span class="font-mono">"{{ daySegment.replace(/^0(?=\d)/, '') }}"</span></div>
          <div>Day Padded: <span class="font-mono">"{{ daySegment }}"</span></div>
          <div>Parsed: <span class="font-mono">{{ parsedDate ? parsedDate.day : 'N/A' }}</span></div>
        </template>

        <template v-if="hasMonthSegmentInFormat">
          <div>Month Raw: <span class="font-mono">"{{ monthSegment.replace(/^0(?=\d)/, '') }}"</span></div>
          <div>Month Padded: <span class="font-mono">"{{ monthSegment }}"</span></div>
          <div>Parsed: <span class="font-mono">{{ parsedDate ? parsedDate.month : 'N/A' }}</span></div>
        </template>

        <template v-if="hasYearSegmentInFormat">
          <div>Year Raw: <span class="font-mono">"{{ yearSegment }}"</span> ({{ yearSegment.length }})</div>
          <div class="col-span-2">Parsed: <span class="font-mono">{{ parsedDate ? parsedDate.year : 'N/A' }}</span>
          </div>
        </template>

        <template v-if="hasHourSegmentInFormat">
          <div>Hour Raw: <span class="font-mono">"{{ hourSegment.replace(/^0(?=\d)/, '') }}"</span></div>
          <div>Hour Padded: <span class="font-mono">"{{ hourSegment }}"</span></div>
          <div>Parsed: <span class="font-mono">{{ parsedDate && 'hour' in parsedDate ? parsedDate.hour : 'N/A' }}</span>
          </div>
        </template>

        <template v-if="hasMinuteSegmentInFormat">
          <div>Minute Raw: <span class="font-mono">"{{ minuteSegment.replace(/^0(?=\d)/, '') }}"</span></div>
          <div>Minute Padded: <span class="font-mono">"{{ minuteSegment }}"</span></div>
          <div>Parsed: <span class="font-mono">{{ parsedDate && 'minute' in parsedDate ? parsedDate.minute : 'N/A'
              }}</span></div>
        </template>
      </div>

      <div class="font-bold text-base mt-3">Focus & Validation:</div>

      <div class="">
        <div>Current Focus: <span class="font-semibold">{{ currentFocus }}</span></div>
        <div>Date Valid: <span class="font-semibold" :class="parsedDate ? 'text-green-600' : ''">
            {{ daySegment && monthSegment && yearSegment ? (parsedDate ? '✅' : '❌') : 'Incomplete' }}
          </span></div>

        <div>Event: <span class="font-semibold">{{ triggeringEvent || 'None' }}</span></div>
        <div>Decision: <span class="font-semibold">{{ decision || 'None' }}</span></div>
        <div>Last Validation: <span class="font-semibold">{{ lastValidationType }}</span></div>
      </div>

      <div class="mt-2">
        <div v-if="hasDaySegmentInFormat">Day Valid (1-31): <span
            :class="daySegment ? 'text-green-600 font-semibold' : ''">
            {{ daySegment ? (parseInt(daySegment) > 0 && parseInt(daySegment) <= 31 ? '✅' : '❌') : 'Empty' }} </span>
        </div>
        <div v-if="hasMonthSegmentInFormat">Month Valid (1-12): <span
            :class="monthSegment ? 'text-green-600 font-semibold' : ''">
            {{ monthSegment ? (parseInt(monthSegment) > 0 && parseInt(monthSegment) <= 12 ? '✅' : '❌') : 'Empty' }}
              </span>
        </div>
        <div>Refs OK:
          <span v-if="hasDaySegmentInFormat"
            :class="dayEl ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'">
            D:{{ dayEl ? '✅' : '❌' }}</span>
          <span v-if="hasMonthSegmentInFormat"
            :class="monthEl ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'"> M:{{ monthEl ? '✅' : '❌'
            }}</span>
          <span v-if="hasYearSegmentInFormat"
            :class="yearEl ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'"> Y:{{ yearEl ? '✅' : '❌'
            }}</span>

          <span v-if="hasHourSegmentInFormat"
            :class="hourEl ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'"> H:{{ hourEl ? '✅' : '❌'
            }}</span>
          <span v-if="hasMinuteSegmentInFormat"
            :class="minuteEl ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'"> M:{{ minuteEl ? '✅' : '❌'
            }}</span>
        </div>
        <div>Caret Positions: Day: {{ dayCaretPos }}, Month: {{ monthCaretPos }}, Year: {{ yearCaretPos }}, Hour: {{
          hourCaretPos }}, Minute: {{ minuteCaretPos }}</div>
      </div>
    </div> -->
</template>
