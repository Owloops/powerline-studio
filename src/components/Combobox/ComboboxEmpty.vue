<script setup lang="ts">
import type { ComboboxEmptyProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { ComboboxEmpty } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<ComboboxEmptyProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	return delegated
})
</script>

<template>
	<ComboboxEmpty
		v-bind="delegatedProps"
		:class="cn('py-4 text-center text-sm text-muted-foreground', props.class)"
	>
		<slot />
	</ComboboxEmpty>
</template>
