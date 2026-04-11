import { ref, computed, reactive, watch } from 'vue'
import { defineStore } from 'pinia'

export type SidebarPanel = 'appearance' | 'segments' | 'tui' | 'mockData' | 'export'

/**
 * TUI area targets for navigation from preview clicks.
 * 'title' / 'footer' open the corresponding collapsible section in TuiLayoutPanel.
 * A segment name (e.g. 'context', 'model') highlights the grid area.
 */
export type TuiAreaTarget =
	| { kind: 'title' }
	| { kind: 'footer' }
	| { kind: 'segment'; name: string }

export const useEditorStore = defineStore('editor', () => {
	const selectedSegment = ref<string | null>(null)
	const activePanel = ref<SidebarPanel>('segments')
	const expandedSections = reactive(new Set<string>())
	const activeLineIndex = ref(0)
	const selectedTuiArea = ref<TuiAreaTarget | null>(null)
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

	// Auto-redirect when display style changes
	watch(
		() => configStore.isTuiStyle,
		(isTui) => {
			if (isTui && activePanel.value === 'segments') {
				activePanel.value = 'tui'
			} else if (!isTui && activePanel.value === 'tui') {
				activePanel.value = 'segments'
			}
		},
	)

	// --- Mutations ---

	function selectSegment(name: string, sourceLineIndex?: number) {
		// TUI-aware: navigate to TUI layout panel instead of Segments panel
		if (configStore.isTuiStyle) {
			selectedTuiArea.value = { kind: 'segment', name }
			activePanel.value = 'tui'
			return
		}

		if (sourceLineIndex !== undefined && sourceLineIndex !== activeLineIndex.value) {
			skipSelectionClear = true
			activeLineIndex.value = sourceLineIndex
		}
		selectedSegment.value = name
		activePanel.value = 'segments'
	}

	function selectTuiArea(target: TuiAreaTarget) {
		selectedTuiArea.value = target
		activePanel.value = 'tui'
	}

	function clearTuiArea() {
		selectedTuiArea.value = null
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
		selectedTuiArea,
		// Computed
		hasSelection,
		// Mutations
		selectSegment,
		selectTuiArea,
		clearTuiArea,
		clearSelection,
		setActivePanel,
		toggleSection,
		setActiveLineIndex,
	}
})
