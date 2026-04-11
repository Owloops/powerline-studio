<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { motion } from 'motion-v'
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

const pressState = computed(() => {
	if (props.disabled) return {}
	return { scale: 0.97 }
})

const transition = { duration: 0.15, ease: [0.22, 1, 0.36, 1] as const }
</script>

<template>
	<motion.button
		data-slot="button"
		:data-variant="variant"
		:data-size="size"
		:disabled="disabled"
		:whilePress="pressState"
		:transition="transition"
		:class="cn(buttonVariants({ variant, size }), props.class)"
	>
		<slot />
	</motion.button>
</template>
