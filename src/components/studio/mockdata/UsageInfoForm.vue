<script setup lang="ts">
import { DEFAULT_MOCK_DATA } from '@/data/mockPresets'

const store = useMockDataStore()

const enabled = computed({
	get: () => store.usageInfo !== null,
	set: (v: boolean) => {
		if (v) {
			const preset = store.getActivePresetData()
			const restored = preset.usageInfo ?? structuredClone(DEFAULT_MOCK_DATA.usageInfo)
			store.usageInfo = structuredClone(restored)
		} else {
			store.usageInfo = null
		}
		store.markCustom()
	},
})

function nullableNum(getter: () => number | null, setter: (v: number | null) => void) {
	return computed({
		get: () => (getter() !== null ? getter() : ''),
		set: (v: string | number) => {
			const n = Number(v)
			setter(v === '' || Number.isNaN(n) ? null : n)
			store.markCustom()
		},
	})
}

const cost = nullableNum(
	() => store.usageInfo?.session.cost ?? null,
	(v) => {
		if (store.usageInfo) store.usageInfo.session.cost = v
	},
)
const calculatedCost = nullableNum(
	() => store.usageInfo?.session.calculatedCost ?? null,
	(v) => {
		if (store.usageInfo) store.usageInfo.session.calculatedCost = v
	},
)
const officialCost = nullableNum(
	() => store.usageInfo?.session.officialCost ?? null,
	(v) => {
		if (store.usageInfo) store.usageInfo.session.officialCost = v
	},
)
const tokens = nullableNum(
	() => store.usageInfo?.session.tokens ?? null,
	(v) => {
		if (store.usageInfo) store.usageInfo.session.tokens = v
	},
)

const hasBreakdown = computed({
	get: () =>
		store.usageInfo?.session.tokenBreakdown !== null &&
		store.usageInfo?.session.tokenBreakdown !== undefined,
	set: (v: boolean) => {
		if (!store.usageInfo) return
		if (v) {
			const preset = store.getActivePresetData()
			store.usageInfo.session.tokenBreakdown = structuredClone(
				preset.usageInfo?.session.tokenBreakdown ??
					DEFAULT_MOCK_DATA.usageInfo?.session.tokenBreakdown ?? {
						input: 0,
						output: 0,
						cacheCreation: 0,
						cacheRead: 0,
					},
			)
		} else {
			store.usageInfo.session.tokenBreakdown = null
		}
		store.markCustom()
	},
})

function breakdownField(key: 'input' | 'output' | 'cacheCreation' | 'cacheRead') {
	return computed({
		get: () => store.usageInfo?.session.tokenBreakdown?.[key] ?? '',
		set: (v: string | number) => {
			if (!store.usageInfo?.session.tokenBreakdown) return
			const n = Number(v)
			store.usageInfo.session.tokenBreakdown[key] = v === '' || Number.isNaN(n) ? 0 : n
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
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<Label class="text-xs font-medium">Enable Session Usage</Label>
			<Switch :checked="enabled" @update:checked="enabled = $event" />
		</div>

		<template v-if="enabled">
			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Cost <span class="text-muted-foreground/60">(USD)</span></Label
					>
					<Input v-model="cost" type="number" class="h-8 text-xs" step="0.01" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Calculated <span class="text-muted-foreground/60">(USD)</span></Label
					>
					<Input v-model="calculatedCost" type="number" class="h-8 text-xs" step="0.01" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Official Cost <span class="text-muted-foreground/60">(USD)</span></Label
					>
					<Input
						v-model="officialCost"
						type="number"
						class="h-8 text-xs"
						step="0.01"
						placeholder="null"
					/>
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Tokens</Label>
					<Input v-model="tokens" type="number" class="h-8 text-xs" />
				</div>
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
