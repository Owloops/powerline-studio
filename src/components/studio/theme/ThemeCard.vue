<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ColorTheme } from '@owloops/claude-powerline/browser'
import { cn } from '@/lib/utils'
import { CANONICAL_THEME_LABELS } from '@/lib/themes'
import type { CanonicalTheme } from '@/lib/themes'

const PALETTE_SEGMENTS: (keyof ColorTheme)[] = [
	'directory',
	'git',
	'model',
	'session',
	'context',
	'block',
	'today',
	'metrics',
	'version',
	'env',
]

const props = defineProps<{
	themeName: CanonicalTheme | string
	theme: ColorTheme
	selected: boolean
	label?: string
	class?: HTMLAttributes['class']
}>()

const displayLabel = computed(
	() => props.label ?? CANONICAL_THEME_LABELS[props.themeName as CanonicalTheme] ?? props.themeName,
)
</script>

<template>
	<button
		:class="
			cn(
				'theme-card flex cursor-pointer flex-col gap-2.5 rounded-xl border bg-card p-3 text-left text-card-foreground outline-none',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
				'data-[state=checked]:border-primary data-[state=checked]:ring-primary/20 data-[state=checked]:ring-2 data-[state=checked]:bg-primary/5',
				props.class,
			)
		"
	>
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium">{{ displayLabel }}</span>
			<IconLucide-check v-if="selected" class="size-4 text-primary" />
		</div>

		<!-- Full color palette preview -->
		<div class="flex flex-col gap-1">
			<div class="flex gap-0.5 overflow-hidden rounded-md">
				<div
					v-for="segment in PALETTE_SEGMENTS"
					:key="segment"
					class="flex h-5 flex-1 items-center justify-center"
					:style="{ backgroundColor: theme[segment].bg }"
				>
					<span class="text-[0.375rem] font-bold leading-none" :style="{ color: theme[segment].fg }"
						>Aa</span
					>
				</div>
			</div>
			<!-- Context warning/critical strip -->
			<div class="flex gap-0.5 overflow-hidden rounded-md">
				<div class="flex h-2.5 flex-1" :style="{ backgroundColor: theme.contextWarning.bg }" />
				<div class="flex h-2.5 flex-1" :style="{ backgroundColor: theme.contextCritical.bg }" />
			</div>
		</div>
	</button>
</template>

<style scoped>
.theme-card {
	transition:
		box-shadow 200ms ease-out,
		border-color 200ms ease-out,
		background-color 150ms ease-out;
}

.theme-card:hover {
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

@media (prefers-reduced-motion: reduce) {
	.theme-card {
		transition: none;
	}
}
</style>
