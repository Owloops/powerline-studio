<script lang="ts" setup>
import { cn } from '@/lib/utils'
import { CalendarGridRow, type CalendarGridRowProps, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<CalendarGridRowProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
	<CalendarGridRow :class="cn('flex space-x-0.5', props.class)" v-bind="forwardedProps">
		<slot />
	</CalendarGridRow>
</template>
