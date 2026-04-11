<script setup lang="ts">
import { DEFAULT_MOCK_DATA } from '@/data/mockPresets'

const store = useMockDataStore()

const enabled = computed({
	get: () => store.metricsInfo !== null,
	set: (v: boolean) => {
		if (v) {
			const preset = store.getActivePresetData()
			const restored = preset.metricsInfo ?? structuredClone(DEFAULT_MOCK_DATA.metricsInfo)
			store.metricsInfo = structuredClone(restored)
		} else {
			store.metricsInfo = null
		}
		store.markCustom()
	},
})

function nullableNum(key: keyof NonNullable<typeof store.metricsInfo>) {
	return computed({
		get: () => {
			const v = store.metricsInfo?.[key]
			return v !== null && v !== undefined ? v : ''
		},
		set: (v: string | number) => {
			if (!store.metricsInfo) return
			const n = Number(v)
			;(store.metricsInfo as Record<string, number | null>)[key] =
				v === '' || Number.isNaN(n) ? null : n
			store.markCustom()
		},
	})
}

const responseTime = nullableNum('responseTime')
const lastResponseTime = nullableNum('lastResponseTime')
const sessionDuration = nullableNum('sessionDuration')
const messageCount = nullableNum('messageCount')
const linesAdded = nullableNum('linesAdded')
const linesRemoved = nullableNum('linesRemoved')
</script>

<template>
	<div class="flex flex-col gap-2">
		<template v-if="enabled">
			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Response Time <span class="text-muted-foreground/60">(s)</span></Label
					>
					<Input v-model="responseTime" type="number" class="h-8 text-xs" placeholder="null" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Last Response <span class="text-muted-foreground/60">(s)</span></Label
					>
					<Input v-model="lastResponseTime" type="number" class="h-8 text-xs" placeholder="null" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Duration <span class="text-muted-foreground/60">(s)</span></Label
					>
					<Input v-model="sessionDuration" type="number" class="h-8 text-xs" placeholder="null" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Messages</Label>
					<Input v-model="messageCount" type="number" class="h-8 text-xs" placeholder="null" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Lines Added</Label>
					<Input v-model="linesAdded" type="number" class="h-8 text-xs" placeholder="null" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Lines Removed</Label>
					<Input v-model="linesRemoved" type="number" class="h-8 text-xs" placeholder="null" />
				</div>
			</div>
		</template>
	</div>
</template>
