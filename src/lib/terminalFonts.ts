export interface TerminalFont {
	id: string
	name: string
	fontFamily: string
	tuiLineHeight: number
}

export const TERMINAL_FONTS: TerminalFont[] = [
	{ id: 'firacode', name: 'Fira Code', fontFamily: 'FiraCode Nerd Font Mono', tuiLineHeight: 1.25 },
	{
		id: 'jetbrains-mono',
		name: 'JetBrains Mono',
		fontFamily: 'JetBrainsMono NFM',
		tuiLineHeight: 1.2,
	},
	{
		id: 'cascadia-code',
		name: 'Cascadia Code',
		fontFamily: 'CaskaydiaCove NFM',
		tuiLineHeight: 1.15,
	},
	{ id: 'iosevka', name: 'Iosevka', fontFamily: 'Iosevka NFM', tuiLineHeight: 1.25 },
	{
		id: 'ubuntu-mono',
		name: 'Ubuntu Mono',
		fontFamily: 'UbuntuMono Nerd Font Mono',
		tuiLineHeight: 1.0,
	},
	{ id: 'zed-mono', name: 'Zed Mono', fontFamily: 'ZedMono NFM', tuiLineHeight: 1.25 },
]

const fontMap = new Map(TERMINAL_FONTS.map((f) => [f.id, f]))

export function getTerminalFont(id: string): TerminalFont {
	return fontMap.get(id) ?? TERMINAL_FONTS[0]!
}
