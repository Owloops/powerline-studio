import { AnsiUp } from 'ansi_up'
import { useConfigStore } from '@/stores/config'
import { useMockDataStore } from '@/stores/mockData'
import { usePreviewStore } from '@/stores/preview'
import type {
	PowerlineConfig,
	PowerlineColors,
	PowerlineSymbols,
	ColorTheme,
	SegmentData,
	AnySegmentConfig,
	DirectorySegmentConfig,
	GitSegmentConfig,
	ClaudeHookData,
	GitInfo,
	UsageInfo,
	ContextInfo,
	MetricsInfo,
	BlockInfo,
	TodayInfo,
	UsageSegmentConfig,
	ContextSegmentConfig,
	MetricsSegmentConfig,
	BlockSegmentConfig,
	TodaySegmentConfig,
	VersionSegmentConfig,
	SessionIdSegmentConfig,
	EnvSegmentConfig,
	WeeklySegmentConfig,
	TuiData,
	BoxChars,
} from '@owloops/claude-powerline/browser'
import {
	SegmentRenderer,
	renderTuiPanel,
	getTheme,
	hexToAnsi,
	hexTo256Ansi,
	hexToBasicAnsi,
	hexColorDistance,
	extractBgToFg,
	visibleLength,
	SYMBOLS,
	TEXT_SYMBOLS,
	RESET_CODE,
	BOX_CHARS,
	BOX_CHARS_TEXT,
} from '@owloops/claude-powerline/browser'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RenderedSegment {
	type: string
	text: string
	bgColor: string
	fgColor: string
}

// ---------------------------------------------------------------------------
// Pure helpers (replicated from PowerlineRenderer private methods)
// ---------------------------------------------------------------------------

function resolveSymbols(config: PowerlineConfig): PowerlineSymbols {
	const style = config.display.style
	const charset = config.display.charset || 'unicode'
	const isMinimalStyle = style === 'minimal'
	const isCapsuleStyle = style === 'capsule'
	const symbolSet = charset === 'text' ? TEXT_SYMBOLS : SYMBOLS

	return {
		right: isMinimalStyle ? '' : isCapsuleStyle ? symbolSet.right_rounded : symbolSet.right,
		left: isCapsuleStyle ? symbolSet.left_rounded : '',
		branch: symbolSet.branch,
		model: symbolSet.model,
		git_clean: symbolSet.git_clean,
		git_dirty: symbolSet.git_dirty,
		git_conflicts: symbolSet.git_conflicts,
		git_ahead: symbolSet.git_ahead,
		git_behind: symbolSet.git_behind,
		git_worktree: symbolSet.git_worktree,
		git_tag: symbolSet.git_tag,
		git_sha: symbolSet.git_sha,
		git_upstream: symbolSet.git_upstream,
		git_stash: symbolSet.git_stash,
		git_time: symbolSet.git_time,
		session_cost: symbolSet.session_cost,
		block_cost: symbolSet.block_cost,
		today_cost: symbolSet.today_cost,
		context_time: symbolSet.context_time,
		metrics_response: symbolSet.metrics_response,
		metrics_last_response: symbolSet.metrics_last_response,
		metrics_duration: symbolSet.metrics_duration,
		metrics_messages: symbolSet.metrics_messages,
		metrics_lines_added: symbolSet.metrics_lines_added,
		metrics_lines_removed: symbolSet.metrics_lines_removed,
		metrics_burn: symbolSet.metrics_burn,
		version: symbolSet.version,
		bar_filled: symbolSet.bar_filled,
		bar_empty: symbolSet.bar_empty,
		env: symbolSet.env,
		session_id: symbolSet.session_id,
		weekly_cost: symbolSet.weekly_cost,
	}
}

