<script lang="ts" setup>
import { cn } from '@/lib/utils'
import { ChevronsRight } from '@lucide/vue'
import { RangeCalendarNext, type RangeCalendarNextProps, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<RangeCalendarNextProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	// Customize the nextPage function to move by 1 year instead of 1 month
	const nextYearPage = (date: any) => {
		return date.add({ years: 1 })
	}

	return {
		...delegated,
		nextPage: nextYearPage,
	}
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
			<ChevronsRight class="h-4 w-4" />
		</slot>
	</RangeCalendarNext>
</template>
