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
import { deepMerge } from './utils'

// --- Default mock data (matching preview.sh sample values) ---

const DEFAULT_HOOK_DATA: ClaudeHookData = {
	hook_event_name: 'prompt',
	session_id: 'mock-session-001',
	transcript_path: '/tmp/mock-transcript.jsonl',
	cwd: '~/my-project',
	model: {
		id: 'claude-sonnet-4-20250514',
		display_name: 'Sonnet 4',
	},
	workspace: {
		current_dir: '~/my-project',
		project_dir: '~/my-project',
	},
	version: '1.0.0',
	cost: {
		total_cost_usd: 2.85,
		total_duration_ms: 270 * 60 * 1000,
		total_api_duration_ms: 13000,
		total_lines_added: 342,
		total_lines_removed: 87,
	},
	context_window: {
		total_input_tokens: 60000,
		total_output_tokens: 24000,
		context_window_size: 200000,
		used_percentage: 42,
		remaining_percentage: 58,
		current_usage: {
			input_tokens: 60000,
			output_tokens: 24000,
			cache_creation_input_tokens: 0,
			cache_read_input_tokens: 0,
		},
	},
}

const DEFAULT_GIT_INFO: GitInfo = {
	branch: 'feat/my-feature',
	status: 'dirty',
	ahead: 0,
	behind: 0,
	staged: 1,
	unstaged: 1,
	untracked: 1,
}

const DEFAULT_USAGE_INFO: UsageInfo = {
	session: {
		cost: 2.85,
		calculatedCost: 2.85,
		officialCost: null,
		tokens: 84000,
		tokenBreakdown: {
			input: 60000,
			output: 24000,
			cacheCreation: 0,
			cacheRead: 0,
		},
	},
}

const DEFAULT_CONTEXT_INFO: ContextInfo = {
	totalTokens: 84000,
	percentage: 42,
	usablePercentage: 42,
	contextLeftPercentage: 58,
	maxTokens: 200000,
	usableTokens: 116000,
}

const DEFAULT_METRICS_INFO: MetricsInfo = {
	responseTime: 13,
	lastResponseTime: 13,
	sessionDuration: 270,
	messageCount: 24,
	linesAdded: 342,
	linesRemoved: 87,
}

const DEFAULT_BLOCK_INFO: BlockInfo = {
	nativeUtilization: 35,
	timeRemaining: 258,
}

const DEFAULT_TODAY_INFO: TodayInfo = {
	cost: 12.4,
	tokens: 450000,
	tokenBreakdown: {
		input: 300000,
		output: 150000,
		cacheCreation: 0,
		cacheRead: 0,
	},
	date: new Date().toISOString().split('T')[0]!,
}

// --- Presets ---

interface MockPreset {
	hookData: ClaudeHookData
	gitInfo: GitInfo | null
	usageInfo: UsageInfo | null
	contextInfo: ContextInfo | null
	metricsInfo: MetricsInfo | null
	blockInfo: BlockInfo | null
	todayInfo: TodayInfo | null
	tmuxSessionId: string | null
}

