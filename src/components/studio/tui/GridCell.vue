<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { SEGMENT_NAME_LIST, SEGMENT_PART_REFS } from '@/types/tui'

const props = defineProps<{
	value: string
	span: number
	startCol: number
	availableSegments?: string[]
	usedSegments?: Set<string>
	highlighted?: boolean
}>()

const emit = defineEmits<{
	update: [newValue: string]
	updateSingle: [colIndex: number, newValue: string]
}>()

const open = shallowRef(false)
const search = shallowRef('')
const perColumnMode = shallowRef(false)
const focusedColOffset = shallowRef(0)

const segmentGroups = computed(() => {
	const q = search.value.toLowerCase()
	const filter = (items: string[]) => items.filter((s) => s.toLowerCase().includes(q))

	return [
		{ label: 'Special', items: filter(['.']) },
		{ label: 'Segments', items: filter(SEGMENT_NAME_LIST as unknown as string[]) },
		{ label: 'Segment Parts', items: filter(SEGMENT_PART_REFS) },
	].filter((g) => g.items.length > 0)
})

function selectSegment(seg: string) {
	if (perColumnMode.value) {
		emit('updateSingle', focusedColOffset.value, seg)
	} else {
		emit('update', seg)
	}
	open.value = false
	perColumnMode.value = false
	search.value = ''
}

function handleKeydown(e: KeyboardEvent) {
	if (e.key === 'Enter' && e.shiftKey && props.span > 1) {
		e.preventDefault()
		perColumnMode.value = true
		focusedColOffset.value = 0
		open.value = true
	} else if (e.key === 'Enter' && !e.shiftKey) {
		e.preventDefault()
		perColumnMode.value = false
		open.value = true
	}
}

function openPerColumn(colOffset: number) {
	perColumnMode.value = true
	focusedColOffset.value = colOffset
	open.value = true
}

function handlePerColumnNav(e: KeyboardEvent) {
	if (!perColumnMode.value) return
	if (e.key === 'ArrowLeft') {
		focusedColOffset.value = Math.max(0, focusedColOffset.value - 1)
		e.preventDefault()
	} else if (e.key === 'ArrowRight') {
		focusedColOffset.value = Math.min(props.span - 1, focusedColOffset.value + 1)
		e.preventDefault()
	}
}

const displayValue = computed(() => {
	if (props.value === '.') return '\u00B7'
	return props.value
})

const cellClasses = computed(() => {
	const base =
		'relative flex items-center justify-center rounded-md border px-2 py-1.5 text-xs font-mono cursor-pointer transition-[box-shadow,ring-color] duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30'
	if (props.value === '.') {
		return `${base} border-dashed border-muted-foreground/30 text-muted-foreground/50 bg-muted/30`
	}
	if (props.value === '---') {
		return `${base} border-dashed border-muted-foreground/40 text-muted-foreground/60 bg-muted/20`
	}
	if (props.highlighted) {
		return `${base} border-primary bg-primary/15 text-foreground ring-2 ring-primary/50`
	}
	return `${base} border-border bg-primary/5 text-foreground hover:ring-2 hover:ring-primary/30`
})
</script>

<template>
	<Popover v-model:open="open">
		<PopoverTrigger as-child>
			<button
				:class="cellClasses"
				:style="span > 1 ? { gridColumn: `span ${span}` } : undefined"
				tabindex="0"
				@keydown="handleKeydown"
				@keydown.escape="open = false"
			>
				<span class="truncate">{{ displayValue }}</span>
				<div
					v-if="span > 1 && !perColumnMode"
					class="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5 pb-0.5"
				>
					<span
						v-for="i in span"
						:key="i"
						class="size-1 rounded-full bg-muted-foreground/20 hover:bg-primary/40 transition-colors"
						@click.stop="openPerColumn(i - 1)"
					/>
				</div>
			</button>
		</PopoverTrigger>
		<PopoverContent class="w-56 p-0" @keydown="handlePerColumnNav" @open-auto-focus.prevent>
			<div class="p-2">
				<Input
					v-model="search"
					placeholder="Search segments..."
					class="h-8 text-xs"
					autofocus
					@keydown.escape="open = false"
				/>
			</div>
			<div
				v-if="perColumnMode && span > 1"
				class="flex items-center gap-1 px-2 pb-1 text-xs text-muted-foreground"
			>
				<span>Column {{ focusedColOffset + 1 }} of {{ span }}</span>
				<span class="text-muted-foreground/50">(Arrow keys to navigate)</span>
			</div>
			<ScrollArea class="max-h-48">
				<div class="px-1 py-0.5">
					<div v-for="group in segmentGroups" :key="group.label" class="py-0.5">
						<div
							class="px-2 py-1 text-[0.625rem] font-medium text-muted-foreground uppercase tracking-wider"
						>
							{{ group.label }}
						</div>
						<button
							v-for="seg in group.items"
							:key="seg"
							class="flex w-full items-center rounded-md px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed"
							:disabled="usedSegments?.has(seg) && seg !== '.' && seg !== value"
							@click="selectSegment(seg)"
						>
							<span class="font-mono">{{ seg === '.' ? '\u00B7 (empty)' : seg }}</span>
							<span
								v-if="usedSegments?.has(seg) && seg !== '.' && seg !== value"
								class="ml-auto text-[0.625rem] text-muted-foreground"
							>
								(used)
							</span>
							<span v-else-if="seg === value" class="ml-auto text-[0.625rem] text-primary">
								current
							</span>
						</button>
					</div>
				</div>
			</ScrollArea>
		</PopoverContent>
	</Popover>
</template>
