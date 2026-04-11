<script setup lang="ts">
import { DEFAULT_MOCK_DATA } from '@/data/mockPresets'

const store = useMockDataStore()

const enabled = computed({
	get: () => store.hookData.rate_limits !== undefined,
	set: (v: boolean) => {
		if (v) {
			const preset = store.getActivePresetData()
			const restored =
				preset.hookData.rate_limits ?? structuredClone(DEFAULT_MOCK_DATA.hookData.rate_limits)
			store.hookData.rate_limits = structuredClone(restored)
		} else {
			store.hookData.rate_limits = undefined
		}
		store.markCustom()
	},
})

// Five hour
const fiveHourPct = computed({
	get: () => store.hookData.rate_limits?.five_hour?.used_percentage ?? '',
	set: (v: string | number) => {
		if (!store.hookData.rate_limits) return
		const n = Number(v)
		if (v === '' || Number.isNaN(n)) return
		if (!store.hookData.rate_limits.five_hour) {
			store.hookData.rate_limits.five_hour = {
				used_percentage: n,
				resets_at: Math.floor(Date.now() / 1000) + 300 * 60,
			}
		} else {
			store.hookData.rate_limits.five_hour.used_percentage = n
		}
		store.markCustom()
	},
})

const fiveHourResets = computed({
	get: () => store.hookData.rate_limits?.five_hour?.resets_at ?? '',
	set: (v: string | number) => {
		if (!store.hookData.rate_limits?.five_hour) return
		const n = Number(v)
		if (v !== '' && !Number.isNaN(n)) {
			store.hookData.rate_limits.five_hour.resets_at = n
		}
		store.markCustom()
	},
})

// Seven day
const sevenDayPct = computed({
	get: () => store.hookData.rate_limits?.seven_day?.used_percentage ?? '',
	set: (v: string | number) => {
		if (!store.hookData.rate_limits) return
		const n = Number(v)
		if (v === '' || Number.isNaN(n)) return
		if (!store.hookData.rate_limits.seven_day) {
			store.hookData.rate_limits.seven_day = {
				used_percentage: n,
				resets_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
			}
		} else {
			store.hookData.rate_limits.seven_day.used_percentage = n
		}
		store.markCustom()
	},
})

const sevenDayResets = computed({
	get: () => store.hookData.rate_limits?.seven_day?.resets_at ?? '',
	set: (v: string | number) => {
		if (!store.hookData.rate_limits?.seven_day) return
		const n = Number(v)
		if (v !== '' && !Number.isNaN(n)) {
			store.hookData.rate_limits.seven_day.resets_at = n
		}
		store.markCustom()
	},
})
</script>

<template>
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<Label class="text-xs font-medium">Enable Rate Limits</Label>
			<Switch :checked="enabled" @update:checked="enabled = $event" />
		</div>

		<template v-if="enabled">
			<div class="space-y-1.5">
				<Label class="text-xs font-medium text-muted-foreground">5-Hour Window</Label>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Used <span class="text-muted-foreground/60">(%)</span></Label
					>
					<Input v-model="fiveHourPct" type="number" class="h-8 text-xs" min="0" max="100" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Resets At <span class="text-muted-foreground/60">(unix s)</span></Label
					>
					<Input v-model="fiveHourResets" type="number" class="h-8 text-xs" />
				</div>
			</div>

			<Separator />

			<div class="space-y-1.5">
				<Label class="text-xs font-medium text-muted-foreground">7-Day Window</Label>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Used <span class="text-muted-foreground/60">(%)</span></Label
					>
					<Input v-model="sevenDayPct" type="number" class="h-8 text-xs" min="0" max="100" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Resets At <span class="text-muted-foreground/60">(unix s)</span></Label
					>
					<Input v-model="sevenDayResets" type="number" class="h-8 text-xs" />
				</div>
			</div>
		</template>
	</div>
</template>
