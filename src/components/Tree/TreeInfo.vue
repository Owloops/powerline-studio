<script setup lang="ts">
import { computed } from 'vue'
import { useAutoAnimate } from '@formkit/auto-animate/vue'
import { type PropType } from 'vue'
import { type TreeNode } from '@/composables/tree'
import { X } from '@lucide/vue'

// Prop inputs
const props = defineProps({
	translations: {
		type: Object as PropType<Record<string, string>>,
		default: () => ({}),
	},
	modelValue: {
		type: Object as PropType<TreeNode[] | TreeNode>,
		default: null,
	},
	labelField: {
		type: Function as PropType<(node: TreeNode) => string>,
		default: (node: TreeNode) => node.Name,
	},
	keyField: {
		type: Function as PropType<(node: TreeNode) => string>,
		default: (node: TreeNode) => `${node.ParentId}_${node.ID}`,
	},
})

// Emitted events
const emit = defineEmits(['update:modelValue'])

function renderLabel(node: TreeNode) {
	return props.labelField(node)
}
const selectedNodes = computed(() => {
	// If props.modelValue is an object, add it to an array
	if (
		props.modelValue &&
		typeof props.modelValue === 'object' &&
		!Array.isArray(props.modelValue)
	) {
		return [props.modelValue]
	}
	return props.modelValue
})

function deleteSelection(node: TreeNode) {
	if (typeof props.modelValue === 'object' && !Array.isArray(props.modelValue)) {
		emit('update:modelValue', undefined)
		return
	}
	emit(
		'update:modelValue',
		(props.modelValue as TreeNode[]).filter((x) => x !== node),
	)
}

// Animations
const [root] = useAutoAnimate({ duration: 150 })
</script>

<template>
	<div ref="root" class="eui__tree__container flex flex-col space-y-4">
		<div class="eui__tree__selected-list space-y-2">
			<span class="label mb-1">{{ props.translations?.SelectedNodes }}</span>
			<div class="eui__tree__clear-selection">
				<button
					type="button"
					class="btn btn-sm"
					:disabled="!props.modelValue || (props.modelValue as TreeNode[]).length === 0"
					@click="emit('update:modelValue', [])"
				>
					{{ props.translations?.ClearSelection }}
				</button>
			</div>
			<ul class="list-none text-sm text-foreground">
				<li
					v-for="node in selectedNodes"
					:key="props.keyField(node)"
					class="flex items-center justify-between p-0.5"
				>
					{{ renderLabel(node) }}
					<span
						class="group ml-2 box-border flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-transparent hover:border-border hover:bg-accent"
						@click="deleteSelection(node)"
					>
						<X class="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
					</span>
				</li>
			</ul>
		</div>
	</div>
</template>
