import type { Component } from 'vue'
import type { LineConfig } from '@owloops/claude-powerline/browser'
import type { AgentSegmentConfig } from '@/types/agent'
import {
	Activity,
	Bot,
	Brain,
	CalendarDays,
	CalendarRange,
	DollarSign,
	FolderOpen,
	Gauge,
	GitBranch,
	Hash,
	Sparkles,
	Tag,
	Terminal,
	Variable,
} from 'lucide-vue-next'

export const SEGMENT_KEYS = [
	'directory',
	'git',
	'model',
	'session',
	'today',
	'block',
	'weekly',
	'version',
	'tmux',
	'sessionId',
	'context',
	'metrics',
	'env',
	'agent',
] as const

export type SegmentKey = (typeof SEGMENT_KEYS)[number]

// Mirrors @owloops/claude-powerline LineConfig['segments'] with the upcoming
// `agent` slot from PR #82 added — switch to the upstream type post-bump.
export type StudioSegmentsMap = LineConfig['segments'] & {
	agent?: AgentSegmentConfig
}

export interface SegmentMeta {
	name: string
	icon: Component
}

export const SEGMENT_META: Record<SegmentKey, SegmentMeta> = {
	directory: { name: 'Directory', icon: FolderOpen },
	git: { name: 'Git', icon: GitBranch },
	model: { name: 'Model', icon: Bot },
	session: { name: 'Session', icon: DollarSign },
	today: { name: 'Today', icon: CalendarDays },
	block: { name: 'Block', icon: Gauge },
	weekly: { name: 'Weekly', icon: CalendarRange },
	version: { name: 'Version', icon: Tag },
	tmux: { name: 'Tmux', icon: Terminal },
	sessionId: { name: 'Session ID', icon: Hash },
	context: { name: 'Context', icon: Brain },
	metrics: { name: 'Metrics', icon: Activity },
	env: { name: 'Environment', icon: Variable },
	agent: { name: 'Agent', icon: Sparkles },
}

/**
 * Canonical defaults for all 13 segment types.
 * Re-exported from useConfigStore's SEGMENT_DEFAULTS for consistency.
 */
export { SEGMENT_DEFAULTS } from '@/stores/config'

type SegmentsMap = StudioSegmentsMap

/**
 * Normalizes a sparse segments object to always have all canonical keys.
 * Preserves existing key order for keys present in the input,
 * then appends missing keys in canonical order with defaults.
 */
export function normalizeSegments(
	sparse: SegmentsMap,
	defaults: Required<SegmentsMap>,
): Required<SegmentsMap> {
	const result = {} as Record<string, unknown>
	const existingKeys = new Set(Object.keys(sparse))

	// Preserve existing key order and values
	for (const key of existingKeys) {
		result[key] = sparse[key as keyof SegmentsMap]
	}

	// Append missing keys in canonical order with defaults
	for (const key of SEGMENT_KEYS) {
		if (!existingKeys.has(key)) {
			result[key] = structuredClone(defaults[key])
		}
	}

	return result as Required<SegmentsMap>
}

/**
 * Type guard to check if a string is a valid SegmentKey.
 */
export function isSegmentKey(key: string): key is SegmentKey {
	return (SEGMENT_KEYS as readonly string[]).includes(key)
}
