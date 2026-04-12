import type { TuiGridConfig, LineConfig } from '@owloops/claude-powerline/browser'

export interface TuiPreset {
	id: string
	name: string
	description: string
	tui: TuiGridConfig
	segments: LineConfig['segments']
}

export const TUI_PRESETS: TuiPreset[] = [
	{
		id: 'compact',
		name: 'Compact',
		description: 'Git + context window only. Minimal footprint.',
		tui: {
			fitContent: true,
			minWidth: 30,
			padding: { horizontal: 1 },
			separator: { column: '' },
			title: {
				left: '{model}',
				right: '{dir}',
			},
			breakpoints: [
				{
					minWidth: 0,
					areas: [
						'git.icon   git.head     .            git.working',
						'---',
						'context.icon  context.bar  context.pct  context.tokens',
					],
					columns: ['auto', '1fr', 'auto', 'auto'],
					align: ['left', 'left', 'right', 'right'],
				},
			],
		},
		segments: {
			directory: { enabled: true, showBasename: true },
			git: { enabled: true },
			model: { enabled: true },
			context: { enabled: true, autocompactBuffer: 0 },
		},
	},
	{
		id: 'standard',
		name: 'Standard',
		description: 'Git + context + block usage with progress bars.',
		tui: {
			fitContent: true,
			minWidth: 45,
			padding: { horizontal: 1 },
			separator: { column: '' },
			title: {
				left: '{model}',
				right: '{dir}',
			},
			segments: {
				'git.info': {
					items: ['{branch}', '{status}', '{ahead}', '{behind}'],
					gap: 1,
				},
			},
			breakpoints: [
				{
					minWidth: 0,
					areas: [
						'git.icon     git.info     git.info     .            git.working',
						'---',
						'context.icon  context.bar  context.bar  context.pct  context.tokens',
						'block.icon    block.bar    block.bar    block.value  block.time',
					],
					columns: ['auto', '1fr', 'auto', 'auto', 'auto'],
					align: ['left', 'left', 'right', 'right', 'right'],
				},
			],
		},
		segments: {
			directory: { enabled: true, showBasename: true },
			git: { enabled: true, showAheadBehind: true },
			model: { enabled: true },
			context: { enabled: true, autocompactBuffer: 0 },
			block: { enabled: true, type: 'tokens' },
		},
	},
	{
		id: 'full',
		name: 'Full',
		description: 'All segments with responsive breakpoints and footer.',
		tui: {
			fitContent: true,
			minWidth: 60,
			padding: { horizontal: 1 },
			separator: { column: '' },
			title: {
				left: '{model.icon}  {model.value}',
				right: '{dir}',
			},
			footer: {
				left: '{activity.durationIcon} {activity.durationVal}  {activity.messagesIcon} {activity.messagesVal}',
				right: '{metrics.lastResponse}',
			},
			segments: {
				'git.info': {
					items: ['{branch}', '{status}', '{ahead}', '{behind}'],
					gap: 1,
				},
			},
			breakpoints: [
				{
					minWidth: 55,
					areas: [
						'git.icon     git.info     git.info     .               git.working',
						'---',
						'context.icon  context.bar  context.bar  context.pct     context.tokens',
						'block.icon    block.bar    block.bar    block.value     block.time',
						'weekly.icon   weekly.bar   weekly.bar   weekly.pct      weekly.time',
						'---',
						'session       session       session     today           today',
					],
					columns: ['auto', '1fr', 'auto', 'auto', 'auto'],
					align: ['left', 'left', 'right', 'right', 'right'],
				},
				{
					minWidth: 0,
					areas: ['git.head', 'git.working', '---', 'context', 'block', '---', 'session', 'today'],
					columns: ['1fr'],
					align: ['left'],
				},
			],
		},
		segments: {
			directory: { enabled: true, style: 'fish' },
			git: { enabled: true, showAheadBehind: true },
			model: { enabled: true },
			context: { enabled: true, autocompactBuffer: 0 },
			block: { enabled: true, type: 'tokens' },
			session: { enabled: true, type: 'tokens' },
			today: { enabled: true, type: 'cost' },
			weekly: { enabled: true },
			metrics: {
				enabled: true,
				showLastResponseTime: true,
				showResponseTime: false,
				showDuration: true,
				showMessageCount: true,
			},
		},
	},
]
