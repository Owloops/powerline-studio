import { ref, computed, reactive, watch } from 'vue'
import { defineStore } from 'pinia'

export type SidebarPanel = 'theme' | 'style' | 'segments' | 'tui' | 'mockData' | 'export'

export const useEditorStore = defineStore('editor', () => {
	const selectedSegment = ref<string | null>(null)
	const activePanel = ref<SidebarPanel>('segments')
	const expandedSections = reactive(new Set<string>())
	const activeLineIndex = ref(0)
	let skipSelectionClear = false

	// --- Computed ---

	const hasSelection = computed(() => selectedSegment.value !== null)

	// --- Watchers ---

	// Clamp activeLineIndex when lines array shrinks (removeLine, loadConfig, $reset)
	const configStore = useConfigStore()
	watch(
		() => configStore.config.display.lines.length,
		(len) => {
			if (activeLineIndex.value >= len) {
				activeLineIndex.value = Math.max(0, len - 1)
			}
		},
	)

	// Clear segment selection when switching lines (unless selectSegment is performing a line switch)
	watch(activeLineIndex, () => {
		if (skipSelectionClear) {
			skipSelectionClear = false
			return
		}
		clearSelection()
	})

	// --- Mutations ---

	function selectSegment(name: string, sourceLineIndex?: number) {
		if (sourceLineIndex !== undefined && sourceLineIndex !== activeLineIndex.value) {
			skipSelectionClear = true
			activeLineIndex.value = sourceLineIndex
		}
		selectedSegment.value = name
		activePanel.value = 'segments'
	}

	function clearSelection() {
		selectedSegment.value = null
	}

	function setActivePanel(panel: SidebarPanel) {
		activePanel.value = panel
	}

	function toggleSection(sectionId: string) {
		if (expandedSections.has(sectionId)) {
			expandedSections.delete(sectionId)
		} else {
			expandedSections.add(sectionId)
		}
	}

	function setActiveLineIndex(index: number) {
		activeLineIndex.value = index
	}

	return {
		selectedSegment,
		activePanel,
		expandedSections,
		activeLineIndex,
		// Computed
		hasSelection,
		// Mutations
		selectSegment,
		clearSelection,
		setActivePanel,
		toggleSection,
		setActiveLineIndex,
	}
})
