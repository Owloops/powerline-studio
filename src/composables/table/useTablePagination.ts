import { computed, ref, type Ref, type ComputedRef } from 'vue'
import { useOffsetPagination } from '@vueuse/core'

export interface UseTablePaginationOptions {
	/**
	 * Initial page
	 * @default 1
	 */
	page?: number

	/**
	 * Initial page size
	 * @default 10
	 */
	pageSize?: number

	/**
	 * Available page sizes
	 * @default [10, 20, 50, 100]
	 */
	pageSizeOptions?: number[]

	/**
	 * Whether to show pagination
	 * @default true
	 */
	enabled?: boolean

	/**
	 * UI options for pagination
	 */
	uiOptions?: {
		/**
		 * Whether to show first/last page buttons
		 * @default true
		 */
		showFirstLastButtons?: boolean

		/**
		 * Whether to show the jump to page select
		 * @default true
		 */
		showJumpToPageSelect?: boolean

		/**
		 * Whether to show the page count (Page X of Y)
		 * @default true
		 */
		showPageCount?: boolean

		/**
		 * Whether to show the row count (Showing X rows of Y rows)
		 * @default true
		 */
		showRowCount?: boolean

		/**
		 * Number of page buttons to show
		 * @default 5
		 */
		pageButtonCount?: number
	}
}

export interface PaginationUiOptions {
	showFirstLastButtons: boolean
	showJumpToPageSelect: boolean
	showPageCount: boolean
	showRowCount: boolean
	pageButtonCount: number
}

export interface UseTablePaginationReturn<T = any> {
	/**
	 * Current page
	 */
	currentPage: Ref<number>

	/**
	 * Current page size
	 */
	currentPageSize: Ref<number>

	/**
	 * Total number of pages
	 */
	pageCount: ComputedRef<number>

	/**
	 * Whether the current page is the first page
	 */
	isFirstPage: ComputedRef<boolean>

	/**
	 * Whether the current page is the last page
	 */
	isLastPage: ComputedRef<boolean>

	/**
	 * Go to the previous page
	 */
	prev: () => void

	/**
	 * Go to the next page
	 */
	next: () => void

	/**
	 * Go to the first page
	 */
	first: () => void

	/**
	 * Go to the last page
	 */
	last: () => void

	/**
	 * Go to a specific page
	 */
	goToPage: (page: number) => void

	/**
	 * Change the page size
	 */
	changePageSize: (size: number) => void

	/**
	 * Paginated data
	 */
	paginatedData: ComputedRef<T[]>

	/**
	 * Whether pagination is enabled
	 */
	paginationEnabled: Ref<boolean>

	/**
	 * Total number of rows
	 */
	totalRows: ComputedRef<number>

	/**
	 * Number of rows being displayed on the current page
	 */
	displayedRows: ComputedRef<number>

	/**
	 * Array of page numbers or page indicators to display in pagination
	 */
	visiblePageNumbers: ComputedRef<(number | string)[]>

	/**
	 * UI options for pagination
	 */
	uiOptions: ComputedRef<PaginationUiOptions>
}

/**
 * Composable for table pagination
 */
export function useTablePagination<T = any>(
	data: Ref<T[]>,
	options: UseTablePaginationOptions = {},
): UseTablePaginationReturn<T> {
	// Default options
	const defaultOptions: Required<UseTablePaginationOptions> = {
		page: 1,
		pageSize: 10,
		pageSizeOptions: [10, 20, 50, 100],
		enabled: true,
		uiOptions: {
			showFirstLastButtons: true,
			showJumpToPageSelect: true,
			showPageCount: true,
			showRowCount: true,
			pageButtonCount: 5,
		},
	}

	// Merge options with just the passed options and defaults
	// Global defaults are already merged by the DataTable component
	const mergedOptions = {
		...defaultOptions,
		...options,
	}

	// Pagination state
	const paginationEnabled = ref(mergedOptions.enabled)
	const page = ref(mergedOptions.page)
	const pageSize = ref(mergedOptions.pageSize)

	// Use VueUse's useOffsetPagination
	const { currentPage, currentPageSize, pageCount, isFirstPage, isLastPage, prev, next } =
		useOffsetPagination({
			total: computed(() => data.value.length),
			page: page,
			pageSize: pageSize,
		})

	// Go to a specific page
	const goToPage = (targetPage: number) => {
		if (targetPage < 1 || targetPage > pageCount.value) return
		currentPage.value = targetPage
	}

	// Go to the first page
	const first = () => {
		goToPage(1)
	}

	// Go to the last page
	const last = () => {
		goToPage(pageCount.value)
	}

	// Change the page size
	const changePageSize = (size: number) => {
		currentPageSize.value = size
	}

	// Paginated data
	const paginatedData = computed(() => {
		if (!paginationEnabled.value) return data.value

		// Special case for "All" rows (pageSize = 999999)
		if (currentPageSize.value === 999999) {
			return data.value
		}

		const start = (currentPage.value - 1) * currentPageSize.value
		const end = start + currentPageSize.value

		return data.value.slice(start, end)
	})

	// Total number of rows
	const totalRows = computed(() => data.value.length)

	// Number of rows being displayed on the current page
	const displayedRows = computed(() => paginatedData.value.length)

	// UI options with defaults
	const uiOptions = computed<PaginationUiOptions>(() => {
		const defaultUiOptions = defaultOptions.uiOptions
		const userUiOptions = mergedOptions.uiOptions || {}

		// Ensure all properties are non-nullable with default values
		return {
			showFirstLastButtons:
				userUiOptions.showFirstLastButtons ?? defaultUiOptions.showFirstLastButtons!,
			showJumpToPageSelect:
				userUiOptions.showJumpToPageSelect ?? defaultUiOptions.showJumpToPageSelect!,
			showPageCount: userUiOptions.showPageCount ?? defaultUiOptions.showPageCount!,
			showRowCount: userUiOptions.showRowCount ?? defaultUiOptions.showRowCount!,
			pageButtonCount: userUiOptions.pageButtonCount ?? defaultUiOptions.pageButtonCount!,
		}
	})

	// Calculate visible page numbers with ellipses
	const visiblePageNumbers = computed(() => {
		const buttonCount = uiOptions.value.pageButtonCount
		const halfButtonCount = Math.floor(buttonCount / 2)

		// If we have fewer pages than buttons, show all pages
		if (pageCount.value <= buttonCount) {
			return Array.from({ length: pageCount.value }, (_, i) => i + 1)
		}

		// Calculate start and end page numbers
		let startPage = Math.max(currentPage.value - halfButtonCount, 1)
		let endPage = startPage + buttonCount - 1

		// Adjust if end page is beyond the total pages
		if (endPage > pageCount.value) {
			endPage = pageCount.value
			startPage = Math.max(endPage - buttonCount + 1, 1)
		}

		// Generate the array of page numbers with ellipses
		const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => {
			const pageNum = startPage + i

			// Add ellipsis indicators
			if (pageNum === startPage && startPage > 1) {
				// Add ellipsis before the first visible page number
				return `...${pageNum}`
			} else if (pageNum === endPage && endPage < pageCount.value) {
				// Add ellipsis after the last visible page number
				return `${pageNum}...`
			}

			return pageNum
		})

		return pageNumbers
	})

	return {
		currentPage,
		currentPageSize,
		pageCount,
		isFirstPage,
		isLastPage,
		prev,
		next,
		first,
		last,
		goToPage,
		changePageSize,
		paginatedData,
		paginationEnabled,
		totalRows,
		displayedRows,
		visiblePageNumbers,
		uiOptions,
	}
}
