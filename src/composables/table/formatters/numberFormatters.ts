import { createFormatter } from './baseFormatter'
import type {
	NumberFormatterOptions,
	CurrencyFormatterOptions,
	PercentageFormatterOptions,
} from './types'
import type { TableColumn } from '@/components/Table/types'

/**
 * Helper function to get Intl.NumberFormat options from our options object
 */
function getNumberFormatOptions(options: NumberFormatterOptions = {}): Intl.NumberFormatOptions {
	const intlOptions: Intl.NumberFormatOptions = {
		style: options.style || 'decimal',
		useGrouping: options.useGrouping !== false,
	}

	// Add precision options
	if (options.minimumIntegerDigits !== undefined) {
		intlOptions.minimumIntegerDigits = options.minimumIntegerDigits
	}

	if (options.minimumFractionDigits !== undefined) {
		intlOptions.minimumFractionDigits = options.minimumFractionDigits
	}

	if (options.maximumFractionDigits !== undefined) {
		intlOptions.maximumFractionDigits = options.maximumFractionDigits
	}

	if (options.minimumSignificantDigits !== undefined) {
		intlOptions.minimumSignificantDigits = options.minimumSignificantDigits
	}

	if (options.maximumSignificantDigits !== undefined) {
		intlOptions.maximumSignificantDigits = options.maximumSignificantDigits
	}

	// Add notation options
	if (options.notation) {
		intlOptions.notation = options.notation
	}

	if (options.compactDisplay) {
		intlOptions.compactDisplay = options.compactDisplay
	}

	// Prevent missing rounding property TypeScript error
	if (options.roundingMode) {
		;(intlOptions as any).roundingMode = options.roundingMode
	}

	return intlOptions
}

/**
 * Apply rounding to a number if specified in the options
 */
function applyRounding(value: number, options: NumberFormatterOptions): number {
	if (!options.roundingMode) {
		return value
	}

	switch (options.roundingMode) {
		case 'ceil':
			return Math.ceil(value)
		case 'floor':
			return Math.floor(value)
		case 'round':
			return Math.round(value)
		case 'trunc':
			return Math.trunc(value)
		default:
			return value
	}
}

/**
 * Apply multiplier to a number if specified in the options
 */
function applyMultiplier(value: number, options: NumberFormatterOptions): number {
	if (options.multiplier !== undefined && options.multiplier !== 0) {
		return value * options.multiplier
	}
	return value
}

/**
 * Format a number as an integer
 */
const integerFormatter = (
	value: any,
	options: NumberFormatterOptions = {},
	_row?: any,
	_column?: TableColumn,
): string => {
	if (typeof value !== 'number' && typeof value !== 'string') {
		return String(value)
	}

	// Convert to number if it's a string
	const numValue = typeof value === 'string' ? parseFloat(value) : value

	if (isNaN(numValue)) {
		return options.invalidValue || ''
	}

	// Apply multiplier and rounding
	let formattedValue = applyMultiplier(numValue, options)
	formattedValue = applyRounding(formattedValue, options)

	// Create formatter with user options
	const intlOptions = getNumberFormatOptions({
		...options,
		maximumFractionDigits: 0,
	})

	const formatter = new Intl.NumberFormat(options.locale, intlOptions)
	return formatter.format(formattedValue)
}

/**
 * Format a number with decimal places
 */
const decimalFormatter = (
	value: any,
	options: NumberFormatterOptions = {},
	_row?: any,
	_column?: TableColumn,
): string => {
	if (typeof value !== 'number' && typeof value !== 'string') {
		return String(value)
	}

	// Convert to number if it's a string
	const numValue = typeof value === 'string' ? parseFloat(value) : value

	if (isNaN(numValue)) {
		return options.invalidValue || ''
	}

	// Apply multiplier and rounding
	let formattedValue = applyMultiplier(numValue, options)

	// Create formatter with user options
	const intlOptions = getNumberFormatOptions({
		...options,
		minimumFractionDigits: options.minimumFractionDigits ?? 2,
		maximumFractionDigits: options.maximumFractionDigits ?? 2,
	})

	const formatter = new Intl.NumberFormat(options.locale, intlOptions)
	return formatter.format(formattedValue)
}

