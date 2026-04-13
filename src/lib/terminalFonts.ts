export interface TerminalFont {
	id: string
	name: string
	fontFamily: string
	tuiLineHeight: number
	weights: number[]
}

export const TERMINAL_FONTS: TerminalFont[] = [
	{
		id: 'firacode',
		name: 'Fira Code',
		fontFamily: 'FiraCode Nerd Font Mono',
		tuiLineHeight: 1.25,
		weights: [300, 400, 500, 600, 700],
	},
	{
		id: 'jetbrains-mono',
		name: 'JetBrains Mono',
		fontFamily: 'JetBrainsMono NFM',
		tuiLineHeight: 1.2,
		weights: [100, 200, 300, 400, 500, 600, 700, 800],
	},
	{
		id: 'cascadia-code',
		name: 'Cascadia Code',
		fontFamily: 'CaskaydiaCove NFM',
		tuiLineHeight: 1.15,
		weights: [200, 300, 400, 600, 700],
	},
	{
		id: 'iosevka',
		name: 'Iosevka',
		fontFamily: 'Iosevka NFM',
		tuiLineHeight: 1.25,
		weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
	},
	{
		id: 'ubuntu-mono',
		name: 'Ubuntu Mono',
		fontFamily: 'UbuntuMono Nerd Font Mono',
		tuiLineHeight: 1.0,
		weights: [400, 700],
	},
	{
		id: 'zed-mono',
		name: 'Zed Mono',
		fontFamily: 'ZedMono NFM',
		tuiLineHeight: 1.25,
		weights: [300, 400, 500, 600, 700, 800],
	},
]

export const FONT_WEIGHT_NAMES: Record<number, string> = {
	100: 'Thin',
	200: 'Extra Light',
	300: 'Light',
	400: 'Normal',
	500: 'Medium',
	600: 'Semi Bold',
	700: 'Bold',
	800: 'Extra Bold',
	900: 'Black',
	950: 'Extra Black',
}

const fontMap = new Map(TERMINAL_FONTS.map((f) => [f.id, f]))

export function getTerminalFont(id: string): TerminalFont {
	return fontMap.get(id) ?? TERMINAL_FONTS[0]!
}
