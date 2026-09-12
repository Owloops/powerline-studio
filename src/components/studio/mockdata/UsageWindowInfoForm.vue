<script setup lang="ts">
import type { MonthInfo, TodayInfo } from '@owloops/claude-powerline/browser'
import { DEFAULT_MOCK_DATA } from '@/data/mockPresets'

type InfoKey = 'todayInfo' | 'monthInfo'

const PERIOD_FIELDS: Record<InfoKey, { label: string; format: string; placeholder: string }> = {
	todayInfo: { label: 'Date', format: 'YYYY-MM-DD', placeholder: '2026-04-11' },
	monthInfo: { label: 'Month', format: 'YYYY-MM', placeholder: '2026-04' },
}

const props = defineProps<{
	infoKey: InfoKey
}>()

const store = useMockDataStore()

const info = computed<TodayInfo | MonthInfo | null>(() => store[props.infoKey])
const periodField = computed(() => PERIOD_FIELDS[props.infoKey])

function usageField(key: 'cost' | 'tokens') {
	return computed({
		get: () => info.value?.[key] ?? '',
		set: (v: string | number) => {
			if (!info.value) return
			const n = Number(v)
			info.value[key] = v === '' || Number.isNaN(n) ? null : n
			store.markCustom()
		},
	})
}

const cost = usageField('cost')
const tokens = usageField('tokens')

const period = computed({
	get: () => {
		const current = info.value
		if (!current) return ''
		return 'month' in current ? current.month : current.date
	},
	set: (v: string) => {
		const current = info.value
		if (!current) return
		if ('month' in current) {
			current.month = v
		} else {
			current.date = v
		}
		store.markCustom()
	},
})

const hasBreakdown = computed({
	get: () => info.value?.tokenBreakdown != null,
	set: (v: boolean) => {
		const current = info.value
		if (!current) return
		if (v) {
			const preset = store.getActivePresetData()
			current.tokenBreakdown = structuredClone(
				preset[props.infoKey]?.tokenBreakdown ??
					DEFAULT_MOCK_DATA[props.infoKey]?.tokenBreakdown ?? {
						input: 0,
						output: 0,
						cacheCreation: 0,
						cacheRead: 0,
					},
			)
		} else {
			current.tokenBreakdown = null
		}
		store.markCustom()
	},
})

function breakdownField(key: 'input' | 'output' | 'cacheCreation' | 'cacheRead') {
	return computed({
		get: () => info.value?.tokenBreakdown?.[key] ?? '',
		set: (v: string | number) => {
			const breakdown = info.value?.tokenBreakdown
			if (!breakdown) return
			const n = Number(v)
			breakdown[key] = v === '' || Number.isNaN(n) ? 0 : n
			store.markCustom()
		},
	})
}

const bdInput = breakdownField('input')
const bdOutput = breakdownField('output')
const bdCacheCreation = breakdownField('cacheCreation')
const bdCacheRead = breakdownField('cacheRead')
</script>

<template>
	<div class="flex flex-col gap-2">
		<template v-if="info">
			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Cost <span class="text-muted-foreground/60">(USD)</span></Label
					>
					<Input v-model="cost" type="number" class="h-8 text-xs" step="0.01" placeholder="null" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Tokens</Label>
					<Input v-model="tokens" type="number" class="h-8 text-xs" placeholder="null" />
				</div>
			</div>

			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground"
					>{{ periodField.label }}
					<span class="text-muted-foreground/60">({{ periodField.format }})</span></Label
				>
				<Input
					v-model="period"
					class="h-8 text-xs font-mono"
					:placeholder="periodField.placeholder"
				/>
			</div>

			<Separator />

			<div class="flex items-center justify-between">
				<Label class="text-xs text-muted-foreground">Token Breakdown</Label>
				<Switch :model-value="hasBreakdown" @update:model-value="hasBreakdown = $event" />
			</div>

			<template v-if="hasBreakdown">
				<div class="grid grid-cols-2 gap-2">
					<div class="space-y-1.5">
						<Label class="text-xs text-muted-foreground">Input</Label>
						<Input v-model="bdInput" type="number" class="h-8 text-xs" />
					</div>
					<div class="space-y-1.5">
						<Label class="text-xs text-muted-foreground">Output</Label>
						<Input v-model="bdOutput" type="number" class="h-8 text-xs" />
					</div>
				</div>
				<div class="grid grid-cols-2 gap-2">
					<div class="space-y-1.5">
						<Label class="text-xs text-muted-foreground">Cache Creation</Label>
						<Input v-model="bdCacheCreation" type="number" class="h-8 text-xs" />
					</div>
					<div class="space-y-1.5">
						<Label class="text-xs text-muted-foreground">Cache Read</Label>
						<Input v-model="bdCacheRead" type="number" class="h-8 text-xs" />
					</div>
				</div>
			</template>
		</template>
	</div>
</template>
