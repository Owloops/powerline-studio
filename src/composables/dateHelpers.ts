export type SegmentType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'literal'

export interface Segment {
	type: SegmentType
	value: string
	mask?: string
	placeholder?: string
	maxValue?: number
}

export const isISOFormat = (str: string): boolean => {
	// Regex updated to support YYYY, YYYY-MM, YYYY-MM-DD and their time extensions
	return /^\d{4}(-\d{2}(-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?)?)?)?$/.test(str)
}

export const isISOWithTimezone = (str: string): boolean => {
	return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/.test(str)
}

export const parseDateFromFormatted = (dateStr: string, format: string): Date | null => {
	try {
		if (isISOFormat(dateStr)) {
			// Don't use this function for ISO strings, defer to the internationalized/date parsers
			return null
		}

		// For non-ISO formats, we need to parse the string based on the format pattern
		let day = 1,
			month = 1,
			year = 2025

		// Extract numeric values based on the format
		// DD.MM.YYYY or other formats
		const parts = dateStr.split(/[^0-9]+/).filter((p) => p.length > 0)
		if (parts.length >= 3) {
			// Extract parts based on the token positions in the format
			const positions: Record<string, number> = {}

			// Find positions of day, month, year tokens in the format
			if (format.indexOf('DD') !== -1) {
				positions.day = format.indexOf('DD')
			} else if (format.indexOf('D') !== -1) {
				positions.day = format.indexOf('D')
			}

			if (format.indexOf('MM') !== -1) {
				positions.month = format.indexOf('MM')
			} else if (format.indexOf('M') !== -1) {
				positions.month = format.indexOf('M')
			}

			if (format.indexOf('YYYY') !== -1) {
				positions.year = format.indexOf('YYYY')
			} else if (format.indexOf('YY') !== -1) {
				positions.year = format.indexOf('YY')
			}

			// Sort tokens by their position in the format
			const sortedPositions = Object.entries(positions).sort((a, b) => a[1] - b[1])

			// Map the sorted positions to the parts array
			for (let i = 0; i < sortedPositions.length && i < parts.length; i++) {
				const [token, _] = sortedPositions[i]!
				const value = parseInt(parts[i]!, 10)

				if (token === 'day') day = value
				if (token === 'month') month = value
				if (token === 'year') {
					year = value
					if (parts[i]!.length === 2) {
						year = year < 50 ? 2000 + year : 1900 + year
					}
				}
			}
		}

		// Create a JavaScript Date
		const result = new Date(year, month - 1, day)
		if (isNaN(result.getTime())) {
			return null
		}
		return result
	} catch (e) {
		console.error('Error parsing formatted date:', e)
		return null
	}
}

export const getDateFormatOptions = (formatStr: string): Intl.DateTimeFormatOptions => {
	const options: Intl.DateTimeFormatOptions = {}

	if (formatStr.includes('YYYY')) options.year = 'numeric'
	if (formatStr.includes('YY')) options.year = '2-digit'
	if (formatStr.includes('MMMM')) options.month = 'long'
	if (formatStr.includes('MMM')) options.month = 'short'
	if (formatStr.includes('MM')) options.month = '2-digit'
	if (formatStr.includes('M')) options.month = 'numeric'
	if (formatStr.includes('DD')) options.day = '2-digit'
	if (formatStr.includes('D')) options.day = 'numeric'

	// Handle time if present in the format
	if (formatStr.includes('HH')) options.hour = '2-digit' // 24-hour
	if (formatStr.includes('H')) options.hour = 'numeric' // 24-hour
	if (formatStr.includes('mm')) options.minute = '2-digit'
	if (formatStr.includes('m')) options.minute = 'numeric'
	if (formatStr.includes('ss')) options.second = '2-digit'
	if (formatStr.includes('s')) options.second = 'numeric'

	// Determine hourCycle based on common patterns, defaulting to h23 (0-23) if H/HH is used.
	// Intl.DateTimeFormat defaults to locale-specific cycle. Explicitly setting for H/HH.
	if (formatStr.includes('H') || formatStr.includes('HH')) {
		options.hourCycle = 'h23' // For 24-hour format display
	}
	// Note: 'h' or 'hh' for 12-hour format with AM/PM would require more logic for 'hour12' and potentially AM/PM segment.
	// Sticking to HH for 24-hour as per plan.

	return options
}

