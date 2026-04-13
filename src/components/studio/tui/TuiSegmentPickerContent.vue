<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { SEGMENT_NAME_LIST, SEGMENT_PART_REFS } from '@/types/tui'

const props = defineProps<{
	currentSegment?: string
	usedSegments?: Set<string>
}>()

const emit = defineEmits<{
	select: [segment: string]
}>()

const search = shallowRef('')

const groups = computed(() => {
	const q = search.value.toLowerCase()
	const filter = (items: string[]) => items.filter((s) => s.toLowerCase().includes(q))
	return [
		{ label: 'Special', items: filter(['.']) },
		{ label: 'Segments', items: filter(SEGMENT_NAME_LIST as unknown as string[]) },
		{ label: 'Segment Parts', items: filter(SEGMENT_PART_REFS) },
	].filter((g) => g.items.length > 0)
})

function selectSegment(seg: string) {
	emit('select', seg)
	search.value = ''
}

defineExpose({
	reset: () => {
		search.value = ''
	},
})
</script>

<template>
	<div class="p-2">
		<Input v-model="search" placeholder="Search segments..." class="h-8 text-xs" autofocus />
	</div>
	<slot />
	<div class="max-h-48 overflow-y-auto">
		<div class="px-1 py-0.5">
			<div v-for="group in groups" :key="group.label" class="py-0.5">
				<div class="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
					{{ group.label }}
				</div>
				<button
					v-for="seg in group.items"
					:key="seg"
					class="flex w-full items-center rounded-md px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground"
					:class="
						usedSegments?.has(seg) && seg !== '.' && seg !== currentSegment
							? 'opacity-40 cursor-not-allowed'
							: ''
					"
					:disabled="usedSegments?.has(seg) && seg !== '.' && seg !== currentSegment"
					@click="selectSegment(seg)"
				>
					<span class="font-mono">{{ seg === '.' ? '\u00B7 (empty)' : seg }}</span>
					<span v-if="seg === currentSegment" class="ml-auto text-[0.625rem] text-primary">
						current
					</span>
					<span
						v-else-if="usedSegments?.has(seg) && seg !== '.'"
						class="ml-auto text-[0.625rem] text-muted-foreground"
					>
						(used)
					</span>
				</button>
			</div>
		</div>
	</div>
</template>
