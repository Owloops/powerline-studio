import type { TableStyles, TableLanguage, TableOptions, TableExportOptions } from './types'

declare global {
	interface Window {
		EUI?: {
			Components?: {
				DataTable?: {
					GlobalOptions?: Partial<TableOptions>
				}
			}
		}
	}
}

// SVG icons for sorting
export const icons = {
	unsorted: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
		<path fill-rule="evenodd" d="M5.22 10.22a.75.75 0 0 1 1.06 0L8 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 0-1.06ZM10.78 5.78a.75.75 0 0 1-1.06 0L8 4.06 6.28 5.78a.75.75 0 0 1-1.06-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06Z" clip-rule="evenodd" />
	</svg>`,
	ascending: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
		<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
	</svg>`,
	descending: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
		<path fill-rule="evenodd" d="M11.78 9.78a.75.75 0 0 1-1.06 0L8 7.06 5.28 9.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06Z" clip-rule="evenodd" />
	</svg>`,
	expanded: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-5">
		<path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
	</svg>`,
	collapsed: `<svg viewBox="0 0 20 20" fill="currentColor" class="size-5">
		<path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
	</svg>`,
	reset: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
		<path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
	</svg>`,
}

/**
 * Default styles for the table component using Tailwind CSS
 */
export const defaultStyles: TableStyles = {
	// Container styles
	container: 'eui-table w-full',
	tableContainer: 'flex flex-col border border-border rounded-md overflow-x-auto',

	// Table element styles
	table: 'w-full border-collapse',

	// Header styles
	thead: 'bg-muted/50',
	headerRow: 'border-b border-border',
	headerCell:
		'px-2 py-2.5 whitespace-nowrap text-muted-foreground text-xs font-medium uppercase tracking-wider relative',
	headerCellSortable: 'cursor-pointer hover:bg-muted pr-7',
	headerCellSorted: '',
	headerCellSelection: '',
	headerCellExpansion: '',

	// Body styles
	tbody: 'bg-background',
	bodyRow: 'border-b border-border',
	bodyRowHover: 'hover:bg-muted/50',
	bodyRowSelected: 'bg-primary/10',
	bodyRowExpanded: '',
	bodyCell: 'px-2 py-2.5 whitespace-nowrap text-sm text-foreground',

	// Selection and expansion styles
	selectionContainer: 'flex items-center justify-center',
	checkbox: 'transition-shadow focus:ring-ring h-4 w-4 text-primary border-input rounded',
	expansionContainer: 'flex items-center justify-center',
	expansionIcon: 'cursor-pointer',
	expandedIcon: '',
	collapsedIcon: '',

	// Footer styles
	tfoot: 'bg-muted/50 border-t border-border',
	footerRow: '',
	footerCell: 'px-2 py-2.5 whitespace-nowrap text-sm text-foreground border-t border-border',

	// Controls styles
	controls: {
		wrapper: 'w-full mb-2',
		container: 'flex flex-col space-y-2',
		row: 'flex flex-wrap items-center gap-2',
		leftSection: 'flex flex-wrap items-center gap-2',
		rightSection: 'flex items-center sm:ml-auto',
		defaultSection: 'flex items-center gap-2',
		customControls: 'w-full mt-2',
	},

	// Column visibility styles
	columnVisibility: {
		container: 'flex items-center gap-2',
		trigger:
			'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2',
		content:
			'z-50 overflow-hidden bg-popover text-popover-foreground rounded-md border border-border shadow-md',
		actionsContainer: 'p-2 flex justify-between space-x-2 border-b border-border',
		actionButton:
			'inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-7 px-2',
		viewport: '',
		item: 'relative py-1.5 pr-8 text-sm pl-2 hover:bg-accent focus:bg-accent hover:text-accent-foreground focus:text-accent-foreground focus:outline-none after:absolute after:right-2 after:top-1/2 after:-translate-y-1/2 after:w-2 after:h-2 after:rounded-full after:block data-[state=unchecked]:after:content-[""] data-[state=unchecked]:after:bg-muted-foreground/30 data-[state=checked]:after:content-[""] data-[state=checked]:after:bg-primary',
		itemSelected: 'bg-primary',
		itemIndicator: '',
	},

	// Pagination styles
	pagination: {
		container: 'flex flex-wrap items-center justify-between gap-3 py-4 pl-1',
		pageInfo: 'text-sm text-muted-foreground',
		pageSize:
			'h-9 px-3 text-sm font-normal border bg-background text-foreground shadow-xs rounded-md outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 disabled:pointer-events-none disabled:opacity-50',
		pageButtons: 'inline-flex rounded-md [&>*+*]:border-l-0',
		pageButtonActive: '!bg-primary !text-primary-foreground',
		pageButtonDisabled:
			'disabled:pointer-events-none disabled:text-muted-foreground disabled:cursor-default',
		jumpToPage:
			'h-9 px-3 text-sm font-normal border bg-background text-foreground shadow-xs rounded-md outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 disabled:pointer-events-none disabled:opacity-50',
		pageButton:
			'inline-flex cursor-pointer items-center justify-center h-9 px-4 py-2 border border-border bg-background text-sm font-medium text-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:z-10 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 dark:border-input dark:hover:bg-input/50 disabled:pointer-events-none disabled:opacity-50',
		firstButton:
			'inline-flex cursor-pointer items-center justify-center h-9 px-4 py-2 border border-border bg-background text-sm font-medium text-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:z-10 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-l-md disabled:pointer-events-none disabled:opacity-50',
		prevButton:
			'inline-flex cursor-pointer items-center justify-center h-9 px-4 py-2 border border-border bg-background text-sm font-medium text-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:z-10 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 dark:border-input dark:hover:bg-input/50 disabled:pointer-events-none disabled:opacity-50',
		nextButton:
			'inline-flex cursor-pointer items-center justify-center h-9 px-4 py-2 border border-border bg-background text-sm font-medium text-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:z-10 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 dark:border-input dark:hover:bg-input/50 disabled:pointer-events-none disabled:opacity-50',
		lastButton:
			'inline-flex cursor-pointer items-center justify-center h-9 px-4 py-2 border border-border bg-background text-sm font-medium text-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:z-10 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-r-md disabled:pointer-events-none disabled:opacity-50',
		leftContainer: 'flex flex-wrap items-center gap-2',
		middleContainer: 'hidden sm:flex items-center gap-2',
		rightContainer: 'flex flex-wrap items-center gap-2',
		selectContainer: 'flex items-center gap-2',
	},

	// Filter styles
	filter: {
		container: 'flex items-center justify-between',
		input:
			'block w-full h-9 px-3 py-1 text-sm font-normal border bg-background text-foreground placeholder:text-muted-foreground shadow-xs rounded-md outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 dark:border-input disabled:pointer-events-none disabled:opacity-50 pr-8',
		select:
			'w-full h-9 px-3 text-sm font-normal border bg-transparent text-foreground placeholder:text-muted-foreground shadow-xs rounded-md outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 dark:border-input disabled:pointer-events-none disabled:opacity-50',
		clearButton:
			'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-3 py-2',
		columnFilter:
			'text-xs h-7 px-1.5 py-0.5 border border-input bg-transparent text-foreground placeholder:text-muted-foreground rounded outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
	},

	// Grouping styles
	grouping: {
		container: 'flex items-center space-x-2 mb-2',
		label: 'text-sm font-medium',
		select:
			'h-8 px-3 text-sm font-normal border bg-background text-foreground shadow-xs rounded-md outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 dark:border-input dark:hover:bg-input/50 disabled:pointer-events-none disabled:opacity-50',
		actions: 'flex space-x-2',
		button:
			'inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 px-3',
		groupRow: 'bg-background font-medium',
		groupCell: 'p-2 cursor-pointer',
		groupIcon: 'mr-2 w-4 inline-block cursor-pointer',
		groupCount: 'ml-2 text-muted-foreground text-sm',
	},

	// Export styles
	export: {
		container: 'flex items-center gap-2',
		button:
			'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2',
	},
}

/**
 * Default language strings for the table component
 */
export const defaultLanguage: TableLanguage = {
	// Pagination text
	pagination: {
		previous: 'Previous',
		next: 'Next',
		first: 'First',
		last: 'Last',
		goToPage: 'Go to',
		pageOf: 'Page {page} of {pageCount}',
		rowsPerPage: '{pageSize} per page',
		showingRows: 'Showing {displayedRows} of {totalRows} rows',
		selectedRows: '{selectedRowsCount} rows selected',
		all: 'All',
	},

	// Column visibility
	columnVisibility: {
		toggleColumns: 'Columns',
		showAll: 'Show All',
		hideAll: 'Hide All',
		resetToDefault: 'Reset to Default',
		columnsShown: '{count} columns shown',
	},

	// Filter text
	filter: {
		search: 'Search...',
		clear: 'Clear all filters',
		selectAll: 'Select All',
		selectNone: 'Select None',
		noResults: 'No results found',
	},

	// Empty state
	emptyState: 'No data available',

	// Selection
	selection: {
		selectAll: 'Select All',
		selectPage: 'Select Page',
		selectedCount: '{count} selected',
	},

	// Export
	export: {
		csv: 'Export CSV',
		excel: 'Export Excel',
		filename: 'Export',
		all: 'All Rows',
		filtered: 'Filtered Rows',
		visible: 'Visible Rows',
	},

	// Grouping
	grouping: {
		groupBy: 'Group by',
		none: 'None',
		expandAll: 'Expand All',
		collapseAll: 'Collapse All',
		groupedBy: 'Grouped by',
		ungrouped: 'Ungrouped',
		count: '{count} items',
	},

	// Formatters
	formatters: {
		boolean: {
			true: 'Yes',
			false: 'No',
		},
		relativeTime: {
			capitalize: false,
		},
	},
}

/**
 * Default export options
 */
export const defaultExportOptions: TableExportOptions = {
	excel: true,
	csv: true,
	include: 'all',
	excludeColumns: [],
	exportChildRows: true,
	includeHiddenColumns: true,
}

/**
 * Helper function to merge styles using deep merge
 *
 * @param target Target object to merge into (will be modified)
 * @param source Source object with properties to merge
 * @returns The modified target object
 */
export function deepMergeStyles(target: TableStyles, source?: TableStyles): TableStyles {
	if (!source) return target

	// Type-safe approach to merge objects
	const safeTarget = target as Record<string, any>
	const safeSource = source as Record<string, any>

	for (const key in safeSource) {
		if (safeSource[key] !== undefined) {
			if (
				safeSource[key] !== null &&
				typeof safeSource[key] === 'object' &&
				!Array.isArray(safeSource[key]) &&
				safeTarget[key] &&
				typeof safeTarget[key] === 'object'
			) {
				// If both values are objects, recursively merge them
				deepMergeStyles(safeTarget[key], safeSource[key])
			} else {
				// Otherwise, just assign the value
				safeTarget[key] = safeSource[key]
			}
		}
	}

	return target
}

/**
 * Helper function to merge user styles with default styles
 * This is a deep merge that handles nested objects
 */
export function mergeStyles(userStyles?: TableStyles): TableStyles {
	if (!userStyles) return { ...defaultStyles }

	// Create a deep copy of the default styles
	const result = JSON.parse(JSON.stringify(defaultStyles)) as TableStyles

	// Apply the deep merge
	return deepMergeStyles(result, userStyles)
}

/**
 * Helper function to merge language objects using deep merge
 *
 * @param target Target language object to merge into (will be modified)
 * @param source Source language object with properties to merge
 * @returns The modified target object
 */
export function deepMergeLanguage(target: TableLanguage, source?: TableLanguage): TableLanguage {
	if (!source) return target

	// Type-safe approach to merge objects
	const safeTarget = target as Record<string, any>
	const safeSource = source as Record<string, any>

	for (const key in safeSource) {
		if (safeSource[key] !== undefined) {
			if (
				safeSource[key] !== null &&
				typeof safeSource[key] === 'object' &&
				!Array.isArray(safeSource[key]) &&
				safeTarget[key] &&
				typeof safeTarget[key] === 'object'
			) {
				// If both values are objects, recursively merge them
				deepMergeLanguage(safeTarget[key], safeSource[key])
			} else {
				// Otherwise, just assign the value
				safeTarget[key] = safeSource[key]
			}
		}
	}

	return target
}

/**
 * Helper function to merge user language with default language
 * This uses the same deep merge approach as mergeStyles
 */
export function mergeLanguage(userLanguage?: TableLanguage): TableLanguage {
	if (!userLanguage) return { ...defaultLanguage }

	// Create a deep copy of the default language
	const result = JSON.parse(JSON.stringify(defaultLanguage)) as TableLanguage

	// Apply the deep merge
	return deepMergeLanguage(result, userLanguage)
}

/**
 * Helper function to format language strings with variables
 */
export function formatLanguageString(template: string, variables: Record<string, any>): string {
	return template.replace(/{(\w+)}/g, (match, key) => {
		return variables[key] !== undefined ? String(variables[key]) : match
	})
}

/**
 * Default options for the table component
 */
export const defaultOptions: TableOptions = {
	// Pagination settings
	pagination: {
		enabled: true,
		pageSize: 20,
		pageSizeOptions: [5, 10, 20, 50, 100, 999_999],
	},

	// Filtering settings
	filtering: {
		enabled: true,
		type: 'fuzzy',
	},

	// Expansion settings
	expansion: {
		enabled: false,
		expandedByDefault: false,
		childrenKey: 'children',
	},

	// Row grouping settings
	grouping: {
		enabled: false, // Row grouping is disabled by default
		groupBy: null, // No default grouping column
		expandedByDefault: false, // Groups are closed by default
	},

	// Selection settings
	selection: {
		enabled: false,
		type: 'multiple',
	},

	// Sorting settings
	sorting: {
		enabled: true,
		multiSort: false,
		resetOtherSorts: true,
		sortChildren: false,
		alwaysSorted: true,
	},

	// Export settings
	export: defaultExportOptions,
}

/**
 * Retrieves global table defaults from window.EUI.Components.DataTable.GlobalOptions if available
 */
export function getGlobalTableDefaults(): Partial<TableOptions> {
	if (typeof window !== 'undefined' && window.EUI?.Components?.DataTable?.GlobalOptions) {
		return window.EUI.Components.DataTable.GlobalOptions
	}
	return {}
}

/**
 * Deep merge utility for objects
 */
function deepMerge(target: any, ...sources: any[]): any {
	if (!sources.length) return target

	const source = sources.shift()

	if (source === undefined) return target

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} })
				deepMerge(target[key], source[key])
			} else {
				Object.assign(target, { [key]: source[key] })
			}
		}
	}

	return deepMerge(target, ...sources)
}

/**
 * Check if value is an object
 */
function isObject(item: any): boolean {
	return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Merges table options with the following precedence:
 * 1. Instance options (highest priority)
 * 2. Global defaults from window.EUI.Components.DataTable.GlobalOptions
 * 3. Built-in defaults (lowest priority)
 */
export function mergeOptions(instanceOptions?: TableOptions): TableOptions {
	// Get the global defaults
	const globalDefaults = getGlobalTableDefaults()

	// Start with a deep copy of the built-in defaults
	const result = JSON.parse(JSON.stringify(defaultOptions)) as TableOptions

	// Apply global defaults on top of built-in defaults
	if (Object.keys(globalDefaults).length > 0) {
		deepMerge(result, globalDefaults)
	}

	// Apply instance options on top of global defaults
	if (instanceOptions && Object.keys(instanceOptions).length > 0) {
		deepMerge(result, instanceOptions)
	}

	// Special handling for styles - ensure correct precedence
	if (instanceOptions?.styles || globalDefaults.styles) {
		// Start with default styles
		const finalStyles = JSON.parse(JSON.stringify(defaultStyles)) as TableStyles

		// Apply global styles on top of defaults (if present)
		if (globalDefaults.styles) {
			deepMergeStyles(finalStyles, globalDefaults.styles)
		}

		// Apply instance styles on top of everything (if present)
		if (instanceOptions?.styles) {
			deepMergeStyles(finalStyles, instanceOptions.styles)
		}

		// Set the final merged styles
		result.styles = finalStyles
	}

	// Special handling for language - ensure correct precedence
	if (instanceOptions?.language || globalDefaults.language) {
		// Start with default language
		const finalLanguage = JSON.parse(JSON.stringify(defaultLanguage)) as TableLanguage

		// Apply global language on top of defaults (if present)
		if (globalDefaults.language) {
			deepMergeLanguage(finalLanguage, globalDefaults.language)
		}

		// Apply instance language on top of everything (if present)
		if (instanceOptions?.language) {
			deepMergeLanguage(finalLanguage, instanceOptions.language)
		}

		// Set the final merged language
		result.language = finalLanguage
	}

	return result
}
