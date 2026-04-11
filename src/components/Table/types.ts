// Class value type - matches Vue's :class binding syntax
export type ClassValue = string | string[] | Record<string, boolean> | undefined

// Row class function for conditional row styling
export type RowClassFn<T = any> = (row: T, index: number) => ClassValue

// Cell class function for conditional cell styling
export type CellClassFn<T = any> = (value: any, row: T, column: TableColumn<T>) => ClassValue

export interface TableColumn<T = any> {
	// Core properties
	id: string
	key?: string | ((row: T) => any) // Optional when columns is provided (for group columns)
	header: string | (() => any)

	// Features flags
	sortable?: boolean
	filterable?: boolean
	groupable?: boolean
	enableHiding?: boolean // Controls whether the column can be hidden
	visible?: boolean // Controls the visibility state of the column
	exportOnly?: boolean // Column is excluded from UI and visibility menu, only appears in exports

	// Formatters and custom functions
	format?: (value: any, row: T) => any
	formatType?: string // Type of formatter to use (e.g., 'date', 'number', 'currency', 'boolean')
	formatOptions?: Record<string, any> // Options for the formatter
	sortFn?: (a: any, b: any) => number
	filterFn?: (value: any, filter: any, formattedValue?: any, row?: T) => boolean
	exportFn?: (value: any) => any
	// Export formatting
	exportFormat?: (value: any, row: T, column: TableColumn<T>) => any

	// Faceting options
	facet?: {
		type: 'select' | 'range' | 'custom'
		options?: any[]
		min?: number
		max?: number
		labelKey?: string | ((row: T) => string) // Key or function to get label for facet options
	}

	// Wrapping
	wrap?: boolean // Allow text wrapping in body/footer cells (default: false / nowrap)
	headerWrap?: boolean // Allow text wrapping in header cells (inherits from wrap unless defined, default: false)

	// Styling and metadata
	width?: string
	align?: 'left' | 'center' | 'right'
	class?: string | CellClassFn<T> // Static class or function for conditional cell styling
	meta?: Record<string, any>

	// Column grouping
	columns?: TableColumn<T>[]
}

export interface TableStyles {
	// Container styles
	container?: string
	tableContainer?: string

	// Table element styles
	table?: string

	// Header styles
	thead?: string
	headerRow?: string
	headerCell?: string
	headerCellSortable?: string
	headerCellSorted?: string
	headerCellSelection?: string
	headerCellExpansion?: string

	// Body styles
	tbody?: string
	bodyRow?: string
	bodyRowHover?: string
	bodyRowSelected?: string
	bodyRowExpanded?: string
	bodyCell?: string

	// Selection and expansion styles
	selectionContainer?: string
	checkbox?: string
	expansionContainer?: string
	expansionIcon?: string
	expandedIcon?: string
	collapsedIcon?: string

	// Footer styles
	tfoot?: string
	footerRow?: string
	footerCell?: string

	// Controls styles
	controls?: {
		wrapper?: string
		container?: string
		row?: string
		leftSection?: string
		rightSection?: string
		defaultSection?: string
		customControls?: string
	}

	// Column visibility styles
	columnVisibility?: {
		container?: string
		trigger?: string
		content?: string
		actionsContainer?: string
		actionButton?: string
		viewport?: string
		item?: string
		itemSelected?: string
		itemIndicator?: string
		itemText?: string
	}

	// Pagination styles
	pagination?: {
		container?: string
		pageInfo?: string
		pageSize?: string
		pageButtons?: string
		pageButtonActive?: string
		pageButtonDisabled?: string
		jumpToPage?: string
		pageButton?: string
		firstButton?: string
		prevButton?: string
		nextButton?: string
		lastButton?: string
		leftContainer?: string
		middleContainer?: string
		rightContainer?: string
		selectContainer?: string
	}

	// Filter styles
	filter?: {
		container?: string
		input?: string
		select?: string
		clearButton?: string
		columnFilter?: string
	}

	// Grouping styles
	grouping?: {
		container?: string
		label?: string
		select?: string
		actions?: string
		button?: string
		groupRow?: string
		groupCell?: string
		groupIcon?: string
		groupCount?: string
	}

	// Export styles
	export?: {
		container?: string
		button?: string
		input?: string
	}
}

export interface TableLanguage {
	// Pagination text
	pagination?: {
		previous?: string
		next?: string
		first?: string
		last?: string
		goToPage?: string
		pageOf?: string
		rowsPerPage?: string
		showingRows?: string
		selectedRows?: string
		all?: string
	}

