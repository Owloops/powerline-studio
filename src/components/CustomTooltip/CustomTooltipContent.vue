<script setup lang="ts">
import { computed } from 'vue'
import {
	Tooltip,
	TooltipContent as StyledTooltipContent,
	TooltipTrigger,
} from '@/components/Tooltip'
import { TooltipContent as UnstyledTooltipContent, TooltipPortal } from 'reka-ui'

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

interface Props {
	root?: Partial<TooltipRootProps>
	trigger?: Partial<TooltipTriggerProps>
	content?: Partial<TooltipContentProps>
	unstyled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'update:open': [value: boolean]
}>()

const handleOpenChange = (value: boolean) => {
	emit('update:open', value)
}

// Compute merged props
const mergedRoot = computed(() => ({
	...props.root,
}))

const mergedTrigger = computed(() => ({
	...props.trigger,
}))

const mergedContent = computed(() => ({
	...props.content,
}))
</script>

<template>
	<Tooltip v-bind="mergedRoot" @update:open="handleOpenChange">
		<TooltipTrigger as-child v-bind="mergedTrigger">
			<slot />
		</TooltipTrigger>
		<TooltipPortal v-if="unstyled">
			<UnstyledTooltipContent v-bind="mergedContent">
				<slot name="content" />
			</UnstyledTooltipContent>
		</TooltipPortal>
		<StyledTooltipContent v-else v-bind="mergedContent">
			<slot name="content" />
		</StyledTooltipContent>
	</Tooltip>
</template>
