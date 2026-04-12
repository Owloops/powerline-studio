<script setup lang="ts">
import { SEGMENT_META, type SegmentKey } from '@/components/studio/segments/segmentMeta'
import { cn } from '@/lib/utils'

const props = defineProps<{
	segmentKey: SegmentKey
	displayStyle: 'minimal' | 'powerline' | 'capsule'
	selected?: boolean
	highlighted?: boolean
}>()

defineEmits<{
	click: []
}>()

const meta = computed(() => SEGMENT_META[props.segmentKey])
</script>

<template>
	<button
		type="button"
		:class="
			cn(
				'group relative flex cursor-pointer items-center gap-1.5 rounded-[inherit] text-xs font-medium outline-none transition-all duration-150',
				'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
				!selected && 'bg-card hover:bg-accent/50',
				selected && 'bg-primary/5',
				// Minimal style
				displayStyle === 'minimal' && 'px-2.5 py-1.5',
				// Powerline style
				displayStyle === 'powerline' && 'gap-1 py-1.5 pr-1 pl-2.5',
				// Capsule style
				displayStyle === 'capsule' && 'px-3 py-1.5',
			)
		"
		@click="$emit('click')"
	>
		<component :is="meta.icon" class="size-3.5 shrink-0 text-muted-foreground" />
		<span class="whitespace-nowrap">{{ meta.name }}</span>

		<!-- Powerline arrow separator -->
		<span
			v-if="displayStyle === 'powerline'"
			class="pointer-events-none font-nerd text-muted-foreground/40"
			aria-hidden="true"
			>&#xE0B0;</span
		>
	</button>
</template>
