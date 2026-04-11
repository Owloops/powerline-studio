<script setup lang="ts">
import type { ChartConfig } from '@/components/ui/chart'
import {
	ChartCrosshair,
	ChartTooltip,
	ChartTooltipContent,
	componentToString,
} from '@/components/ui/chart'
import {
	VisArea,
	VisAxis,
	VisDonut,
	VisGroupedBar,
	VisLine,
	VisSingleContainer,
	VisXYContainer,
} from '@unovis/vue'
const VChart = defineAsyncComponent(() => import('@/lib/echarts'))

useHead({ title: 'Charts' })
useSeoMeta({
	title: 'Charts — Vue Template',
	description: 'Chart examples using shadcn-vue chart wrappers and Unovis visualization library',
})

interface MonthlyData {
	month: string
	desktop: number
	mobile: number
}

type SeriesKey = 'desktop' | 'mobile'

const chartData: MonthlyData[] = [
	{ month: 'Jan', desktop: 186, mobile: 80 },
	{ month: 'Feb', desktop: 305, mobile: 200 },
	{ month: 'Mar', desktop: 237, mobile: 120 },
	{ month: 'Apr', desktop: 173, mobile: 190 },
	{ month: 'May', desktop: 209, mobile: 130 },
	{ month: 'Jun', desktop: 214, mobile: 140 },
	{ month: 'Jul', desktop: 252, mobile: 165 },
	{ month: 'Aug', desktop: 294, mobile: 180 },
	{ month: 'Sep', desktop: 331, mobile: 220 },
	{ month: 'Oct', desktop: 268, mobile: 195 },
	{ month: 'Nov', desktop: 319, mobile: 240 },
	{ month: 'Dec', desktop: 348, mobile: 260 },
]

const lineConfig: ChartConfig = {
	desktop: { label: 'Desktop', color: 'var(--chart-1)' },
	mobile: { label: 'Mobile', color: 'var(--chart-2)' },
}

const barConfig: ChartConfig = {
	desktop: { label: 'Desktop', color: 'var(--chart-1)' },
	mobile: { label: 'Mobile', color: 'var(--chart-2)' },
}

const areaConfig: ChartConfig = {
	desktop: { label: 'Desktop', color: 'var(--chart-1)' },
	mobile: { label: 'Mobile', color: 'var(--chart-3)' },
}

interface BrowserData {
	browser: string
	visitors: number
	color: string
}

const browserData: BrowserData[] = [
	{ browser: 'Chrome', visitors: 275, color: 'var(--chart-1)' },
	{ browser: 'Safari', visitors: 200, color: 'var(--chart-2)' },
	{ browser: 'Firefox', visitors: 187, color: 'var(--chart-3)' },
	{ browser: 'Edge', visitors: 173, color: 'var(--chart-4)' },
	{ browser: 'Other', visitors: 90, color: 'var(--chart-5)' },
]

const donutConfig: ChartConfig = {
	Chrome: { label: 'Chrome', color: 'var(--chart-1)' },
	Safari: { label: 'Safari', color: 'var(--chart-2)' },
	Firefox: { label: 'Firefox', color: 'var(--chart-3)' },
	Edge: { label: 'Edge', color: 'var(--chart-4)' },
	Other: { label: 'Other', color: 'var(--chart-5)' },
}

const totalVisitors = browserData.reduce((sum, d) => sum + d.visitors, 0)

function x(_d: MonthlyData, i: number) {
	return i
}

function tickFormat(i: number) {
	return chartData[i]?.month ?? ''
}

const tickValues = chartData.map((_d, i) => i)

const areaGradientDefs = `
	<linearGradient id="area-gradient-desktop" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0%" stop-color="var(--color-desktop)" stop-opacity="0.5" />
		<stop offset="100%" stop-color="var(--color-desktop)" stop-opacity="0.02" />
	</linearGradient>
	<linearGradient id="area-gradient-mobile" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0%" stop-color="var(--color-mobile)" stop-opacity="0.4" />
		<stop offset="100%" stop-color="var(--color-mobile)" stop-opacity="0.02" />
	</linearGradient>
`

const yAccessors: Record<SeriesKey, (d: MonthlyData) => number> = {
	desktop: (d: MonthlyData) => d.desktop,
	mobile: (d: MonthlyData) => d.mobile,
}

