export interface TerminalFont {
	id: string
	name: string
	fontFamily: string
}

export const TERMINAL_FONTS: TerminalFont[] = [
	{ id: 'firacode', name: 'Fira Code', fontFamily: 'FiraCode Nerd Font Mono' },
	{ id: 'jetbrains-mono', name: 'JetBrains Mono', fontFamily: 'JetBrainsMono NFM' },
	{ id: 'cascadia-code', name: 'Cascadia Code', fontFamily: 'CaskaydiaCove NFM' },
	{ id: 'iosevka', name: 'Iosevka', fontFamily: 'Iosevka NFM' },
	{ id: 'ubuntu-mono', name: 'Ubuntu Mono', fontFamily: 'UbuntuMono Nerd Font Mono' },
	{ id: 'zed-mono', name: 'Zed Mono', fontFamily: 'ZedMono NFM' },
]

const fontMap = new Map(TERMINAL_FONTS.map((f) => [f.id, f]))

export function getTerminalFont(id: string): TerminalFont {
	return fontMap.get(id) ?? TERMINAL_FONTS[0]!
}
