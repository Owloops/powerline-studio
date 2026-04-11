import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

export const badgeVariants = cva(
	'inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none inset-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden',
	{
		variants: {
			variant: {
				default: 'bg-gray-400/10 text-gray-400 inset-ring-gray-400/20',
				secondary: 'bg-blue-400/10 text-blue-400 inset-ring-blue-400/30',
				destructive: 'bg-red-400/10 text-red-400 inset-ring-red-400/20',
				outline: 'bg-transparent text-foreground inset-ring-border',
				warning: 'bg-yellow-400/10 text-yellow-500 inset-ring-yellow-400/20',
				success: 'bg-green-400/10 text-green-400 inset-ring-green-500/20',
				blue: 'bg-blue-400/10 text-blue-400 inset-ring-blue-400/30',
				indigo: 'bg-indigo-400/10 text-indigo-400 inset-ring-indigo-400/30',
				purple: 'bg-purple-400/10 text-purple-400 inset-ring-purple-400/30',
				pink: 'bg-pink-400/10 text-pink-400 inset-ring-pink-400/20',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)
export type BadgeVariants = VariantProps<typeof badgeVariants>
