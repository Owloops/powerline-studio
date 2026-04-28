// Mirrors @owloops/claude-powerline PR #82 — switch to upstream types post-bump.
// Module augmentation lets the studio reference `showPercentage` / `showValue`
// on BudgetItemConfig before PR #82 lands in npm. Once the dep is bumped,
// delete this file.

declare module '@owloops/claude-powerline/browser' {
	interface BudgetItemConfig {
		showPercentage?: boolean
		showValue?: boolean
	}
}

export {}
