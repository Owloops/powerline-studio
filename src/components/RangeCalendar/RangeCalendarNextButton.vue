<script lang="ts" setup>
import { cn } from '@/lib/utils'
import { ChevronRight } from '@lucide/vue'
import { RangeCalendarNext, type RangeCalendarNextProps, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<RangeCalendarNextProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
	<RangeCalendarNext
		:class="
			cn(
				'inline-flex items-center justify-center shrink-0',
				'h-8 w-8 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground rounded-md',
				props.class,
			)
		"
		v-bind="forwardedProps"
	>
		<slot>
			<ChevronRight class="h-4 w-4" />
		</slot>
	</RangeCalendarNext>
</template>
