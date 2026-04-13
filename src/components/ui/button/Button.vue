<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'

interface Props extends PrimitiveProps {
	variant?: ButtonVariants['variant']
	size?: ButtonVariants['size']
	class?: HTMLAttributes['class']
	disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	as: 'button',
})
</script>

<template>
	<button
		data-slot="button"
		:data-variant="variant"
		:data-size="size"
		:disabled="disabled"
		:class="cn(buttonVariants({ variant, size }), props.class)"
	>
		<slot />
	</button>
</template>
