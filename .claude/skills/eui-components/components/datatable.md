# DataTable

Vue 3 data table component with column configuration, format types, sorting, filtering, pagination, selection, grouping, expansion, Excel/CSV export, and virtual scrolling.

## Installation

```bash
pnpm dlx shadcn-vue@latest add @electricity-ui/data-table
```

This also installs dependencies: `@electricity-ui/select`, `@electricity-ui/slider`, `@electricity-ui/custom-combobox`.

## Legacy UMD Registration

```javascript
app.component('electricity-table', window.EUI.Components.DataTable.DataTable)
```

## Basic Usage

```html
<DataTable :columns="columns" :data="tableData" :loading="loading" @row-click="handleRowClick" />
```

## Column Configuration

```javascript
{
	id: 'name',                     // Required: unique column ID
	key: 'name',                    // Data property key: string | ((row) => any)
	header: 'Product Name',         // Required: string | (() => any)
	sortable: true,
	filterable: true,
	groupable: true,
	enableHiding: true,
	visible: true,
	width: '200px',
	align: 'left',                  // 'left' | 'center' | 'right'
	formatType: 'text',             // See Format Types below
	formatOptions: {},              // Intl format options
	format: (value, row) => value,  // Custom format function
	sortFn: (a, b) => 0,           // Custom sort (receives column values)
	filterFn: (value, filter, formattedValue, row) => true,
	exportFn: (value) => value,
	exportFormat: (value, row, column) => value,
	facet: { type: 'select', labelKey: (row) => row.label },
	class: 'custom-cell',
	columns: []                     // Child columns for column grouping
}
```

## Format Types

`text`, `integer`, `decimal`, `currency`, `percentage`, `date`, `datetime`, `time`, `boolean`, `relativeTime`, `url`, `email`, `truncate`

Numeric/date types are automatically right-aligned.

### Date/Time Format Options (Intl.DateTimeFormatOptions)

```javascript
{ id: 'created', formatType: 'date',
	formatOptions: { locale: 'fi-FI', day: '2-digit', month: '2-digit', year: 'numeric' } }

{ id: 'updated', formatType: 'datetime',
	formatOptions: { locale: 'fi-FI', dateStyle: 'short', timeStyle: 'short' } }
```

### Currency

```javascript
{ id: 'price', formatType: 'currency',
	formatOptions: { currency: 'EUR', locale: 'fi-FI', minimumFractionDigits: 2, maximumFractionDigits: 2 } }
```

### Number

```javascript
{ id: 'amount', formatType: 'decimal',
	formatOptions: { locale: 'fi-FI', minimumFractionDigits: 2, maximumFractionDigits: 2 } }
```

## Options Object

All features are configured via the `:options` prop:

### Pagination (Client-Side Only)

```javascript
pagination: {
	enabled: true, page: 1, pageSize: 25,
	pageSizeOptions: [10, 25, 50, 100]
}
// v-model:pagination="paginationState"
```

### Sorting

```javascript
sorting: {
	enabled: true,
	sortBy: [{ id: 'name', desc: false }],  // desc: false = ascending
	multiSort: true, resetOtherSorts: false,
	sortChildren: false, alwaysSorted: true
}
```

### Filtering

```javascript
filtering: { enabled: true, globalFilter: '' }
// v-model:globalFilter="searchText"
// Placeholder: options.language.filter.search
```

### Selection

```javascript
selection: {
	enabled: true, type: 'single' | 'multiple',
	showSelectionColumn: true
}
// v-model:selection="selectedRowIds"   (array of ID strings)
// Event: @update:selection
```

### Grouping

```javascript
grouping: { enabled: true, groupBy: 'category', expandedByDefault: false }
// v-model:groupBy="selectedGroupColumn"
// Slot: #group-row="{ groupValue, groupSize, isExpanded, toggleExpansion, rows }"
```

### Expansion

```javascript
expansion: {
	enabled: true, expandedByDefault: false,
	childrenKey: 'children',
	expandedContent: 'auto',  // 'children' | 'custom' | 'auto'
	showExpandColumn: true
}
// Slot: #expanded-row="{ row, depth, isExpanded, toggleExpansion }"
```

### Export

```javascript
export: {
	excel: true, csv: true, filename: 'export',
	excludeColumns: [], exportChildRows: true, includeHiddenColumns: true,
	excelOptions: {
		fontFamily: 'Calibri', fontSize: 11, styleHeaders: true,
		headerStyle: {
			fontWeight: 'bold', backgroundColor: '#eeeeee',
			color: '#000000', fontSize: 12
		}
	}
}
```

