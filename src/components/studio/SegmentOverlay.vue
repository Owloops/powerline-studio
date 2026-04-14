<script setup lang="ts">
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { isSegmentKey, type SegmentKey } from '@/components/studio/segments/segmentMeta'
import SegmentConfigContent from '@/components/studio/editor/SegmentConfigContent.vue'
import TuiCellContent from '@/components/studio/editor/TuiCellContent.vue'
import TemplateEditor from '@/components/studio/tui/TemplateEditor.vue'

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

// --- Popover state ---

const popoverOpen = ref(false)
const activeSegment = ref<{
	key: SegmentKey
	lineIndex: number
	cellSegment?: string
} | null>(null)
const activeTitleFooter = ref<'title' | 'footer' | null>(null)
const anchorStyle = ref<{
	position: string
	top: string
	left: string
	width: string
	height: string
}>()

const isTui = computed(() => configStore.isTuiStyle)

// --- Title/Footer config ---

const titleConfig = computed(() => configStore.config.display.tui?.title)
const footerConfig = computed(() => configStore.config.display.tui?.footer)

function updateTitleLeft(value: string | undefined) {
	configStore.setTuiTitle({ left: value })
}

function updateTitleRight(value: string | undefined) {
	configStore.setTuiTitle({ right: value })
}

function updateFooterLeft(value: string | undefined) {
	configStore.setTuiFooter({ left: value })
}

function updateFooterRight(value: string | undefined) {
	configStore.setTuiFooter({ right: value })
}

// --- Handlers ---

function positionAnchor(event: MouseEvent) {
	const el = event.currentTarget as HTMLElement
	const rect = el.getBoundingClientRect()
	anchorStyle.value = {
		position: 'fixed',
		top: `${rect.top}px`,
		left: `${rect.left}px`,
		width: `${rect.width}px`,
		height: `${rect.height}px`,
	}
}

function handleClick(
	event: MouseEvent,
	segmentType: string,
	sourceLineIndex: number,
	cellSegment?: string,
) {
	if (segmentType === '__title_left' || segmentType === '__title_right') {
		positionAnchor(event)
		activeSegment.value = null
		activeTitleFooter.value = 'title'
		popoverOpen.value = true
		return
	}
	if (segmentType === '__footer_left' || segmentType === '__footer_right') {
		positionAnchor(event)
		activeSegment.value = null
		activeTitleFooter.value = 'footer'
		popoverOpen.value = true
		return
	}

	if (!isSegmentKey(segmentType)) return

	positionAnchor(event)
	activeTitleFooter.value = null
	activeSegment.value = { key: segmentType, lineIndex: sourceLineIndex, cellSegment }
	popoverOpen.value = true
}

function handleRemove() {
	popoverOpen.value = false
	activeSegment.value = null
}

function handleSwap(newSegment: string) {
	const old = activeSegment.value?.cellSegment
	if (!old) return
	const tui = configStore.config.display.tui
	if (!tui) return
	for (const bp of tui.breakpoints) {
		bp.areas = bp.areas.map((row) => {
			if (row.trim() === '---') return row
			return row
				.trim()
				.split(/\s+/)
				.map((cell) => (cell === old ? newSegment : cell))
				.join(' ')
		})
	}
	popoverOpen.value = false
	activeSegment.value = null
}

function handleOpenChange(open: boolean) {
	popoverOpen.value = open
	if (!open) {
		activeSegment.value = null
		activeTitleFooter.value = null
	}
}
</script>

<template>
	<div class="pointer-events-none absolute inset-0">
		<div
			v-for="(hitbox, index) in previewStore.segmentHitboxes"
			:key="`${hitbox.segmentType}-${hitbox.line}-${index}`"
			role="button"
			tabindex="0"
			:aria-label="`Configure ${hitboxTitle(hitbox.segmentType)} segment`"
			class="segment-hitbox pointer-events-auto absolute cursor-pointer rounded-sm"
			:style="{
				left: `${hitbox.charStart}ch`,
				width: `${hitbox.charWidth}ch`,
				top: `${hitbox.line * previewStore.effectiveLineHeight}em`,
				height: `${previewStore.effectiveLineHeight}em`,
			}"
			@click="handleClick($event, hitbox.segmentType, hitbox.sourceLineIndex, hitbox.cellSegment)"
			@keydown.enter="
				handleClick($event, hitbox.segmentType, hitbox.sourceLineIndex, hitbox.cellSegment)
			"
			@keydown.space.prevent="
				handleClick($event, hitbox.segmentType, hitbox.sourceLineIndex, hitbox.cellSegment)
			"
		/>

		<!-- Inline config popover anchored to clicked hitbox -->
		<Popover :open="popoverOpen" @update:open="handleOpenChange">
			<PopoverAnchor v-if="anchorStyle" as="div" class="pointer-events-none" :style="anchorStyle" />
			<PopoverContent
				v-if="activeTitleFooter || activeSegment"
				:side-offset="8"
				align="start"
				class="w-96 p-0"
				@open-auto-focus.prevent
			>
				<!-- Title/Footer -->
				<template v-if="activeTitleFooter">
					<div class="flex items-center gap-1.5 px-4 pt-3 pb-3">
						<IconLucide-panel-top
							v-if="activeTitleFooter === 'title'"
							class="size-3.5 text-muted-foreground"
						/>
						<IconLucide-panel-bottom v-else class="size-3.5 text-muted-foreground" />
						<span class="text-xs font-medium">
							{{ activeTitleFooter === 'title' ? 'Title Bar' : 'Footer' }}
						</span>
					</div>
					<Separator />
					<div class="px-4 py-3">
						<TemplateEditor
							v-if="activeTitleFooter === 'title'"
							label="Title Bar"
							:left="titleConfig?.left"
							:right="titleConfig?.right"
							left-placeholder="{model}"
							@update:left="updateTitleLeft"
							@update:right="updateTitleRight"
						/>
						<TemplateEditor
							v-else
							label="Footer"
							:left="footerConfig?.left"
							:right="footerConfig?.right"
							@update:left="updateFooterLeft"
							@update:right="updateFooterRight"
						/>
					</div>
				</template>

				<!-- TUI segment cell -->
				<TuiCellContent
					v-else-if="isTui && activeSegment?.cellSegment"
					:cell-segment="activeSegment.cellSegment"
					@swap="handleSwap"
				/>

				<!-- Flat segment -->
				<SegmentConfigContent
					v-else-if="activeSegment"
					:segment-key="activeSegment.key"
					:line-index="activeSegment.lineIndex"
					@remove="handleRemove"
				/>
			</PopoverContent>
		</Popover>
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
