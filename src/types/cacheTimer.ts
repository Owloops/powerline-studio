// Mirrors @owloops/claude-powerline CacheTimerSegmentConfig — switch to import post-bump
// Module augmentation lets the studio reference `cacheTimer` on upstream types
// (ColorTheme) before PR #82 lands in npm. Once the dep is bumped, delete this file
// and import the upstream types directly.
//
// Note: cacheTimer is computed from `transcript_path` upstream, but the studio runs
// in the browser (no fs access) so 027h synthesizes CacheTimerInfo from a single
// `cacheTimerElapsedSeconds` mock value instead. No ClaudeHookData augmentation is
// required for this segment.

import type { SegmentColor } from '@owloops/claude-powerline/browser'

export interface CacheTimerSegmentConfig {
	enabled: boolean
}

declare module '@owloops/claude-powerline/browser' {
	interface ColorTheme {
		cacheTimer: SegmentColor
	}
}
