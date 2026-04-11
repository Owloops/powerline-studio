import type { TuiGridConfig } from '@/types/tui'
import type { TuiValidationError } from '@/types/tui'
import { isValidSegmentRef } from '@owloops/claude-powerline/browser'

const COLUMN_DEF_RE = /^(\d+fr|\d+|auto)$/

export function useTuiValidation(tuiConfig: () => TuiGridConfig | undefined) {
	const errors = computed<TuiValidationError[]>(() => {
		const tui = tuiConfig()
		if (!tui) return []

		const result: TuiValidationError[] = []

		if (!tui.breakpoints || tui.breakpoints.length === 0) {
			result.push({ path: 'breakpoints', message: 'At least one breakpoint is required' })
			return result
		}

		// Global minWidth/maxWidth consistency
		if (tui.minWidth !== undefined && tui.maxWidth !== undefined && tui.minWidth > tui.maxWidth) {
			result.push({
				path: 'global',
				message: 'minWidth must be less than or equal to maxWidth',
			})
		}

		// Validate breakpoints
		const seenMinWidths = new Set<number>()
		for (let bpIdx = 0; bpIdx < tui.breakpoints.length; bpIdx++) {
			const bp = tui.breakpoints[bpIdx]!
			const prefix = `breakpoints[${bpIdx}]`

			// minWidth uniqueness
			if (seenMinWidths.has(bp.minWidth)) {
				result.push({
					path: `${prefix}.minWidth`,
					message: `Duplicate minWidth ${bp.minWidth}`,
				})
			}
			seenMinWidths.add(bp.minWidth)

			// minWidth non-negative
			if (bp.minWidth < 0) {
				result.push({
					path: `${prefix}.minWidth`,
					message: 'minWidth must be non-negative',
				})
			}

			// Column definitions
			for (let colIdx = 0; colIdx < bp.columns.length; colIdx++) {
				const col = bp.columns[colIdx]!
				if (!COLUMN_DEF_RE.test(col)) {
					result.push({
						path: `${prefix}.columns[${colIdx}]`,
						message: `Invalid column definition "${col}"`,
					})
				}
			}

			// Align length
			if (bp.align && bp.align.length !== bp.columns.length) {
				result.push({
					path: `${prefix}.align`,
					message: `Align length (${bp.align.length}) must match columns (${bp.columns.length})`,
				})
			}

			// Areas validation
			const templateNames = tui.segments ? new Set(Object.keys(tui.segments)) : new Set<string>()
			const seenSegments = new Set<string>()

			for (let rowIdx = 0; rowIdx < bp.areas.length; rowIdx++) {
				const row = bp.areas[rowIdx]!
				if (row.trim() === '---') continue

				const cells = row.trim().split(/\s+/)

				// Cell count must match columns
				if (cells.length !== bp.columns.length) {
					result.push({
						path: `${prefix}.areas[${rowIdx}]`,
						message: `Row has ${cells.length} cells but expected ${bp.columns.length}`,
					})
					continue
				}

				// Check segment name validity
				for (const cell of cells) {
					if (cell !== '.' && !isValidSegmentRef(cell) && !templateNames.has(cell)) {
						result.push({
							path: `${prefix}.areas[${rowIdx}]`,
							message: `Unknown segment "${cell}"`,
						})
					}
				}

				// Contiguous spans
				const seen = new Map<string, number>()
				for (let i = 0; i < cells.length; i++) {
					const cell = cells[i]!
					if (cell === '.' || cell === '---') continue
					const lastIdx = seen.get(cell)
					if (lastIdx !== undefined && lastIdx !== i - 1) {
						result.push({
							path: `${prefix}.areas[${rowIdx}].${cell}`,
							message: `"${cell}" has non-contiguous span`,
						})
					}
					seen.set(cell, i)
				}

				// Cross-row segment uniqueness
				for (const cell of cells) {
					if (cell === '.' || cell === '---') continue
					if (seenSegments.has(cell) && !seen.has(cell)) {
						// segment seen in previous row but not in current row's own tracking
					}
				}

				// Track used segments per row for cross-row uniqueness
				const rowSegments = new Set<string>()
				for (const cell of cells) {
					if (cell !== '.' && cell !== '---') {
						if (seenSegments.has(cell) && !rowSegments.has(cell)) {
							result.push({
								path: `${prefix}.areas[${rowIdx}].${cell}`,
								message: `"${cell}" appears on multiple rows`,
							})
						}
						rowSegments.add(cell)
					}
				}
				for (const seg of rowSegments) {
					seenSegments.add(seg)
				}
			}
		}

		return result
	})

	const hasErrors = computed(() => errors.value.length > 0)

	function errorsForPath(path: string) {
		return computed(() => errors.value.filter((e) => e.path.startsWith(path)))
	}

	/** Get segments used in other rows for a given breakpoint/row (to disable in picker) */
	function usedSegmentsInOtherRows(bpIndex: number, rowIndex: number) {
		return computed(() => {
			const tui = tuiConfig()
			if (!tui) return new Set<string>()
			const bp = tui.breakpoints[bpIndex]
			if (!bp) return new Set<string>()

			const used = new Set<string>()
			for (let i = 0; i < bp.areas.length; i++) {
				if (i === rowIndex) continue
				const row = bp.areas[i]!
				if (row.trim() === '---') continue
				const cells = row.trim().split(/\s+/)
				for (const cell of cells) {
					if (cell !== '.' && cell !== '---') {
						used.add(cell)
					}
				}
			}
			return used
		})
	}

	return { errors, hasErrors, errorsForPath, usedSegmentsInOtherRows }
}
