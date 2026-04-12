import { computed, reactive, toRaw, watch } from 'vue'
import { defineStore } from 'pinia'
import type {
	PowerlineConfig,
	LineConfig,
	ColorTheme,
	SegmentColor,
	TuiGridConfig,
	TuiTitleConfig,
	TuiFooterConfig,
	SegmentTemplate,
	AlignValue,
} from '@owloops/claude-powerline/browser'
import { DEFAULT_CONFIG } from '@owloops/claude-powerline/browser'
import { deepMerge } from './utils'
import { useEditorStore } from './editor'
import { normalizeSegments } from '@/components/studio/segments/segmentMeta'
import type { CanonicalTheme, ThemeEditorState, SavedCustomTheme } from '@/lib/themes'
import type { TuiPreset } from '@/lib/tuiPresets'
import type { FlatPreset } from '@/lib/flatPresets'
import {
	CANONICAL_THEMES,
	getCanonicalThemeColors,
	mergeThemeWithOverrides,
	deepEqualColorTheme,
} from '@/lib/themes'

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
	const config = useStorage<PowerlineConfig>(
		'powerline-studio-config',
		structuredClone(DEFAULT_CONFIG),
		undefined,
		{
			mergeDefaults: (stored, defaults) => deepMerge(defaults, stored),
			initOnMounted: true,
		},
	)

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

	const currentLineSegments = computed(() => {
		const editorStore = useEditorStore()
		const line = config.value.display.lines[editorStore.activeLineIndex]
		if (!line) return normalizeSegments({}, SEGMENT_DEFAULTS)
		return normalizeSegments(line.segments, SEGMENT_DEFAULTS)
	})

	// --- Mutations ---

	function setTheme(theme: PowerlineConfig['theme']) {
		config.value.theme = theme
	}

	function setStyle(style: NonNullable<PowerlineConfig['display']['style']>) {
		config.value.display.style = style
		if (style === 'tui') {
			ensureTuiConfig()
		}
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

	function applyTuiPreset(preset: TuiPreset) {
		config.value.display.style = 'tui'
		config.value.display.padding = 0
		config.value.display.tui = structuredClone(preset.tui) as TuiGridConfig
		// Replace the first line's segments with preset segments, keep remaining lines
		const presetSegments = structuredClone(preset.segments) as LineConfig['segments']
		if (config.value.display.lines.length === 0) {
			config.value.display.lines.push({ segments: presetSegments })
		} else {
			config.value.display.lines[0]!.segments = presetSegments
		}
		// Normalize segments to ensure all 13 keys.
		// Use toRaw() to avoid leaking reactive proxies into the new plain
		// object that normalizeSegments builds — otherwise the raw object tree
		// ends up with mixed reactive/plain children that break structuredClone.
		for (const line of config.value.display.lines) {
			line.segments = normalizeSegments(toRaw(line.segments), SEGMENT_DEFAULTS)
		}
	}

	function applyFlatPreset(preset: FlatPreset) {
		config.value.display.style = preset.style
		config.value.display.tui = undefined
		// Replace lines with preset lines
		config.value.display.lines = preset.lines.map((line) => ({
			segments: normalizeSegments(
				structuredClone(line.segments) as LineConfig['segments'],
				SEGMENT_DEFAULTS,
			),
		}))
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

		// Normalize first so all 13 keys are present before reordering
		const normalized = normalizeSegments(toRaw(line.segments), SEGMENT_DEFAULTS)
		const reordered: LineConfig['segments'] = {}

		// Add segments in the requested order
		for (const name of orderedNames) {
			if (name in normalized) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				reordered[name] = normalized[name] as any
			}
		}

		// Append any remaining segments not mentioned in orderedNames
		const orderedSet = new Set<string>(orderedNames)
		for (const name of Object.keys(normalized) as SegmentName[]) {
			if (!orderedSet.has(name)) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				reordered[name] = normalized[name] as any
			}
		}

		line.segments = reordered
	}

	function addLine() {
		if (config.value.display.lines.length >= 5) return
		const newLine: LineConfig = {
			segments: {
				directory: { enabled: true, style: 'basename' },
				model: { enabled: true },
			},
		}
		config.value.display.lines.push(newLine)
	}

	function removeLine(lineIndex: number) {
		if (lineIndex === 0) return
		if (lineIndex < 0 || lineIndex >= config.value.display.lines.length) return
		if (config.value.display.lines.length <= 1) return
		config.value.display.lines.splice(lineIndex, 1)
	}

	// --- TUI Actions ---

	function ensureTuiConfig() {
		if (config.value.display.tui) return
		config.value.display.tui = {
			breakpoints: [
				{
					minWidth: 0,
					areas: ['. .'],
					columns: ['auto', '1fr'],
				},
			],
		}
	}

	function setTuiOption(
		key: 'fitContent' | 'minWidth' | 'maxWidth',
		value: number | boolean | undefined,
	) {
		ensureTuiConfig()
		const tui = config.value.display.tui!
		if (value === undefined) {
			delete tui[key]
		} else {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			;(tui as any)[key] = value
		}
	}

	function setTuiWidthReserve(value: number) {
		ensureTuiConfig()
		config.value.display.tui!.widthReserve = value
	}

	function addBreakpoint() {
		ensureTuiConfig()
		const tui = config.value.display.tui!
		const maxMin = tui.breakpoints.reduce((max, bp) => Math.max(max, bp.minWidth), 0)
		const newMinWidth = maxMin + 20
		const colCount = tui.breakpoints[0]?.columns.length ?? 2
		tui.breakpoints.push({
			minWidth: newMinWidth,
			areas: [Array(colCount).fill('.').join(' ')],
			columns: tui.breakpoints[0]?.columns.slice() ?? ['auto', '1fr'],
		})
	}

	function removeBreakpoint(bpIndex: number) {
		ensureTuiConfig()
		const tui = config.value.display.tui!
		if (tui.breakpoints.length <= 1) return
		tui.breakpoints.splice(bpIndex, 1)
	}

	function updateBreakpointMinWidth(bpIndex: number, minWidth: number) {
		ensureTuiConfig()
		const bp = config.value.display.tui!.breakpoints[bpIndex]
		if (bp) {
			bp.minWidth = minWidth
		}
	}

	function setAreaCell(bpIndex: number, rowIndex: number, colIndex: number, value: string) {
		ensureTuiConfig()
		const bp = config.value.display.tui!.breakpoints[bpIndex]
		if (!bp) return
		const row = bp.areas[rowIndex]
		if (row === undefined) return
		if (row.trim() === '---') return
		const cells = row.trim().split(/\s+/)
		cells[colIndex] = value
		bp.areas[rowIndex] = cells.join(' ')
	}

	function setAreaSpan(
		bpIndex: number,
		rowIndex: number,
		startCol: number,
		endCol: number,
		value: string,
	) {
		ensureTuiConfig()
		const bp = config.value.display.tui!.breakpoints[bpIndex]
		if (!bp) return
		const row = bp.areas[rowIndex]
		if (row === undefined) return
		if (row.trim() === '---') return
		const cells = row.trim().split(/\s+/)
		for (let i = startCol; i <= endCol; i++) {
			cells[i] = value
		}
		bp.areas[rowIndex] = cells.join(' ')
	}

	function addAreaRow(bpIndex: number, type: 'cells' | 'divider') {
		ensureTuiConfig()
		const bp = config.value.display.tui!.breakpoints[bpIndex]
		if (!bp) return
		if (type === 'divider') {
			bp.areas.push('---')
		} else {
			bp.areas.push(Array(bp.columns.length).fill('.').join(' '))
		}
	}

	function removeAreaRow(bpIndex: number, rowIndex: number) {
		ensureTuiConfig()
		const bp = config.value.display.tui!.breakpoints[bpIndex]
		if (!bp) return
		bp.areas.splice(rowIndex, 1)
	}

	function moveAreaRow(bpIndex: number, fromIndex: number, toIndex: number) {
		ensureTuiConfig()
		const bp = config.value.display.tui!.breakpoints[bpIndex]
		if (!bp) return
		if (fromIndex < 0 || fromIndex >= bp.areas.length) return
		if (toIndex < 0 || toIndex >= bp.areas.length) return
		const [row] = bp.areas.splice(fromIndex, 1)
		bp.areas.splice(toIndex, 0, row!)
	}

	function addColumn(bpIndex: number) {
		ensureTuiConfig()
		const bp = config.value.display.tui!.breakpoints[bpIndex]
		if (!bp) return
		bp.columns.push('auto')
		for (let i = 0; i < bp.areas.length; i++) {
			const row = bp.areas[i]!
			if (row.trim() === '---') continue
			bp.areas[i] = row + ' .'
		}
		if (bp.align) {
			bp.align.push('left')
		}
	}

	function removeColumn(bpIndex: number, colIndex: number) {
		ensureTuiConfig()
		const bp = config.value.display.tui!.breakpoints[bpIndex]
		if (!bp || bp.columns.length <= 1) return
		bp.columns.splice(colIndex, 1)
		for (let i = 0; i < bp.areas.length; i++) {
			const row = bp.areas[i]!
			if (row.trim() === '---') continue
			const cells = row.trim().split(/\s+/)
			cells.splice(colIndex, 1)
			bp.areas[i] = cells.join(' ')
		}
		if (bp.align) {
			bp.align.splice(colIndex, 1)
		}
	}

	function setColumnDef(bpIndex: number, colIndex: number, value: string) {
		ensureTuiConfig()
		const bp = config.value.display.tui!.breakpoints[bpIndex]
		if (!bp) return
		bp.columns[colIndex] = value
	}

	function setColumnAlign(bpIndex: number, colIndex: number, value: AlignValue) {
		ensureTuiConfig()
		const bp = config.value.display.tui!.breakpoints[bpIndex]
		if (!bp || !bp.align) return
		bp.align[colIndex] = value
	}

	function toggleAlignOverrides(bpIndex: number, enabled: boolean) {
		ensureTuiConfig()
		const bp = config.value.display.tui!.breakpoints[bpIndex]
		if (!bp) return
		if (enabled) {
			bp.align = Array(bp.columns.length).fill('left') as AlignValue[]
		} else {
			delete bp.align
		}
	}

	function setTuiBox(value: string | undefined) {
		ensureTuiConfig()
		const tui = config.value.display.tui!
		if (value === undefined) {
			delete tui.box
		} else {
			tui.box = value
		}
	}

	function setTuiTitle(title: Partial<TuiTitleConfig> | undefined) {
		ensureTuiConfig()
		const tui = config.value.display.tui!
		if (title === undefined) {
			delete tui.title
		} else {
			tui.title = { ...tui.title, ...title }
			// Clean up: remove undefined keys
			const t = tui.title!
			if (t.left === undefined) delete t.left
			if (t.right === undefined) delete t.right
			// Remove empty object
			if (Object.keys(tui.title!).length === 0) delete tui.title
		}
	}

	function setTuiFooter(footer: Partial<TuiFooterConfig> | undefined) {
		ensureTuiConfig()
		const tui = config.value.display.tui!
		if (footer === undefined) {
			delete tui.footer
		} else {
			tui.footer = { ...tui.footer, ...footer }
			const f = tui.footer!
			if (f.left === undefined) delete f.left
			if (f.right === undefined) delete f.right
			if (Object.keys(tui.footer!).length === 0) delete tui.footer
		}
	}

	function setTuiSeparator(separator: Partial<{ column: string; divider: string }> | undefined) {
		ensureTuiConfig()
		const tui = config.value.display.tui!
		if (separator === undefined) {
			delete tui.separator
		} else {
			tui.separator = { ...tui.separator, ...separator }
			const s = tui.separator!
			if (s.column === undefined) delete s.column
			if (s.divider === undefined) delete s.divider
			if (Object.keys(tui.separator!).length === 0) delete tui.separator
		}
	}

	function setTuiPadding(horizontal: number | undefined) {
		ensureTuiConfig()
		const tui = config.value.display.tui!
		if (horizontal === undefined) {
			delete tui.padding
		} else {
			tui.padding = { horizontal }
		}
	}

	function setTuiSegmentTemplate(segRef: string, template: SegmentTemplate | undefined) {
		ensureTuiConfig()
		const tui = config.value.display.tui!
		if (template === undefined) {
			if (tui.segments) {
				delete tui.segments[segRef]
				if (Object.keys(tui.segments).length === 0) delete tui.segments
			}
		} else {
			if (!tui.segments) tui.segments = {}
			tui.segments[segRef] = template
		}
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
		// Normalize all lines to ensure 13 segment keys
		for (const line of config.value.display.lines) {
			line.segments = normalizeSegments(toRaw(line.segments), SEGMENT_DEFAULTS)
		}
		rehydrateThemeEditor()
	}

	function resetToDefaults() {
		config.value = structuredClone(DEFAULT_CONFIG)
		rehydrateThemeEditor()
	}

	function $reset() {
		config.value = structuredClone(DEFAULT_CONFIG)
		rehydrateThemeEditor()
	}

	// --- Theme Editor State ---

	function resolveInitialThemeState(): ThemeEditorState {
		const currentTheme = config.value.theme
		if (currentTheme === 'custom') {
			const customColors = config.value.colors?.custom as ColorTheme | undefined
			const draft = customColors
				? structuredClone(customColors)
				: structuredClone(getCanonicalThemeColors('dark'))
			return {
				mode: 'custom',
				builtinTheme: 'dark',
				overrides: {},
				customDraft: draft,
				customSourceSnapshot: structuredClone(draft),
			}
		}
		const canonical = CANONICAL_THEMES.includes(currentTheme as CanonicalTheme)
			? (currentTheme as CanonicalTheme)
			: 'dark'
		return {
			mode: 'builtin',
			builtinTheme: canonical,
			overrides: {},
			customDraft: null,
			customSourceSnapshot: null,
		}
	}

	const themeEditor = reactive<ThemeEditorState>(resolveInitialThemeState())

	function rehydrateThemeEditor() {
		const fresh = resolveInitialThemeState()
		themeEditor.mode = fresh.mode
		themeEditor.builtinTheme = fresh.builtinTheme
		themeEditor.overrides = fresh.overrides
		themeEditor.customDraft = fresh.customDraft
		themeEditor.customSourceSnapshot = fresh.customSourceSnapshot
	}

	// --- Saved Custom Themes ---

	const savedCustomThemes = useStorage<SavedCustomTheme[]>('powerline-studio-custom-themes', [])

	function saveCustomTheme(name: string) {
		if (!themeEditor.customDraft) return
		const id = `custom-${Date.now()}`
		savedCustomThemes.value.push({
			id,
			name,
			colors: structuredClone(toRaw(themeEditor.customDraft)),
			createdAt: Date.now(),
		})
		return id
	}

	function deleteCustomTheme(id: string) {
		const index = savedCustomThemes.value.findIndex((t) => t.id === id)
		if (index !== -1) {
			savedCustomThemes.value.splice(index, 1)
		}
	}

	function loadSavedCustomTheme(saved: SavedCustomTheme) {
		themeEditor.customDraft = structuredClone(saved.colors)
		themeEditor.customSourceSnapshot = structuredClone(saved.colors)
		themeEditor.mode = 'custom'
	}

	const effectiveColors = computed<ColorTheme>(() => {
		if (themeEditor.mode === 'custom') {
			return themeEditor.customDraft ?? getCanonicalThemeColors('dark')
		}
		const base = getCanonicalThemeColors(themeEditor.builtinTheme)
		return mergeThemeWithOverrides(base, themeEditor.overrides)
	})

	const overrideCount = computed(() => Object.keys(themeEditor.overrides).length)

	const previewThemeConfig = computed<Pick<PowerlineConfig, 'theme' | 'colors'>>(() => {
		if (themeEditor.mode === 'custom') {
			return {
				theme: 'custom',
				colors: { custom: effectiveColors.value },
			}
		}
		if (overrideCount.value > 0) {
			return {
				theme: 'custom',
				colors: { custom: effectiveColors.value },
			}
		}
		return { theme: themeEditor.builtinTheme } as Pick<PowerlineConfig, 'theme' | 'colors'>
	})

	const hasModifiedCustomDraft = computed(() => {
		if (themeEditor.mode !== 'custom') return false
		return !deepEqualColorTheme(themeEditor.customDraft, themeEditor.customSourceSnapshot)
	})

	// Sync theme editor state → config for live preview
	watch(
		previewThemeConfig,
		(cfg) => {
			config.value.theme = cfg.theme
			if (cfg.colors) {
				config.value.colors = cfg.colors
			} else {
				config.value.colors = undefined as unknown as PowerlineConfig['colors']
			}
		},
		{ deep: true },
	)

	function selectBuiltInTheme(theme: CanonicalTheme) {
		themeEditor.builtinTheme = theme
		if (themeEditor.mode !== 'custom') {
			themeEditor.mode = 'builtin'
		}
	}

	function confirmSwitchToBuiltIn(theme: CanonicalTheme) {
		themeEditor.customDraft = null
		themeEditor.customSourceSnapshot = null
		themeEditor.mode = 'builtin'
		themeEditor.builtinTheme = theme
	}

	function enterCustomTheme() {
		const colors = structuredClone(effectiveColors.value)
		themeEditor.customDraft = colors
		themeEditor.customSourceSnapshot = structuredClone(colors)
		themeEditor.mode = 'custom'
	}

	function updateCustomColor(segment: keyof ColorTheme, color: SegmentColor) {
		if (themeEditor.customDraft) {
			themeEditor.customDraft[segment] = { ...color }
		}
	}

	function setColorOverride(segment: keyof ColorTheme, color: SegmentColor) {
		const base = getCanonicalThemeColors(themeEditor.builtinTheme)[segment]
		if (base.bg === color.bg && base.fg === color.fg) {
			delete themeEditor.overrides[segment]
		} else {
			themeEditor.overrides[segment] = { ...color }
		}
	}

	function resetSegmentOverride(segment: keyof ColorTheme) {
		delete themeEditor.overrides[segment]
	}

	return {
		config,
		// Computed
		configJson,
		activeStyle,
		isTuiStyle,
		enabledSegments,
		currentLineSegments,
		// Mutations
		setTheme,
		setStyle,
		setCharset,
		setColorCompatibility,
		setPadding,
		setAutoWrap,
		setTuiConfig,
		applyTuiPreset,
		applyFlatPreset,
		// TUI actions
		ensureTuiConfig,
		setTuiOption,
		setTuiWidthReserve,
		addBreakpoint,
		removeBreakpoint,
		updateBreakpointMinWidth,
		setAreaCell,
		setAreaSpan,
		addAreaRow,
		removeAreaRow,
		moveAreaRow,
		addColumn,
		removeColumn,
		setColumnDef,
		setColumnAlign,
		toggleAlignOverrides,
		// TUI accessory actions
		setTuiBox,
		setTuiTitle,
		setTuiFooter,
		setTuiSeparator,
		setTuiPadding,
		setTuiSegmentTemplate,
		updateSegmentConfig,
		toggleSegment,
		reorderSegments,
		addLine,
		removeLine,
		setBudget,
		setModelContextLimit,
		setCustomColors,
		loadConfig,
		resetToDefaults,
		$reset,
		// Theme editor
		themeEditor,
		effectiveColors,
		overrideCount,
		previewThemeConfig,
		hasModifiedCustomDraft,
		selectBuiltInTheme,
		confirmSwitchToBuiltIn,
		enterCustomTheme,
		updateCustomColor,
		setColorOverride,
		resetSegmentOverride,
		// Saved custom themes
		savedCustomThemes,
		saveCustomTheme,
		deleteCustomTheme,
		loadSavedCustomTheme,
	}
})
