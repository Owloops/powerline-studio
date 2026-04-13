<script setup lang="ts">
import { MOCK_DATA_PRESETS } from '@/data/mockPresets'
import MockDataSections from '@/components/studio/mockdata/MockDataSections.vue'

const store = useMockDataStore()

const presetValue = computed({
	get: () => store.activePreset,
	set: (id: string) => {
		if (id !== 'custom') {
			store.applyPreset(id)
		}
	},
})

const presetLabel = computed(() => {
	if (store.activePreset === 'custom') return 'Custom'
	return MOCK_DATA_PRESETS.find((p) => p.id === store.activePreset)?.name ?? store.activePreset
})
</script>

<template>
	<div class="flex flex-col gap-4 p-4">
		<!-- Header + Preset Selector -->
		<div class="flex flex-col gap-1.5">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-sm font-medium">Mock Data</h2>
					<p class="text-xs text-muted-foreground">
						Simulate Claude Code hook data for the live preview
					</p>
				</div>
				<Select v-model="presetValue" class="w-auto">
					<SelectTrigger class="h-8 w-36 text-xs">
						<SelectValue :placeholder="presetLabel" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem v-for="preset in MOCK_DATA_PRESETS" :key="preset.id" :value="preset.id">
							{{ preset.name }}
						</SelectItem>
						<SelectItem v-if="store.activePreset === 'custom'" value="custom" disabled>
							Custom
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>

		<!-- Sections -->
		<MockDataSections />
	</div>
</template>
