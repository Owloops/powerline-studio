<script lang="ts" setup>
import { cn } from '@/lib/utils'
import { CalendarHeadCell, type CalendarHeadCellProps, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<CalendarHeadCellProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
	<CalendarHeadCell
		:class="
			cn(
				'w-9 px-px rounded-md text-[0.8rem] font-normal text-muted-foreground text-center',
				props.class,
			)
		"
		v-bind="forwardedProps"
	>
		<slot />
	</CalendarHeadCell>
</template>
