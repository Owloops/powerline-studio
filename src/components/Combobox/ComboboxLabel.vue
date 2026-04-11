<script setup lang="ts">
import type { ComboboxLabelProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { ComboboxLabel, useForwardPropsEmits } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<ComboboxLabelProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps)
</script>

<template>
	<ComboboxLabel
		v-bind="forwarded"
		:class="cn('py-1.5 px-2 text-sm font-semibold text-muted-foreground', props.class)"
	>
		<slot />
	</ComboboxLabel>
</template>
