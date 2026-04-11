import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'

export type SidebarPanel = 'theme' | 'style' | 'segments' | 'tui' | 'mockData' | 'export'

export const useEditorStore = defineStore('editor', () => {
	const selectedSegment = ref<string | null>(null)
	const activePanel = ref<SidebarPanel>('segments')
	const expandedSections = reactive(new Set<string>())
	const activeLineIndex = ref(0)

	// --- Computed ---

	const hasSelection = computed(() => selectedSegment.value !== null)

	// --- Mutations ---

	function selectSegment(name: string) {
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
