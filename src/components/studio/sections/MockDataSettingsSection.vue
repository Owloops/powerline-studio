<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { MOCK_DATA_PRESETS } from '@/data/mockPresets'
import MockDataSections from '@/components/studio/mockdata/MockDataSections.vue'

defineProps<{ step?: number }>()

const store = useMockDataStore()

const isOpen = ref(false)

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
	<section class="flex flex-col gap-4">
		<Collapsible v-model:open="isOpen">
			<!-- Section Header -->
			<div class="flex items-center justify-between">
				<SectionTrigger
					title="Mock Data"
					description="Simulate Claude Code hook data for the live preview"
					:step="step"
					:is-open="isOpen"
				/>

				<!-- Preset Selector -->
				<Select v-model="presetValue">
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

			<CollapsibleContent>
				<div class="pt-4">
					<MockDataSections />
				</div>
			</CollapsibleContent>
		</Collapsible>
	</section>
</template>
