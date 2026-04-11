<script setup lang="ts">
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

const previewStore = usePreviewStore()

const terminalClasses = computed(() =>
	previewStore.darkBackground
		? 'bg-terminal-dark text-terminal-dark-fg'
		: 'bg-terminal-light text-terminal-light-fg',
)
</script>

<template>
	<div class="overflow-hidden rounded-xl border border-border shadow-lg">
		<!-- Title Bar -->
		<div class="relative flex h-9 items-center border-b border-border bg-muted px-4">
			<div class="flex gap-2" aria-hidden="true">
				<span class="size-3 rounded-full bg-[#FF5F56]" />
				<span class="size-3 rounded-full bg-[#FFBD2E]" />
				<span class="size-3 rounded-full bg-[#27C93F]" />
			</div>
			<span class="flex-1 text-center text-xs text-muted-foreground">
				powerline-studio — bash
			</span>
			<Badge variant="secondary">{{ previewStore.terminalWidth }} cols</Badge>
		</div>

		<!-- Terminal Body -->
		<ScrollArea class="min-h-[3rem] max-h-[600px]" :class="terminalClasses">
			<pre
				v-if="previewStore.htmlOutput"
				v-html="previewStore.htmlOutput"
				class="min-w-max whitespace-pre px-4 py-3 font-nerd text-sm leading-none"
				role="img"
				aria-label="Terminal preview of powerline statusline"
			/>
			<p v-else class="px-4 py-3 text-sm italic text-muted-foreground">
				Preview will appear here...
			</p>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	</div>
</template>
