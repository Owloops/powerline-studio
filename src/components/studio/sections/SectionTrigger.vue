<script setup lang="ts">
import { CollapsibleTrigger } from '@/components/ui/collapsible'

defineProps<{
	title: string
	description: string
	step?: number
	isOpen: boolean
}>()
</script>

<template>
	<CollapsibleTrigger
		class="relative flex cursor-pointer items-center rounded-md px-1 py-0.5 -ml-1 text-left transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
	>
		<span
			v-if="step"
			class="absolute -left-18 top-0.5 flex size-8 items-center justify-center rounded-full border border-muted-foreground/15 text-xs font-semibold tabular-nums text-muted-foreground/25"
			>{{ step }}</span
		>
		<IconLucide-chevron-right
			class="absolute -left-7 top-2 size-4 text-muted-foreground transition-transform duration-200"
			:class="isOpen && 'rotate-90'"
		/>
		<div>
			<h2 class="text-sm font-semibold">{{ title }}</h2>
			<p class="text-xs text-muted-foreground">{{ description }}</p>
		</div>
	</CollapsibleTrigger>
</template>