function resolveThemeColors(
	config: PowerlineConfig,
	colorMode: 'truecolor' | 'ansi256' | 'ansi' | 'none',
	darkBackground: boolean,
): PowerlineColors {
	const theme = config.theme
	let colorTheme: ColorTheme | undefined

	if (theme === 'custom') {
		colorTheme = config.colors?.custom as ColorTheme | undefined
		if (!colorTheme) {
			throw new Error('Custom theme selected but no colors provided in configuration')
		}
	} else {
		colorTheme = getTheme(theme, colorMode) ?? undefined
		if (!colorTheme) {
			colorTheme = getTheme('dark', colorMode)!
		}
	}

	const convertHex = (hex: string, isBg: boolean): string => {
		if (colorMode === 'none') return ''
		if (colorMode === 'ansi') return hexToBasicAnsi(hex, isBg)
		if (colorMode === 'ansi256') return hexTo256Ansi(hex, isBg)
		return hexToAnsi(hex, isBg)
	}

	const fallbackTheme = getTheme('dark', colorMode)!

	const isTui = config.display.style === 'tui'
	const terminalRef = darkBackground ? '#1e1e1e' : '#f0f0f0'

	const getSegmentColors = (segment: Exclude<keyof ColorTheme, 'tui'>) => {
		const fallback = fallbackTheme[segment]
		const custom = colorTheme![segment]
		const colors = {
			fg: custom?.fg || fallback.fg,
			bg: custom?.bg || fallback.bg,
		}

		let fgHex = colors.fg
		if (isTui && hexColorDistance(fgHex, terminalRef) < 60) {
			fgHex = colors.bg
		}

		return {
			bg: convertHex(colors.bg, true),
			fg: convertHex(fgHex, false),
		}
	}

	const directory = getSegmentColors('directory')
	const git = getSegmentColors('git')
	const model = getSegmentColors('model')
	const session = getSegmentColors('session')
	const block = getSegmentColors('block')
	const today = getSegmentColors('today')
	const tmux = getSegmentColors('tmux')
	const context = getSegmentColors('context')
	const contextWarning = getSegmentColors('contextWarning')
	const contextCritical = getSegmentColors('contextCritical')
	const metrics = getSegmentColors('metrics')
	const version = getSegmentColors('version')
	const env = getSegmentColors('env')
	const weekly = getSegmentColors('weekly')

	let partFg: Record<string, string> = {}
	if (theme === 'custom') {
		const custom = config.colors?.custom as Record<string, { fg?: string }> | undefined
		if (custom) {
			for (const key of Object.keys(custom)) {
				const entry = custom[key]
				if (!entry?.fg) continue
				partFg[key] = convertHex(entry.fg, false)
			}
		}
	}

	return {
		reset: colorMode === 'none' ? '' : RESET_CODE,
		modeBg: directory.bg,
		modeFg: directory.fg,
		gitBg: git.bg,
		gitFg: git.fg,
		modelBg: model.bg,
		modelFg: model.fg,
		sessionBg: session.bg,
		sessionFg: session.fg,
		blockBg: block.bg,
		blockFg: block.fg,
		todayBg: today.bg,
		todayFg: today.fg,
		tmuxBg: tmux.bg,
		tmuxFg: tmux.fg,
		contextBg: context.bg,
		contextFg: context.fg,
		contextWarningBg: contextWarning.bg,
		contextWarningFg: contextWarning.fg,
		contextCriticalBg: contextCritical.bg,
		contextCriticalFg: contextCritical.fg,
		metricsBg: metrics.bg,
		metricsFg: metrics.fg,
		versionBg: version.bg,
		versionFg: version.fg,
		envBg: env.bg,
		envFg: env.fg,
		weeklyBg: weekly.bg,
		weeklyFg: weekly.fg,
		partFg,
	}
}

function formatSegment(
	config: PowerlineConfig,
	symbols: PowerlineSymbols,
	colorMode: 'truecolor' | 'ansi256' | 'ansi' | 'none',
	bgColor: string,
	fgColor: string,
	text: string,
	nextBgColor: string | undefined,
	colors: PowerlineColors,
): string {
	const isCapsuleStyle = config.display.style === 'capsule'
	const padding = ' '.repeat(config.display.padding ?? 1)
	const isBasicMode = colorMode === 'ansi'

	if (isCapsuleStyle) {
		const capFgColor = extractBgToFg(bgColor, isBasicMode)
		const leftCap = `${capFgColor}${symbols.left}${colors.reset}`
		const content = `${bgColor}${fgColor}${padding}${text}${padding}${colors.reset}`
		const rightCap = `${capFgColor}${symbols.right}${colors.reset}`
		return `${leftCap}${content}${rightCap}`
	}

	let output = `${bgColor}${fgColor}${padding}${text}${padding}`

	if (nextBgColor) {
		const arrowFgColor = extractBgToFg(bgColor, isBasicMode)
		output += `${colors.reset}${nextBgColor}${arrowFgColor}${symbols.right}`
	} else {
		output += `${colors.reset}${extractBgToFg(bgColor, isBasicMode)}${symbols.right}${colors.reset}`
	}

	return output
}

function buildLineFromSegments(
	segments: RenderedSegment[],
	colors: PowerlineColors,
	config: PowerlineConfig,
	symbols: PowerlineSymbols,
	colorMode: 'truecolor' | 'ansi256' | 'ansi' | 'none',
): string {
	const isCapsuleStyle = config.display.style === 'capsule'
	let line = colors.reset

	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i]
		if (!segment) continue

		const isFirst = i === 0
		const isLast = i === segments.length - 1
		const nextSegment = !isLast ? segments[i + 1] : null

		if (isCapsuleStyle && !isFirst) {
			line += ' '
		}

		line += formatSegment(
			config,
			symbols,
			colorMode,
			segment.bgColor,
			segment.fgColor,
			segment.text,
			nextSegment?.bgColor,
			colors,
		)
	}

	return line
}

