<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

defineProps<{
	value: 'minimal' | 'powerline' | 'capsule' | 'tui'
	title: string
	description: string
	class?: HTMLAttributes['class']
}>()

const segments = [
	{ label: '~/project', bg: '#3b82f6' },
	{ label: 'main \u2713', bg: '#22c55e' },
	{ label: '\u25C6 Sonnet', bg: '#a855f7' },
] as const
</script>

<template>
	<button
		:class="
			cn(
				'flex cursor-pointer flex-col gap-2 rounded-xl border bg-card p-3 text-left text-card-foreground shadow-sm transition-all outline-none',
				'hover:bg-accent/50',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
				'data-[state=checked]:border-primary data-[state=checked]:ring-primary/20 data-[state=checked]:ring-2 data-[state=checked]:bg-primary/5',
				$attrs.class as HTMLAttributes['class'],
			)
		"
	>
		<div>
			<div class="text-sm font-medium">{{ title }}</div>
			<div class="text-xs text-muted-foreground">{{ description }}</div>
		</div>

		<!-- Mini Preview -->
		<div
			class="flex min-h-[28px] items-center overflow-hidden rounded-md bg-[#1e1e2e] px-2 py-1.5 font-nerd text-[10px] leading-tight"
		>
			<!-- Minimal: colored spans side by side, no separators -->
			<template v-if="value === 'minimal'">
				<span
					v-for="seg in segments"
					:key="seg.label"
					:style="{ background: seg.bg, color: '#fff' }"
					class="inline-block px-1"
					>{{ seg.label }}</span
				>
			</template>

			<!-- Powerline: arrow glyphs between segments -->
			<template v-else-if="value === 'powerline'">
				<template v-for="(seg, i) in segments" :key="seg.label">
					<span :style="{ background: seg.bg, color: '#fff' }" class="inline-block px-1">{{
						seg.label
					}}</span>
					<span
						:style="{
							color: seg.bg,
							background: i < segments.length - 1 ? segments[i + 1].bg : 'transparent',
						}"
						class="inline-block"
						>&#xE0B0;</span
					>
				</template>
			</template>

			<!-- Capsule: rounded caps wrapping each segment -->
			<template v-else-if="value === 'capsule'">
				<template v-for="(seg, i) in segments" :key="seg.label">
					<span :style="{ color: seg.bg }" class="inline-block">&#xE0B6;</span>
					<span :style="{ background: seg.bg, color: '#fff' }" class="inline-block px-0.5">{{
						seg.label
					}}</span>
					<span :style="{ color: seg.bg }" class="inline-block">&#xE0B4;</span>
					<span v-if="i < segments.length - 1" class="inline-block w-1" />
				</template>
			</template>

			<!-- TUI: box-drawing character panel -->
			<template v-else-if="value === 'tui'">
				<div class="flex flex-col text-[#cdd6f4]">
					<div>
						&#x256D;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x252C;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x256E;
					</div>
					<div>
						&#x2502;<span :style="{ color: '#3b82f6' }">~/proj </span>&#x2502;<span
							:style="{ color: '#22c55e' }"
							>main </span
						>&#x2502;
					</div>
					<div>
						&#x2570;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2534;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x256F;
					</div>
				</div>
			</template>
		</div>
	</button>
</template>
