// Mirrors @owloops/claude-powerline PR #82 — switch to upstream types post-bump.
// Module augmentation lets the studio reference `display.showIcons` and the
// per-segment `showIcon` override before PR #82 lands in npm.
// Once the dep is bumped, delete this file.

declare module '@owloops/claude-powerline/browser' {
	interface DisplayConfig {
		showIcons?: boolean
	}

	interface SegmentConfig {
		showIcon?: boolean
	}
}

export {}
