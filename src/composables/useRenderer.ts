import { AnsiUp } from 'ansi_up'
import { useConfigStore } from '@/stores/config'
import { useMockDataStore } from '@/stores/mockData'
import { usePreviewStore } from '@/stores/preview'
import type { SegmentHitbox, NonTuiStyle } from '@/lib/segmentHitboxes'
import { calculateHitboxWidth, extractTuiHitboxes } from '@/lib/segmentHitboxes'
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
	BOX_PRESETS,
	parseAreas,
	cullMatrix,
	calculateColumnWidths,
	selectBreakpoint,
	solveFitContentLayout,
	LATE_RESOLVE_SEGMENTS,
	resolveSegments,
	buildContextLine,
	buildContextBar,
	buildBlockBar,
	buildWeeklyBar,
	composeTemplate,
	resolveTitleToken,
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
	terminalBgColor: string,
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
	const terminalRef = terminalBgColor

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

// eslint-disable-next-line no-control-regex
const SYNC_RE = /\x1b\[\?2026[hl]/g
// eslint-disable-next-line no-control-regex
const WS_GUARD_RE = /^\x1b\[0m/gm

function stripControlSequences(ansi: string): string {
	return ansi.replace(SYNC_RE, '').replace(WS_GUARD_RE, '')
}

/**
 * Wrap each visible character in the ansi_up HTML output in a fixed-width
 * `1ch` cell to enforce monospace grid alignment in the browser.
 *
 * Browsers don't enforce terminal-style `wcwidth` rules, so certain Unicode
 * symbols (Nerd Font icons, dingbats, etc.) render at non-monospace widths.
 * Wrapping every character in an inline-block `1ch` cell forces correct
 * column alignment regardless of individual glyph metrics.
 */
const TCH_OPEN = '<span class="tch">'
const TCH_CLOSE = '</span>'

function enforceMonospaceGrid(html: string): string {
	return html.replace(/>([^<]+)/g, (_, text: string) => {
		let out = '>'
		for (const ch of text) {
			if (ch === '\n') {
				out += '\n'
			} else {
				out += TCH_OPEN + ch + TCH_CLOSE
			}
		}
		return out
	})
}

// ---------------------------------------------------------------------------
// TUI helpers (mirrored from grid.ts internals not exported by the library)
// ---------------------------------------------------------------------------

function parseFr(colDef: string): number {
	if (!colDef.endsWith('fr')) return 0
	const fr = parseInt(colDef.replace('fr', ''), 10)
	return !isNaN(fr) && fr > 0 ? fr : 0
}

// ---------------------------------------------------------------------------
// TUI hitbox computation (mirrors grid logic to extract matrix + colWidths)
// ---------------------------------------------------------------------------

function computeTuiHitboxes(
	config: PowerlineConfig,
	tuiData: TuiData,
	box: BoxChars,
	rawTerminalWidth: number,
): SegmentHitbox[] {
	const gridConfig = config.display.tui
	if (!gridConfig) return []

	const sym = (config.display.charset || 'unicode') === 'text' ? TEXT_SYMBOLS : SYMBOLS
	const colors = tuiData.colors
	const reset = colors.reset

	// Resolve box characters (same logic as renderTuiPanel)
	let mergedBox: BoxChars
	if (typeof gridConfig.box === 'string') {
		mergedBox = BOX_PRESETS[gridConfig.box as keyof typeof BOX_PRESETS] ?? box
	} else {
		mergedBox = gridConfig.box ? { ...box, ...gridConfig.box } : box
	}

	const minWidth = gridConfig.minWidth ?? 32
	const maxWidth = gridConfig.maxWidth ?? Infinity
	const colSep = gridConfig.separator?.column ?? '  '
	const sepWidth = visibleLength(colSep)
	const fitContent = gridConfig.fitContent ?? false
	const hPad = gridConfig.padding?.horizontal ?? 0

	// Estimate panel width for segment resolution
	const estPanelWidth = Math.max(minWidth, rawTerminalWidth - (gridConfig.widthReserve ?? 45))
	const estInnerWidth = estPanelWidth - 2
	const estContentWidth = estInnerWidth - 2

	const ctx = {
		lines: [] as string[],
		data: tuiData,
		box: mergedBox,
		contentWidth: estContentWidth,
		innerWidth: estInnerWidth,
		sym,
		config,
		reset,
		colors,
	}
	const resolved = resolveSegments(tuiData, ctx)
	const resolvedData = resolved.data
	const templates = resolved.templates

	// Select panel width for breakpoint
	let panelWidth: number
	if (fitContent) {
		panelWidth = maxWidth !== Infinity ? Math.min(rawTerminalWidth, maxWidth) : rawTerminalWidth
	} else {
		const widthReserve = gridConfig.widthReserve ?? 45
		panelWidth = Math.min(maxWidth, Math.max(minWidth, rawTerminalWidth - widthReserve))
	}

	const bp = selectBreakpoint(gridConfig.breakpoints, panelWidth)
	const rawMatrix = parseAreas(bp.areas)
	let matrix = cullMatrix(rawMatrix, resolvedData)

	if (matrix.length === 0) return []

	// Collect late-resolve segment names
	const lateNames = new Set(LATE_RESOLVE_SEGMENTS)
	if (gridConfig.segments) {
		for (const key of Object.keys(gridConfig.segments)) {
			lateNames.add(key)
		}
	}

	let colWidths: number[]

	if (fitContent) {
		const solved = solveFitContentLayout(
			bp.columns,
			matrix,
			resolvedData,
			sepWidth,
			hPad,
			lateNames,
		)
		panelWidth = Math.min(maxWidth, Math.max(minWidth, solved.panelWidth))
		colWidths = solved.colWidths

		// Redistribute surplus from minWidth/maxWidth clamping into fr columns
		// (mirrors renderGrid logic that the hitbox computation was missing)
		const surplus = panelWidth - solved.panelWidth
		if (surplus > 0) {
			let totalFr = 0
			for (const colDef of bp.columns) totalFr += parseFr(colDef)
			if (totalFr > 0) {
				const frCols: number[] = []
				let allocated = 0
				for (let i = 0; i < colWidths.length; i++) {
					const fr = parseFr(bp.columns[i]!)
					if (fr > 0) {
						const add = Math.floor((surplus * fr) / totalFr)
						colWidths[i]! += add
						allocated += add
						frCols.push(i)
					}
				}
				let leftover = surplus - allocated
				for (let k = 0; leftover > 0 && k < frCols.length; k++) {
					colWidths[frCols[k]!]! += 1
					leftover--
				}
			}
		}
	} else {
		const innerW = panelWidth - 2
		const contentW = innerW - 2
		colWidths = calculateColumnWidths(
			bp.columns,
			matrix,
			resolvedData,
			contentW,
			sepWidth,
			lateNames,
		)
	}

	// Late-resolve pass (re-resolve width-dependent segments)
	const pf = colors.partFg
	const seen = new Set<string>()
	for (const row of matrix) {
		if (row.length === 1 && row[0]!.segment === '---') continue
		for (let i = 0; i < row.length; i++) {
			const cell = row[i]!
			if (!cell.spanStart || cell.segment === '.' || cell.segment === '---') continue
			if (seen.has(cell.segment)) continue
			seen.add(cell.segment)

			let cellWidth = 0
			for (let j = 0; j < cell.spanSize; j++) {
				cellWidth += colWidths[i + j] ?? 0
			}
			if (cell.spanSize > 1) {
				cellWidth += (cell.spanSize - 1) * sepWidth
			}

			let content: string | undefined
			if (cell.segment === 'context') {
				content = buildContextLine(tuiData, cellWidth, sym, reset, colors) ?? ''
			} else if (cell.segment === 'context.bar') {
				content = buildContextBar(tuiData, cellWidth, sym, reset, colors, pf)
			} else if (cell.segment === 'block.bar') {
				content = buildBlockBar(tuiData, cellWidth, sym, reset, colors, config, pf)
			} else if (cell.segment === 'weekly.bar') {
				content = buildWeeklyBar(tuiData, cellWidth, sym, reset, colors, pf)
			} else {
				const tmpl = templates[cell.segment]
				if (tmpl) {
					content = composeTemplate(tmpl.items, tmpl.gap, tmpl.justify, cellWidth)
				}
			}

			if (content !== undefined) {
				resolvedData[cell.segment] = content
			}
		}
	}

	// Post-lateResolve re-cull
	const finalMatrix = cullMatrix(matrix, resolvedData)
	if (finalMatrix.length === 0) return []

	// Has title bar: grid path always generates a title bar
	const hitboxes = extractTuiHitboxes(finalMatrix, colWidths, sepWidth, true)

	// --- Title bar hitboxes (output line 0) ---
	const titleLeft = gridConfig.title?.left ?? '{model}'
	const titleRight =
		gridConfig.title?.right !== undefined ? gridConfig.title.right : 'claude-powerline'

	const titleLeftResolved = resolveTitleToken(titleLeft, tuiData, resolvedData)
	const titleLeftText = titleLeftResolved ? ` ${titleLeftResolved} ` : ''
	const titleLeftLen = visibleLength(titleLeftText)

	if (titleLeftLen > 0) {
		hitboxes.push({
			segmentType: '__title_left',
			line: 0,
			charStart: 1, // after topLeft box char
			charWidth: titleLeftLen,
			sourceLineIndex: 0,
		})
	}

	const hasRight = titleRight !== false
	if (hasRight && titleRight) {
		const titleRightResolved = resolveTitleToken(titleRight as string, tuiData, resolvedData)
		const titleRightText = titleRightResolved ? ` ${titleRightResolved} ` : ''
		const titleRightLen = visibleLength(titleRightText)
		if (titleRightLen > 0) {
			hitboxes.push({
				segmentType: '__title_right',
				line: 0,
				charStart: panelWidth - 1 - titleRightLen, // before topRight box char
				charWidth: titleRightLen,
				sourceLineIndex: 0,
			})
		}
	}

	// --- Footer hitboxes (last output line) ---
	// Footer line = 1 (title) + finalMatrix.length
	const footerLine = 1 + finalMatrix.length
	const footerLeft = gridConfig.footer?.left
		? resolveTitleToken(gridConfig.footer.left, tuiData, resolvedData)
		: undefined
	const footerRight = gridConfig.footer?.right
		? resolveTitleToken(gridConfig.footer.right, tuiData, resolvedData)
		: undefined

	if (footerLeft) {
		const footerLeftText = ` ${footerLeft} `
		const footerLeftLen = visibleLength(footerLeftText)
		hitboxes.push({
			segmentType: '__footer_left',
			line: footerLine,
			charStart: 1, // after bottomLeft box char
			charWidth: footerLeftLen,
			sourceLineIndex: 0,
		})
	}

	if (footerRight) {
		const footerRightText = ` ${footerRight} `
		const footerRightLen = visibleLength(footerRightText)
		hitboxes.push({
			segmentType: '__footer_right',
			line: footerLine,
			charStart: panelWidth - 1 - footerRightLen, // before bottomRight box char
			charWidth: footerRightLen,
			sourceLineIndex: 0,
		})
	}

	return hitboxes
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
			const terminalBgColor = previewStore.terminalBgColor
			const terminalWidth = previewStore.terminalWidth
			const reservedWidth = previewStore.reservedWidth
			const charset = previewStore.charset

			// Override charset from preview store
			config.display.charset = charset

			const colors = resolveThemeColors(config, colorMode, terminalBgColor)
			let ansi: string
			let hitboxes: SegmentHitbox[] = []

			if (config.display.style === 'tui') {
				// --- TUI path ---
				const boxChars: BoxChars = charset === 'text' ? BOX_CHARS_TEXT : BOX_CHARS

				// Override tui settings so grid path uses preview values
				if (config.display.tui) {
					config.display.tui.terminalWidth = terminalWidth
					config.display.tui.widthReserve = reservedWidth
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

				// Compute TUI hitboxes from grid data
				if (config.display.tui) {
					hitboxes = computeTuiHitboxes(config, tuiData, boxChars, terminalWidth)
				}
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
				hitboxes = []
				let outputLineIndex = 0
				const style = config.display.style as NonTuiStyle
				const padding = config.display.padding ?? 1

				for (
					let sourceLineIndex = 0;
					sourceLineIndex < config.display.lines.length;
					sourceLineIndex++
				) {
					const lineConfig = config.display.lines[sourceLineIndex]!
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
						let charStart = 0

						for (const segment of renderedSegments) {
							const textWidth = visibleLength(segment.text)
							const isFirst = currentLineSegments.length === 0
							const segmentWidth = calculateHitboxWidth(textWidth, padding, style, isFirst)

							if (!isFirst && currentLineWidth + segmentWidth > terminalWidth) {
								outputLines.push(
									buildLineFromSegments(currentLineSegments, colors, config, symbols, colorMode),
								)
								outputLineIndex++
								currentLineSegments = []
								currentLineWidth = 0
								charStart = 0
							}

							// Recalculate width for the actual position (isFirst may change after wrap)
							const actualWidth = calculateHitboxWidth(
								textWidth,
								padding,
								style,
								currentLineSegments.length === 0,
							)

							hitboxes.push({
								segmentType: segment.type,
								line: outputLineIndex,
								charStart,
								charWidth: actualWidth,
								sourceLineIndex,
							})

							currentLineSegments.push(segment)
							charStart += actualWidth
							currentLineWidth += actualWidth
						}

						if (currentLineSegments.length > 0) {
							outputLines.push(
								buildLineFromSegments(currentLineSegments, colors, config, symbols, colorMode),
							)
							outputLineIndex++
						}
					} else {
						let charStart = 0
						for (let i = 0; i < renderedSegments.length; i++) {
							const segment = renderedSegments[i]!
							const textWidth = visibleLength(segment.text)
							const segWidth = calculateHitboxWidth(textWidth, padding, style, i === 0)

							hitboxes.push({
								segmentType: segment.type,
								line: outputLineIndex,
								charStart,
								charWidth: segWidth,
								sourceLineIndex,
							})

							charStart += segWidth
						}

						outputLines.push(
							buildLineFromSegments(renderedSegments, colors, config, symbols, colorMode),
						)
						outputLineIndex++
					}
				}

				ansi = outputLines.filter((line) => line.length > 0).join('\n')
			}

			if (token !== renderToken) return // stale

			const cleanAnsi = stripControlSequences(ansi)
			const html = enforceMonospaceGrid(ansiUp.ansi_to_html(cleanAnsi))

			previewStore.setRenderedOutput(cleanAnsi, html, hitboxes)
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
			() => previewStore.terminalTheme,
			() => previewStore.reservedWidth,
		],
		() => {
			void debouncedRender()
		},
		{ deep: true },
	)

	// Sync preview store's reservedWidth into TUI config for export.
	// On load, seed the preview slider from any existing TUI widthReserve.
	if (configStore.isTuiStyle && configStore.config.display.tui?.widthReserve != null) {
		previewStore.reservedWidth = configStore.config.display.tui.widthReserve
	}

	watch(
		() => previewStore.reservedWidth,
		(value) => {
			if (configStore.isTuiStyle) {
				configStore.setTuiWidthReserve(value)
			}
		},
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
