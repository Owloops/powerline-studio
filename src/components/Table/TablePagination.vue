<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { TableStyles } from './types'

interface PaginationUiOptions {
	showFirstLastButtons: boolean
	showJumpToPageSelect: boolean
	showPageCount: boolean
	showRowCount: boolean
}

const props = defineProps({
	// Current page
	currentPage: {
		type: Number,
		required: true,
	},

	// Total number of pages
	pageCount: {
		type: Number,
		required: true,
	},

	// Current page size
	currentPageSize: {
		type: Number,
		required: true,
	},

	// Available page sizes
	pageSizeOptions: {
		type: Array as PropType<number[]>,
		default: () => [10, 20, 50, 100],
	},

	// Whether the current page is the first page
	isFirstPage: {
		type: Boolean,
		required: true,
	},

	// Whether the current page is the last page
	isLastPage: {
		type: Boolean,
		required: true,
	},

	// Total number of rows
	totalRows: {
		type: Number,
		required: true,
	},

	// Number of rows being displayed on the current page
	displayedRows: {
		type: Number,
		required: true,
	},

	// Selected rows count
	selectedRowsCount: {
		type: Number,
		default: 0,
	},

	// Array of page numbers to display in pagination
	visiblePageNumbers: {
		type: Array as PropType<(number | string)[]>,
		required: true,
	},

	// UI options for pagination
	uiOptions: {
		type: Object as PropType<PaginationUiOptions>,
		required: true,
	},

	// Styles for the table
	styles: {
		type: Object as PropType<TableStyles>,
		required: true,
	},

	// Localized strings
	formatLang: {
		type: Function as PropType<(key: string, variables?: Record<string, any>) => string>,
		required: true,
	},
})

const emit = defineEmits(['page-change', 'page-size-change', 'first', 'last', 'prev', 'next'])

// Handle page change
const goToPage = (page: number) => {
	emit('page-change', page)
}

// Handle page size change
const changePageSize = (event: Event) => {
	const select = event.target as HTMLSelectElement
	// Important: Use Number() instead of parseInt() to correctly handle negative values like -1
	emit('page-size-change', Number(select.value))
}

// Go to the first page
const first = () => {
	emit('first')
}

// Go to the last page
const last = () => {
	emit('last')
}

// Go to the previous page
const prev = () => {
	emit('prev')
}

// Go to the next page
const next = () => {
	emit('next')
}

// Extract page number from string with ellipsis
const extractPageNumber = (page: string | number): number => {
	if (typeof page === 'number') return page
	return parseInt(String(page).replace(/\.\.\./g, ''))
}

// Check if the page is the current page
const isCurrentPage = (page: string | number): boolean => {
	if (typeof page === 'number') return props.currentPage === page
	return props.currentPage === extractPageNumber(page)
}
</script>

<template>
	<div :class="styles.pagination?.container">
		<div :class="styles.pagination?.leftContainer">
			<!-- Page count info -->
			<span :class="styles.pagination?.pageInfo" v-if="uiOptions.showPageCount">
				{{ formatLang('pagination.pageOf', { page: currentPage, pageCount }) }}
			</span>

			<!-- Page size selector -->
			<select
				:value="currentPageSize"
				@change="changePageSize"
				:class="styles.pagination?.pageSize"
			>
				<option v-for="size in pageSizeOptions" :key="size" :value="size">
					{{
						size === 999999
							? formatLang('pagination.all')
							: formatLang('pagination.rowsPerPage', { pageSize: size })
					}}
				</option>
			</select>

			<!-- Row count info - moved next to page size selector -->
			<span v-if="uiOptions.showRowCount" :class="[styles.pagination?.pageInfo, 'ml-2']">
				{{ formatLang('pagination.showingRows', { displayedRows, totalRows }) }}
				<template v-if="selectedRowsCount > 0">
					<span class="mx-1">•</span>
					{{ formatLang('pagination.selectedRows', { selectedRowsCount }) }}
				</template>
			</span>
		</div>

		<!-- Empty div to maintain the 3-column layout -->
		<div :class="styles.pagination?.middleContainer"></div>

		<div :class="styles.pagination?.rightContainer">
			<!-- Jump to page select -->
			<div
				:class="styles.pagination?.selectContainer"
				v-if="uiOptions.showJumpToPageSelect && pageCount > 1"
			>
				<span :class="styles.pagination?.pageInfo">{{ formatLang('pagination.goToPage') }}</span>
				<select
					:value="currentPage"
					@change="(e) => goToPage(parseInt((e.target as HTMLSelectElement).value))"
					:class="styles.pagination?.jumpToPage"
				>
					<option v-for="page in pageCount" :key="page" :value="page">
						{{ page }}
					</option>
				</select>
			</div>

			<!-- Pagination buttons -->
			<div :class="styles.pagination?.pageButtons">
				<!-- First page button - always rounded on the left -->
				<button
					v-if="uiOptions.showFirstLastButtons"
					@click="first"
					:disabled="isFirstPage"
					:class="[
						styles.pagination?.firstButton,
						isFirstPage ? styles.pagination?.pageButtonDisabled : '',
					]"
					aria-label="First page"
				>
					{{ formatLang('pagination.first') }}
				</button>

				<!-- Previous button -->
				<button
					@click="prev"
					:disabled="isFirstPage"
					:class="[
						uiOptions.showFirstLastButtons
							? styles.pagination?.prevButton
							: styles.pagination?.firstButton,
						isFirstPage ? styles.pagination?.pageButtonDisabled : '',
					]"
				>
					{{ formatLang('pagination.previous') }}
				</button>

				<!-- Page number buttons -->
				<button
					v-for="page in visiblePageNumbers"
					:key="page"
					@click="goToPage(extractPageNumber(page))"
					:class="[
						styles.pagination?.pageButton,
						isCurrentPage(page) ? styles.pagination?.pageButtonActive : '',
					]"
				>
					{{ page }}
				</button>

				<!-- Next button -->
				<button
					@click="next"
					:disabled="isLastPage"
					:class="[
						uiOptions.showFirstLastButtons
							? styles.pagination?.nextButton
							: styles.pagination?.lastButton,
						isLastPage ? styles.pagination?.pageButtonDisabled : '',
					]"
				>
					{{ formatLang('pagination.next') }}
				</button>

				<!-- Last page button - always rounded on the right -->
				<button
					v-if="uiOptions.showFirstLastButtons"
					@click="last"
					:disabled="isLastPage"
					:class="[
						styles.pagination?.lastButton,
						isLastPage ? styles.pagination?.pageButtonDisabled : '',
					]"
					aria-label="Last page"
				>
					{{ formatLang('pagination.last') }}
				</button>
			</div>
		</div>
	</div>
</template>
