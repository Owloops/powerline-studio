<script setup lang="ts">
import type { TuiGridBreakpoint } from '@/types/tui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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

function getBreakpointLabel(minWidth: number, index: number): string {
	if (minWidth === 0) return 'Default'
	return `Breakpoint ${index}`
}

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
	<TooltipProvider :delay-duration="300">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-1.5">
					<span class="text-xs font-medium text-muted-foreground">Breakpoints</span>
					<Tooltip>
						<TooltipTrigger as-child>
							<IconLucide-info class="size-3 text-muted-foreground/50" />
						</TooltipTrigger>
						<TooltipContent side="right" class="max-w-64 text-xs">
							Breakpoints define different grid layouts for different terminal widths. The layout
							with the largest matching min-width is used.
						</TooltipContent>
					</Tooltip>
				</div>
				<Button variant="outline" size="sm" class="h-7 text-xs" @click="$emit('add')">
					<IconLucide-plus class="size-3" />
					Add Breakpoint
				</Button>
			</div>

			<div class="flex flex-col gap-1.5">
				<button
					v-for="(item, sortIdx) in sortedBreakpoints"
					:key="item.id"
					class="group relative flex items-center rounded-lg border px-3 py-2 text-left outline-none focus-visible:border-primary dark:focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/50"
					:class="
						selectedId === item.id
							? 'border-primary ring-1 ring-primary/30 bg-primary/5'
							: 'border-border hover:border-primary/30 hover:bg-muted/50'
					"
					@click="$emit('select', item.id)"
				>
					<div class="flex flex-1 items-center gap-3">
						<div
							class="flex size-7 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-semibold tabular-nums"
							:class="
								selectedId === item.id
									? 'bg-primary text-primary-foreground'
									: 'bg-muted text-muted-foreground'
							"
						>
							{{ sortIdx + 1 }}
						</div>

						<div class="flex flex-col gap-0.5">
							<span class="text-xs font-medium leading-none">
								{{ getBreakpointLabel(item.bp.minWidth, sortIdx + 1) }}
							</span>
							<template v-if="editingId === item.id">
								<div class="flex items-center gap-1" @click.stop>
									<Input
										v-model="editValue"
										type="number"
										class="h-5 w-16 text-xs p-0.5 text-center"
										:min="0"
										autofocus
										@keydown.enter="commitEdit(item.index)"
										@keydown.escape="cancelEdit"
										@blur="commitEdit(item.index)"
									/>
									<span class="text-[0.625rem] text-muted-foreground">cols</span>
								</div>
							</template>
							<template v-else>
								<span
									class="text-[11px] tabular-nums text-muted-foreground cursor-pointer hover:text-foreground"
									@dblclick.stop="startEditing(item.id, item.bp.minWidth)"
								>
									<template v-if="item.bp.minWidth === 0">Any width (fallback)</template>
									<template v-else>&#x2265; {{ item.bp.minWidth }} columns</template>
								</span>
							</template>
						</div>
					</div>

					<div class="flex items-center gap-1">
						<Tooltip v-if="item.bp.minWidth > 0">
							<TooltipTrigger as-child>
								<button
									class="rounded p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50"
									aria-label="Edit min-width"
									@click.stop="startEditing(item.id, item.bp.minWidth)"
								>
									<IconLucide-pencil class="size-3" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="left" class="text-xs">Edit min-width</TooltipContent>
						</Tooltip>

						<ConfirmPopover v-if="breakpoints.length > 1" @confirm="$emit('remove', item.id)">
							<button
								class="rounded p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 group-focus-within:opacity-100 outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/50"
								aria-label="Remove breakpoint"
								@click.stop
							>
								<IconLucide-trash-2 class="size-3" />
							</button>
						</ConfirmPopover>
					</div>
				</button>
			</div>
		</div>
	</TooltipProvider>
</template>
