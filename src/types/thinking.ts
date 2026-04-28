// Mirrors @owloops/claude-powerline ThinkingSegmentConfig — switch to import post-bump.
// Module augmentation lets the studio reference `thinking` on upstream types
// (ColorTheme, ClaudeHookData) plus `effort` on ClaudeHookData before PR #82
// lands in npm. Once the dep is bumped, delete this file and import the upstream
// types directly.

import type { SegmentColor } from '@owloops/claude-powerline/browser'

export interface ThinkingSegmentConfig {
	enabled: boolean
	showEnabled?: boolean
	showEffort?: boolean
	showIcon?: boolean
}

declare module '@owloops/claude-powerline/browser' {
	interface ColorTheme {
		thinking: SegmentColor
	}

	interface ClaudeHookData {
		effort?: {
			level?: string
		}
		thinking?: {
			enabled?: boolean
		}
	}
}
