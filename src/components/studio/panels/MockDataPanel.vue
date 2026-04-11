<script setup lang="ts">
import { MOCK_DATA_PRESETS } from '@/data/mockPresets'
import HookDataForm from '@/components/studio/mockdata/HookDataForm.vue'
import GitInfoForm from '@/components/studio/mockdata/GitInfoForm.vue'
import UsageInfoForm from '@/components/studio/mockdata/UsageInfoForm.vue'
import ContextInfoForm from '@/components/studio/mockdata/ContextInfoForm.vue'
import MetricsInfoForm from '@/components/studio/mockdata/MetricsInfoForm.vue'
import BlockInfoForm from '@/components/studio/mockdata/BlockInfoForm.vue'
import TodayInfoForm from '@/components/studio/mockdata/TodayInfoForm.vue'
import RateLimitsForm from '@/components/studio/mockdata/RateLimitsForm.vue'

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
		<!-- Preset Selector -->
		<div class="space-y-1.5">
			<Label class="text-xs font-medium text-muted-foreground">Preset</Label>
			<Select v-model="presetValue">
				<SelectTrigger class="h-9 text-sm">
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

		<Separator />

		<!-- Accordion Sections -->
		<Accordion type="multiple" class="w-full">
			<AccordionItem value="hook-data">
				<AccordionTrigger class="py-3 text-xs">
					<span class="flex items-center gap-2">
						<IconLucide-terminal class="size-3.5 text-muted-foreground" />
						Claude Hook Data
					</span>
				</AccordionTrigger>
				<AccordionContent>
					<HookDataForm />
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="git-info">
				<AccordionTrigger class="py-3 text-xs">
					<span class="flex items-center gap-2">
						<IconLucide-git-branch class="size-3.5 text-muted-foreground" />
						Git Info
					</span>
				</AccordionTrigger>
				<AccordionContent>
					<GitInfoForm />
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="usage-info">
				<AccordionTrigger class="py-3 text-xs">
					<span class="flex items-center gap-2">
						<IconLucide-coins class="size-3.5 text-muted-foreground" />
						Session Usage
					</span>
				</AccordionTrigger>
				<AccordionContent>
					<UsageInfoForm />
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="context-info">
				<AccordionTrigger class="py-3 text-xs">
					<span class="flex items-center gap-2">
						<IconLucide-brain class="size-3.5 text-muted-foreground" />
						Context Window
					</span>
				</AccordionTrigger>
				<AccordionContent>
					<ContextInfoForm />
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="metrics-info">
				<AccordionTrigger class="py-3 text-xs">
					<span class="flex items-center gap-2">
						<IconLucide-activity class="size-3.5 text-muted-foreground" />
						Metrics
					</span>
				</AccordionTrigger>
				<AccordionContent>
					<MetricsInfoForm />
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="block-info">
				<AccordionTrigger class="py-3 text-xs">
					<span class="flex items-center gap-2">
						<IconLucide-shield class="size-3.5 text-muted-foreground" />
						Block / Rate
					</span>
				</AccordionTrigger>
				<AccordionContent>
					<BlockInfoForm />
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="today-info">
				<AccordionTrigger class="py-3 text-xs">
					<span class="flex items-center gap-2">
						<IconLucide-calendar class="size-3.5 text-muted-foreground" />
						Today Usage
					</span>
				</AccordionTrigger>
				<AccordionContent>
					<TodayInfoForm />
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="rate-limits">
				<AccordionTrigger class="py-3 text-xs">
					<span class="flex items-center gap-2">
						<IconLucide-gauge class="size-3.5 text-muted-foreground" />
						Rate Limits
					</span>
				</AccordionTrigger>
				<AccordionContent>
					<RateLimitsForm />
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	</div>
</template>