/**
 * Format a number as currency
 */
const currencyFormatter = (
	value: any,
	options: CurrencyFormatterOptions = {},
	_row?: any,
	_column?: TableColumn,
): string => {
	if (typeof value !== 'number' && typeof value !== 'string') {
		return String(value)
	}

	// Convert to number if it's a string
	const numValue = typeof value === 'string' ? parseFloat(value) : value

	if (isNaN(numValue)) {
		return options.invalidValue || ''
	}

	// Apply multiplier and rounding
	let formattedValue = applyMultiplier(numValue, options)

	// Determine if we should show the currency symbol (default to false)
	const showUnit = options.showUnit ?? false

	// Create base intl options
	let intlOptions: Intl.NumberFormatOptions

	if (showUnit) {
		// Format with currency style
		intlOptions = {
			style: 'currency',
			currency: options.currency || 'EUR',
			currencyDisplay: options.currencyDisplay || 'symbol',
			useGrouping: options.useGrouping !== false,
			minimumFractionDigits: options.minimumFractionDigits ?? 2,
			maximumFractionDigits: options.maximumFractionDigits ?? 2,
		}

		// Add optional properties
		if (options.minimumIntegerDigits !== undefined) {
			intlOptions.minimumIntegerDigits = options.minimumIntegerDigits
		}

		if (options.notation) {
			intlOptions.notation = options.notation
		}

		if (options.compactDisplay) {
			intlOptions.compactDisplay = options.compactDisplay
		}

		if (options.currencySign) {
			;(intlOptions as any).currencySign = options.currencySign
		}
	} else {
		// Format as decimal without currency symbol
		intlOptions = getNumberFormatOptions({
			...options,
			style: 'decimal',
			minimumFractionDigits: options.minimumFractionDigits ?? 2,
			maximumFractionDigits: options.maximumFractionDigits ?? 2,
		})
	}

	const formatter = new Intl.NumberFormat(options.locale, intlOptions)
	return formatter.format(formattedValue)
}

/**
 * Format a number as percentage
 */
const percentageFormatter = (
	value: any,
	options: PercentageFormatterOptions = {},
	_row?: any,
	_column?: TableColumn,
): string => {
	if (typeof value !== 'number' && typeof value !== 'string') {
		return String(value)
	}

	// Convert to number if it's a string
	const numValue = typeof value === 'string' ? parseFloat(value) : value

	if (isNaN(numValue)) {
		return options.invalidValue || ''
	}

	// Determine if we need to multiply by 100 for percentage display
	const autoMultiply = options.autoMultiply !== false
	const showUnit = options.showUnit ?? false

	// Apply multiplier and rounding
	let formattedValue = numValue
	if (autoMultiply && Math.abs(formattedValue) < 10) {
		// If value is small (likely in decimal form like 0.25), multiply by 100 for percentage
		formattedValue = formattedValue * 100
	}

	// Also apply any additional multiplier from options
	formattedValue = applyMultiplier(formattedValue, options)

	if (showUnit) {
		// Format with percentage style
		const intlOptions = getNumberFormatOptions({
			...options,
			style: 'percent',
			minimumFractionDigits: options.minimumFractionDigits ?? 0,
			maximumFractionDigits: options.maximumFractionDigits ?? 0,
		})

		const formatter = new Intl.NumberFormat(options.locale, intlOptions)
		return formatter.format(autoMultiply ? formattedValue / 100 : formattedValue)
	} else {
		// Format as decimal without % symbol (maintain the 100× value)
		const intlOptions = getNumberFormatOptions({
			...options,
			style: 'decimal',
			minimumFractionDigits: options.minimumFractionDigits ?? 0,
			maximumFractionDigits: options.maximumFractionDigits ?? 0,
		})

		const formatter = new Intl.NumberFormat(options.locale, intlOptions)
		return formatter.format(formattedValue)
	}
}

// Export formatters
export const integer = createFormatter(integerFormatter)
export const decimal = createFormatter(decimalFormatter)
export const currency = createFormatter(currencyFormatter)
export const percentage = createFormatter(percentageFormatter)
