// Mirrors @owloops/claude-powerline worktree hookData shape — switch to import post-bump.
// Module augmentation lets the studio reference `worktree` on ClaudeHookData
// before PR #82 lands in npm. Once the dep is bumped, delete this file and import
// the upstream types directly.

declare module '@owloops/claude-powerline/browser' {
	interface ClaudeHookData {
		worktree?: {
			name?: string
			path?: string
			branch?: string
			original_cwd?: string
			original_branch?: string
		}
	}
}

export {}
