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
		class="relative flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 -ml-1 text-left transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
	>
		<span
			v-if="step"
			class="absolute -left-18 top-0.5 hidden size-8 items-center justify-center rounded-full border border-muted-foreground/15 text-xs font-semibold tabular-nums text-muted-foreground/25 min-[1048px]:flex"
			>{{ step }}</span
		>
		<IconLucide-chevron-right
			class="size-4 shrink-0 self-start mt-0.5 text-muted-foreground transition-transform duration-200 min-[960px]:absolute min-[960px]:-left-7 min-[960px]:top-2 min-[960px]:mt-0"
			:class="isOpen && 'rotate-90'"
		/>
		<div>
			<h2 class="text-sm font-semibold">{{ title }}</h2>
			<p class="text-xs text-muted-foreground">{{ description }}</p>
		</div>
	</CollapsibleTrigger>
</template>
