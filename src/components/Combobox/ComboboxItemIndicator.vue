<script setup lang="ts">
import type { ComboboxItemIndicatorProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { ComboboxItemIndicator } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'
import { Check } from '@lucide/vue'

const props = defineProps<ComboboxItemIndicatorProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	return delegated
})
</script>

<template>
	<ComboboxItemIndicator v-bind="delegatedProps" :class="cn(props.class)">
		<slot>
			<Check :class="cn('ml-auto h-4 w-4')" />
		</slot>
	</ComboboxItemIndicator>
</template>
