<script setup lang="ts">
import { SEGMENT_META, type SegmentKey } from '@/components/studio/segments/segmentMeta'
import { cn } from '@/lib/utils'

const props = defineProps<{
	segmentKey: SegmentKey
	displayStyle: 'minimal' | 'powerline' | 'capsule'
	selected?: boolean
	highlighted?: boolean
	isFirst?: boolean
	isLast?: boolean
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
				'group relative flex cursor-pointer items-center gap-1.5 text-xs font-medium outline-none transition-all duration-150',
				'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
				// Minimal style
				displayStyle === 'minimal' &&
					'rounded-md border border-border bg-card px-2.5 py-1.5 hover:bg-accent/50',
				displayStyle === 'minimal' &&
					selected &&
					'border-primary bg-primary/5 ring-2 ring-primary/20',
				// Powerline style
				displayStyle === 'powerline' &&
					'gap-1 rounded-none border-y border-l border-border bg-card py-1.5 pr-1 pl-2.5 hover:bg-accent/50',
				displayStyle === 'powerline' && isFirst && 'rounded-l-md',
				displayStyle === 'powerline' && isLast && 'rounded-r-md border-r',
				displayStyle === 'powerline' &&
					selected &&
					'border-primary bg-primary/5 ring-2 ring-primary/20',
				// Capsule style
				displayStyle === 'capsule' &&
					'rounded-full border border-border bg-card px-3 py-1.5 hover:bg-accent/50',
				displayStyle === 'capsule' &&
					selected &&
					'border-primary bg-primary/5 ring-2 ring-primary/20',
				// Highlight pulse from preview click
				highlighted && 'segment-highlight-pulse',
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

<style scoped>
.segment-highlight-pulse {
	animation: segment-pulse 2s ease-out;
}

@keyframes segment-pulse {
	0% {
		box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4);
	}
	20% {
		box-shadow: 0 0 0 4px hsl(var(--primary) / 0.3);
	}
	100% {
		box-shadow: 0 0 0 0 hsl(var(--primary) / 0);
	}
}

@media (prefers-reduced-motion: reduce) {
	.segment-highlight-pulse {
		animation: none;
		box-shadow: 0 0 0 3px hsl(var(--primary) / 0.3);
	}
}
</style>
