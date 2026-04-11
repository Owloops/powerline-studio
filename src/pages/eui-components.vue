<script setup lang="ts">
import CustomCombobox from '@/components/CustomCombobox/CustomCombobox.vue'
import CustomSelect from '@/components/CustomSelect/CustomSelect.vue'
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip.vue'
import DateInput from '@/components/DateInput/DateInput.vue'
import DatePicker from '@/components/DatePicker/DatePicker.vue'
import DateRangePicker from '@/components/DateRangePicker/DateRangePicker.vue'
import MaskNumberInput from '@/components/MaskNumberInput/MaskNumberInput.vue'
import MaskTextInput from '@/components/MaskTextInput/MaskTextInput.vue'
import PercentageInput from '@/components/PercentageInput/PercentageInput.vue'
import Calendar from '@/components/Calendar/Calendar.vue'
import RangeCalendar from '@/components/RangeCalendar/RangeCalendar.vue'
import TreeRoot from '@/components/Tree/TreeRoot.vue'
import DataTable from '@/components/Table/DataTable.vue'
import FlagIcon from '@/components/FlagIcon/FlagIcon.vue'
import type { TreeNode } from '@/composables/tree'
import type { TableColumn } from '@/components/Table/types'

useHead({ title: 'EUI Components' })

// FlagIcon
const sampleFlags = [
	{ code: 'NO', name: 'Norway' },
	{ code: 'SE', name: 'Sweden' },
	{ code: 'DK', name: 'Denmark' },
	{ code: 'FI', name: 'Finland' },
	{ code: 'IS', name: 'Iceland' },
	{ code: 'GB', name: 'United Kingdom' },
	{ code: 'DE', name: 'Germany' },
	{ code: 'FR', name: 'France' },
	{ code: 'EU', name: 'European Union' },
	{ code: 'US', name: 'United States' },
	{ code: 'JP', name: 'Japan' },
	{ code: 'AU', name: 'Australia' },
]

// CustomCombobox
const comboboxValue = ref(null)
const comboboxOptions = [
	{ id: 'apple', label: 'Apple' },
	{ id: 'banana', label: 'Banana' },
	{ id: 'cherry', label: 'Cherry' },
	{ id: 'date', label: 'Date' },
	{ id: 'elderberry', label: 'Elderberry' },
	{ id: 'fig', label: 'Fig' },
	{ id: 'grape', label: 'Grape' },
]

// CustomSelect
const selectValue = ref(null)
const selectOptions = { FI: 'Finland', SE: 'Sweden', NO: 'Norway', DK: 'Denmark', IS: 'Iceland' }

// DateInput
const dateInputValue = ref<Date | null>(null)

// DatePicker
const datePickerValue = ref<Date | undefined>(undefined)

// DateRangePicker
const dateRangeValue = ref<{ start?: Date | null; end?: Date | null }>({})

// MaskNumberInput
const numberValue = ref<number | null>(1234.56)

// MaskTextInput
const phoneValue = ref('')

// PercentageInput
const percentValue = ref<number | null>(0.25)

// Calendar
const calendarValue = ref(undefined)

// RangeCalendar
const rangeCalendarValue = ref<{ start?: any; end?: any }>({})

// Tree
const treeData: TreeNode[] = [
	{
		ID: 1,
		Name: 'Documents',
		Children: [
			{
				ID: 2,
				ParentId: 1,
				Name: 'Reports',
				Children: [
					{ ID: 5, ParentId: 2, Name: 'Q1 Report.pdf', Children: [] },
					{ ID: 6, ParentId: 2, Name: 'Q2 Report.pdf', Children: [] },
				],
			},
			{ ID: 3, ParentId: 1, Name: 'Invoices', Children: [] },
		],
	},
	{
		ID: 4,
		Name: 'Images',
		Children: [
			{ ID: 7, ParentId: 4, Name: 'photo.jpg', Children: [] },
			{ ID: 8, ParentId: 4, Name: 'logo.png', Children: [] },
		],
	},
]
const treeSelected = ref<TreeNode | TreeNode[]>([])

