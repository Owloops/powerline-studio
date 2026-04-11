import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useConfigStore } from './config'

export const usePreviewStore = defineStore('preview', () => {
	const configStore = useConfigStore()

	// --- State ---

	const terminalWidth = ref(120)
	const colorMode = ref<'truecolor' | 'ansi256' | 'ansi' | 'none'>('truecolor')
	const darkBackground = ref(true)
	const ansiOutput = ref('')
	const htmlOutput = ref('')

	// --- Computed ---

	const charset = computed(() => configStore.config.display.charset ?? 'unicode')

	// --- Mutations ---

	function setTerminalWidth(width: number) {
		terminalWidth.value = Math.max(30, Math.min(200, width))
	}

	function setColorMode(mode: 'truecolor' | 'ansi256' | 'ansi' | 'none') {
		colorMode.value = mode
	}

	function toggleBackground() {
		darkBackground.value = !darkBackground.value
	}

	function setRenderedOutput(ansi: string, html: string) {
		ansiOutput.value = ansi
		htmlOutput.value = html
	}

	function clearOutput() {
		ansiOutput.value = ''
		htmlOutput.value = ''
	}

	return {
		terminalWidth,
		colorMode,
		darkBackground,
		ansiOutput,
		htmlOutput,
		// Computed
		charset,
		// Mutations
		setTerminalWidth,
		setColorMode,
		toggleBackground,
		setRenderedOutput,
		clearOutput,
	}
})
