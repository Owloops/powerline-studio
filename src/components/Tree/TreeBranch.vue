<script setup lang="ts">
import { useAutoAnimate } from '@formkit/auto-animate/vue'
import { computed, inject, watch, type PropType } from 'vue'
import { Minus } from '@lucide/vue'
import { TreeBranchClickAction, type TreeNode, treeKey } from '@/composables/tree'
import { Checkbox } from '@/components/ui/checkbox'

// Props
const props = defineProps({
	node: {
		type: Object as PropType<TreeNode>,
		required: true,
	},
	checkable: {
		type: Boolean,
		default: false,
	},
	multiple: {
		type: Boolean,
		default: true,
	},
	clickAction: {
		type: String as PropType<TreeBranchClickAction>,
		default: TreeBranchClickAction.Expand,
	},
	labelField: {
		type: Function as PropType<(node: TreeNode) => string>,
		default: (node: TreeNode) => node.Name,
	},
	keyField: {
		type: Function as PropType<(node: TreeNode) => string>,
		default: (node: TreeNode) => `${node.ParentId}_${node.ID}`,
	},
	search: {
		type: String,
		default: '',
	},
	modelValue: {
		type: Object as PropType<TreeNode | TreeNode[]>,
	},
})

// Emits
const emit = defineEmits(['update:modelValue', 'activeBranch'])

function handleValueUpdate(value: TreeNode | TreeNode[] | undefined) {
	// console.log('Tree Branch', value);
	emit('update:modelValue', value)
}

// The checkbox/radio value binds to the passed down node,
// but the v-model binds to this model, because we can't bind the value and change events seperately
// since :value is already being used
const model = computed({
	get() {
		return props.modelValue
	},
	set(value) {
		handleValueUpdate(value)
	},
})

// Checkbox checked state (bridges array model to boolean for Checkbox component)
const isChecked = computed(() => {
	if (!Array.isArray(props.modelValue)) return false
	return props.modelValue.some(
		(n: TreeNode) => n.ID === props.node.ID && n.ParentId === props.node.ParentId,
	)
})

function toggleCheckbox(checked: boolean) {
	const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
	if (checked) {
		arr.push(props.node)
	} else {
		const idx = arr.findIndex(
			(n: TreeNode) => n.ID === props.node.ID && n.ParentId === props.node.ParentId,
		)
		if (idx !== -1) arr.splice(idx, 1)
	}
	handleValueUpdate(arr)
}

// Local state
const expanded = computed({
	get() {
		return props.search.length > 0
			? props.node.TreeState!.ExpandedSearch
			: props.node.TreeState!.Expanded
	},
	set(value) {
		if (props.search.length > 0) {
			props.node.TreeState!.ExpandedSearch = value
		} else {
			props.node.TreeState!.Expanded = value
		}
	},
})

const visible = computed(() => {
	return props.node.TreeState!.Match
})

// Reset the expanded state when the search changes
watch(
	() => props.search,
	(newVal, oldVal) => {
		if (newVal !== oldVal) {
			props.node.TreeState!.ExpandedSearch = true
		}
	},
)

const uuid = crypto.randomUUID()

const [parent] = useAutoAnimate({ duration: 150 })

function handleExpand(node: TreeNode) {
	expanded.value = !expanded.value
}

function handleLabel(node: TreeNode) {
	if (props.clickAction === TreeBranchClickAction.None) {
		return
	}

	if (props.clickAction === TreeBranchClickAction.Expand) {
		handleExpand(node)
	}
}

function focusParent(event: FocusEvent) {
	// Find the first focusable parent element and set focus to it
	let current: HTMLElement | null = event.target as HTMLElement
	while (current) {
		if (current.tabIndex >= 0) {
			current.focus()
			return
		}
		current = current.parentElement
	}
}

// Keyboard navigation
const tree = inject(treeKey)
// create a computed ref 'active' that is true when the current node is the treeState.activeNode
const active = computed(
	() => tree?.state?.activeNode?.TreeState?.BreadCrumb === props.node?.TreeState?.BreadCrumb,
)

function handleBranchClick(node: TreeNode) {
	emit('activeBranch', node)
}
</script>

<!-- FIX ME! @mouseup because of obscure vue bug where checkbox does not get
	 checked because the container's click changes the the class of the container -->
<template>
	<div
		v-if="visible"
		class="eui__tree__branch flex items-center rounded border-2 border-transparent pr-2 hover:bg-accent focus:outline-none"
		:class="{ 'group-focus:!bg-accent': active, 'focus-within:!bg-accent': active }"
		:data-active-node="active"
		@mouseup="handleBranchClick(props.node)"
	>
		<div class="eui__tree__branch__expand mr-1 h-5 w-5">
			<div v-if="props.node.Children?.length" class="cursor-pointer">
				<div class="relative" @click="handleExpand(props.node)">
					<Transition enter-from-class="!rotate-0" leave-to-class="!rotate-180">
						<Minus
							v-if="!expanded"
							class="absolute rotate-90 transition-all duration-150 h-5 w-5"
						/>
					</Transition>
					<Minus class="h-5 w-5" />
				</div>
			</div>
		</div>
		<input
			v-if="props.checkable && !props.multiple"
			:id="`${uuid}_${node.ID}`"
			v-model="model"
			type="radio"
			name="tree-radio"
			class="eui__tree__branch__radio mr-2 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border border-input bg-transparent transition-all checked:border-primary checked:bg-primary checked:shadow-[inset_0_0_0_3px_var(--background)] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
			:value="node"
			tabindex="-1"
			@focus="focusParent"
		/>
		<Checkbox
			v-else-if="props.checkable && props.multiple"
			:id="`${uuid}_${node.ID}`"
			:checked="isChecked"
			class="eui__tree__branch__checkbox mr-2 cursor-pointer"
			tabindex="-1"
			@update:checked="toggleCheckbox"
		/>
		<!-- Should the name be a label for the input? -->
		<label
			v-if="props.clickAction === TreeBranchClickAction.Select"
			:for="`${uuid}_${node.ID.toString()}`"
			class="eui__tree__branch__label cursor-pointer whitespace-pre text-sm font-[450] text-foreground"
			@click="handleLabel(props.node)"
			v-html="props.labelField(props.node)"
		>
		</label>
		<div
			v-else
			class="eui__tree__branch__label cursor-pointer whitespace-pre text-sm font-[450] text-foreground"
			@click="handleLabel(props.node)"
			v-html="props.labelField(props.node)"
		></div>
	</div>
	<div v-if="visible" ref="parent" class="eui__tree__children ml-4">
		<template v-for="(child, index) in props.node.Children" :key="`${index}_${child.ID}`">
			<TreeBranch
				v-if="expanded"
				:node="child"
				:checkable="props.checkable"
				:multiple="props.multiple"
				:click-action="props.clickAction"
				:label-field="props.labelField"
				:key-field="props.keyField"
				:model-value="props.modelValue"
				:search="props.search"
				@update:model-value="handleValueUpdate"
				@active-branch="handleBranchClick"
			/>
		</template>
	</div>
</template>