const areaVisible = reactive<Record<SeriesKey, boolean>>({ desktop: true, mobile: true })
const lineVisible = reactive<Record<SeriesKey, boolean>>({ desktop: true, mobile: true })
const barVisible = reactive<Record<SeriesKey, boolean>>({ desktop: true, mobile: true })

function toggle(state: Record<string, boolean>, key: string) {
	state[key] = !state[key]
}

const areaSeriesColors: Record<SeriesKey, string> = {
	desktop: 'var(--color-desktop)',
	mobile: 'var(--color-mobile)',
}

const lineSeriesColors: Record<SeriesKey, string> = {
	desktop: 'var(--color-desktop)',
	mobile: 'var(--color-mobile)',
}

function visibleY(state: Record<SeriesKey, boolean>) {
	return (['desktop', 'mobile'] as SeriesKey[]).filter((k) => state[k]).map((k) => yAccessors[k])
}

function visibleColors(state: Record<SeriesKey, boolean>, colors: Record<SeriesKey, string>) {
	return (['desktop', 'mobile'] as SeriesKey[]).filter((k) => state[k]).map((k) => colors[k])
}

const areaCrosshairY = computed(() => visibleY(areaVisible))
const areaCrosshairColors = computed(() => visibleColors(areaVisible, areaSeriesColors))
const barY = computed(() => visibleY(barVisible))
const barColors = computed(() => visibleColors(barVisible, lineSeriesColors))

// --- ECharts Energy Overview (8760 hourly data points) — lazy loaded on scroll ---

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const MONTH_LABELS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
]

function noise(i: number): number {
	const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453
	return (v - Math.floor(v)) * 2 - 1
}

let _energyData: { production: number[]; consumption: number[]; labels: string[] } | null = null

function getEnergyData() {
	if (_energyData) return _energyData
	const production: number[] = []
	const consumption: number[] = []
	const labels: string[] = []
	let hi = 0
	for (let m = 0; m < 12; m++) {
		for (let d = 0; d < DAYS_PER_MONTH[m]; d++) {
			const dayOfYear = DAYS_PER_MONTH.slice(0, m).reduce((a, b) => a + b, 0) + d
			const seasonal = Math.sin(((dayOfYear - 80) / 365) * Math.PI * 2)
			for (let h = 0; h < 24; h++) {
				const windBase = 65 + seasonal * 15 + noise(hi) * 4
				const solar = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI)) ** 2 * (120 + seasonal * 80)
				production.push(windBase + solar + noise(hi + 3000) * 3)

				const baseLoad = 90
				const heatingBias = -seasonal * 25
				const dailyCycle = Math.sin(((h - 3) / 24) * Math.PI * 2) * 15
				const eveningPeak = h >= 17 && h <= 21 ? Math.sin(((h - 17) / 4) * Math.PI) * 20 : 0
				consumption.push(baseLoad + heatingBias + dailyCycle + eveningPeak + noise(hi + 5000) * 3)

				labels.push(`${MONTH_LABELS[m]} ${d + 1}, ${String(h).padStart(2, '0')}:00`)
				hi++
			}
		}
	}
	_energyData = { production, consumption, labels }
	return _energyData
}

const energySentinel = shallowRef<HTMLElement>()
const energyInView = shallowRef(false)

useIntersectionObserver(
	energySentinel,
	([entry]) => {
		if (entry?.isIntersecting) energyInView.value = true
	},
	{ rootMargin: '200px' },
)

const { isDark } = useDarkMode()

const energyVisible = reactive({ production: true, consumption: true })
const energyChartRef = shallowRef<InstanceType<typeof VChart>>()
let zoomBrushActivated = false

function activateZoomBrush() {
	if (zoomBrushActivated) return
	zoomBrushActivated = true
	energyChartRef.value?.dispatchAction({
		type: 'takeGlobalCursor',
		key: 'dataZoomSelect',
		dataZoomSelectActive: true,
	})
}

function resetEnergyZoom() {
	energyChartRef.value?.dispatchAction({ type: 'restore' })
	zoomBrushActivated = false
	nextTick(activateZoomBrush)
}

