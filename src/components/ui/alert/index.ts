import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Alert } from './Alert.vue'
export { default as AlertAction } from './AlertAction.vue'
export { default as AlertDescription } from './AlertDescription.vue'
export { default as AlertTitle } from './AlertTitle.vue'

export const alertVariants = cva(
	'grid gap-0.5 rounded-lg border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*=size-])]:size-4 group/alert relative w-full',
	{
		variants: {
			variant: {
				default: 'bg-card text-card-foreground',
				destructive:
					'border-transparent outline outline-red-500/25 bg-red-500/15 text-red-600 dark:text-red-200 *:data-[slot=alert-description]:text-red-600/80 dark:*:data-[slot=alert-description]:text-red-200/80 *:[svg]:text-current',
				warning:
					'border-transparent outline outline-yellow-500/15 bg-yellow-500/10 text-yellow-700 dark:text-yellow-100 *:data-[slot=alert-description]:text-yellow-700/80 dark:*:data-[slot=alert-description]:text-yellow-100/80 *:[svg]:text-current',
				success:
					'border-transparent outline outline-green-500/20 bg-green-500/10 text-green-700 dark:text-green-200 *:data-[slot=alert-description]:text-green-700/85 dark:*:data-[slot=alert-description]:text-green-200/85 *:[svg]:text-current',
				info: 'border-transparent outline outline-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300 *:data-[slot=alert-description]:text-blue-600/80 dark:*:data-[slot=alert-description]:text-blue-300/80 *:[svg]:text-current',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

export type AlertVariants = VariantProps<typeof alertVariants>
