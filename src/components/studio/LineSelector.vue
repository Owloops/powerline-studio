<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const lines = computed(() => configStore.config.display.lines)
const lineCount = computed(() => lines.value.length)
const canAddLine = computed(() => lineCount.value < 5)
const canRemoveLine = computed(() => lineCount.value > 1 && editorStore.activeLineIndex > 0)
const hasPrev = computed(() => editorStore.activeLineIndex > 0)
const hasNext = computed(() => editorStore.activeLineIndex < lineCount.value - 1)

function goToPrev() {
	if (hasPrev.value) {
		editorStore.setActiveLineIndex(editorStore.activeLineIndex - 1)
	}
}

function goToNext() {
	if (hasNext.value) {
		editorStore.setActiveLineIndex(editorStore.activeLineIndex + 1)
	}
}

function handleAddLine() {
	configStore.addLine()
	editorStore.setActiveLineIndex(configStore.config.display.lines.length - 1)
}

// --- Remove line dialog state ---

const dialogOpen = ref(false)

function requestRemoveLine() {
	if (canRemoveLine.value) {
		dialogOpen.value = true
	}
}

function confirmRemoveLine() {
	configStore.removeLine(editorStore.activeLineIndex)
	dialogOpen.value = false
}
</script>

<template>
	<div class="flex items-center gap-2">
		<!-- Prev/Next arrows + Line label -->
		<div class="flex min-w-0 flex-1 items-center gap-1">
			<Button
				variant="ghost"
				size="icon-sm"
				:disabled="!hasPrev"
				class="shrink-0"
				@click="goToPrev"
			>
				<ChevronLeft class="size-4" />
				<span class="sr-only">Previous line</span>
			</Button>

			<span class="min-w-0 text-sm font-medium">
				Line {{ editorStore.activeLineIndex + 1 }}
				<span class="text-muted-foreground">of {{ lineCount }}</span>
			</span>

			<Button
				variant="ghost"
				size="icon-sm"
				:disabled="!hasNext"
				class="shrink-0"
				@click="goToNext"
			>
				<ChevronRight class="size-4" />
				<span class="sr-only">Next line</span>
			</Button>
		</div>

		<!-- Remove line button -->
		<Button
			v-if="canRemoveLine"
			variant="ghost"
			size="icon-sm"
			class="shrink-0 text-muted-foreground hover:text-destructive"
			@click="requestRemoveLine"
		>
			<Trash2 class="size-4" />
			<span class="sr-only">Remove Line {{ editorStore.activeLineIndex + 1 }}</span>
		</Button>

		<!-- Add line button -->
		<Button
			variant="outline"
			size="sm"
			:disabled="!canAddLine"
			class="shrink-0"
			@click="handleAddLine"
		>
			<Plus class="size-4" />
			Add Line
		</Button>
	</div>

	<!-- Remove line confirmation dialog -->
	<Dialog v-model:open="dialogOpen">
		<DialogContent :show-close-button="false">
			<DialogHeader>
				<DialogTitle>Remove Line {{ editorStore.activeLineIndex + 1 }}?</DialogTitle>
				<DialogDescription>
					This will delete all segments configured for this line.
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button variant="outline" @click="dialogOpen = false"> Cancel </Button>
				<Button variant="destructive" @click="confirmRemoveLine"> Remove </Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
