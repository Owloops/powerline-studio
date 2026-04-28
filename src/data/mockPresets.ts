import type {
	ClaudeHookData,
	GitInfo,
	UsageInfo,
	ContextInfo,
	MetricsInfo,
	BlockInfo,
	TodayInfo,
} from '@owloops/claude-powerline/browser'

export interface MockDataPreset {
	hookData: ClaudeHookData
	gitInfo: GitInfo | null
	usageInfo: UsageInfo | null
	contextInfo: ContextInfo | null
	metricsInfo: MetricsInfo | null
	blockInfo: BlockInfo | null
	todayInfo: TodayInfo | null
	tmuxSessionId: string | null
	cacheTimerElapsedSeconds: number | null
}

export interface PresetMeta {
	id: string
	name: string
	description: string
	factory: () => MockDataPreset
}

function todayDate(): string {
	const d = new Date()
	const year = d.getFullYear()
	const month = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

function resetAtFromNow(minutes: number): number {
	return Math.floor((Date.now() + minutes * 60 * 1000) / 1000)
}

// --- Default Preset ---

function createDefaultPreset(): MockDataPreset {
	const now = todayDate()
	return {
		hookData: {
			hook_event_name: 'prompt',
			session_id: 'preview-123',
			transcript_path: '/tmp/mock-transcript.jsonl',
			cwd: '/home/user/my-project',
			model: {
				id: 'claude-sonnet-4-20250514',
				display_name: 'Sonnet 4',
			},
			workspace: {
				current_dir: '/home/user/my-project',
				project_dir: '/home/user/my-project',
			},
			version: '1.0.47',
			cost: {
				total_cost_usd: 2.85,
				total_duration_ms: 16200000,
				total_api_duration_ms: 480000,
				total_lines_added: 342,
				total_lines_removed: 87,
			},
			context_window: {
				total_input_tokens: 72000,
				total_output_tokens: 12000,
				context_window_size: 200000,
				used_percentage: 42,
				remaining_percentage: 58,
				current_usage: {
					input_tokens: 72000,
					output_tokens: 12000,
					cache_creation_input_tokens: 15000,
					cache_read_input_tokens: 8000,
				},
			},
			rate_limits: {
				five_hour: {
					used_percentage: 35,
					resets_at: resetAtFromNow(258),
				},
				seven_day: {
					used_percentage: 28,
					resets_at: resetAtFromNow(4320),
				},
			},
		},
		gitInfo: {
			branch: 'feat/my-feature',
			status: 'dirty',
			ahead: 3,
			behind: 1,
			staged: 2,
			unstaged: 3,
			untracked: 1,
			sha: 'a1b2c3d',
			tag: 'v1.2.0',
			timeSinceCommit: 300,
			stashCount: 2,
			upstream: 'origin/feat/my-feature',
			repoName: 'my-project',
		},
		usageInfo: {
			session: {
				cost: 2.85,
				calculatedCost: 2.85,
				officialCost: null,
				tokens: 107000,
				tokenBreakdown: {
					input: 72000,
					output: 12000,
					cacheCreation: 15000,
					cacheRead: 8000,
				},
			},
		},
		contextInfo: {
			totalTokens: 84000,
			percentage: 42,
			usablePercentage: 50,
			contextLeftPercentage: 50,
			maxTokens: 200000,
			usableTokens: 167000,
		},
		metricsInfo: {
			responseTime: 480,
			lastResponseTime: 12,
			sessionDuration: 16200,
			messageCount: 24,
			linesAdded: 342,
			linesRemoved: 87,
		},
		blockInfo: {
			nativeUtilization: 35,
			timeRemaining: 258,
		},
		todayInfo: {
			cost: 12.4,
			tokens: 450000,
			tokenBreakdown: {
				input: 300000,
				output: 150000,
				cacheCreation: 0,
				cacheRead: 0,
			},
			date: now,
		},
		tmuxSessionId: 'studio-preview',
		cacheTimerElapsedSeconds: 0,
	}
}

// --- Minimal Session ---

function createMinimalPreset(): MockDataPreset {
	const now = todayDate()
	return {
		hookData: {
			hook_event_name: 'prompt',
			session_id: 'mock-session-minimal',
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
			version: '1.0.47',
			cost: {
				total_cost_usd: 0.02,
				total_duration_ms: 120000,
				total_api_duration_ms: 3000,
				total_lines_added: 5,
				total_lines_removed: 0,
			},
			context_window: {
				total_input_tokens: 3000,
				total_output_tokens: 800,
				context_window_size: 200000,
				used_percentage: 2,
				remaining_percentage: 98,
				current_usage: {
					input_tokens: 3000,
					output_tokens: 800,
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
				cost: 0.02,
				calculatedCost: 0.02,
				officialCost: null,
				tokens: 3800,
				tokenBreakdown: {
					input: 3000,
					output: 800,
					cacheCreation: 0,
					cacheRead: 0,
				},
			},
		},
		contextInfo: {
			totalTokens: 3800,
			percentage: 2,
			usablePercentage: 2,
			contextLeftPercentage: 98,
			maxTokens: 200000,
			usableTokens: 167000,
		},
		metricsInfo: null,
		blockInfo: null,
		todayInfo: {
			cost: 0.02,
			tokens: 3800,
			tokenBreakdown: {
				input: 3000,
				output: 800,
				cacheCreation: 0,
				cacheRead: 0,
			},
			date: now,
		},
		tmuxSessionId: null,
		cacheTimerElapsedSeconds: 0,
	}
}

// --- Heavy Session ---

function createHeavyPreset(): MockDataPreset {
	const now = todayDate()
	return {
		hookData: {
			hook_event_name: 'prompt',
			session_id: 'mock-session-heavy',
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
			version: '1.0.47',
			cost: {
				total_cost_usd: 28.5,
				total_duration_ms: 28800000,
				total_api_duration_ms: 2700000,
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
					cache_creation_input_tokens: 20000,
					cache_read_input_tokens: 35000,
				},
			},
			rate_limits: {
				five_hour: {
					used_percentage: 72,
					resets_at: resetAtFromNow(90),
				},
				seven_day: {
					used_percentage: 55,
					resets_at: resetAtFromNow(2880),
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
				tokens: 235000,
				tokenBreakdown: {
					input: 150000,
					output: 30000,
					cacheCreation: 20000,
					cacheRead: 35000,
				},
			},
		},
		contextInfo: {
			totalTokens: 180000,
			percentage: 90,
			usablePercentage: 108,
			contextLeftPercentage: 0,
			maxTokens: 200000,
			usableTokens: 167000,
		},
		metricsInfo: {
			responseTime: 2700,
			lastResponseTime: 45,
			sessionDuration: 28800,
			messageCount: 85,
			linesAdded: 2450,
			linesRemoved: 890,
		},
		blockInfo: {
			nativeUtilization: 72,
			timeRemaining: 90,
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
			date: now,
		},
		tmuxSessionId: 'prod-session',
		cacheTimerElapsedSeconds: 0,
	}
}

// --- Rate Limited ---

function createRateLimitedPreset(): MockDataPreset {
	const now = todayDate()
	return {
		hookData: {
			hook_event_name: 'prompt',
			session_id: 'mock-session-ratelimit',
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
			version: '1.0.47',
			cost: {
				total_cost_usd: 15.0,
				total_duration_ms: 18000000,
				total_api_duration_ms: 1500000,
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
					used_percentage: 95,
					resets_at: resetAtFromNow(8),
				},
				seven_day: {
					used_percentage: 82,
					resets_at: resetAtFromNow(1440),
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
			usablePercentage: 90,
			contextLeftPercentage: 10,
			maxTokens: 200000,
			usableTokens: 167000,
		},
		metricsInfo: {
			responseTime: 1500,
			lastResponseTime: 25,
			sessionDuration: 18000,
			messageCount: 48,
			linesAdded: 500,
			linesRemoved: 200,
		},
		blockInfo: {
			nativeUtilization: 95,
			timeRemaining: 8,
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
			date: now,
		},
		tmuxSessionId: 'rate-check',
		cacheTimerElapsedSeconds: 0,
	}
}

// --- Large Context ---

function createLargeContextPreset(): MockDataPreset {
	const now = todayDate()
	return {
		hookData: {
			hook_event_name: 'prompt',
			session_id: 'mock-session-context',
			transcript_path: '/tmp/mock-transcript.jsonl',
			cwd: '~/big-project',
			model: {
				id: 'claude-sonnet-4-20250514',
				display_name: 'Sonnet 4',
			},
			workspace: {
				current_dir: '~/big-project',
				project_dir: '~/big-project',
			},
			version: '1.0.47',
			cost: {
				total_cost_usd: 8.5,
				total_duration_ms: 10800000,
				total_api_duration_ms: 900000,
				total_lines_added: 180,
				total_lines_removed: 45,
			},
			context_window: {
				total_input_tokens: 165000,
				total_output_tokens: 20000,
				context_window_size: 200000,
				used_percentage: 96,
				remaining_percentage: 4,
				current_usage: {
					input_tokens: 165000,
					output_tokens: 20000,
					cache_creation_input_tokens: 5000,
					cache_read_input_tokens: 2000,
				},
			},
			rate_limits: {
				five_hour: {
					used_percentage: 50,
					resets_at: resetAtFromNow(180),
				},
				seven_day: {
					used_percentage: 35,
					resets_at: resetAtFromNow(4000),
				},
			},
		},
		gitInfo: {
			branch: 'fix/memory-leak',
			status: 'dirty',
			ahead: 1,
			behind: 0,
			staged: 2,
			unstaged: 1,
			untracked: 0,
		},
		usageInfo: {
			session: {
				cost: 8.5,
				calculatedCost: 8.5,
				officialCost: null,
				tokens: 192000,
				tokenBreakdown: {
					input: 165000,
					output: 20000,
					cacheCreation: 5000,
					cacheRead: 2000,
				},
			},
		},
		contextInfo: {
			totalTokens: 192000,
			percentage: 96,
			usablePercentage: 115,
			contextLeftPercentage: 0,
			maxTokens: 200000,
			usableTokens: 167000,
		},
		metricsInfo: {
			responseTime: 900,
			lastResponseTime: 18,
			sessionDuration: 10800,
			messageCount: 35,
			linesAdded: 180,
			linesRemoved: 45,
		},
		blockInfo: {
			nativeUtilization: 50,
			timeRemaining: 180,
		},
		todayInfo: {
			cost: 18.0,
			tokens: 600000,
			tokenBreakdown: {
				input: 450000,
				output: 150000,
				cacheCreation: 0,
				cacheRead: 0,
			},
			date: now,
		},
		tmuxSessionId: 'studio-preview',
		cacheTimerElapsedSeconds: 0,
	}
}

// --- Git Merge Conflict ---

function createGitMergeConflictPreset(): MockDataPreset {
	const now = todayDate()
	return {
		hookData: {
			hook_event_name: 'prompt',
			session_id: 'mock-session-merge',
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
			version: '1.0.47',
			cost: {
				total_cost_usd: 1.2,
				total_duration_ms: 3600000,
				total_api_duration_ms: 120000,
				total_lines_added: 45,
				total_lines_removed: 20,
			},
			context_window: {
				total_input_tokens: 40000,
				total_output_tokens: 8000,
				context_window_size: 200000,
				used_percentage: 24,
				remaining_percentage: 76,
				current_usage: {
					input_tokens: 40000,
					output_tokens: 8000,
					cache_creation_input_tokens: 2000,
					cache_read_input_tokens: 1000,
				},
			},
		},
		gitInfo: {
			branch: 'feat/new-api',
			status: 'conflicts',
			ahead: 3,
			behind: 5,
			staged: 2,
			unstaged: 4,
			untracked: 1,
			conflicts: 3,
			operation: 'MERGE',
			upstream: 'origin/feat/new-api',
			repoName: 'my-project',
		},
		usageInfo: {
			session: {
				cost: 1.2,
				calculatedCost: 1.2,
				officialCost: null,
				tokens: 51000,
				tokenBreakdown: {
					input: 40000,
					output: 8000,
					cacheCreation: 2000,
					cacheRead: 1000,
				},
			},
		},
		contextInfo: {
			totalTokens: 48000,
			percentage: 24,
			usablePercentage: 29,
			contextLeftPercentage: 71,
			maxTokens: 200000,
			usableTokens: 167000,
		},
		metricsInfo: {
			responseTime: 120,
			lastResponseTime: 8,
			sessionDuration: 3600,
			messageCount: 12,
			linesAdded: 45,
			linesRemoved: 20,
		},
		blockInfo: null,
		todayInfo: {
			cost: 5.0,
			tokens: 200000,
			tokenBreakdown: {
				input: 150000,
				output: 50000,
				cacheCreation: 0,
				cacheRead: 0,
			},
			date: now,
		},
		tmuxSessionId: 'studio-preview',
		cacheTimerElapsedSeconds: 0,
	}
}

// --- Long Running ---

function createLongRunningPreset(): MockDataPreset {
	const now = todayDate()
	return {
		hookData: {
			hook_event_name: 'prompt',
			session_id: 'mock-session-long',
			transcript_path: '/tmp/mock-transcript.jsonl',
			cwd: '~/enterprise-app',
			model: {
				id: 'claude-opus-4-20250514',
				display_name: 'Opus 4',
			},
			workspace: {
				current_dir: '~/enterprise-app',
				project_dir: '~/enterprise-app',
			},
			version: '1.0.47',
			cost: {
				total_cost_usd: 42.0,
				total_duration_ms: 43200000,
				total_api_duration_ms: 3600000,
				total_lines_added: 3200,
				total_lines_removed: 1400,
			},
			context_window: {
				total_input_tokens: 100000,
				total_output_tokens: 25000,
				context_window_size: 200000,
				used_percentage: 62,
				remaining_percentage: 38,
				current_usage: {
					input_tokens: 100000,
					output_tokens: 25000,
					cache_creation_input_tokens: 10000,
					cache_read_input_tokens: 15000,
				},
			},
			rate_limits: {
				five_hour: {
					used_percentage: 60,
					resets_at: resetAtFromNow(150),
				},
				seven_day: {
					used_percentage: 70,
					resets_at: resetAtFromNow(2000),
				},
			},
		},
		gitInfo: {
			branch: 'feat/complete-overhaul',
			status: 'dirty',
			ahead: 25,
			behind: 0,
			staged: 12,
			unstaged: 8,
			untracked: 3,
			tag: 'v2.0.0-beta.1',
			sha: 'a1b2c3d',
			timeSinceCommit: 1800,
			stashCount: 2,
			upstream: 'origin/feat/complete-overhaul',
			repoName: 'enterprise-app',
		},
		usageInfo: {
			session: {
				cost: 42.0,
				calculatedCost: 42.0,
				officialCost: null,
				tokens: 150000,
				tokenBreakdown: {
					input: 100000,
					output: 25000,
					cacheCreation: 10000,
					cacheRead: 15000,
				},
			},
		},
		contextInfo: {
			totalTokens: 125000,
			percentage: 62,
			usablePercentage: 75,
			contextLeftPercentage: 25,
			maxTokens: 200000,
			usableTokens: 167000,
		},
		metricsInfo: {
			responseTime: 3600,
			lastResponseTime: 30,
			sessionDuration: 43200,
			messageCount: 120,
			linesAdded: 3200,
			linesRemoved: 1400,
		},
		blockInfo: {
			nativeUtilization: 60,
			timeRemaining: 150,
		},
		todayInfo: {
			cost: 65.0,
			tokens: 2000000,
			tokenBreakdown: {
				input: 1500000,
				output: 500000,
				cacheCreation: 0,
				cacheRead: 0,
			},
			date: now,
		},
		tmuxSessionId: 'long-session',
		cacheTimerElapsedSeconds: 0,
	}
}

// --- Exports ---

export const DEFAULT_MOCK_DATA: MockDataPreset = createDefaultPreset()

export const MOCK_DATA_PRESETS: PresetMeta[] = [
	{
		id: 'default',
		name: 'Default',
		description: 'Active session, moderate values',
		factory: createDefaultPreset,
	},
	{
		id: 'minimal',
		name: 'Minimal Session',
		description: 'Fresh start, clean git',
		factory: createMinimalPreset,
	},
	{
		id: 'heavy',
		name: 'Heavy Session',
		description: 'High cost, high context usage',
		factory: createHeavyPreset,
	},
	{
		id: 'rate-limited',
		name: 'Rate Limited',
		description: 'Near or at rate limits',
		factory: createRateLimitedPreset,
	},
	{
		id: 'large-context',
		name: 'Large Context',
		description: 'Near context capacity',
		factory: createLargeContextPreset,
	},
	{
		id: 'git-merge-conflict',
		name: 'Git Merge Conflict',
		description: 'Mid-merge with conflicts',
		factory: createGitMergeConflictPreset,
	},
	{
		id: 'long-running',
		name: 'Long Running',
		description: 'Extended session, high metrics',
		factory: createLongRunningPreset,
	},
]
