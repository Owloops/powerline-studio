export interface TerminalTheme {
	id: string
	name: string
	bg: string
	fg: string
	isDark: boolean
}

export const TERMINAL_THEMES: TerminalTheme[] = [
	// --- Dark ---
	// Neutral
	{ id: 'github-dark', name: 'GitHub Dark', bg: '#0d1117', fg: '#e6edf3', isDark: true },
	{ id: 'vscode-dark-modern', name: 'VS Code Dark', bg: '#1f1f1f', fg: '#cccccc', isDark: true },
	// Cool
	{ id: 'tokyo-night', name: 'Tokyo Night', bg: '#1a1b26', fg: '#a9b1d6', isDark: true },
	{ id: 'one-dark', name: 'One Dark', bg: '#282c34', fg: '#abb2bf', isDark: true },
	// Green
	{ id: 'solarized-dark', name: 'Solarized Dark', bg: '#002b36', fg: '#839496', isDark: true },
	// Warm
	{ id: 'monokai', name: 'Monokai', bg: '#272822', fg: '#f8f8f2', isDark: true },
	{ id: 'gruvbox-dark', name: 'Gruvbox Dark', bg: '#282828', fg: '#ebdbb2', isDark: true },
	// --- Light ---
	// Neutral
	{ id: 'one-light', name: 'One Light', bg: '#fafafa', fg: '#383a42', isDark: false },
	// Warm
	{ id: 'solarized-light', name: 'Solarized Light', bg: '#fdf6e3', fg: '#657b83', isDark: false },
	// Warmer
	{ id: 'gruvbox-light', name: 'Gruvbox Light', bg: '#fbf1c7', fg: '#3c3836', isDark: false },
]

export const DARK_THEMES = TERMINAL_THEMES.filter((t) => t.isDark)
export const LIGHT_THEMES = TERMINAL_THEMES.filter((t) => !t.isDark)

const themeMap = new Map(TERMINAL_THEMES.map((t) => [t.id, t]))

export function getTerminalTheme(id: string): TerminalTheme {
	return themeMap.get(id) ?? TERMINAL_THEMES[0]!
}
