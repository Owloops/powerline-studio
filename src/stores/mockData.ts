import { ref } from 'vue'
import { defineStore } from 'pinia'
import type {
	ClaudeHookData,
	GitInfo,
	UsageInfo,
	ContextInfo,
	MetricsInfo,
	BlockInfo,
	TodayInfo,
} from '@owloops/claude-powerline/browser'
// Side-effect imports: augment ClaudeHookData with `agent`, `effort`, and
// `thinking` slots ahead of PR #82 npm bump.
import '@/types/agent'
import '@/types/thinking'
import { DEFAULT_MOCK_DATA, MOCK_DATA_PRESETS } from '@/data/mockPresets'
import type { MockDataPreset } from '@/data/mockPresets'
import { deepMerge } from './utils'

export const useMockDataStore = defineStore('mockData', () => {
	// --- State ---

	const hookData = ref<ClaudeHookData>(structuredClone(DEFAULT_MOCK_DATA.hookData))
	const gitInfo = ref<GitInfo | null>(structuredClone(DEFAULT_MOCK_DATA.gitInfo))
	const usageInfo = ref<UsageInfo | null>(structuredClone(DEFAULT_MOCK_DATA.usageInfo))
	const contextInfo = ref<ContextInfo | null>(structuredClone(DEFAULT_MOCK_DATA.contextInfo))
	const metricsInfo = ref<MetricsInfo | null>(structuredClone(DEFAULT_MOCK_DATA.metricsInfo))
	const blockInfo = ref<BlockInfo | null>(structuredClone(DEFAULT_MOCK_DATA.blockInfo))
	const todayInfo = ref<TodayInfo | null>(structuredClone(DEFAULT_MOCK_DATA.todayInfo))
	const tmuxSessionId = ref<string | null>(DEFAULT_MOCK_DATA.tmuxSessionId)
	const activePreset = ref('default')

	// Tracks the last named preset (not 'custom') for re-enable restore logic.
	// When activePreset becomes 'custom', this still holds the original preset id.
	let _lastNamedPreset = 'default'

	// Flag to suppress custom-detection during preset application
	let _applyingPreset = false

	// --- Mutations ---

	function applyPreset(id: string) {
		const meta = MOCK_DATA_PRESETS.find((p) => p.id === id)
		if (!meta) return
		const preset = meta.factory()
		_applyingPreset = true
		hookData.value = structuredClone(preset.hookData)
		gitInfo.value = structuredClone(preset.gitInfo)
		usageInfo.value = structuredClone(preset.usageInfo)
		contextInfo.value = structuredClone(preset.contextInfo)
		metricsInfo.value = structuredClone(preset.metricsInfo)
		blockInfo.value = structuredClone(preset.blockInfo)
		todayInfo.value = structuredClone(preset.todayInfo)
		tmuxSessionId.value = preset.tmuxSessionId
		activePreset.value = id
		_lastNamedPreset = id
		_applyingPreset = false
	}

	function markCustom() {
		if (!_applyingPreset) {
			activePreset.value = 'custom'
		}
	}

	/** Returns preset data for re-enable restore. Uses last named preset,
	 *  falling back to DEFAULT_MOCK_DATA if preset has null for that section. */
	function getActivePresetData(): MockDataPreset {
		const meta = MOCK_DATA_PRESETS.find((p) => p.id === _lastNamedPreset)
		if (meta) return meta.factory()
		return structuredClone(DEFAULT_MOCK_DATA)
	}

	function updateHookData(patch: Partial<ClaudeHookData>) {
		hookData.value = deepMerge(hookData.value, patch)
		markCustom()
	}

	function updateGitInfo(patch: Partial<GitInfo>) {
		if (gitInfo.value) {
			gitInfo.value = deepMerge(gitInfo.value, patch)
			markCustom()
		}
	}

	function updateUsageInfo(patch: Partial<UsageInfo>) {
		if (usageInfo.value) {
			usageInfo.value = deepMerge(usageInfo.value, patch)
			markCustom()
		}
	}

	function updateContextInfo(patch: Partial<ContextInfo>) {
		if (contextInfo.value) {
			contextInfo.value = deepMerge(contextInfo.value, patch)
			markCustom()
		}
	}

	function updateMetricsInfo(patch: Partial<MetricsInfo>) {
		if (metricsInfo.value) {
			metricsInfo.value = deepMerge(metricsInfo.value, patch)
			markCustom()
		}
	}

	function updateBlockInfo(patch: Partial<BlockInfo>) {
		if (blockInfo.value) {
			blockInfo.value = deepMerge(blockInfo.value, patch)
			markCustom()
		}
	}

	function updateTodayInfo(patch: Partial<TodayInfo>) {
		if (todayInfo.value) {
			todayInfo.value = deepMerge(todayInfo.value, patch)
			markCustom()
		}
	}

	function setTmuxSessionId(id: string | null) {
		tmuxSessionId.value = id
		markCustom()
	}

	function $reset() {
		applyPreset('default')
	}

	return {
		hookData,
		gitInfo,
		usageInfo,
		contextInfo,
		metricsInfo,
		blockInfo,
		todayInfo,
		tmuxSessionId,
		activePreset,
		// Mutations
		applyPreset,
		markCustom,
		getActivePresetData,
		updateHookData,
		updateGitInfo,
		updateUsageInfo,
		updateContextInfo,
		updateMetricsInfo,
		updateBlockInfo,
		updateTodayInfo,
		setTmuxSessionId,
		$reset,
	}
})
