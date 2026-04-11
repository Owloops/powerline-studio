<script setup lang="ts">
import type { TuiGridBreakpoint } from '@/types/tui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = defineProps<{
	breakpoints: TuiGridBreakpoint[]
	selectedId: string
	breakpointIds: string[]
}>()

const emit = defineEmits<{
	select: [id: string]
	add: []
	remove: [id: string]
}>()

const editingId = shallowRef<string | null>(null)
const editValue = shallowRef('')

const configStore = useConfigStore()

// Sorted breakpoint indices for display
const sortedBreakpoints = computed(() => {
	return props.breakpointIds
		.map((id, index) => ({ id, index, bp: props.breakpoints[index]! }))
		.sort((a, b) => a.bp.minWidth - b.bp.minWidth)
})

function startEditing(id: string, currentValue: number) {
	editingId.value = id
	editValue.value = String(currentValue)
}

function commitEdit(bpIndex: number) {
	const val = Number.parseInt(editValue.value)
	if (!Number.isNaN(val) && val >= 0) {
		configStore.updateBreakpointMinWidth(bpIndex, val)
	}
	editingId.value = null
}

function cancelEdit() {
	editingId.value = null
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="text-xs font-medium text-muted-foreground">Breakpoints</div>

		<div class="flex items-center gap-1.5 overflow-x-auto pb-1">
			<button
				v-for="item in sortedBreakpoints"
				:key="item.id"
				class="group relative flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs transition-colors"
				:class="
					selectedId === item.id
						? 'border-primary bg-primary/5 text-foreground'
						: 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
				"
				@click="$emit('select', item.id)"
			>
				<template v-if="editingId === item.id">
					<Input
						v-model="editValue"
						type="number"
						class="h-5 w-12 text-xs p-0.5 text-center"
						:min="0"
						autofocus
						@keydown.enter="commitEdit(item.index)"
						@keydown.escape="cancelEdit"
						@blur="commitEdit(item.index)"
						@click.stop
					/>
				</template>
				<template v-else>
					<Badge
						variant="secondary"
						class="cursor-pointer text-[10px] px-1.5 py-0"
						@dblclick.stop="startEditing(item.id, item.bp.minWidth)"
					>
						&ge;{{ item.bp.minWidth }}
					</Badge>
				</template>

				<button
					v-if="breakpoints.length > 1"
					class="text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
					@click.stop="$emit('remove', item.id)"
				>
					<IconLucide-x class="size-3" />
				</button>
			</button>

			<Button
				variant="outline"
				size="sm"
				class="h-7 shrink-0 text-xs"
				@click="$emit('add')"
			>
				<IconLucide-plus class="size-3" />
			</Button>
		</div>
	</div>
</template>
