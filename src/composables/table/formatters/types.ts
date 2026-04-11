import type { TableColumn } from '@/components/Table/types'

// Common options for all formatters
export interface CommonFormatterOptions {
	// Value handling
	nullValue?: string
	undefinedValue?: string
	emptyValue?: string
	invalidValue?: string

	// Decoration
	prefix?: string
	suffix?: string

	// Locale for internationalization
	locale?: string
}

// Base formatter type
export type FormatterFunction = (
	value: any,
	options: FormatterOptions,
	row?: any,
	column?: TableColumn,
) => string

// Number formatting options
export interface NumberFormatterOptions extends CommonFormatterOptions {
	// Rounding
	roundingMode?: 'ceil' | 'floor' | 'round' | 'trunc'
	multiplier?: number

	// Intl.NumberFormat options
	style?: 'decimal' | 'percent' | 'currency' | 'unit'
	notation?: 'standard' | 'scientific' | 'engineering' | 'compact'
	compactDisplay?: 'short' | 'long'
	useGrouping?: boolean

	// Precision
	minimumIntegerDigits?: number
	minimumFractionDigits?: number
	maximumFractionDigits?: number
	minimumSignificantDigits?: number
	maximumSignificantDigits?: number
}

// Currency formatting options
export interface CurrencyFormatterOptions extends NumberFormatterOptions {
	currency?: string
	currencyDisplay?: 'symbol' | 'code' | 'name' | 'narrowSymbol'
	currencySign?: 'standard' | 'accounting'
	showUnit?: boolean // When false, will format as decimal without currency symbol
}

// Percentage formatting options
export interface PercentageFormatterOptions extends NumberFormatterOptions {
	autoMultiply?: boolean // Automatically multiply by 100 for percentage display
	showUnit?: boolean // When false, will format as decimal without % symbol
}

// Date formatting options
export interface DateFormatterOptions extends CommonFormatterOptions {
	// Intl.DateTimeFormat options
	dateStyle?: 'full' | 'long' | 'medium' | 'short'
	timeStyle?: 'full' | 'long' | 'medium' | 'short'

	// Individual components
	weekday?: 'long' | 'short' | 'narrow'
	year?: 'numeric' | '2-digit'
	month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow'
	day?: 'numeric' | '2-digit'
	hour?: 'numeric' | '2-digit'
	minute?: 'numeric' | '2-digit'
	second?: 'numeric' | '2-digit'
	hour12?: boolean

	// Timezone
	timeZone?: string
	timeZoneName?: 'long' | 'short'
}

// Relative time formatting options using Intl.RelativeTimeFormat
export interface RelativeTimeFormatterOptions extends CommonFormatterOptions {
	// Intl.RelativeTimeFormat options
	localeMatcher?: 'best fit' | 'lookup'
	numeric?: 'always' | 'auto'
	style?: 'long' | 'short' | 'narrow'

	// Unit to use for relative time (defaults to 'day' if not specified)
	unit?: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'

	// If true, it will automatically calculate the difference between the date and now
	// If false, it will use the raw value as the input
	calculateDifference?: boolean

	// If true, the first letter of the formatted result will be capitalized
	capitalize?: boolean
}

// URL formatting options
export interface UrlFormatterOptions extends CommonFormatterOptions {
	url?: string
	text?: string
	openInNewTab?: boolean
	download?: boolean | string // true to enable download, or string for filename
	urlSelector?: (row: any) => string
	textSelector?: (row: any) => string
	attributes?: Record<string, string>
}

// Email formatting options
export interface EmailFormatterOptions extends CommonFormatterOptions {
	asLink?: boolean
	maskDomain?: boolean
	textSelector?: (row: any) => string
}

// Boolean formatting options
export interface BooleanFormatterOptions extends CommonFormatterOptions {
	trueValue?: string
	falseValue?: string
}

// Union type for all formatter options
export type FormatterOptions = CommonFormatterOptions &
	Partial<NumberFormatterOptions> &
	Partial<CurrencyFormatterOptions> &
	Partial<PercentageFormatterOptions> &
	Partial<DateFormatterOptions> &
	Partial<RelativeTimeFormatterOptions> &
	Partial<UrlFormatterOptions> &
	Partial<EmailFormatterOptions> &
	Partial<BooleanFormatterOptions>

// Record of formatter types to their default options
export interface FormattingDefaults {
	number?: NumberFormatterOptions
	integer?: NumberFormatterOptions
	decimal?: NumberFormatterOptions
	currency?: CurrencyFormatterOptions
	percentage?: PercentageFormatterOptions
	date?: DateFormatterOptions
	time?: DateFormatterOptions
	datetime?: DateFormatterOptions
	relativeTime?: RelativeTimeFormatterOptions
	url?: UrlFormatterOptions
	email?: EmailFormatterOptions
	boolean?: BooleanFormatterOptions
	truncate?: CommonFormatterOptions
	text?: CommonFormatterOptions
}

// Global formatting options
export interface FormattingOptions extends CommonFormatterOptions {
	defaults?: FormattingDefaults
}

// Map of formatter names to formatter functions
export interface Formatters {
	[key: string]: FormatterFunction
}