	// Column visibility
	columnVisibility?: {
		toggleColumns?: string
		showAll?: string
		hideAll?: string
		resetToDefault?: string
		columnsShown?: string
	}

	// Filter text
	filter?: {
		search?: string
		clear?: string
		selectAll?: string
		selectNone?: string
		noResults?: string
	}

	// Empty state
	emptyState?: string

	// Selection
	selection?: {
		selectAll?: string
		selectPage?: string
		selectedCount?: string
	}

	// Export
	export?: {
		csv?: string
		excel?: string
		filename?: string
		all?: string
		filtered?: string
		visible?: string
	}

	// Grouping
	grouping?: {
		groupBy?: string
		none?: string
		expandAll?: string
		collapseAll?: string
		groupedBy?: string
		ungrouped?: string
		count?: string
	}

	// Formatters
	formatters?: {
		boolean?: {
			true?: string
			false?: string
		}
		relativeTime?: {
			capitalize?: boolean
		}
	}
}

export interface TableExportOptions {
	/**
	 * Whether Excel export is enabled
	 * @default true
	 */
	excel?: boolean

	/**
	 * Whether CSV export is enabled
	 * @default true
	 */
	csv?: boolean

	/**
	 * Which rows to include in the export
	 * - 'all': All rows regardless of filtering
	 * - 'filtered': Only rows that match the current filters
	 * - 'visible': Only rows that are currently visible (on the current page)
	 * @default 'all'
	 */
	include?: 'all' | 'filtered' | 'visible'

	/**
	 * Array of column IDs to exclude from the export
	 * @default []
	 */
	excludeColumns?: string[]

	/**
	 * Whether to include child rows in the export (when expansion type is 'children')
	 * Child rows will be exported as flat rows with the same structure as parent rows
	 * @default true
	 */
	exportChildRows?: boolean

	/**
	 * Whether to include columns that are hidden in the UI in the export
	 * @default true
	 */
	includeHiddenColumns?: boolean

	/**
	 * The filename to use when exporting (without extension)
	 * @default 'export'
	 */
	filename?: string

	/**
	 * Excel-specific export options
	 */
	excelOptions?: {
		/**
		 * Global font family for the entire Excel file
		 * @default 'Calibri'
		 */
		fontFamily?: string

		/**
		 * Global font size for the entire Excel file
		 * @default 11
		 */
		fontSize?: number

		/**
		 * Header row styling options
		 */
		headerStyle?: {
			/**
			 * Font weight for headers
			 * @default 'bold'
			 */
			fontWeight?: 'bold' | 'normal'

			/**
			 * Background color for header cells (hex format)
			 * @example '#eeeeee'
			 */
			backgroundColor?: string

			/**
			 * Text color for header cells (hex format)
			 * @example '#000000'
			 */
			color?: string

			/**
			 * Font family for headers (overrides global)
			 */
			fontFamily?: string

			/**
			 * Font size for headers (overrides global)
			 */
			fontSize?: number

			/**
			 * Font style for headers
			 */
			fontStyle?: 'italic' | 'normal'
		}

		/**
		 * Whether to apply default header styling (bold)
		 * Set to false to disable all default header styling
		 * @default true
		 */
		styleHeaders?: boolean
	}
}

export interface TableOptions {
	// Row identification
	/**
	 * Define how to generate unique IDs for rows
	 * @param row The row data object
	 * @param index Optional index of the row in the data array
	 * @returns A unique string ID for the row
	 * @default undefined (will use row.id, fallback to index-based IDs if not available)
	 */
	getRowId?: (row: any, index?: number) => string

	// Feature toggles
	showSelection?: boolean

	// Column visibility settings
	columnVisibility?: boolean // Whether column visibility feature is enabled

	// Pagination settings
	pagination?: {
		enabled?: boolean
		page?: number
		pageSize?: number
		pageSizeOptions?: number[]
	}

	// Filtering settings
	filtering?: {
		enabled?: boolean
		type?: 'exact' | 'fuzzy'
		fuzzyOptions?: any
		globalFilter?: string
		filters?: Record<string, any>
		columnFilters?: boolean // Whether to show column filters in the header
		includeParentWhenChildMatches?: boolean // Whether to include parent rows when any child matches the filter
	}

