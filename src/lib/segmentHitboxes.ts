import { VALID_SEGMENT_NAMES } from '@owloops/claude-powerline/browser'
import type { GridCell } from '@owloops/claude-powerline/browser'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SegmentHitbox {
	segmentType: string // config-level name: 'directory', 'git', 'session', etc.
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
): SegmentHitbox[] {
	const hitboxes: SegmentHitbox[] = []
	// Border + padding offset: 1 box char + 1 space = 2 chars from left edge
	const leftOffset = 2

	let outputLine = hasTitleBar ? 1 : 0

	for (const row of matrix) {
		// Divider row — single cell with segment "---"
		if (row.length === 1 && row[0]!.segment === '---') {
			outputLine++
			continue
		}

		for (let colIdx = 0; colIdx < row.length; colIdx++) {
			const cell = row[colIdx]!
			if (!cell.spanStart) continue

			const normalized = normalizeSegmentName(cell.segment)
			if (!normalized) continue

			// Compute charStart: border+padding + sum of prior column widths + prior separators
			let charStart = leftOffset
			for (let c = 0; c < colIdx; c++) {
				charStart += (colWidths[c] ?? 0) + separatorWidth
			}

			// Compute charWidth: sum of spanned column widths + internal separators
			let charWidth = 0
			for (let j = 0; j < cell.spanSize; j++) {
				charWidth += colWidths[colIdx + j] ?? 0
			}
			if (cell.spanSize > 1) {
				charWidth += (cell.spanSize - 1) * separatorWidth
			}

			hitboxes.push({
				segmentType: normalized,
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
