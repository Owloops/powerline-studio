<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ColorTheme } from '@owloops/claude-powerline/browser'
import { cn } from '@/lib/utils'
import { PREVIEW_SEGMENTS, CANONICAL_THEME_LABELS } from '@/lib/themes'
import type { CanonicalTheme } from '@/lib/themes'

const props = defineProps<{
	themeName: CanonicalTheme
	theme: ColorTheme
	selected: boolean
	class?: HTMLAttributes['class']
}>()

const label = computed(() => CANONICAL_THEME_LABELS[props.themeName])
</script>

<template>
	<button
		:class="
			cn(
				'theme-card flex cursor-pointer flex-col gap-2 rounded-xl border bg-card p-3 text-left text-card-foreground shadow-sm outline-none',
				'hover:bg-accent/50',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
				'data-[state=checked]:border-primary data-[state=checked]:ring-primary/20 data-[state=checked]:ring-2 data-[state=checked]:bg-primary/5',
				props.class,
			)
		"
	>
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium">{{ label }}</span>
			<IconLucide-check v-if="selected" class="size-4 text-primary" />
		</div>

		<!-- Mini Preview Strip -->
		<div class="flex h-5 items-center gap-0.5 overflow-hidden rounded-md">
			<div
				v-for="segment in PREVIEW_SEGMENTS"
				:key="segment"
				class="h-full flex-1"
				:style="{ backgroundColor: theme[segment].bg }"
			/>
		</div>
	</button>
</template>

<style scoped>
.theme-card {
	transition:
		box-shadow 200ms ease-out,
		border-color 200ms ease-out,
		background-color 150ms ease-out,
		transform 200ms ease-out;
}

.theme-card:hover {
	transform: scale(1.02);
}

.theme-card:active {
	transform: scale(0.98);
	transition-duration: 0ms;
}

@media (prefers-reduced-motion: reduce) {
	.theme-card {
		transition: none;
	}
	.theme-card:hover,
	.theme-card:active {
		transform: none;
	}
}
</style>