function calculateSegmentWidth(
	segment: RenderedSegment,
	isFirst: boolean,
	config: PowerlineConfig,
): number {
	const isCapsuleStyle = config.display.style === 'capsule'
	const textWidth = visibleLength(segment.text)
	const padding = config.display.padding ?? 1
	const paddingWidth = padding * 2

	if (isCapsuleStyle) {
		const capsuleOverhead = 2 + paddingWidth + (isFirst ? 0 : 1)
		return textWidth + capsuleOverhead
	}

	const powerlineOverhead = 1 + paddingWidth
	return textWidth + powerlineOverhead
}

// eslint-disable-next-line no-control-regex
const SYNC_RE = /\x1b\[\?2026[hl]/g
// eslint-disable-next-line no-control-regex
const WS_GUARD_RE = /^\x1b\[0m/gm

function stripControlSequences(ansi: string): string {
	return ansi.replace(SYNC_RE, '').replace(WS_GUARD_RE, '')
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useRenderer() {
	const configStore = useConfigStore()
	const mockDataStore = useMockDataStore()
	const previewStore = usePreviewStore()

	const isRendering = shallowRef(false)
	const renderError = shallowRef<string | null>(null)
	let renderToken = 0

	const ansiUp = new AnsiUp()
	ansiUp.use_classes = false
	ansiUp.escape_html = true

	async function render() {
		const token = ++renderToken
		isRendering.value = true
		renderError.value = null

		try {
			const config = structuredClone(toRaw(configStore.config))
			const colorMode = previewStore.colorMode
			const darkBg = previewStore.darkBackground
			const terminalWidth = previewStore.terminalWidth
			const charset = previewStore.charset

			// Override charset from preview store
			config.display.charset = charset

			const colors = resolveThemeColors(config, colorMode, darkBg)
			let ansi: string

			if (config.display.style === 'tui') {
				// --- TUI path ---
				const boxChars: BoxChars = charset === 'text' ? BOX_CHARS_TEXT : BOX_CHARS

				// Override tui.terminalWidth so grid path uses preview width
				if (config.display.tui) {
					config.display.tui.terminalWidth = terminalWidth
				}

				const tuiData: TuiData = {
					hookData: toRaw(mockDataStore.hookData),
					usageInfo: toRaw(mockDataStore.usageInfo),
					blockInfo: toRaw(mockDataStore.blockInfo),
					todayInfo: toRaw(mockDataStore.todayInfo),
					contextInfo: toRaw(mockDataStore.contextInfo),
					metricsInfo: toRaw(mockDataStore.metricsInfo),
					gitInfo: toRaw(mockDataStore.gitInfo),
					tmuxSessionId: mockDataStore.tmuxSessionId,
					colors,
				}

				ansi = await renderTuiPanel(tuiData, boxChars, colors.reset, terminalWidth, config)
			} else {
				// --- Non-TUI path (minimal / powerline / capsule) ---
				const symbols = resolveSymbols(config)
				const segmentRenderer = new SegmentRenderer(config, symbols)
				const hookData = toRaw(mockDataStore.hookData)
				const gitInfo = toRaw(mockDataStore.gitInfo)
				const usageInfo = toRaw(mockDataStore.usageInfo)
				const contextInfo = toRaw(mockDataStore.contextInfo)
				const metricsInfo = toRaw(mockDataStore.metricsInfo)
				const blockInfo = toRaw(mockDataStore.blockInfo)
				const todayInfo = toRaw(mockDataStore.todayInfo)
				const tmuxSessionId = mockDataStore.tmuxSessionId

				const outputLines: string[] = []

				for (const lineConfig of config.display.lines) {
					const segments = (
						Object.entries(lineConfig.segments) as [string, AnySegmentConfig | undefined][]
					)
						.filter((entry): entry is [string, AnySegmentConfig] => !!entry[1]?.enabled)
						.map(([type, cfg]) => ({
							type,
							config: cfg,
						}))

					const renderedSegments: RenderedSegment[] = []
					for (const seg of segments) {
						const segData = renderSingleSegment(
							seg,
							segmentRenderer,
							hookData,
							gitInfo,
							usageInfo,
							contextInfo,
							metricsInfo,
							blockInfo,
							todayInfo,
							tmuxSessionId,
							colors,
							seg.config,
						)
						if (segData) {
							renderedSegments.push({
								type: seg.type,
								text: segData.text,
								bgColor: segData.bgColor,
								fgColor: segData.fgColor,
							})
						}
					}

					if (renderedSegments.length === 0) continue

					if (config.display.autoWrap && terminalWidth > 0) {
						// Auto-wrap: split across lines when too wide
						let currentLineSegments: RenderedSegment[] = []
						let currentLineWidth = 0

						for (const segment of renderedSegments) {
							const segmentWidth = calculateSegmentWidth(
								segment,
								currentLineSegments.length === 0,
								config,
							)

							if (
								currentLineSegments.length > 0 &&
								currentLineWidth + segmentWidth > terminalWidth
							) {
								outputLines.push(
									buildLineFromSegments(currentLineSegments, colors, config, symbols, colorMode),
								)
								currentLineSegments = []
								currentLineWidth = 0
							}

							currentLineSegments.push(segment)
							currentLineWidth += segmentWidth
						}

						if (currentLineSegments.length > 0) {
							outputLines.push(
								buildLineFromSegments(currentLineSegments, colors, config, symbols, colorMode),
							)
						}
					} else {
						outputLines.push(
							buildLineFromSegments(renderedSegments, colors, config, symbols, colorMode),
						)
					}
				}

				ansi = outputLines.filter((line) => line.length > 0).join('\n')
			}

			if (token !== renderToken) return // stale

			const cleanAnsi = stripControlSequences(ansi)
			const html = ansiUp.ansi_to_html(cleanAnsi)

			previewStore.setRenderedOutput(cleanAnsi, html)
		} catch (e) {
			if (token !== renderToken) return
			renderError.value = e instanceof Error ? e.message : String(e)
		} finally {
			if (token === renderToken) isRendering.value = false
		}
	}

	const debouncedRender = useDebounceFn(render, 150)

	watch(
		[
			() => configStore.config,
			() => mockDataStore.hookData,
			() => mockDataStore.gitInfo,
			() => mockDataStore.usageInfo,
			() => mockDataStore.contextInfo,
			() => mockDataStore.metricsInfo,
			() => mockDataStore.blockInfo,
			() => mockDataStore.todayInfo,
			() => mockDataStore.tmuxSessionId,
			() => previewStore.terminalWidth,
			() => previewStore.colorMode,
			() => previewStore.charset,
			() => previewStore.darkBackground,
		],
		() => {
			void debouncedRender()
		},
		{ deep: true },
	)

	// Initial render
	void render()

	return { isRendering, renderError, renderNow: render }
}

// ---------------------------------------------------------------------------
// Segment dispatch (maps segment type to SegmentRenderer method)
// ---------------------------------------------------------------------------

function renderSingleSegment(
	seg: { type: string; config: AnySegmentConfig },
	renderer: SegmentRenderer,
	hookData: ClaudeHookData,
	gitInfo: GitInfo | null,
	usageInfo: UsageInfo | null,
	contextInfo: ContextInfo | null,
	metricsInfo: MetricsInfo | null,
	blockInfo: BlockInfo | null,
	todayInfo: TodayInfo | null,
	tmuxSessionId: string | null,
	colors: PowerlineColors,
	config: AnySegmentConfig,
): SegmentData | null {
	switch (seg.type) {
		case 'directory':
			return renderer.renderDirectory(hookData, colors, config as DirectorySegmentConfig)
		case 'model':
			return renderer.renderModel(hookData, colors)
		case 'git':
			return gitInfo ? renderer.renderGit(gitInfo, colors, config as GitSegmentConfig) : null
		case 'session':
			return usageInfo
				? renderer.renderSession(usageInfo, colors, config as UsageSegmentConfig)
				: null
		case 'sessionId':
			return hookData.session_id
				? renderer.renderSessionId(hookData.session_id, colors, config as SessionIdSegmentConfig)
				: null
		case 'tmux':
			return renderer.renderTmux(tmuxSessionId, colors)
		case 'context':
			return renderer.renderContext(contextInfo, colors, config as ContextSegmentConfig)
		case 'metrics':
			return renderer.renderMetrics(metricsInfo, colors, config as MetricsSegmentConfig)
		case 'block':
			return blockInfo
				? renderer.renderBlock(blockInfo, colors, config as BlockSegmentConfig)
				: null
		case 'today':
			return todayInfo
				? renderer.renderToday(todayInfo, colors, (config as TodaySegmentConfig).type || 'cost')
				: null
		case 'version':
			return renderer.renderVersion(hookData, colors, config as VersionSegmentConfig)
		case 'env':
			return renderer.renderEnv(colors, config as EnvSegmentConfig)
		case 'weekly':
			return renderer.renderWeekly(hookData, colors, config as WeeklySegmentConfig)
		default:
			return null
	}
}
