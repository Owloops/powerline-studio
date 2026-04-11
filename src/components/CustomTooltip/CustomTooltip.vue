<script setup lang="ts">
import { computed } from 'vue'
import {
	Tooltip,
	TooltipContent as StyledTooltipContent,
	TooltipProvider,
	TooltipTrigger,
	TooltipArrow,
} from '@/components/Tooltip'
import {
	TooltipContent as UnstyledTooltipContent,
	TooltipPortal,
	TooltipArrow as UnstyledTooltipArrow,
} from 'reka-ui'

interface TooltipProviderProps {
	delayDuration?: number
	disableClosingTrigger?: boolean
	disabled?: boolean
	disableHoverableContent?: boolean
	ignoreNonKeyboardFocus?: boolean
	skipDelayDuration?: number
}

interface TooltipRootProps {
	defaultOpen?: boolean
	delayDuration?: number
	disableClosingTrigger?: boolean
	disabled?: boolean
	disableHoverableContent?: boolean
	ignoreNonKeyboardFocus?: boolean
	open?: boolean
}

interface TooltipTriggerProps {
	as?: any
	asChild?: boolean
	reference?: any
}

interface TooltipContentProps {
	align?: 'start' | 'center' | 'end'
	alignOffset?: number
	ariaLabel?: string
	arrowPadding?: number
	as?: any
	asChild?: boolean
	avoidCollisions?: boolean
	collisionBoundary?: Element | (Element | null)[] | null
	collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
	forceMount?: boolean
	hideWhenDetached?: boolean
	positionStrategy?: 'fixed' | 'absolute'
	side?: 'top' | 'right' | 'bottom' | 'left'
	sideOffset?: number
	sticky?: 'partial' | 'always'
	updatePositionStrategy?: 'always' | 'optimized'
}

interface TooltipArrowProps {
	as?: any
	asChild?: boolean
	width?: number
	height?: number
}

interface Props {
	provider?: Partial<TooltipProviderProps>
	root?: Partial<TooltipRootProps>
	trigger?: Partial<TooltipTriggerProps>
	content?: Partial<TooltipContentProps>
	arrow?: Partial<TooltipArrowProps> | boolean
	unstyled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'update:open': [value: boolean]
}>()

const handleOpenChange = (value: boolean) => {
	emit('update:open', value)
}

// Compute merged props with defaults
const mergedProvider = computed(() => ({
	delayDuration: 200,
	...props.provider,
}))

const mergedRoot = computed(() => ({
	...props.root,
}))

const mergedTrigger = computed(() => ({
	...props.trigger,
}))

const mergedContent = computed(() => ({
	...props.content,
}))

const mergedArrow = computed(() => {
	if (props.arrow === false) return null
	if (props.arrow === true) return { width: 10, height: 5 }
	return {
		width: 10,
		height: 5,
		...props.arrow,
	}
})
</script>

<template>
	<TooltipProvider v-bind="mergedProvider">
		<Tooltip v-bind="mergedRoot" @update:open="handleOpenChange">
			<TooltipTrigger as-child v-bind="mergedTrigger">
				<slot />
			</TooltipTrigger>
			<TooltipPortal v-if="unstyled">
				<UnstyledTooltipContent v-bind="mergedContent">
					<slot name="content" />
					<UnstyledTooltipArrow v-if="mergedArrow" v-bind="mergedArrow">
						<slot name="arrow" />
					</UnstyledTooltipArrow>
				</UnstyledTooltipContent>
			</TooltipPortal>
			<StyledTooltipContent v-else v-bind="mergedContent">
				<slot name="content" />
				<TooltipArrow v-if="mergedArrow" v-bind="mergedArrow">
					<slot name="arrow" />
				</TooltipArrow>
			</StyledTooltipContent>
		</Tooltip>
	</TooltipProvider>
</template>