const energyChartOption = computed(() => {
	const data = getEnergyData()
	const dark = isDark.value
	const mutedColor = dark ? 'oklch(0.708 0 0)' : 'oklch(0.556 0 0)'
	const borderColor = dark ? 'oklch(1 0 0 / 10%)' : 'oklch(0.922 0 0)'
	const chart1 = dark ? 'oklch(0.488 0.243 264.376)' : 'oklch(0.646 0.222 41.116)'
	const chart2 = dark ? 'oklch(0.696 0.17 162.48)' : 'oklch(0.6 0.118 184.704)'

	const tooltipBg = dark ? 'oklch(0.205 0 0)' : 'oklch(1 0 0)'
	const tooltipText = dark ? 'oklch(0.985 0 0)' : 'oklch(0.145 0 0)'

	return {
		backgroundColor: 'transparent',
		animation: false,
		tooltip: {
			trigger: 'axis',
			backgroundColor: tooltipBg,
			borderColor: borderColor,
			textStyle: { color: tooltipText, fontSize: 12, fontFamily: 'inherit' },
			axisPointer: {
				lineStyle: { color: borderColor, width: 1, type: 'dashed' },
			},
		},
		legend: {
			show: false,
		},
		toolbox: {
			show: true,
			right: 8,
			top: 0,
			iconStyle: { opacity: 0 },
			emphasis: { iconStyle: { opacity: 0 } },
			feature: {
				dataZoom: { yAxisIndex: 'none' },
				restore: { show: false },
			},
		},
		grid: {
			left: 48,
			right: 48,
			top: 8,
			bottom: 24,
		},
		xAxis: {
			type: 'category',
			data: data.labels,
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: {
				color: mutedColor,
				fontSize: 11,
				fontFamily: 'inherit',
				interval: (index: number) => {
					let cumHours = 0
					for (const days of DAYS_PER_MONTH) {
						if (index === cumHours) return true
						cumHours += days * 24
					}
					return false
				},
				formatter: (value: string) => value.split(',')[0].split(' ')[0],
			},
			splitLine: { show: false },
		},
		yAxis: [
			{
				type: 'value',
				position: 'left',
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: { color: mutedColor, fontSize: 11, fontFamily: 'inherit' },
				splitLine: { lineStyle: { color: borderColor, type: 'dashed' } },
			},
		],
		dataZoom: [],
		series: [
			...(energyVisible.production
				? [
						{
							name: 'Production',
							type: 'line' as const,
							data: data.production,
							symbol: 'none',
							lineStyle: { width: 1, color: chart1 },
							itemStyle: { color: chart1 },
							emphasis: { disabled: true },
							z: 2,
						},
					]
				: []),
			...(energyVisible.consumption
				? [
						{
							name: 'Consumption',
							type: 'line' as const,
							data: data.consumption,
							symbol: 'none',
							lineStyle: { width: 1, color: chart2 },
							itemStyle: { color: chart2 },
							emphasis: { disabled: true },
							z: 2,
						},
					]
				: []),
		],
	}
})
</script>

