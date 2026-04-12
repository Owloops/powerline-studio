import type { LineConfig } from '@owloops/claude-powerline/browser'

export interface FlatPreset {
	id: string
	name: string
	description: string
	style: 'minimal' | 'powerline' | 'capsule'
	lines: { segments: LineConfig['segments'] }[]
}

export const FLAT_PRESETS: FlatPreset[] = [
	{
		id: 'compact',
		name: 'Compact',
		description: 'Directory + git + model. One line, essentials only.',
		style: 'powerline',
		lines: [
			{
				segments: {
					directory: { enabled: true, style: 'basename' },
					git: { enabled: true },
					model: { enabled: true },
				},
			},
		],
	},
	{
		id: 'standard',
		name: 'Standard',
		description: 'Directory, git, model, session, and context window.',
		style: 'powerline',
		lines: [
			{
				segments: {
					directory: { enabled: true, style: 'fish' },
					git: { enabled: true },
					model: { enabled: true },
					session: { enabled: true, type: 'tokens' },
					context: { enabled: true },
				},
			},
		],
	},
	{
		id: 'full',
		name: 'Full',
		description: 'All major segments across two lines.',
		style: 'powerline',
		lines: [
			{
				segments: {
					directory: { enabled: true, style: 'fish' },
					git: { enabled: true, showAheadBehind: true },
					model: { enabled: true },
					session: { enabled: true, type: 'tokens' },
					context: { enabled: true },
				},
			},
			{
				segments: {
					block: { enabled: true, type: 'tokens' },
					today: { enabled: true, type: 'cost' },
					metrics: { enabled: true, showLastResponseTime: true },
				},
			},
		],
	},
]
