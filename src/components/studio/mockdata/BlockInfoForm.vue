<script setup lang="ts">
import { DEFAULT_MOCK_DATA } from '@/data/mockPresets'

const store = useMockDataStore()

const enabled = computed({
	get: () => store.blockInfo !== null,
	set: (v: boolean) => {
		if (v) {
			const preset = store.getActivePresetData()
			const restored = preset.blockInfo ?? structuredClone(DEFAULT_MOCK_DATA.blockInfo)
			store.blockInfo = structuredClone(restored)
		} else {
			store.blockInfo = null
		}
		store.markCustom()
	},
})

const nativeUtilization = computed({
	get: () => store.blockInfo?.nativeUtilization ?? '',
	set: (v: string | number) => {
		if (!store.blockInfo) return
		const n = Number(v)
		if (v !== '' && !Number.isNaN(n)) {
			store.blockInfo.nativeUtilization = n
		}
		store.markCustom()
	},
})

const timeRemaining = computed({
	get: () => store.blockInfo?.timeRemaining ?? '',
	set: (v: string | number) => {
		if (!store.blockInfo) return
		const n = Number(v)
		if (v !== '' && !Number.isNaN(n)) {
			store.blockInfo.timeRemaining = n
		}
		store.markCustom()
	},
})
</script>

<template>
	<div class="flex flex-col gap-2">
		<template v-if="enabled">
			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Utilization <span class="text-muted-foreground/60">(%)</span></Label
					>
					<Input v-model="nativeUtilization" type="number" class="h-8 text-xs" min="0" max="100" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Time Left <span class="text-muted-foreground/60">(min)</span></Label
					>
					<Input v-model="timeRemaining" type="number" class="h-8 text-xs" min="0" />
				</div>
			</div>
		</template>
	</div>
</template>
