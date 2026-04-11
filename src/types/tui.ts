import type {
	TuiGridConfig,
	TuiGridBreakpoint,
	SegmentName,
	AlignValue,
	SegmentTemplate,
} from '@owloops/claude-powerline/browser'
import { SEGMENT_PARTS, VALID_SEGMENT_NAMES } from '@owloops/claude-powerline/browser'

export type { TuiGridConfig, TuiGridBreakpoint, SegmentName, AlignValue, SegmentTemplate }
export { SEGMENT_PARTS, VALID_SEGMENT_NAMES }

/** Segment names derived from SEGMENT_PARTS keys */
export const SEGMENT_NAME_LIST = Object.keys(SEGMENT_PARTS) as SegmentName[]

/** All segment part references (e.g., "session.cost", "git.branch") */
export const SEGMENT_PART_REFS: string[] = SEGMENT_NAME_LIST.flatMap((seg) =>
	SEGMENT_PARTS[seg].map((part) => `${seg}.${part}`),
)

/** Breakpoint with ephemeral editor ID (stripped before export) */
export interface EditorBreakpoint extends TuiGridBreakpoint {
	_id: string
}

/** Parsed cell for grid display */
export interface ParsedCell {
	segment: string
	span: number
	startCol: number
}

/** Validation error with location context */
export interface TuiValidationError {
	path: string
	message: string
}
