<script setup lang="ts">
const previewStore = usePreviewStore()
const editorStore = useEditorStore()

function handleClick(segmentType: string, sourceLineIndex: number) {
	editorStore.selectSegment(segmentType, sourceLineIndex)
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
			:title="hitbox.segmentType"
			@click="handleClick(hitbox.segmentType, hitbox.sourceLineIndex)"
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
