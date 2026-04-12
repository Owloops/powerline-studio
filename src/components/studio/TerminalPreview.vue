<script setup lang="ts">
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import PreviewControls from './PreviewControls.vue'
import SegmentOverlay from './SegmentOverlay.vue'

const previewStore = usePreviewStore()

const terminalStyle = computed(() => ({
	'--terminal-bg': previewStore.terminalBgColor,
	'--terminal-fg': previewStore.terminalFgColor,
}))

const preStyle = computed(() => ({
	fontFamily: previewStore.terminalFontFamily,
	fontFeatureSettings: "'calt' 0, 'liga' 0",
	fontSize: `${previewStore.fontSize}px`,
	lineHeight: previewStore.lineHeight,
}))

const contentStyle = computed(() => ({
	width: `${previewStore.terminalWidth}ch`,
}))

const reservedStyle = computed(() => {
	const tw = previewStore.terminalWidth
	const rw = previewStore.reservedWidth
	if (rw <= 0 || rw >= tw) return null
	return {
		left: `${tw - rw}ch`,
		width: `${rw}ch`,
	}
})

const effectiveWidth = computed(() =>
	Math.max(1, previewStore.terminalWidth - previewStore.reservedWidth),
)
</script>

<template>
	<div class="w-fit overflow-hidden rounded-xl border border-border shadow-lg">
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
			<div class="flex shrink-0 items-center gap-1">
				<Badge variant="secondary">
					{{ effectiveWidth }}/{{ previewStore.terminalWidth }} cols
				</Badge>
				<Popover>
					<TooltipProvider :delay-duration="300">
						<Tooltip>
							<TooltipTrigger as-child>
								<PopoverTrigger as-child>
									<Button variant="ghost" size="icon-sm" class="size-7">
										<IconLucide-settings-2 class="size-3.5" />
										<span class="sr-only">Configure terminal preview</span>
									</Button>
								</PopoverTrigger>
							</TooltipTrigger>
							<TooltipContent side="bottom"> Configure terminal preview </TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<PopoverContent
						align="end"
						side="bottom"
						:side-offset="8"
						update-position-strategy="always"
						class="w-80 p-0"
					>
						<PreviewControls />
					</PopoverContent>
				</Popover>
			</div>
		</div>

		<!-- Terminal Body -->
		<ScrollArea
			class="min-h-[3rem] max-h-[40svh] bg-(--terminal-bg) text-(--terminal-fg)"
			:style="terminalStyle"
		>
			<pre
				v-if="previewStore.htmlOutput"
				class="whitespace-pre px-4 py-3"
				:style="preStyle"
				role="img"
				aria-label="Terminal preview of powerline statusline"
			><div class="relative" :style="contentStyle"><div v-html="previewStore.htmlOutput" /><SegmentOverlay class="absolute inset-0" /><div
					v-if="reservedStyle"
					class="pointer-events-none absolute inset-y-0"
					:style="reservedStyle"
				><div class="reserved-stripes absolute inset-0" /><div class="absolute inset-0 flex items-center justify-center"><span class="reserved-label">RESERVED</span></div></div></div></pre>
			<p v-else class="px-4 py-3 text-sm italic text-muted-foreground">
				Preview will appear here...
			</p>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	</div>
</template>

<style scoped>
.reserved-stripes {
	border-left: 1px dashed currentColor;
	opacity: 0.2;
	background: repeating-linear-gradient(
		-45deg,
		currentColor 0,
		currentColor 1px,
		transparent 0,
		transparent 6px
	);
}

.reserved-label {
	font-size: 10px;
	font-weight: 700;
	letter-spacing: 0.15em;
	text-transform: uppercase;
	opacity: 0.5;
}
</style>
