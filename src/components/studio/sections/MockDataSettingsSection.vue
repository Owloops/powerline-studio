<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { MOCK_DATA_PRESETS, DEFAULT_MOCK_DATA } from '@/data/mockPresets'
import MockDataFormSection from '@/components/studio/mockdata/MockDataSection.vue'
import HookDataForm from '@/components/studio/mockdata/HookDataForm.vue'
import GitInfoForm from '@/components/studio/mockdata/GitInfoForm.vue'
import UsageInfoForm from '@/components/studio/mockdata/UsageInfoForm.vue'
import ContextInfoForm from '@/components/studio/mockdata/ContextInfoForm.vue'
import MetricsInfoForm from '@/components/studio/mockdata/MetricsInfoForm.vue'
import BlockInfoForm from '@/components/studio/mockdata/BlockInfoForm.vue'
import TodayInfoForm from '@/components/studio/mockdata/TodayInfoForm.vue'
import RateLimitsForm from '@/components/studio/mockdata/RateLimitsForm.vue'

const configStore = useConfigStore()
const store = useMockDataStore()

const isOpen = ref(false)

function resetToDefaults() {
	configStore.resetToDefaults()
	toast.success('Config reset to defaults')
}

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

function toggleSection(
	key: 'gitInfo' | 'usageInfo' | 'contextInfo' | 'metricsInfo' | 'blockInfo' | 'todayInfo',
	enabled: boolean,
) {
	if (enabled) {
		const preset = store.getActivePresetData()
		const restored =
			preset[key] ?? structuredClone((DEFAULT_MOCK_DATA as Record<string, unknown>)[key])
		;(store as Record<string, unknown>)[key] = structuredClone(restored)
	} else {
		;(store as Record<string, unknown>)[key] = null
	}
	store.markCustom()
}

function toggleRateLimits(enabled: boolean) {
	if (enabled) {
		const preset = store.getActivePresetData()
		const restored =
			preset.hookData.rate_limits ?? structuredClone(DEFAULT_MOCK_DATA.hookData.rate_limits)
		store.hookData.rate_limits = structuredClone(restored)
	} else {
		store.hookData.rate_limits = undefined
	}
	store.markCustom()
}
</script>

<template>
	<section class="flex flex-col gap-4">
		<Collapsible v-model:open="isOpen">
			<!-- Section Header -->
			<div class="flex items-center justify-between">
				<CollapsibleTrigger class="flex items-center gap-2 text-left">
					<IconLucide-chevron-right
						class="size-4 shrink-0 text-muted-foreground transition-transform duration-200"
						:class="isOpen && 'rotate-90'"
					/>
					<div>
						<h2 class="text-sm font-semibold">Mock Data</h2>
						<p class="text-xs text-muted-foreground">
							Simulate Claude Code hook data for the live preview
						</p>
					</div>
				</CollapsibleTrigger>

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
				<div class="mt-4 flex flex-col gap-2">
					<!-- Claude Hook Data (always enabled, not toggleable) -->
					<MockDataFormSection
						title="Claude Hook Data"
						description="Core session info: model, cwd, version"
					>
						<template #icon>
							<IconLucide-terminal class="size-3.5 shrink-0 text-muted-foreground" />
						</template>
						<HookDataForm />
					</MockDataFormSection>

					<!-- Git Info -->
					<MockDataFormSection
						title="Git Info"
						description="Repository state for git segments"
						toggleable
						:enabled="store.gitInfo !== null"
						@update:enabled="toggleSection('gitInfo', $event)"
					>
						<template #icon>
							<IconLucide-git-branch class="size-3.5 shrink-0 text-muted-foreground" />
						</template>
						<GitInfoForm />
					</MockDataFormSection>

					<!-- Session Usage -->
					<MockDataFormSection
						title="Session Usage"
						description="Cost and token usage for current session"
						toggleable
						:enabled="store.usageInfo !== null"
						@update:enabled="toggleSection('usageInfo', $event)"
					>
						<template #icon>
							<IconLucide-coins class="size-3.5 shrink-0 text-muted-foreground" />
						</template>
						<UsageInfoForm />
					</MockDataFormSection>

					<!-- Context Window -->
					<MockDataFormSection
						title="Context Window"
						description="Token capacity and context utilization"
						toggleable
						:enabled="store.contextInfo !== null"
						@update:enabled="toggleSection('contextInfo', $event)"
					>
						<template #icon>
							<IconLucide-brain class="size-3.5 shrink-0 text-muted-foreground" />
						</template>
						<ContextInfoForm />
					</MockDataFormSection>

					<!-- Metrics -->
					<MockDataFormSection
						title="Metrics"
						description="Response time, duration, line changes"
						toggleable
						:enabled="store.metricsInfo !== null"
						@update:enabled="toggleSection('metricsInfo', $event)"
					>
						<template #icon>
							<IconLucide-activity class="size-3.5 shrink-0 text-muted-foreground" />
						</template>
						<MetricsInfoForm />
					</MockDataFormSection>

					<!-- Block / Rate -->
					<MockDataFormSection
						title="Block / Rate"
						description="Native utilization and time remaining"
						toggleable
						:enabled="store.blockInfo !== null"
						@update:enabled="toggleSection('blockInfo', $event)"
					>
						<template #icon>
							<IconLucide-shield class="size-3.5 shrink-0 text-muted-foreground" />
						</template>
						<BlockInfoForm />
					</MockDataFormSection>

					<!-- Today Usage -->
					<MockDataFormSection
						title="Today Usage"
						description="Aggregate cost and tokens for today"
						toggleable
						:enabled="store.todayInfo !== null"
						@update:enabled="toggleSection('todayInfo', $event)"
					>
						<template #icon>
							<IconLucide-calendar class="size-3.5 shrink-0 text-muted-foreground" />
						</template>
						<TodayInfoForm />
					</MockDataFormSection>

					<!-- Rate Limits -->
					<MockDataFormSection
						title="Rate Limits"
						description="5-hour and 7-day usage windows"
						toggleable
						:enabled="store.hookData.rate_limits !== undefined"
						@update:enabled="toggleRateLimits($event)"
					>
						<template #icon>
							<IconLucide-gauge class="size-3.5 shrink-0 text-muted-foreground" />
						</template>
						<RateLimitsForm />
					</MockDataFormSection>
				</div>
			</CollapsibleContent>
		</Collapsible>

		<!-- Reset to Defaults -->
		<div class="flex justify-end border-t border-border pt-4">
			<Button variant="destructive" size="sm" @click="resetToDefaults">
				<IconLucide-rotate-ccw class="size-3.5" />
				Reset to Defaults
			</Button>
		</div>
	</section>
</template>