// DataTable
const tableData = [
	{ id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
	{ id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active' },
	{ id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'Inactive' },
	{ id: 4, name: 'Dave Brown', email: 'dave@example.com', role: 'Editor', status: 'Active' },
	{ id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'Active' },
]

const tableColumns: TableColumn[] = [
	{ id: 'name', key: 'name', header: 'Name', sortable: true },
	{ id: 'email', key: 'email', header: 'Email', sortable: true },
	{ id: 'role', key: 'role', header: 'Role', sortable: true, filterable: true },
	{ id: 'status', key: 'status', header: 'Status', sortable: true, filterable: true },
]
</script>

<template>
	<div class="flex flex-col gap-12">
		<section>
			<h1 class="text-3xl font-bold tracking-tight">ElectricityUI Components</h1>
			<p class="mt-2 text-muted-foreground">Custom components from the ElectricityUI registry.</p>
		</section>

		<Separator />

		<!-- CustomCombobox -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">CustomCombobox</h2>
			<div class="max-w-sm">
				<CustomCombobox
					v-model="comboboxValue"
					:options="comboboxOptions"
					placeholder="Search fruits..."
				/>
				<p class="mt-2 text-sm text-muted-foreground">Selected: {{ comboboxValue ?? 'none' }}</p>
			</div>
		</section>

		<Separator />

		<!-- CustomSelect -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">CustomSelect</h2>
			<div class="max-w-sm">
				<CustomSelect v-model="selectValue" :options="selectOptions" placeholder="Select country" />
				<p class="mt-2 text-sm text-muted-foreground">Selected: {{ selectValue ?? 'none' }}</p>
			</div>
		</section>

		<Separator />

		<!-- CustomTooltip -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">CustomTooltip</h2>
			<div class="flex flex-wrap gap-3">
				<CustomTooltip :content="{ side: 'top' }" :arrow="true">
					<Button variant="outline">Hover me (top)</Button>
					<template #content>Tooltip on top</template>
				</CustomTooltip>
				<CustomTooltip :content="{ side: 'bottom' }" :arrow="true">
					<Button variant="outline">Hover me (bottom)</Button>
					<template #content>Tooltip on bottom</template>
				</CustomTooltip>
				<CustomTooltip :content="{ side: 'right' }" :arrow="true">
					<Button variant="outline">Hover me (right)</Button>
					<template #content>Tooltip on right</template>
				</CustomTooltip>
			</div>
		</section>

		<Separator />

		<!-- DateInput -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">DateInput</h2>
			<div class="max-w-sm">
				<DateInput v-model="dateInputValue" format="DD.MM.YYYY" locale="en-US" />
				<p class="mt-2 text-sm text-muted-foreground">Value: {{ dateInputValue ?? 'none' }}</p>
			</div>
		</section>

		<Separator />

		<!-- DatePicker -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">DatePicker</h2>
			<div class="max-w-sm">
				<DatePicker
					v-model="datePickerValue"
					date-format="dd.MM.yyyy"
					locale="en-US"
					placeholder="Pick a date"
				/>
				<p class="mt-2 text-sm text-muted-foreground">Value: {{ datePickerValue ?? 'none' }}</p>
			</div>
		</section>

		<Separator />

		<!-- DateRangePicker -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">DateRangePicker</h2>
			<div class="max-w-sm">
				<DateRangePicker v-model="dateRangeValue" locale="en-US" placeholder="Select range" />
				<p class="mt-2 text-sm text-muted-foreground">
					Start: {{ dateRangeValue.start ?? 'none' }} / End: {{ dateRangeValue.end ?? 'none' }}
				</p>
			</div>
		</section>

		<Separator />

		<!-- MaskNumberInput -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">MaskNumberInput</h2>
			<div class="max-w-sm">
				<MaskNumberInput
					v-model="numberValue"
					locale="en-US"
					:fraction="2"
					placeholder="Enter amount"
				/>
				<p class="mt-2 text-sm text-muted-foreground">Raw value: {{ numberValue }}</p>
			</div>
		</section>

		<Separator />

		<!-- MaskTextInput -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">MaskTextInput</h2>
			<div class="max-w-sm">
				<MaskTextInput
					v-model="phoneValue"
					mask="+## (###) ###-####"
					placeholder="+00 (000) 000-0000"
				/>
				<p class="mt-2 text-sm text-muted-foreground">Unmasked value: "{{ phoneValue }}"</p>
			</div>
		</section>

		<Separator />

		<!-- PercentageInput -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">PercentageInput</h2>
			<div class="max-w-sm">
				<PercentageInput v-model="percentValue" locale="en-US" />
				<p class="mt-2 text-sm text-muted-foreground">
					Decimal value: {{ percentValue }} (displays as
					{{ percentValue != null ? (percentValue * 100).toFixed(2) : 'none' }}%)
				</p>
			</div>
		</section>

		<Separator />

		<!-- FlagIcon -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">FlagIcon</h2>
			<p class="text-sm text-muted-foreground">
				249 country flags from a single SVG sprite. Size controlled by parent width.
			</p>
			<div class="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-12">
				<div
					v-for="flag in sampleFlags"
					:key="flag.code"
					class="flex flex-col items-center gap-1.5"
				>
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<div class="w-6">
							<FlagIcon :country="flag.code" />
						</div>
					</div>
					<span class="text-xs text-muted-foreground">{{ flag.code }}</span>
				</div>
			</div>
			<div class="flex items-center gap-4">
				<span class="text-sm text-muted-foreground">Sizes:</span>
				<div
					v-for="size in [16, 24, 32, 48, 64]"
					:key="size"
					class="flex flex-col items-center gap-1"
				>
					<div :style="{ width: size + 'px' }">
						<FlagIcon country="NO" />
					</div>
					<span class="text-xs text-muted-foreground">{{ size }}px</span>
				</div>
			</div>
		</section>

		<Separator />

		<!-- Calendar -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Calendar</h2>
			<Calendar v-model="calendarValue" locale="en-US" />
		</section>

		<Separator />

		<!-- RangeCalendar -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">RangeCalendar</h2>
			<RangeCalendar v-model="rangeCalendarValue" :number-of-months="2" locale="en-US" />
		</section>

		<Separator />

		<!-- Tree -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Tree</h2>
			<div class="max-w-sm">
				<TreeRoot v-model="treeSelected" :data="treeData" :searchable="true" :checkable="true" />
			</div>
		</section>

		<Separator />

		<!-- DataTable -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">DataTable</h2>
			<DataTable
				:data="tableData"
				:columns="tableColumns"
				:options="{ pagination: { enabled: true, pageSize: 5 } }"
			/>
		</section>
	</div>
</template>
