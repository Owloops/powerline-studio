import { ref, computed, reactive, watch } from 'vue'
import { defineStore } from 'pinia'

/**
 * TUI area targets for navigation from preview clicks.
 * 'title' / 'footer' open the corresponding collapsible section in TuiLayoutPanel.
 * A segment name (e.g. 'context', 'model') highlights the grid area.
 */
export type TuiAreaTarget =
	| { kind: 'title' }
	| { kind: 'footer' }
	| { kind: 'segment'; name: string; cellSegment?: string }

export interface FocusedSegment {
	name: string
	cellSegment?: string
	source: 'preview' | 'editor'
}

export const useEditorStore = defineStore('editor', () => {
	const selectedSegment = ref<string | null>(null)
	const expandedSections = reactive(new Set<string>())
	const activeLineIndex = ref(0)
	const selectedTuiArea = ref<TuiAreaTarget | null>(null)
	const focusedSegment = ref<FocusedSegment | null>(null)
	const showPreviewControls = ref(false)
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

	function selectSegment(name: string, sourceLineIndex?: number, cellSegment?: string) {
		// TUI-aware: set TUI area target
		if (configStore.isTuiStyle) {
			selectedTuiArea.value = { kind: 'segment', name, cellSegment }
			return
		}

		if (sourceLineIndex !== undefined && sourceLineIndex !== activeLineIndex.value) {
			skipSelectionClear = true
			activeLineIndex.value = sourceLineIndex
		}
		selectedSegment.value = name
	}

	function selectTuiArea(target: TuiAreaTarget) {
		selectedTuiArea.value = target
	}

	function clearTuiArea() {
		selectedTuiArea.value = null
	}

	function clearSelection() {
		selectedSegment.value = null
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

	function scrollToSegment(name: string, cellSegment?: string) {
		focusedSegment.value = { name, cellSegment, source: 'preview' }
	}

	function clearFocusedSegment() {
		focusedSegment.value = null
	}

	function togglePreviewControls() {
		showPreviewControls.value = !showPreviewControls.value
	}

	return {
		selectedSegment,
		expandedSections,
		activeLineIndex,
		selectedTuiArea,
		focusedSegment,
		showPreviewControls,
		// Computed
		hasSelection,
		// Mutations
		selectSegment,
		selectTuiArea,
		clearTuiArea,
		clearSelection,
		toggleSection,
		setActiveLineIndex,
		scrollToSegment,
		clearFocusedSegment,
		togglePreviewControls,
	}
})
