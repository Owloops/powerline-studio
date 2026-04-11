export const DIRECTORY_STYLES = ['full', 'fish', 'basename'] as const
export const USAGE_TYPES = ['cost', 'tokens', 'both', 'breakdown'] as const
export const COST_SOURCES = ['calculated', 'official'] as const
export const BAR_DISPLAY_STYLES = [
	'text',
	'ball',
	'bar',
	'blocks',
	'blocks-line',
	'capped',
	'dots',
	'filled',
	'geometric',
	'line',
	'squares',
] as const
export const BLOCK_TYPES = ['cost', 'tokens', 'both', 'time', 'weighted'] as const
export const BURN_TYPES = ['cost', 'tokens', 'both', 'none'] as const
export const PERCENTAGE_MODES = ['remaining', 'used'] as const
export const BUDGET_TYPES = ['cost', 'tokens'] as const

function toSelectOptions<T extends string>(values: readonly T[]): { label: string; value: T }[] {
	return values.map((v) => ({
		label: v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, ' '),
		value: v,
	}))
}

export const DIRECTORY_STYLE_OPTIONS = toSelectOptions(DIRECTORY_STYLES)
export const USAGE_TYPE_OPTIONS = toSelectOptions(USAGE_TYPES)
export const COST_SOURCE_OPTIONS = toSelectOptions(COST_SOURCES)
export const BAR_DISPLAY_STYLE_OPTIONS = toSelectOptions(BAR_DISPLAY_STYLES)
export const BLOCK_TYPE_OPTIONS = toSelectOptions(BLOCK_TYPES)
export const BURN_TYPE_OPTIONS = toSelectOptions(BURN_TYPES)
export const PERCENTAGE_MODE_OPTIONS = toSelectOptions(PERCENTAGE_MODES)
export const BUDGET_TYPE_OPTIONS = toSelectOptions(BUDGET_TYPES)