	// Sorting settings
	sorting?: {
		enabled?: boolean
		sortBy?: SortBy[]
		fixedSortBy?: SortBy[] // Sort orders that are always applied first and cannot be removed
		multiSort?: boolean
		resetOtherSorts?: boolean
		sortChildren?: boolean // Whether to sort child rows recursively when a parent is sorted
		alwaysSorted?: boolean // When true, always maintains at least one sorted column (toggles asc/desc only), defaults to true
	}

	// Expansion settings
	expansion?: {
		enabled?: boolean
		expandedByDefault?: boolean
		childrenKey?: string
		expandedContent?: 'children' | 'custom' | 'auto' // Type of expanded content to display
		getRowCanExpand?: (row: any) => boolean // Custom function to determine if row can expand
		showExpandColumn?: boolean // Whether to auto-generate an expansion column
	}

	// Row grouping settings
	grouping?: {
		enabled?: boolean
		groupBy?: string | null
		expandedByDefault?: boolean
	}

	// Selection settings
	selection?: {
		enabled?: boolean
		type?: 'single' | 'multiple'
		showSelectionColumn?: boolean // Whether to auto-generate a selection checkbox column
	}

	// Export settings
	export?: TableExportOptions

	// Formatting options
	formatting?: {
		locale?: string
		defaults?: Record<string, Record<string, any>>
		nullValue?: string
		undefinedValue?: string
		emptyValue?: string
		invalidValue?: string
	}

	// Styles and language
	styles?: TableStyles
	language?: TableLanguage
}

export interface SortBy {
	id?: string
	index?: number // Optional index for sorting by column position
	desc: boolean
}

export interface ColumnFilter {
	id: string
	value: any
}

export interface TableState {
	sortBy: SortBy[]
	filters: Record<string, any>
	globalFilter: string
	pagination: {
		page: number
		pageSize: number
		pageCount: number
		total: number
	}
	selection: any[]
	expanded: Record<string, boolean>
	expandedRows: Record<string, boolean>
	groupBy: string | null
	columnVisibility: Record<string, boolean>
}

export interface TableRowModels<T = any> {
	coreRowModel: T[]
	filteredData: T[]
	groupedData: T[]
	sortedData: T[]
	paginatedData: T[]
	selectedRows?: T[]
	filteredSelectedRows?: T[]
}

export interface HeaderGroup {
	id: string
	depth: number
	headers: Header[]
}

export interface Header {
	id: string
	column: TableColumn
	colSpan: number
	rowSpan: number
	depth: number
	isPlaceholder: boolean
	placeholderId?: string
	subHeaders: Header[]
	headerGroup: HeaderGroup
}

// Type for our example data
export interface ExampleData {
	id: string
	Component: string
	PriceArea: 'SYS' | 'HEL' | 'STO'
	Tarification:
		| 'General'
		| 'Day'
		| 'Night'
		| 'Winter week day'
		| 'Winter other time'
		| 'Summer time'
		| 'Winter time'
		| 'Year'
		| 'Quarter 1'
		| 'Quarter 2'
		| 'Quarter 3'
		| 'Quarter 4'
		| 'Quarter'
		| 'Month'
		| 'Spot'
	Weight: number
	Unit: '€/MWh' | '€/PoD/m' | '€/Month'
	Price: number
	Amount: number
	Revenue: number
	// Additional formatting example fields
	DateCreated: Date
	LastUpdated: Date
	DateAsISOString: string
	DateAsTimestamp: number
	IsActive: boolean
	Website: string
	Email: string
	Notes: string
	Category?: 'Electronics' | 'Furniture' | 'Clothing' | 'Food' | 'Services'
	Costs?: ExampleData[]
}

// List of format types that should be right-aligned by default
export const RIGHT_ALIGNED_FORMAT_TYPES = [
	'date',
	'datetime',
	'time',
	'number',
	'integer',
	'decimal',
	'currency',
	'percentage',
]

// Slot props types
export interface TableSlotProps {
	// Common slot props
	row?: any
	column?: TableColumn
	index?: number
	value?: any
}

export interface GroupRowSlotProps<T = any> {
	// Group row slot props
	group: any
	toggleExpansion: () => void
	groupValue: any
	groupSize: number
	isExpanded: boolean
	groupKey: string
	rows: T[]
}

export interface ExpandedRowSlotProps<T = any> {
	// Expanded row slot props
	row: T
	depth: number
	parent: T | null
	toggleExpansion: () => void
	isExpanded: boolean
	expandedContent: 'children' | 'custom'
}
