<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import {
	SEGMENT_KEYS,
	SEGMENT_META,
	type SegmentKey,
} from '@/components/studio/segments/segmentMeta'
import { cn } from '@/lib/utils'

const props = defineProps<{
	enabledKeys: Set<string>
}>()

const emit = defineEmits<{
	add: [key: SegmentKey]
}>()

const open = ref(false)
const search = ref('')

const availableSegments = computed(() => {
	const query = search.value.toLowerCase().trim()
	return SEGMENT_KEYS.filter((key) => {
		if (props.enabledKeys.has(key)) return false
		if (query && !SEGMENT_META[key].name.toLowerCase().includes(query)) return false
		return true
	})
})

const hasAvailableSegments = computed(() => SEGMENT_KEYS.some((key) => !props.enabledKeys.has(key)))

function handleAdd(key: SegmentKey) {
	emit('add', key)
	search.value = ''
	// Keep open so user can add multiple segments quickly
}

function handleOpenChange(value: boolean) {
	open.value = value
	if (!value) {
		search.value = ''
	}
}
</script>

<template>
	<Popover :open="open" @update:open="handleOpenChange">
		<PopoverTrigger as-child>
			<Button
				variant="outline"
				size="sm"
				:disabled="!hasAvailableSegments"
				class="h-7 border-dashed px-2 text-xs"
			>
				<Plus class="size-3.5" />
				Add
			</Button>
		</PopoverTrigger>
		<PopoverContent align="start" :side-offset="4" class="w-64 p-0">
			<!-- Search input -->
			<div class="border-b p-2">
				<div class="relative">
					<Search class="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input v-model="search" placeholder="Search segments..." class="h-8 pl-8 text-sm" />
				</div>
			</div>

			<!-- Segment list -->
			<div class="max-h-64 overflow-y-auto p-1">
				<button
					v-for="key in availableSegments"
					:key="key"
					:class="
						cn(
							'flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm transition-colors',
							'hover:bg-accent hover:text-accent-foreground',
							'cursor-pointer outline-none focus-visible:bg-accent',
						)
					"
					@click="handleAdd(key)"
				>
					<component :is="SEGMENT_META[key].icon" class="size-4 shrink-0 text-muted-foreground" />
					<span>{{ SEGMENT_META[key].name }}</span>
				</button>
				<div
					v-if="availableSegments.length === 0"
					class="px-2 py-4 text-center text-sm text-muted-foreground"
				>
					{{ search ? 'No matching segments' : 'All segments added' }}
				</div>
			</div>
		</PopoverContent>
	</Popover>
</template>
