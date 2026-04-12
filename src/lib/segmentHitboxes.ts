import { VALID_SEGMENT_NAMES } from '@owloops/claude-powerline/browser'
import type { GridCell } from '@owloops/claude-powerline/browser'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SegmentHitbox {
	segmentType: string // config-level name: 'directory', 'git', 'session', etc.
	cellSegment?: string // raw grid cell name before normalization (TUI only, e.g. 'context.bar')
	line: number // 0-based output line index
	charStart: number // character offset from left edge of text content
	charWidth: number // visible width in characters
	sourceLineIndex: number // index into config.display.lines[] (0 for TUI)
}

// ---------------------------------------------------------------------------
// TUI name normalization
// ---------------------------------------------------------------------------

const TUI_TO_CONFIG_SEGMENT: Record<string, string> = {
	dir: 'directory',
}

export function normalizeSegmentName(tuiName: string): string | null {
	if (tuiName === '.' || tuiName === '---') return null

	// Strip part suffixes: 'context.bar' -> 'context'
	const base = tuiName.includes('.') ? tuiName.split('.')[0]! : tuiName

	// Filter out user-defined template keys — only real segments get hitboxes
	if (!VALID_SEGMENT_NAMES.has(base)) return null

	// Map TUI short names to config names
	return TUI_TO_CONFIG_SEGMENT[base] ?? base
}

// ---------------------------------------------------------------------------
// Non-TUI width calculations
// ---------------------------------------------------------------------------

export type NonTuiStyle = 'powerline' | 'capsule' | 'minimal'

export function calculateHitboxWidth(
	textWidth: number,
	padding: number,
	style: NonTuiStyle,
	isFirst: boolean,
): number {
	const paddingWidth = padding * 2

	switch (style) {
		case 'powerline':
			// [padding][text][padding][arrow] = padding*2 + textWidth + 1
			return paddingWidth + textWidth + 1
		case 'capsule':
			// [space?][leftCap][padding][text][padding][rightCap] = (isFirst ? 0 : 1) + 2 + padding*2 + textWidth
			return (isFirst ? 0 : 1) + 2 + paddingWidth + textWidth
		case 'minimal':
			// [padding][text][padding] = padding*2 + textWidth
			return paddingWidth + textWidth
	}
}

// ---------------------------------------------------------------------------
// TUI hitbox extraction from grid matrix + column widths
// ---------------------------------------------------------------------------

export function extractTuiHitboxes(
	matrix: GridCell[][],
	colWidths: number[],
	separatorWidth: number,
	hasTitleBar: boolean,
	horizontalPadding = 0,
	align?: string[],
	padShrink?: number[],
): SegmentHitbox[] {
	const hitboxes: SegmentHitbox[] = []
	const hPad = horizontalPadding
	const extraWallPad = Math.max(0, 1 - hPad)
	const leftOffset = 1 + extraWallPad

	let outputLine = hasTitleBar ? 1 : 0

	for (const row of matrix) {
		if (row.length === 1 && row[0]!.segment === '---') {
			outputLine++
			continue
		}

		for (let colIdx = 0; colIdx < row.length; colIdx++) {
			const cell = row[colIdx]!
			if (!cell.spanStart) continue

			const normalized = normalizeSegmentName(cell.segment)
			if (!normalized) continue

			// Left pad of first column in this cell
			const leftShrink = align?.[colIdx] === 'right' ? (padShrink?.[colIdx] ?? 0) : 0
			const cellLeftPad = hPad - leftShrink

			// charStart: border + wall pad + left cell pad + prior columns
			let charStart = leftOffset + cellLeftPad
			for (let c = 0; c < colIdx; c++) {
				const rShrink = align?.[c] === 'left' ? (padShrink?.[c] ?? 0) : 0
				const lShrink = align?.[c + 1] === 'right' ? (padShrink?.[c + 1] ?? 0) : 0
				const colTotalPad = hPad - rShrink + (hPad - lShrink)
				charStart += (colWidths[c] ?? 0) + colTotalPad + separatorWidth
			}

			// charWidth: spanned column widths + internal padding
			let charWidth = 0
			for (let j = 0; j < cell.spanSize; j++) {
				charWidth += colWidths[colIdx + j] ?? 0
			}
			if (cell.spanSize > 1) {
				for (let j = colIdx; j < colIdx + cell.spanSize - 1; j++) {
					const rShrink = align?.[j] === 'left' ? (padShrink?.[j] ?? 0) : 0
					const lShrink = align?.[j + 1] === 'right' ? (padShrink?.[j + 1] ?? 0) : 0
					charWidth += separatorWidth + (hPad - rShrink) + (hPad - lShrink)
				}
			}

			hitboxes.push({
				segmentType: normalized,
				cellSegment: cell.segment,
				line: outputLine,
				charStart,
				charWidth,
				sourceLineIndex: 0,
			})
		}

		outputLine++
	}

	return hitboxes
}
