<script setup lang="ts">
import { DEFAULT_MOCK_DATA } from '@/data/mockPresets'

const store = useMockDataStore()

const enabled = computed({
	get: () => store.todayInfo !== null,
	set: (v: boolean) => {
		if (v) {
			const preset = store.getActivePresetData()
			const restored = preset.todayInfo ?? structuredClone(DEFAULT_MOCK_DATA.todayInfo)
			store.todayInfo = structuredClone(restored)
		} else {
			store.todayInfo = null
		}
		store.markCustom()
	},
})

const cost = computed({
	get: () => {
		const v = store.todayInfo?.cost
		return v !== null && v !== undefined ? v : ''
	},
	set: (v: string | number) => {
		if (!store.todayInfo) return
		const n = Number(v)
		store.todayInfo.cost = v === '' || Number.isNaN(n) ? null : n
		store.markCustom()
	},
})

const tokens = computed({
	get: () => {
		const v = store.todayInfo?.tokens
		return v !== null && v !== undefined ? v : ''
	},
	set: (v: string | number) => {
		if (!store.todayInfo) return
		const n = Number(v)
		store.todayInfo.tokens = v === '' || Number.isNaN(n) ? null : n
		store.markCustom()
	},
})

const date = computed({
	get: () => store.todayInfo?.date ?? '',
	set: (v: string) => {
		if (!store.todayInfo) return
		store.todayInfo.date = v
		store.markCustom()
	},
})

const hasBreakdown = computed({
	get: () =>
		store.todayInfo?.tokenBreakdown !== null && store.todayInfo?.tokenBreakdown !== undefined,
	set: (v: boolean) => {
		if (!store.todayInfo) return
		if (v) {
			const preset = store.getActivePresetData()
			store.todayInfo.tokenBreakdown = structuredClone(
				preset.todayInfo?.tokenBreakdown ??
					DEFAULT_MOCK_DATA.todayInfo?.tokenBreakdown ?? {
						input: 0,
						output: 0,
						cacheCreation: 0,
						cacheRead: 0,
					},
			)
		} else {
			store.todayInfo.tokenBreakdown = null
		}
		store.markCustom()
	},
})

function breakdownField(key: 'input' | 'output' | 'cacheCreation' | 'cacheRead') {
	return computed({
		get: () => store.todayInfo?.tokenBreakdown?.[key] ?? '',
		set: (v: string | number) => {
			if (!store.todayInfo?.tokenBreakdown) return
			const n = Number(v)
			store.todayInfo.tokenBreakdown[key] = v === '' || Number.isNaN(n) ? 0 : n
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
		<template v-if="enabled">
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
					>Date <span class="text-muted-foreground/60">(YYYY-MM-DD)</span></Label
				>
				<Input v-model="date" class="h-8 text-xs font-mono" placeholder="2026-04-11" />
			</div>

			<Separator />

			<div class="flex items-center justify-between">
				<Label class="text-xs text-muted-foreground">Token Breakdown</Label>
				<Switch :checked="hasBreakdown" @update:checked="hasBreakdown = $event" />
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
