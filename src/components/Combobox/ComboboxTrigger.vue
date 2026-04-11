<script setup lang="ts">
import type { ComboboxTriggerProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { ComboboxTrigger, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'
import { ChevronsUpDown } from '@lucide/vue'

const props = defineProps<ComboboxTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	return delegated
})

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
	<ComboboxTrigger
		v-bind="forwarded"
		:class="
			cn(
				'absolute end-0 inset-y-0 flex items-center justify-center px-3 rounded-md focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]',
				props.class,
			)
		"
		tabindex="0"
	>
		<slot>
			<ChevronsUpDown class="size-4 text-muted-foreground" />
		</slot>
	</ComboboxTrigger>
</template>