export const parseFormatToSegments = (format: string): Segment[] => {
	const segments: Segment[] = []
	let currentLiteral = ''
	let i = 0

	while (i < format.length) {
		let tokenFound = false
		// Check for longest tokens first
		if (format.substring(i, i + 4) === 'YYYY') {
			segments.push({
				type: 'year',
				value: 'YYYY',
				mask: '####',
				placeholder: '____',
				maxValue: 9999,
			})
			i += 4
			tokenFound = true
		} else if (format.substring(i, i + 2) === 'YY') {
			segments.push({
				type: 'year',
				value: 'YY',
				mask: '##',
				placeholder: '__',
				maxValue: 99,
			})
			i += 2
			tokenFound = true
		} else if (format.substring(i, i + 2) === 'MM') {
			segments.push({
				type: 'month',
				value: 'MM',
				mask: '##',
				placeholder: '__',
				maxValue: 12,
			})
			i += 2
			tokenFound = true
		} else if (format.substring(i, i + 1) === 'M') {
			segments.push({
				type: 'month',
				value: 'M',
				mask: '#?',
				placeholder: '__',
				maxValue: 12,
			})
			i += 1
			tokenFound = true
		} else if (format.substring(i, i + 2) === 'DD') {
			segments.push({
				type: 'day',
				value: 'DD',
				mask: '##',
				placeholder: '__',
				maxValue: 31,
			})
			i += 2
			tokenFound = true
		} else if (format.substring(i, i + 1) === 'D') {
			segments.push({
				type: 'day',
				value: 'D',
				mask: '#?',
				placeholder: '__',
				maxValue: 31,
			})
			i += 1
			tokenFound = true
		} else if (format.substring(i, i + 2) === 'HH') {
			segments.push({
				type: 'hour',
				value: 'HH',
				mask: '##',
				placeholder: '__',
				maxValue: 23,
			})
			i += 2
			tokenFound = true
		} else if (format.substring(i, i + 2) === 'mm') {
			segments.push({
				type: 'minute',
				value: 'mm',
				mask: '##',
				placeholder: '__',
				maxValue: 59,
			})
			i += 2
			tokenFound = true
		}
		// Add other tokens like H, m, ss, s if needed in the future

		if (tokenFound) {
			if (currentLiteral) {
				// Find the segment just pushed
				const lastSegment = segments.pop()
				// Insert literal before it
				segments.push({ type: 'literal', value: currentLiteral })
				if (lastSegment) segments.push(lastSegment) // Add the token segment back
				currentLiteral = ''
			}
		} else {
			// Add character to current literal
			currentLiteral += format[i]
			i += 1
		}
	}

	// Add any remaining literal characters
	if (currentLiteral) {
		segments.push({
			type: 'literal',
			value: currentLiteral,
		})
	}

	return segments
}

export const validateAndClampSegment = (
	type: SegmentType,
	value: string,
	segments: Segment[],
): string => {
	if (!value) return value

	const intValue = parseInt(value, 10)
	if (isNaN(intValue)) return ''

	const segmentInfo = segments.find((s) => s.type === type)
	const maxValue = segmentInfo?.maxValue // Can be undefined if not found or not set

	if (type === 'day') {
		if (intValue < 1) return '1'
		if (maxValue !== undefined && intValue > maxValue) return maxValue.toString()
	} else if (type === 'month') {
		if (intValue < 1) return '1'
		if (maxValue !== undefined && intValue > maxValue) return maxValue.toString()
	} else if (type === 'year') {
		// Assuming year minimum is 0 or 1 for typical date inputs, not negative.
		// MaxValue handles upper bound.
		if (intValue < 0) return '0' // Or '1' depending on desired minimum year representation
		if (maxValue !== undefined && intValue > maxValue) return maxValue.toString()
	} else if (type === 'hour') {
		if (intValue < 0) return '0'
		if (maxValue !== undefined && intValue > maxValue) return maxValue.toString() // maxValue should be 23 for HH
	} else if (type === 'minute') {
		if (intValue < 0) return '0'
		if (maxValue !== undefined && intValue > maxValue) return maxValue.toString() // maxValue should be 59 for mm
	}

	return intValue.toString()
}

export const getDaysInMonth = (month: number, year: number): number => {
	// Handle February and leap years
	if (month === 2) {
		const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
		return isLeapYear ? 29 : 28
	}

	if ([4, 6, 9, 11].includes(month)) {
		return 30 // April, June, September, November
	}

	return 31 // All other months
}

export const clampDay = (day: number, month: number, year: number): number => {
	// Basic validation for inputs
	if (isNaN(day) || isNaN(month)) {
		return 1 // Default to 1 if inputs are invalid
	}

	// Handle February separately for leap year logic
	if (month === 2) {
		// Check if year is potentially incomplete/invalid (e.g., NaN or maybe length check if needed)
		// For simplicity, we'll check isNaN. A more robust check might involve expected year length.
		const isYearPotentiallyInvalid = isNaN(year)
		if (isYearPotentiallyInvalid) {
			// If year is not fully determined, provisionally allow up to 29
			return Math.min(Math.max(1, day), 29)
		} else {
			// Year is valid, perform standard leap year check
			const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
			return Math.min(Math.max(1, day), isLeapYear ? 29 : 28)
		}
	}

	// For other months, use the standard daysInMonth calculation
	const maxDays = getDaysInMonth(month, year) // year might be NaN here, but getDaysInMonth handles it okay for non-Feb months
	return Math.min(Math.max(1, day), maxDays)
}
