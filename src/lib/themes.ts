import type { ColorTheme, SegmentColor } from '@owloops/claude-powerline/browser'
import { BUILT_IN_THEMES } from '@owloops/claude-powerline/browser'

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

export interface ThemeEditorState {
	mode: 'builtin' | 'custom'
	builtinTheme: CanonicalTheme
	overrides: Partial<ColorTheme>
	customDraft: ColorTheme | null
	customSourceSnapshot: ColorTheme | null
}

export interface SavedCustomTheme {
	id: string
	name: string
	colors: ColorTheme
	createdAt: number
}

export function getCanonicalThemeColors(theme: CanonicalTheme): ColorTheme {
	return BUILT_IN_THEMES[theme]!
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
