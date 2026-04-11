<script setup lang="ts">
import { MOCK_DATA_PRESETS } from '@/data/mockPresets'
import { DEFAULT_MOCK_DATA } from '@/data/mockPresets'
import MockDataSection from '@/components/studio/mockdata/MockDataSection.vue'
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

// Toggle helpers that read/write to the store
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
		<div class="flex flex-col gap-2">
			<!-- Claude Hook Data (always enabled, not toggleable) -->
			<MockDataSection
				title="Claude Hook Data"
				description="Core session info: model, cwd, version"
			>
				<template #icon>
					<IconLucide-terminal class="size-3.5 shrink-0 text-muted-foreground" />
				</template>
				<HookDataForm />
			</MockDataSection>

			<!-- Git Info -->
			<MockDataSection
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
			</MockDataSection>

			<!-- Session Usage -->
			<MockDataSection
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
			</MockDataSection>

			<!-- Context Window -->
			<MockDataSection
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
			</MockDataSection>

			<!-- Metrics -->
			<MockDataSection
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
			</MockDataSection>

			<!-- Block / Rate -->
			<MockDataSection
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
			</MockDataSection>

			<!-- Today Usage -->
			<MockDataSection
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
			</MockDataSection>

			<!-- Rate Limits -->
			<MockDataSection
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
			</MockDataSection>
		</div>
	</div>
</template>
