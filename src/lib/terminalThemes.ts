export interface TerminalTheme {
	id: string
	name: string
	bg: string
	fg: string
	isDark: boolean
}

export const TERMINAL_THEMES: TerminalTheme[] = [
	// --- Dark ---
	{ id: 'catppuccin-mocha', name: 'Catppuccin Mocha', bg: '#1e1e2e', fg: '#cdd6f4', isDark: true },
	{ id: 'one-dark', name: 'One Dark', bg: '#282c34', fg: '#abb2bf', isDark: true },
	{ id: 'dracula', name: 'Dracula', bg: '#282a36', fg: '#f8f8f2', isDark: true },
	{ id: 'nord', name: 'Nord', bg: '#2e3440', fg: '#d8dee9', isDark: true },
	{ id: 'gruvbox-dark', name: 'Gruvbox Dark', bg: '#282828', fg: '#ebdbb2', isDark: true },
	{ id: 'solarized-dark', name: 'Solarized Dark', bg: '#002b36', fg: '#839496', isDark: true },
	{ id: 'tokyo-night', name: 'Tokyo Night', bg: '#1a1b26', fg: '#a9b1d6', isDark: true },
	{ id: 'material-dark', name: 'Material Dark', bg: '#263238', fg: '#eeffff', isDark: true },
	{ id: 'monokai', name: 'Monokai', bg: '#272822', fg: '#f8f8f2', isDark: true },
	{ id: 'github-dark', name: 'GitHub Dark', bg: '#0d1117', fg: '#e6edf3', isDark: true },
	// --- Light ---
	{ id: 'github-light', name: 'GitHub Light', bg: '#ffffff', fg: '#1f2328', isDark: false },
	{ id: 'catppuccin-latte', name: 'Catppuccin Latte', bg: '#eff1f5', fg: '#4c4f69', isDark: false },
	{ id: 'solarized-light', name: 'Solarized Light', bg: '#fdf6e3', fg: '#657b83', isDark: false },
	{ id: 'one-light', name: 'One Light', bg: '#fafafa', fg: '#383a42', isDark: false },
	{ id: 'nord-light', name: 'Nord Light', bg: '#eceff4', fg: '#2e3440', isDark: false },
	{ id: 'gruvbox-light', name: 'Gruvbox Light', bg: '#fbf1c7', fg: '#3c3836', isDark: false },
]

export const DARK_THEMES = TERMINAL_THEMES.filter((t) => t.isDark)
export const LIGHT_THEMES = TERMINAL_THEMES.filter((t) => !t.isDark)

const themeMap = new Map(TERMINAL_THEMES.map((t) => [t.id, t]))

export function getTerminalTheme(id: string): TerminalTheme {
	return themeMap.get(id) ?? TERMINAL_THEMES[0]!
}
