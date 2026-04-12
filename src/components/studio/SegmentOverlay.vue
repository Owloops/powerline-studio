<script setup lang="ts">
const previewStore = usePreviewStore()
const configStore = useConfigStore()
const editorStore = useEditorStore()

const HITBOX_TITLES: Record<string, string> = {
	__title_left: 'Title Bar (left)',
	__title_right: 'Title Bar (right)',
	__footer_left: 'Footer (left)',
	__footer_right: 'Footer (right)',
}

function hitboxTitle(segmentType: string): string {
	return HITBOX_TITLES[segmentType] ?? segmentType
}

function handleClick(segmentType: string, sourceLineIndex: number, cellSegment?: string) {
	// Handle special TUI title/footer hitbox types
	if (segmentType === '__title_left' || segmentType === '__title_right') {
		editorStore.setFocusedTuiArea('title')
		return
	}
	if (segmentType === '__footer_left' || segmentType === '__footer_right') {
		editorStore.setFocusedTuiArea('footer')
		return
	}

	// For flat mode, switch line if needed
	if (!configStore.isTuiStyle && sourceLineIndex !== editorStore.activeLineIndex) {
		editorStore.setActiveLineIndex(sourceLineIndex)
	}

	editorStore.scrollToSegment(segmentType, cellSegment)
}
</script>

<template>
	<div class="pointer-events-none absolute inset-0">
		<div
			v-for="(hitbox, index) in previewStore.segmentHitboxes"
			:key="`${hitbox.segmentType}-${hitbox.line}-${index}`"
			class="segment-hitbox pointer-events-auto absolute cursor-pointer rounded-sm"
			:style="{
				left: `${hitbox.charStart}ch`,
				width: `${hitbox.charWidth}ch`,
				top: `${hitbox.line * previewStore.lineHeight}em`,
				height: `${previewStore.lineHeight}em`,
			}"
			:title="hitboxTitle(hitbox.segmentType)"
			@click="handleClick(hitbox.segmentType, hitbox.sourceLineIndex, hitbox.cellSegment)"
		/>
	</div>
</template>

<style scoped>
.segment-hitbox {
	background-color: transparent;
	opacity: 0;
	transition:
		background-color 150ms ease-out,
		opacity 150ms ease-out;
}

.segment-hitbox:hover {
	background-color: rgb(255 255 255 / 0.1);
	opacity: 1;
	transition:
		background-color 0ms,
		opacity 0ms;
}

@media (prefers-reduced-motion: reduce) {
	.segment-hitbox {
		transition: none;
	}

	.segment-hitbox:hover {
		transition: none;
	}
}
</style>