**Excel-specific column options** (in `formatOptions`):

- `excelFormat`: Custom Excel format string (e.g., `'yyyy-mm-dd hh:mm:ss'`)
- `decimalPlaces`: Decimal precision for Excel exports

## Slots

- `#custom-controls` -- Toolbar area above table
- `#expanded-row="{ row, toggleExpansion }"` -- Expandable row content
- `#group-row="{ groupValue, groupSize, isExpanded, toggleExpansion, rows }"` -- Group header
- `#col-{columnId}="{ row, value }"` -- Custom cell rendering per column

## Styling

```html
<DataTable
	class="border border-border rounded-lg shadow-sm"
	header-class="bg-muted"
	row-class="hover:bg-muted/50 transition-colors"
/>
```

Column-level: use `class` property in column config.

## Key Points

- **Client-side pagination only** -- all data must be in `:data` prop
- Selection is array of **row ID strings**, not row objects
- Use `v-model:selection`, `v-model:pagination`, `v-model:globalFilter`, `v-model:groupBy`
- Event names: `@update:selection`, `@update:pagination`, `@row-click`

## Complete Example

```html
<DataTable
	:columns="columns"
	:data="products"
	:options="{
		pagination: { enabled: true, pageSize: 25, pageSizeOptions: [10, 25, 50, 100] },
		filtering: { enabled: true },
		selection: { enabled: true, type: 'multiple', showSelectionColumn: true },
		expansion: { enabled: true, expandedContent: 'custom' },
		export: { excel: true, csv: true, filename: 'products-export' }
	}"
	v-model:selection="selectedProductIds"
	@row-click="handleRowClick"
>
	<template #custom-controls>
		<div class="flex gap-2">
			<button @click="addProduct" class="rounded-md bg-primary px-4 py-2 text-primary-foreground">
				Add Product
			</button>
			<button
				@click="deleteSelected"
				class="rounded-md bg-destructive px-4 py-2 text-destructive-foreground"
				:disabled="!hasSelection"
			>
				Delete Selected ({{ selectedProductIds.length }})
			</button>
		</div>
	</template>

	<template #expanded-row="{ row }">
		<div class="p-4 bg-muted/50">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<strong>Description:</strong>
					<p>{{ row.description }}</p>
				</div>
				<div>
					<strong>Created:</strong>
					<p>{{ formatDate(row.created) }}</p>
				</div>
			</div>
		</div>
	</template>
</DataTable>
```

## Advanced Filter Examples

### Numeric Range

```javascript
{
	key: 'price', header: 'Price', filterable: true,
	filterFn: (cellValue, filterValue) => {
		if (!filterValue || filterValue === '') return true;
		return parseFloat(cellValue) >= parseFloat(filterValue);
	}
}
```

### Text Contains

```javascript
{
	key: 'name', header: 'Product Name', filterable: true,
	filterFn: (cellValue, filterValue) => {
		if (!filterValue || filterValue === '') return true;
		return cellValue.toLowerCase().includes(filterValue.toLowerCase());
	}
}
```

## Export Configuration Details

### Column-Level Excel Format

```javascript
{
	id: 'created', formatType: 'datetime',
	formatOptions: {
		// Display (Intl.DateTimeFormat)
		locale: 'fi-FI', day: '2-digit', month: '2-digit', year: 'numeric',
		hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki',
		// Excel export only
		excelFormat: 'yyyy-mm-dd hh:mm:ss',
		decimalPlaces: 2
	}
}
```

## Sorting Configuration

### SortBy Interface

```typescript
{
	id?: string;    // Column ID
	index?: number; // Column position
	desc: boolean;  // false = ascending, true = descending
}
```

### Fixed Sorting

```javascript
sorting: {
	enabled: true,
	fixedSortBy: [{ id: 'priority', desc: false }],  // Always applied first
	sortBy: [{ id: 'name', desc: false }]
}
```

## Virtual Scrolling

```html
<DataTable
	:columns="columns"
	:data="largeData"
	:virtual-scrolling="true"
	:row-height="40"
	:visible-rows="20"
/>
```

## Column Visibility

```javascript
{
	id: 'email', key: 'email', header: 'Email',
	enableHiding: true,  // Allow hiding
	visible: true        // Initially visible
}
```

Enable visibility controls: `:options="{ columnVisibility: true }"`
