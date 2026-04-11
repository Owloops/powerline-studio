import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
	PowerlineConfig,
	LineConfig,
	ColorTheme,
	TuiGridConfig,
} from '@owloops/claude-powerline/browser'
import { DEFAULT_CONFIG } from '@owloops/claude-powerline/browser'
import { deepMerge } from './utils'
import { useEditorStore } from './editor'

type SegmentName = keyof LineConfig['segments']

/**
 * Canonical defaults for all 13 segment types, including `env`
 * which is absent from upstream DEFAULT_CONFIG.
 * Typed as Required<LineConfig['segments']> for per-segment type safety.
 */
export const SEGMENT_DEFAULTS: Required<LineConfig['segments']> = {
	directory: {
		enabled: false,
		style: 'basename',
	},
	git: {
		enabled: false,
		showSha: false,
		showWorkingTree: false,
		showOperation: false,
		showTag: false,
		showTimeSinceCommit: false,
		showStashCount: false,
		showUpstream: false,
		showRepoName: false,
	},
	model: { enabled: false },
	session: { enabled: false, type: 'tokens', costSource: 'calculated' },
	today: { enabled: false, type: 'cost' },
	block: {
		enabled: false,
		type: 'cost',
		burnType: 'cost',
		displayStyle: 'text',
	},
	weekly: { enabled: false, displayStyle: 'text' },
	version: { enabled: false },
	tmux: { enabled: false },
	sessionId: { enabled: false, showIdLabel: true },
	context: {
		enabled: false,
		showPercentageOnly: false,
		displayStyle: 'text',
		autocompactBuffer: 33000,
	},
	metrics: {
		enabled: false,
		showResponseTime: true,
		showLastResponseTime: true,
		showDuration: true,
		showMessageCount: true,
		showLinesAdded: true,
		showLinesRemoved: true,
	},
	env: {
		enabled: false,
		variable: '',
	},
}

export const useConfigStore = defineStore('config', () => {
	const config = ref<PowerlineConfig>(structuredClone(DEFAULT_CONFIG))

	// --- Computed ---

	const configJson = computed(() => JSON.stringify(config.value, null, 2))
	const activeStyle = computed(() => config.value.display.style)
	const isTuiStyle = computed(() => config.value.display.style === 'tui')

	function enabledSegments(lineIndex: number): string[] {
		const line = config.value.display.lines[lineIndex]
		if (!line) return []
		return Object.entries(line.segments)
			.filter(([, cfg]) => cfg?.enabled)
			.map(([name]) => name)
	}

	// --- Mutations ---

	function setTheme(theme: PowerlineConfig['theme']) {
		config.value.theme = theme
	}

	function setStyle(style: NonNullable<PowerlineConfig['display']['style']>) {
		config.value.display.style = style
	}

	function setCharset(charset: 'unicode' | 'text') {
		config.value.display.charset = charset
	}

	function setColorCompatibility(
		mode: NonNullable<PowerlineConfig['display']['colorCompatibility']>,
	) {
		config.value.display.colorCompatibility = mode
	}

	function setPadding(n: number) {
		config.value.display.padding = Math.max(0, Math.min(3, n))
	}

	function setAutoWrap(enabled: boolean) {
		config.value.display.autoWrap = enabled
	}

	function setTuiConfig(tui: TuiGridConfig | undefined) {
		config.value.display.tui = tui
	}

	function updateSegmentConfig(
		lineIndex: number,
		segmentName: SegmentName,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		patch: Record<string, any>,
	) {
		const line = config.value.display.lines[lineIndex]
		if (!line) return
		const existing = line.segments[segmentName]
		if (existing) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			line.segments[segmentName] = deepMerge(existing as any, patch) as any
		} else {
			const defaults = SEGMENT_DEFAULTS[segmentName]
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			line.segments[segmentName] = deepMerge({ ...defaults } as any, patch) as any
		}
	}

	function toggleSegment(lineIndex: number, segmentName: SegmentName, enabled: boolean) {
		const line = config.value.display.lines[lineIndex]
		if (!line) return
		if (!line.segments[segmentName]) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			line.segments[segmentName] = { ...SEGMENT_DEFAULTS[segmentName] } as any
		}
		line.segments[segmentName]!.enabled = enabled
	}

	function reorderSegments(lineIndex: number, orderedNames: SegmentName[]) {
		const line = config.value.display.lines[lineIndex]
		if (!line) return

		const existing = line.segments
		const reordered: LineConfig['segments'] = {}

		// Add segments in the requested order (only those that exist in the line)
		for (const name of orderedNames) {
			if (name in existing) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				reordered[name] = existing[name] as any
			}
		}

		// Append any existing segments not mentioned in orderedNames
		const orderedSet = new Set<string>(orderedNames)
		for (const name of Object.keys(existing) as SegmentName[]) {
			if (!orderedSet.has(name)) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				reordered[name] = existing[name] as any
			}
		}

		line.segments = reordered
	}

	function addLine() {
		const newLine: LineConfig = {
			segments: structuredClone(SEGMENT_DEFAULTS),
		}
		config.value.display.lines.push(newLine)
	}

	function removeLine(lineIndex: number) {
		if (config.value.display.lines.length <= 1) return
		config.value.display.lines.splice(lineIndex, 1)

		// Clamp editor's activeLineIndex to valid range
		const editorStore = useEditorStore()
		editorStore.setActiveLineIndex(
			Math.min(editorStore.activeLineIndex, config.value.display.lines.length - 1),
		)
	}

	function setBudget(path: string, value: number) {
		if (!config.value.budget) {
			config.value.budget = {}
		}
		const parts = path.split('.')
		if (parts.length === 2) {
			const [category, field] = parts as [string, string]
			const budget = config.value.budget as Record<string, Record<string, unknown> | undefined>
			if (!budget[category]) {
				budget[category] = {}
			}
			budget[category]![field] = value
		}
	}

	function setModelContextLimit(model: string, limit: number) {
		if (!config.value.modelContextLimits) {
			config.value.modelContextLimits = {}
		}
		config.value.modelContextLimits[model] = limit
	}

	function setCustomColors(colors: ColorTheme) {
		config.value.colors = { custom: colors }
	}

	function loadConfig(partial: Partial<PowerlineConfig>) {
		config.value = deepMerge(structuredClone(DEFAULT_CONFIG), partial as PowerlineConfig)
	}

	function $reset() {
		config.value = structuredClone(DEFAULT_CONFIG)
	}

	return {
		config,
		// Computed
		configJson,
		activeStyle,
		isTuiStyle,
		enabledSegments,
		// Mutations
		setTheme,
		setStyle,
		setCharset,
		setColorCompatibility,
		setPadding,
		setAutoWrap,
		setTuiConfig,
		updateSegmentConfig,
		toggleSegment,
		reorderSegments,
		addLine,
		removeLine,
		setBudget,
		setModelContextLimit,
		setCustomColors,
		loadConfig,
		$reset,
	}
})
