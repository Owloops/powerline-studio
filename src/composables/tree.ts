export interface TreeNode {
	ID: number
	ParentId?: number
	Name: string
	Children: TreeNode[]
	TreeState?: {
		Expanded: boolean
		ExpandedSearch: boolean
		Match: boolean
		BreadCrumb: string
	}
}

export interface Props {
	checkable?: boolean
	multiple?: boolean
	searchable?: boolean
	clickAction?: TreeBranchClickAction
	labelField?: (node: TreeNode) => string
	keyField?: (node: TreeNode) => string
	translations?: Record<string, string>
	modelValue?: TreeNode | TreeNode[]
	data?: TreeNode[]
}

export enum TreeBranchClickAction {
	Select = 'select',
	Expand = 'expand',
	None = 'none',
	OpenLink = 'open',
}

export function useTree() {
	// Create local state
	const state = reactive({
		activeNode: null as TreeNode | null,
	})

	return {
		state,
	}
}

export const treeKey = Symbol('Tree injection key') as InjectionKey<ReturnType<typeof useTree>>
