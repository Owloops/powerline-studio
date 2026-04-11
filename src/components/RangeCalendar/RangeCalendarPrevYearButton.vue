<script lang="ts" setup>
import { cn } from '@/lib/utils'
import { ChevronsLeft } from '@lucide/vue'
import { RangeCalendarPrev, type RangeCalendarPrevProps, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<RangeCalendarPrevProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	// Customize the prevPage function to move by 1 year instead of 1 month
	const prevYearPage = (date: any) => {
		return date.subtract({ years: 1 })
	}

	return {
		...delegated,
		prevPage: prevYearPage,
	}
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
	<RangeCalendarPrev
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
			<ChevronsLeft class="h-4 w-4" />
		</slot>
	</RangeCalendarPrev>
</template>
