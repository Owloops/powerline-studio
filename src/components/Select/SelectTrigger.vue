<script setup lang="ts">
import { cn } from '@/lib/utils'
import { ChevronDown } from '@lucide/vue'
import { SelectIcon, SelectTrigger, type SelectTriggerProps, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<SelectTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
	<SelectTrigger
		v-bind="forwardedProps"
		:class="
			cn(
				'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background dark:bg-input/30 px-3 py-2 text-sm text-foreground shadow-xs data-[placeholder]:text-muted-foreground [&>span]:truncate focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
				props.class,
			)
		"
	>
		<slot />
		<SelectIcon as-child>
			<ChevronDown class="w-4 h-4 ml-1.5 -mr-1.5 opacity-50 shrink-0" />
		</SelectIcon>
	</SelectTrigger>
</template>