<template>
	<div class="flex flex-col gap-8">
		<section>
			<h1 class="text-3xl font-bold tracking-tight">Charts</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Built with Unovis, ECharts, and shadcn-vue chart wrappers.
			</p>
		</section>

		<!-- Area Chart — gradient fade hero -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle class="text-base font-medium">Traffic Overview</CardTitle>
					<CardDescription>Page views over the last 12 months</CardDescription>
				</div>
				<div class="flex items-center gap-4 text-sm">
					<button
						class="flex cursor-pointer items-center gap-1.5 transition-opacity"
						:class="areaVisible.desktop ? 'opacity-100' : 'opacity-40'"
						@click="toggle(areaVisible, 'desktop')"
					>
						<span class="size-2 rounded-full bg-[var(--chart-1)]" />
						Desktop
					</button>
					<button
						class="flex cursor-pointer items-center gap-1.5 transition-opacity"
						:class="areaVisible.mobile ? 'opacity-100' : 'opacity-40'"
						@click="toggle(areaVisible, 'mobile')"
					>
						<span class="size-2 rounded-full bg-[var(--chart-3)]" />
						Mobile
					</button>
				</div>
			</CardHeader>
			<CardContent class="pt-0">
				<ChartContainer :config="areaConfig" class="h-[220px] w-full">
					<VisXYContainer
						:data="chartData"
						:padding="{ top: 8, right: 0, bottom: 0, left: 0 }"
						:svg-defs="areaGradientDefs"
					>
						<template v-if="areaVisible.desktop">
							<VisArea
								:x="x"
								:y="yAccessors.desktop"
								color="url(#area-gradient-desktop)"
								curve-type="monotoneX"
							/>
							<VisLine
								:x="x"
								:y="yAccessors.desktop"
								color="var(--color-desktop)"
								:line-width="2"
								curve-type="monotoneX"
							/>
						</template>
						<template v-if="areaVisible.mobile">
							<VisArea
								:x="x"
								:y="yAccessors.mobile"
								color="url(#area-gradient-mobile)"
								curve-type="monotoneX"
							/>
							<VisLine
								:x="x"
								:y="yAccessors.mobile"
								color="var(--color-mobile)"
								:line-width="2"
								curve-type="monotoneX"
							/>
						</template>
						<VisAxis
							type="x"
							:x="x"
							:tick-format="tickFormat"
							:tick-line="false"
							:domain-line="false"
							:grid-line="false"
							:tick-values="tickValues"
						/>
						<VisAxis type="y" :tick-line="false" :domain-line="false" :grid-line="true" />
						<ChartTooltip />
						<ChartCrosshair
							:x="x"
							:y="areaCrosshairY"
							:color="areaCrosshairColors"
							:template="
								componentToString(areaConfig, ChartTooltipContent, {
									labelFormatter: (v: number | Date) => chartData[v as number]?.month,
								})
							"
						/>
					</VisXYContainer>
				</ChartContainer>
			</CardContent>
		</Card>

		<!-- Line + Bar side by side -->
		<div class="grid gap-6 lg:grid-cols-2">
			<Card>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<div>
						<CardTitle class="text-base font-medium">Visitors</CardTitle>
						<CardDescription>Desktop vs mobile</CardDescription>
					</div>
					<div class="flex items-center gap-4 text-sm">
						<button
							class="flex cursor-pointer items-center gap-1.5 transition-opacity"
							:class="lineVisible.desktop ? 'opacity-100' : 'opacity-40'"
							@click="toggle(lineVisible, 'desktop')"
						>
							<span class="size-2 rounded-full bg-[var(--chart-1)]" />
							Desktop
						</button>
						<button
							class="flex cursor-pointer items-center gap-1.5 transition-opacity"
							:class="lineVisible.mobile ? 'opacity-100' : 'opacity-40'"
							@click="toggle(lineVisible, 'mobile')"
						>
							<span class="size-2 rounded-full bg-[var(--chart-2)]" />
							Mobile
						</button>
					</div>
				</CardHeader>
				<CardContent class="pt-0">
					<ChartContainer :config="lineConfig" class="h-[200px] w-full">
						<VisXYContainer :data="chartData" :padding="{ top: 8, right: 0, bottom: 0, left: 0 }">
							<VisLine
								v-if="lineVisible.desktop"
								:x="x"
								:y="yAccessors.desktop"
								color="var(--color-desktop)"
								:line-width="2"
								curve-type="monotoneX"
							/>
							<VisLine
								v-if="lineVisible.mobile"
								:x="x"
								:y="yAccessors.mobile"
								color="var(--color-mobile)"
								:line-width="2"
								curve-type="monotoneX"
							/>
							<VisAxis
								type="x"
								:x="x"
								:tick-format="tickFormat"
								:tick-line="false"
								:domain-line="false"
								:grid-line="false"
								:tick-values="tickValues"
							/>
							<VisAxis type="y" :tick-line="false" :domain-line="false" :grid-line="true" />
							<ChartTooltip />
							<ChartCrosshair
								:color="visibleColors(lineVisible, lineSeriesColors)"
								:template="
									componentToString(lineConfig, ChartTooltipContent, {
										labelFormatter: (v: number | Date) => chartData[v as number]?.month,
									})
								"
							/>
						</VisXYContainer>
					</ChartContainer>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<div>
						<CardTitle class="text-base font-medium">Revenue</CardTitle>
						<CardDescription>Desktop vs mobile</CardDescription>
					</div>
					<div class="flex items-center gap-4 text-sm">
						<button
							class="flex cursor-pointer items-center gap-1.5 transition-opacity"
							:class="barVisible.desktop ? 'opacity-100' : 'opacity-40'"
							@click="toggle(barVisible, 'desktop')"
						>
							<span class="size-2 rounded-full bg-[var(--chart-1)]" />
							Desktop
						</button>
						<button
							class="flex cursor-pointer items-center gap-1.5 transition-opacity"
							:class="barVisible.mobile ? 'opacity-100' : 'opacity-40'"
							@click="toggle(barVisible, 'mobile')"
						>
							<span class="size-2 rounded-full bg-[var(--chart-2)]" />
							Mobile
						</button>
					</div>
				</CardHeader>
				<CardContent class="pt-0">
					<ChartContainer :config="barConfig" class="h-[200px] w-full">
						<VisXYContainer :data="chartData" :padding="{ top: 8, right: 0, bottom: 0, left: 0 }">
							<VisGroupedBar
								:x="x"
								:y="barY"
								:color="barColors"
								:bar-padding="0.3"
								:rounded-corners="4"
							/>
							<VisAxis
								type="x"
								:x="x"
								:tick-format="tickFormat"
								:tick-line="false"
								:domain-line="false"
								:grid-line="false"
								:tick-values="tickValues"
							/>
							<VisAxis type="y" :tick-line="false" :domain-line="false" :grid-line="true" />
							<ChartTooltip />
							<ChartCrosshair
								:color="barColors"
								:template="
									componentToString(barConfig, ChartTooltipContent, {
										labelFormatter: (v: number | Date) => chartData[v as number]?.month,
									})
								"
							/>
						</VisXYContainer>
					</ChartContainer>
				</CardContent>
			</Card>
		</div>

		<!-- Donut Chart -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle class="text-base font-medium">Browser Share</CardTitle>
					<CardDescription>Visitor distribution by browser</CardDescription>
				</div>
				<p class="tabular-nums text-2xl font-semibold tracking-tight">
					{{ totalVisitors.toLocaleString() }}
					<span class="text-sm font-normal text-muted-foreground">visitors</span>
				</p>
			</CardHeader>
			<CardContent class="flex items-center gap-8 pt-0">
				<ChartContainer
					:config="donutConfig"
					class="h-[180px] w-[180px] shrink-0"
					:style="{ '--vis-donut-background-color': 'transparent' }"
				>
					<VisSingleContainer :data="browserData">
						<VisDonut
							:value="(d: BrowserData) => d.visitors"
							:color="(d: BrowserData) => d.color"
							:arc-width="40"
							:pad-angle="0.02"
							:corner-radius="3"
						/>
					</VisSingleContainer>
				</ChartContainer>
				<div role="list" class="flex flex-col gap-3">
					<div
						v-for="item in browserData"
						:key="item.browser"
						role="listitem"
						class="flex items-center gap-3"
					>
						<span class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: item.color }" />
						<span class="w-16 text-sm text-muted-foreground">{{ item.browser }}</span>
						<span class="tabular-nums text-sm font-medium">{{ item.visitors }}</span>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- ECharts Energy Overview — 8760 hourly points, lazy loaded on scroll -->
		<Card ref="energySentinel">
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle class="text-base font-medium">Energy Overview</CardTitle>
					<CardDescription>Hourly production & consumption over 12 months</CardDescription>
				</div>
				<div class="flex items-center gap-4 text-sm">
					<button
						class="flex cursor-pointer items-center gap-1.5 transition-opacity"
						:class="energyVisible.production ? 'opacity-100' : 'opacity-40'"
						@click="toggle(energyVisible, 'production')"
					>
						<span class="size-2 rounded-full bg-[var(--chart-1)]" />
						Production
					</button>
					<button
						class="flex cursor-pointer items-center gap-1.5 transition-opacity"
						:class="energyVisible.consumption ? 'opacity-100' : 'opacity-40'"
						@click="toggle(energyVisible, 'consumption')"
					>
						<span class="size-2 rounded-full bg-[var(--chart-2)]" />
						Consumption
					</button>
					<Button variant="ghost" size="icon" class="size-7" @click="resetEnergyZoom">
						<IconLucide-rotate-ccw class="size-3.5" />
					</Button>
				</div>
			</CardHeader>
			<CardContent class="pt-0">
				<div class="h-[280px] w-full">
					<VChart
						v-if="energyInView"
						ref="energyChartRef"
						class="size-full"
						:option="energyChartOption"
						:autoresize="true"
						@rendered="activateZoomBrush"
					/>
				</div>
			</CardContent>
		</Card>
	</div>
</template>
