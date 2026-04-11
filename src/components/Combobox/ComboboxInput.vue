<script setup lang="ts">
import { cn } from '@/lib/utils'
import { ComboboxInput, type ComboboxInputProps, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<
	ComboboxInputProps & {
		class?: HTMLAttributes['class']
	}
>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
	<ComboboxInput
		v-bind="forwardedProps"
		:class="
			cn(
				'h-9 w-full rounded-md border border-input bg-transparent px-3 pr-8 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
				props.class,
			)
		"
	>
		<slot />
	</ComboboxInput>
</template>
