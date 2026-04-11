<script setup lang="ts">
import { ref, computed, reactive, watch, provide, nextTick } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useAutoAnimate } from '@formkit/auto-animate/vue'
import {
	type Props,
	TreeBranchClickAction,
	type TreeNode,
	treeKey,
	useTree,
} from '@/composables/tree'

// Prop inputs
const props = withDefaults(defineProps<Props>(), {
	checkable: false,
	multiple: true,
	searchable: true,
	clickAction: TreeBranchClickAction.Expand,
	labelField: (node: TreeNode) => node.Name,
	keyField: (node: TreeNode) => `${node.ParentId}_${node.ID}`,
	translations: () => ({}),
	data: () => [],
})

// Emitted events
const emit = defineEmits(['update:modelValue'])

function handleValueUpdate(value: TreeNode | TreeNode[]) {
	// console.log('Tree Root', value);
	emit('update:modelValue', value)
}

// Animations
const [treeRoot] = useAutoAnimate({ duration: 150 })

// Shared global state
const tree = useTree()
provide(treeKey, tree)

// ============================================================================
// ============================== Search filter ===============================
// ============================================================================

const search = ref('')
const debouncedSearch = ref('')

watchDebounced(
	search,
	() => {
		debouncedSearch.value = search.value
	},
	{ debounce: 500, maxWait: 3000 },
)

function recurseTree(nodes: TreeNode[], searchTerm: string, parentCrumb = '') {
	for (const node of nodes) {
		// Set additional state to each node
		if (!Object.hasOwn(node, 'TreeState')) {
			node.TreeState = reactive({
				Expanded: false,
				ExpandedSearch: true,
				Match: true,
				BreadCrumb: '',
			})
		}
		node.TreeState!.BreadCrumb = `${parentCrumb}${parentCrumb.length > 0 ? '_' : ''}${node.ID}`
		// Only include nodes that match the search or have children that match the search
		let found = searchTerm === '' || node.Name.toLocaleLowerCase().includes(searchTerm)
		if (node.Children?.length > 0) {
			recurseTree(node.Children, searchTerm, node.TreeState!.BreadCrumb)
			found = found || node.Children.some((x) => x.TreeState!.Match)
		}
		// Add node ID to the breadcrumb, include the parent's breadcrumb if it exists
		node.TreeState!.Match = found
	}
}

// Not needed anymore
// const clonedData = computed(() => {
// 	const data = structuredClone(toRaw(props.data));
// 	return data;
// });

const treeNodes = computed(() => {
	const searchTerm = debouncedSearch.value.toLowerCase()
	recurseTree(props.data, searchTerm)
	return props.data
})

// ============================================================================
// =========================== Keyboard navigation ============================
// ============================================================================

// A flat list we can navigate through with the keyboard via indeces
let flatVisibleTree: TreeNode[] = []

function flattenTreeRec(nodes: TreeNode[], flatTree: TreeNode[], searchTerm: string) {
	for (const node of nodes) {
		if (node.TreeState!.Match) {
			flatTree.push(node)
		}
		if (node.Children?.length > 0) {
			if (searchTerm.length > 0 && node.TreeState!.ExpandedSearch) {
				flattenTreeRec(node.Children, flatTree, searchTerm)
			}
			if (searchTerm.length === 0 && node.TreeState!.Expanded) {
				flattenTreeRec(node.Children, flatTree, searchTerm)
			}
		}
	}
}
// When the search term changes, we need to update which nodes are visible in the flatened tree
watch(
	debouncedSearch,
	(newSearchTerm, oldSearchTerm) => {
		if (newSearchTerm !== oldSearchTerm) {
			nextTick(() => {
				const flatTree: TreeNode[] = []
				flattenTreeRec(treeNodes.value, flatTree, newSearchTerm)
				flatVisibleTree = flatTree
			})
		}
	},
	{ immediate: true },
)

// Recreate the flat tree when the nodes themselves change, deep watch is needed for the expanded states
watch(
	treeNodes,
	(newNodes, oldNodes) => {
		nextTick(() => {
			const flatTree: TreeNode[] = []
			flattenTreeRec(newNodes, flatTree, debouncedSearch.value.toLowerCase())
			flatVisibleTree = flatTree
		})
	},
	{ immediate: true, deep: true },
)

// Make sure the first node is selected, when first focusing the tree
watch(
	tree.state,
	(newNode, oldNode) => {
		if (newNode.activeNode == null) {
			if (flatVisibleTree.length > 0) {
				tree.state.activeNode = flatVisibleTree[0]
			}
		}
	},
	{ immediate: true },
)

// Get current index of active node
const activeNodeIndex = computed(() => {
	const activePath = tree.state.activeNode?.TreeState?.BreadCrumb ?? ''
	const activeIndex = flatVisibleTree.findIndex((node) => node.TreeState!.BreadCrumb === activePath)
	return activeIndex
})

