<script setup lang="ts">
import { DEFAULT_MOCK_DATA } from '@/data/mockPresets'
import MockDataSection from './MockDataSection.vue'
import HookDataForm from './HookDataForm.vue'
import GitInfoForm from './GitInfoForm.vue'
import UsageInfoForm from './UsageInfoForm.vue'
import ContextInfoForm from './ContextInfoForm.vue'
import MetricsInfoForm from './MetricsInfoForm.vue'
import BlockInfoForm from './BlockInfoForm.vue'
import TodayInfoForm from './TodayInfoForm.vue'
import RateLimitsForm from './RateLimitsForm.vue'

const store = useMockDataStore()

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
	<div class="flex flex-col gap-2">
		<MockDataSection
			title="Claude Hook Data"
			description="Core session info: model, cwd, version"
			:enabled="true"
		>
			<template #icon>
				<IconLucide-terminal class="size-3.5 shrink-0 text-muted-foreground" />
			</template>
			<HookDataForm />
		</MockDataSection>

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
</template>
