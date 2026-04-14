<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import TuiSegmentPickerContent from './TuiSegmentPickerContent.vue'

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
const perColumnMode = shallowRef(false)
const focusedColOffset = shallowRef(0)

function selectSegment(seg: string) {
	if (perColumnMode.value) {
		emit('updateSingle', focusedColOffset.value, seg)
	} else {
		emit('update', seg)
	}
	open.value = false
	perColumnMode.value = false
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
		'relative flex items-center justify-center rounded-md border px-2 py-1.5 text-xs font-mono cursor-pointer transition-[box-shadow,ring-color] duration-150 outline-none focus-visible:border-primary dark:focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/50'
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
						role="button"
						tabindex="0"
						:aria-label="`Select column ${i}`"
						class="size-1 rounded-full bg-muted-foreground/20 hover:bg-primary/40 transition-colors"
						@click.stop="openPerColumn(i - 1)"
						@keydown.enter.stop="openPerColumn(i - 1)"
						@keydown.space.prevent.stop="openPerColumn(i - 1)"
					/>
				</div>
			</button>
		</PopoverTrigger>
		<PopoverContent class="w-56 p-0" @keydown="handlePerColumnNav" @open-auto-focus.prevent>
			<TuiSegmentPickerContent
				:current-segment="value"
				:used-segments="usedSegments"
				@select="selectSegment"
			>
				<div
					v-if="perColumnMode && span > 1"
					class="flex items-center gap-1 px-2 pb-1 text-xs text-muted-foreground"
				>
					<span>Column {{ focusedColOffset + 1 }} of {{ span }}</span>
					<span class="text-muted-foreground/50">(Arrow keys to navigate)</span>
				</div>
			</TuiSegmentPickerContent>
		</PopoverContent>
	</Popover>
</template>
