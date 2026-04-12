import { ref, shallowRef, computed } from 'vue'
import { defineStore } from 'pinia'
import { useConfigStore } from './config'
import type { SegmentHitbox } from '@/lib/segmentHitboxes'
import { getTerminalFont } from '@/lib/terminalFonts'
import { getTerminalTheme } from '@/lib/terminalThemes'

export const usePreviewStore = defineStore('preview', () => {
	const configStore = useConfigStore()

	// --- State ---

	const terminalWidth = ref(145)
	const colorMode = ref<'truecolor' | 'ansi256' | 'ansi' | 'none'>('truecolor')
	const terminalTheme = ref('catppuccin-mocha')
	const terminalFont = ref('firacode')
	const fontSize = ref(14)
	const lineHeight = ref(1)
	const reservedWidth = ref(45)
	const ansiOutput = ref('')
	const htmlOutput = ref('')
	const segmentHitboxes = shallowRef<SegmentHitbox[]>([])

	// --- Computed ---

	const charset = computed(() => configStore.config.display.charset ?? 'unicode')

	const resolvedFont = computed(() => getTerminalFont(terminalFont.value))
	const terminalFontFamily = computed(
		() => `'${resolvedFont.value.fontFamily}', 'FiraCode Nerd Font Mono', monospace`,
	)
	const resolvedTheme = computed(() => getTerminalTheme(terminalTheme.value))
	const darkBackground = computed(() => resolvedTheme.value.isDark)
	const terminalBgColor = computed(() => resolvedTheme.value.bg)
	const terminalFgColor = computed(() => resolvedTheme.value.fg)

	const baseLineHeight = computed(() =>
		configStore.isTuiStyle ? resolvedFont.value.tuiLineHeight : 1.5,
	)
	const effectiveLineHeight = computed(() => {
		const offset = lineHeight.value - 1
		return Math.round((baseLineHeight.value + offset) * 100) / 100
	})

	// --- Mutations ---

	function setTerminalWidth(width: number) {
		terminalWidth.value = Math.max(30, Math.min(240, width))
	}

	function setColorMode(mode: 'truecolor' | 'ansi256' | 'ansi' | 'none') {
		colorMode.value = mode
	}

	function setTerminalTheme(id: string) {
		terminalTheme.value = id
	}

	function setRenderedOutput(ansi: string, html: string, hitboxes?: SegmentHitbox[]) {
		ansiOutput.value = ansi
		htmlOutput.value = html
		if (hitboxes) {
			segmentHitboxes.value = hitboxes
		}
	}

	function setSegmentHitboxes(hitboxes: SegmentHitbox[]) {
		segmentHitboxes.value = hitboxes
	}

	function clearOutput() {
		ansiOutput.value = ''
		htmlOutput.value = ''
		segmentHitboxes.value = []
	}

	return {
		terminalWidth,
		colorMode,
		terminalTheme,
		terminalFont,
		terminalFontFamily,
		fontSize,
		lineHeight,
		reservedWidth,
		darkBackground,
		terminalBgColor,
		terminalFgColor,
		ansiOutput,
		htmlOutput,
		segmentHitboxes,
		// Computed
		charset,
		effectiveLineHeight,
		// Mutations
		setTerminalWidth,
		setColorMode,
		setTerminalTheme,
		setRenderedOutput,
		setSegmentHitboxes,
		clearOutput,
	}
})
