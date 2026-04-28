import type { ColorTheme, SegmentColor } from '@owloops/claude-powerline/browser'
import { BUILT_IN_THEMES } from '@owloops/claude-powerline/browser'
// Side-effect import: augments ColorTheme with `agent` slot ahead of PR #82 npm bump.
import '@/types/agent'

export type CanonicalTheme = 'dark' | 'light' | 'nord' | 'tokyo-night' | 'rose-pine' | 'gruvbox'

export const CANONICAL_THEMES: CanonicalTheme[] = [
	'dark',
	'light',
	'nord',
	'tokyo-night',
	'rose-pine',
	'gruvbox',
]

export const CANONICAL_THEME_LABELS: Record<CanonicalTheme, string> = {
	dark: 'Dark',
	light: 'Light',
	nord: 'Nord',
	'tokyo-night': 'Tokyo Night',
	'rose-pine': 'Rose Pine',
	gruvbox: 'Gruvbox',
}

export const SEGMENT_LABELS: Record<keyof ColorTheme, string> = {
	directory: 'Directory',
	git: 'Git',
	model: 'Model',
	session: 'Session',
	block: 'Block',
	today: 'Today',
	tmux: 'Tmux',
	context: 'Context',
	contextWarning: 'Context Warning',
	contextCritical: 'Context Critical',
	metrics: 'Metrics',
	version: 'Version',
	env: 'Environment',
	weekly: 'Weekly',
	agent: 'Agent',
}

export const SEGMENT_KEYS = Object.keys(SEGMENT_LABELS) as (keyof ColorTheme)[]

/** Preview segments shown in theme card mini-strip */
export const PREVIEW_SEGMENTS: (keyof ColorTheme)[] = [
	'directory',
	'git',
	'model',
	'session',
	'context',
]

export interface PreCustomSnapshot {
	builtinTheme: CanonicalTheme
	overrides: Partial<ColorTheme>
}

export interface ThemeEditorState {
	mode: 'builtin' | 'custom'
	builtinTheme: CanonicalTheme
	overrides: Partial<ColorTheme>
	customDraft: ColorTheme | null
	customSourceSnapshot: ColorTheme | null
	customSourceTheme: CanonicalTheme | null
	savedThemeId: string | null
	preCustomSnapshot: PreCustomSnapshot | null
}

export interface SavedCustomTheme {
	id: string
	name: string
	colors: ColorTheme
	sourceTheme?: CanonicalTheme
	createdAt: number
}

// Local fallback for the `agent` color slot, used until PR #82's themes ship in
// `@owloops/claude-powerline`. Once the dep is bumped these defaults can be removed.
const AGENT_FALLBACK_COLORS: Record<CanonicalTheme, SegmentColor> = {
	dark: { bg: '#7c3aed', fg: '#ffffff' },
	light: { bg: '#a855f7', fg: '#ffffff' },
	nord: { bg: '#b48ead', fg: '#2e3440' },
	'tokyo-night': { bg: '#bb9af7', fg: '#1a1b26' },
	'rose-pine': { bg: '#c4a7e7', fg: '#191724' },
	gruvbox: { bg: '#d3869b', fg: '#282828' },
}

export function getCanonicalThemeColors(theme: CanonicalTheme): ColorTheme {
	const base = BUILT_IN_THEMES[theme]!
	if (base.agent) return base
	return { ...base, agent: { ...AGENT_FALLBACK_COLORS[theme] } }
}

/**
 * Backfills any missing slots in a partial ColorTheme from a canonical source.
 * Needed for stored custom themes that predate newer slots like `agent`.
 */
export function completeColorTheme(
	theme: Partial<ColorTheme>,
	sourceTheme: CanonicalTheme = 'dark',
): ColorTheme {
	const source = getCanonicalThemeColors(sourceTheme)
	const result = { ...source } as ColorTheme
	for (const key of SEGMENT_KEYS) {
		const slot = theme[key]
		if (slot) {
			result[key] = { ...slot }
		}
	}
	return result
}

export function deepEqualColorTheme(a: ColorTheme | null, b: ColorTheme | null): boolean {
	if (a === b) return true
	if (!a || !b) return false
	for (const key of SEGMENT_KEYS) {
		const sa = a[key] as SegmentColor
		const sb = b[key] as SegmentColor
		if (sa.bg !== sb.bg || sa.fg !== sb.fg) return false
	}
	return true
}

export function mergeThemeWithOverrides(
	base: ColorTheme,
	overrides: Partial<ColorTheme>,
): ColorTheme {
	const result = { ...base }
	for (const key of SEGMENT_KEYS) {
		if (overrides[key]) {
			result[key] = { ...overrides[key] }
		}
	}
	return result
}