function handleBranchClick(node: TreeNode) {
	tree.state.activeNode = node
	scrollActiveNodeIntoView()
}

function scrollActiveNodeIntoView() {
	nextTick(() => {
		const activeNodeElement = document.querySelector('[data-active-node="true"]')
		if (activeNodeElement) {
			activeNodeElement.scrollIntoView({ behavior: 'auto', block: 'nearest' })
		}
	})
}

function handleKeyDown(event: KeyboardEvent) {
	// Set activeNode to flatVisibleTree activeNodeIndex + 1
	if (event.key === 'ArrowDown') {
		event.preventDefault()
		if (activeNodeIndex.value < flatVisibleTree.length - 1) {
			tree.state.activeNode = flatVisibleTree[activeNodeIndex.value + 1]
			scrollActiveNodeIntoView()
		}
	} else if (event.key === 'ArrowUp') {
		event.preventDefault()
		if (activeNodeIndex.value > 0) {
			tree.state.activeNode = flatVisibleTree[activeNodeIndex.value - 1]
			scrollActiveNodeIntoView()
		}
	} else if (event.key === 'ArrowRight') {
		event.preventDefault()
		if (!tree.state.activeNode) {
			return
		}
		const hasChildren = (tree.state.activeNode?.Children?.length ?? 0) > 0
		if (!hasChildren) {
			return
		}
		if (debouncedSearch.value.length > 0) {
			tree.state.activeNode.TreeState!.ExpandedSearch = true
		} else {
			tree.state.activeNode.TreeState!.Expanded = true
		}
	} else if (event.key === 'ArrowLeft') {
		event.preventDefault()
		if (!tree.state.activeNode) {
			return
		}
		const hasChildren = (tree.state.activeNode?.Children?.length ?? 0) > 0
		if (!hasChildren) {
			return
		}
		if (debouncedSearch.value.length > 0) {
			tree.state.activeNode.TreeState!.ExpandedSearch = false
		} else {
			tree.state.activeNode.TreeState!.Expanded = false
		}
	}
	// On Enter or space do action determined by the clickAction prop
	if (event.key === 'Enter' || event.key === ' ') {
		if (event.target instanceof HTMLInputElement && event.target.name === 'searchInput') {
			return
		}
		event.preventDefault()
		if (!tree.state.activeNode) {
			return
		}
		if (props.clickAction === TreeBranchClickAction.None) {
			// Do nothing
		} else if (!props.checkable && props.clickAction === TreeBranchClickAction.Expand) {
			if (debouncedSearch.value.length > 0) {
				tree.state.activeNode.TreeState!.ExpandedSearch =
					!tree.state.activeNode.TreeState!.ExpandedSearch
			} else {
				tree.state.activeNode.TreeState!.Expanded = !tree.state.activeNode.TreeState!.Expanded
			}
		} else if (props.checkable || props.clickAction === TreeBranchClickAction.Select) {
			if (props.multiple) {
				const modelVal = props.modelValue as TreeNode[]
				if (
					modelVal?.some(
						(x) =>
							x.ID === tree.state.activeNode?.ID && x.ParentId === tree.state.activeNode?.ParentId,
					)
				) {
					// Remove from selection
					handleValueUpdate(
						modelVal.filter(
							(x) =>
								x.ID !== tree.state.activeNode?.ID ||
								x.ParentId !== tree.state.activeNode?.ParentId,
						),
					)
				} else {
					// Add to selection
					handleValueUpdate([...modelVal, tree.state.activeNode])
				}
			} else {
				handleValueUpdate(tree.state.activeNode)
			}
		} else if (
			props.clickAction === TreeBranchClickAction.OpenLink &&
			typeof props.labelField === 'function'
		) {
			// labelField renders an <a> tag as a string
			const aTagString = props.labelField(tree.state.activeNode)
			// Parse href from the <a> tag
			const href = aTagString.match(/href=["']([^"]*)["']/)?.[1]
			if (href) {
				// get the target attribute
				const target = aTagString.match(/target=["']([^"]*)["']/)?.[1]
				window.open(href, target ?? '_blank')
			}
		}
	}
}
</script>

<template>
	<div class="eui__tree__container flex flex-col space-y-4" @keydown="handleKeyDown">
		<div v-if="props.searchable" class="eui__tree__search">
			<input
				v-model="search"
				type="text"
				class="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-1 text-sm text-foreground shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
				name="searchInput"
				:placeholder="props.translations?.Filter"
			/>
		</div>
		<div ref="treeRoot" class="eui__tree__root group rounded focus:outline-none" tabindex="0">
			<TreeBranch
				v-for="node in treeNodes"
				:key="keyField(node)"
				:node="node"
				:checkable="checkable"
				:multiple="multiple"
				:click-action="clickAction"
				:label-field="labelField"
				:key-field="keyField"
				:model-value="modelValue"
				:search="debouncedSearch"
				@active-branch="handleBranchClick"
				@update:model-value="handleValueUpdate"
			/>
		</div>
	</div>
</template>