const PRESETS: Record<string, MockPreset> = {
	default: {
		hookData: DEFAULT_HOOK_DATA,
		gitInfo: DEFAULT_GIT_INFO,
		usageInfo: DEFAULT_USAGE_INFO,
		contextInfo: DEFAULT_CONTEXT_INFO,
		metricsInfo: DEFAULT_METRICS_INFO,
		blockInfo: DEFAULT_BLOCK_INFO,
		todayInfo: DEFAULT_TODAY_INFO,
		tmuxSessionId: 'studio-preview',
	},
	minimal: {
		hookData: {
			hook_event_name: 'prompt',
			session_id: 'mock-session-002',
			transcript_path: '/tmp/mock-transcript.jsonl',
			cwd: '~/project',
			model: {
				id: 'claude-sonnet-4-20250514',
				display_name: 'Sonnet 4',
			},
			workspace: {
				current_dir: '~/project',
				project_dir: '~/project',
			},
			version: '1.0.0',
			cost: {
				total_cost_usd: 0.12,
				total_duration_ms: 5 * 60 * 1000,
				total_api_duration_ms: 3000,
				total_lines_added: 12,
				total_lines_removed: 3,
			},
			context_window: {
				total_input_tokens: 5000,
				total_output_tokens: 2000,
				context_window_size: 200000,
				used_percentage: 3.5,
				remaining_percentage: 96.5,
				current_usage: {
					input_tokens: 5000,
					output_tokens: 2000,
					cache_creation_input_tokens: 0,
					cache_read_input_tokens: 0,
				},
			},
		},
		gitInfo: {
			branch: 'main',
			status: 'clean',
			ahead: 0,
			behind: 0,
		},
		usageInfo: {
			session: {
				cost: 0.12,
				calculatedCost: 0.12,
				officialCost: null,
				tokens: 7000,
				tokenBreakdown: {
					input: 5000,
					output: 2000,
					cacheCreation: 0,
					cacheRead: 0,
				},
			},
		},
		contextInfo: {
			totalTokens: 7000,
			percentage: 3.5,
			usablePercentage: 3.5,
			contextLeftPercentage: 96.5,
			maxTokens: 200000,
			usableTokens: 193000,
		},
		metricsInfo: {
			responseTime: 3,
			lastResponseTime: 3,
			sessionDuration: 5,
			messageCount: 2,
			linesAdded: 12,
			linesRemoved: 3,
		},
		blockInfo: null,
		todayInfo: {
			cost: 0.12,
			tokens: 7000,
			tokenBreakdown: {
				input: 5000,
				output: 2000,
				cacheCreation: 0,
				cacheRead: 0,
			},
			date: new Date().toISOString().split('T')[0]!,
		},
		tmuxSessionId: null,
	},
	heavy: {
		hookData: {
			hook_event_name: 'prompt',
			session_id: 'mock-session-003',
			transcript_path: '/tmp/mock-transcript.jsonl',
			cwd: '~/large-monorepo',
			model: {
				id: 'claude-opus-4-20250514',
				display_name: 'Opus 4',
			},
			workspace: {
				current_dir: '~/large-monorepo',
				project_dir: '~/large-monorepo',
			},
			version: '1.0.0',
			cost: {
				total_cost_usd: 28.5,
				total_duration_ms: 480 * 60 * 1000,
				total_api_duration_ms: 45000,
				total_lines_added: 2450,
				total_lines_removed: 890,
			},
			context_window: {
				total_input_tokens: 150000,
				total_output_tokens: 30000,
				context_window_size: 200000,
				used_percentage: 90,
				remaining_percentage: 10,
				current_usage: {
					input_tokens: 150000,
					output_tokens: 30000,
					cache_creation_input_tokens: 0,
					cache_read_input_tokens: 0,
				},
			},
		},
		gitInfo: {
			branch: 'refactor/massive-rewrite',
			status: 'dirty',
			ahead: 12,
			behind: 3,
			staged: 8,
			unstaged: 15,
			untracked: 4,
		},
		usageInfo: {
			session: {
				cost: 28.5,
				calculatedCost: 28.5,
				officialCost: null,
				tokens: 180000,
				tokenBreakdown: {
					input: 150000,
					output: 30000,
					cacheCreation: 0,
					cacheRead: 0,
				},
			},
		},
		contextInfo: {
			totalTokens: 180000,
			percentage: 90,
			usablePercentage: 90,
			contextLeftPercentage: 10,
			maxTokens: 200000,
			usableTokens: 20000,
		},
		metricsInfo: {
			responseTime: 45,
			lastResponseTime: 45,
			sessionDuration: 480,
			messageCount: 85,
			linesAdded: 2450,
			linesRemoved: 890,
		},
		blockInfo: {
			nativeUtilization: 65,
			timeRemaining: 120,
		},
		todayInfo: {
			cost: 45.0,
			tokens: 1200000,
			tokenBreakdown: {
				input: 900000,
				output: 300000,
				cacheCreation: 0,
				cacheRead: 0,
			},
			date: new Date().toISOString().split('T')[0]!,
		},
		tmuxSessionId: 'prod-session',
	},
	'rate-limited': {
		hookData: {
			hook_event_name: 'prompt',
			session_id: 'mock-session-004',
			transcript_path: '/tmp/mock-transcript.jsonl',
			cwd: '~/my-project',
			model: {
				id: 'claude-opus-4-20250514',
				display_name: 'Opus 4',
			},
			workspace: {
				current_dir: '~/my-project',
				project_dir: '~/my-project',
			},
			version: '1.0.0',
			cost: {
				total_cost_usd: 15.0,
				total_duration_ms: 300 * 60 * 1000,
				total_api_duration_ms: 25000,
				total_lines_added: 500,
				total_lines_removed: 200,
			},
			context_window: {
				total_input_tokens: 120000,
				total_output_tokens: 30000,
				context_window_size: 200000,
				used_percentage: 75,
				remaining_percentage: 25,
				current_usage: {
					input_tokens: 120000,
					output_tokens: 30000,
					cache_creation_input_tokens: 0,
					cache_read_input_tokens: 0,
				},
			},
			rate_limits: {
				five_hour: {
					used_percentage: 87,
					resets_at: Date.now() + 18 * 60 * 1000,
				},
			},
		},
		gitInfo: {
			branch: 'feat/api-integration',
			status: 'dirty',
			ahead: 2,
			behind: 0,
			staged: 3,
			unstaged: 2,
			untracked: 0,
		},
		usageInfo: {
			session: {
				cost: 15.0,
				calculatedCost: 15.0,
				officialCost: null,
				tokens: 150000,
				tokenBreakdown: {
					input: 120000,
					output: 30000,
					cacheCreation: 0,
					cacheRead: 0,
				},
			},
		},
		contextInfo: {
			totalTokens: 150000,
			percentage: 75,
			usablePercentage: 75,
			contextLeftPercentage: 25,
			maxTokens: 200000,
			usableTokens: 50000,
		},
		metricsInfo: {
			responseTime: 25,
			lastResponseTime: 25,
			sessionDuration: 300,
			messageCount: 48,
			linesAdded: 500,
			linesRemoved: 200,
		},
		blockInfo: {
			nativeUtilization: 87,
			timeRemaining: 18,
		},
		todayInfo: {
			cost: 32.0,
			tokens: 850000,
			tokenBreakdown: {
				input: 600000,
				output: 250000,
				cacheCreation: 0,
				cacheRead: 0,
			},
			date: new Date().toISOString().split('T')[0]!,
		},
		tmuxSessionId: 'rate-check',
	},
}

