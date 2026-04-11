<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
const canAddLine = computed(() => lines.value.length < 5)

// Tabs v-model: maps numeric activeLineIndex ↔ string tab value
const activeTab = computed({
	get: () => `line-${editorStore.activeLineIndex}`,
	set: (val: string) => {
		const index = Number.parseInt(val.replace('line-', ''), 10)
		if (!Number.isNaN(index)) {
			editorStore.setActiveLineIndex(index)
		}
	},
})

// --- Remove line dialog state ---

const lineToRemove = ref<number | null>(null)
const dialogOpen = computed({
	get: () => lineToRemove.value !== null,
	set: (open: boolean) => {
		if (!open) lineToRemove.value = null
	},
})

function requestRemoveLine(index: number) {
	lineToRemove.value = index
}

function confirmRemoveLine() {
	if (lineToRemove.value !== null) {
		configStore.removeLine(lineToRemove.value)
		lineToRemove.value = null
	}
}

function handleAddLine() {
	configStore.addLine()
	// Auto-select the newly added line
	editorStore.setActiveLineIndex(configStore.config.display.lines.length - 1)
}
</script>

<template>
	<div class="flex items-center gap-1">
		<Tabs v-model="activeTab" class="min-w-0 flex-1">
			<TabsList class="h-8 w-full overflow-x-auto">
				<div v-for="(_, index) in lines" :key="index" class="flex items-center">
					<TabsTrigger :value="`line-${index}`" class="h-7 px-2 text-xs">
						Line {{ index + 1 }}
					</TabsTrigger>
					<button
						v-if="index > 0"
						class="ml-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
						@click.stop="requestRemoveLine(index)"
					>
						<X class="size-3" />
						<span class="sr-only">Remove Line {{ index + 1 }}</span>
					</button>
				</div>
			</TabsList>
		</Tabs>

		<Button
			variant="ghost"
			size="icon-sm"
			:disabled="!canAddLine"
			class="shrink-0"
			@click="handleAddLine"
		>
			<Plus class="size-4" />
			<span class="sr-only">Add Line</span>
		</Button>
	</div>

	<!-- Remove line confirmation dialog -->
	<Dialog v-model:open="dialogOpen">
		<DialogContent :show-close-button="false">
			<DialogHeader>
				<DialogTitle>Remove Line {{ lineToRemove !== null ? lineToRemove + 1 : '' }}?</DialogTitle>
				<DialogDescription>
					This will delete all segments configured for this line.
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button variant="outline" @click="lineToRemove = null"> Cancel </Button>
				<Button variant="destructive" @click="confirmRemoveLine"> Remove </Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
