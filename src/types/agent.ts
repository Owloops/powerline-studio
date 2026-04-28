// Mirrors @owloops/claude-powerline AgentSegmentConfig — switch to import post-bump
// Module augmentation lets the studio reference `agent` on upstream types
// (ColorTheme, ClaudeHookData) before PR #82 lands in npm.
// Once the dep is bumped, delete this file and import the upstream types directly.

import type { SegmentColor } from '@owloops/claude-powerline/browser'

export interface AgentSegmentConfig {
	enabled: boolean
	showLabel?: boolean
}

declare module '@owloops/claude-powerline/browser' {
	interface ColorTheme {
		agent: SegmentColor
	}

	interface ClaudeHookData {
		agent?: {
			name?: string
		}
	}
}