export const useMockDataStore = defineStore('mockData', () => {
	// --- State ---

	const hookData = ref<ClaudeHookData>(structuredClone(DEFAULT_HOOK_DATA))
	const gitInfo = ref<GitInfo | null>(structuredClone(DEFAULT_GIT_INFO))
	const usageInfo = ref<UsageInfo | null>(structuredClone(DEFAULT_USAGE_INFO))
	const contextInfo = ref<ContextInfo | null>(structuredClone(DEFAULT_CONTEXT_INFO))
	const metricsInfo = ref<MetricsInfo | null>(structuredClone(DEFAULT_METRICS_INFO))
	const blockInfo = ref<BlockInfo | null>(structuredClone(DEFAULT_BLOCK_INFO))
	const todayInfo = ref<TodayInfo | null>(structuredClone(DEFAULT_TODAY_INFO))
	const tmuxSessionId = ref<string | null>('studio-preview')
	const activePreset = ref('default')

	// --- Mutations ---

	function applyPreset(name: string) {
		const preset = PRESETS[name]
		if (!preset) return
		hookData.value = structuredClone(preset.hookData)
		gitInfo.value = structuredClone(preset.gitInfo)
		usageInfo.value = structuredClone(preset.usageInfo)
		contextInfo.value = structuredClone(preset.contextInfo)
		metricsInfo.value = structuredClone(preset.metricsInfo)
		blockInfo.value = structuredClone(preset.blockInfo)
		todayInfo.value = structuredClone(preset.todayInfo)
		tmuxSessionId.value = preset.tmuxSessionId
		activePreset.value = name
	}

	function updateHookData(patch: Partial<ClaudeHookData>) {
		hookData.value = deepMerge(hookData.value, patch)
	}

	function updateGitInfo(patch: Partial<GitInfo>) {
		if (gitInfo.value) {
			gitInfo.value = deepMerge(gitInfo.value, patch)
		}
	}

	function updateUsageInfo(patch: Partial<UsageInfo>) {
		if (usageInfo.value) {
			usageInfo.value = deepMerge(usageInfo.value, patch)
		}
	}

	function updateContextInfo(patch: Partial<ContextInfo>) {
		if (contextInfo.value) {
			contextInfo.value = deepMerge(contextInfo.value, patch)
		}
	}

	function updateMetricsInfo(patch: Partial<MetricsInfo>) {
		if (metricsInfo.value) {
			metricsInfo.value = deepMerge(metricsInfo.value, patch)
		}
	}

	function updateBlockInfo(patch: Partial<BlockInfo>) {
		if (blockInfo.value) {
			blockInfo.value = deepMerge(blockInfo.value, patch)
		}
	}

	function updateTodayInfo(patch: Partial<TodayInfo>) {
		if (todayInfo.value) {
			todayInfo.value = deepMerge(todayInfo.value, patch)
		}
	}

	function setTmuxSessionId(id: string | null) {
		tmuxSessionId.value = id
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
