<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { motion, AnimatePresence } from 'motion-v'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'

interface Props {
	variant?: ButtonVariants['variant']
	size?: ButtonVariants['size']
	class?: HTMLAttributes['class']
	disabled?: boolean
	copied?: boolean
	label?: string
	copiedLabel?: string
	/** Hide the text label, show only the icon */
	iconOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'ghost',
	size: 'icon-sm',
	label: 'Copy',
	copiedLabel: 'Copied!',
	iconOnly: true,
})

const SPRING = { type: 'spring' as const, stiffness: 600, damping: 30 }
const SWAP = { duration: 0.12, ease: 'easeInOut' as const }

const pressState = computed(() => {
	if (props.disabled) return {}
	return { scale: 0.97 }
})

const pressTransition = { type: 'spring' as const, duration: 0.15, bounce: 0 }

const measureRef = ref<HTMLSpanElement | null>(null)
const labelWidth = ref(0)

function measureLabel() {
	if (measureRef.value) {
		labelWidth.value = measureRef.value.getBoundingClientRect().width
	}
}

useResizeObserver(measureRef, measureLabel)
watch(
	() => props.copied,
	() => nextTick(measureLabel),
	{ flush: 'post' },
)
</script>

<template>
	<motion.button
		data-slot="button"
		:data-variant="variant"
		:data-size="size"
		:disabled="disabled"
		:whilePress="pressState"
		:transition="pressTransition"
		:aria-label="iconOnly ? (copied ? copiedLabel : label) : undefined"
		:class="cn(buttonVariants({ variant, size }), 'relative', props.class)"
	>
		<span class="sr-only" aria-live="polite">{{ copied ? copiedLabel : '' }}</span>
		<motion.span
			class="flex items-center justify-center overflow-hidden"
			:style="{ gap: iconOnly ? '0px' : '6px' }"
		>
			<!-- Icon with animated swap -->
			<span class="relative size-3.5 shrink-0">
				<AnimatePresence mode="wait">
					<motion.span
						v-if="!copied"
						key="clipboard"
						class="absolute inset-0 flex items-center justify-center"
						:initial="{ y: -14, scale: 0.5, filter: 'blur(6px)', WebkitFilter: 'blur(6px)' }"
						:animate="{ y: 0, scale: 1, filter: 'blur(0px)', WebkitFilter: 'blur(0px)' }"
						:exit="{ y: 14, scale: 0.5, filter: 'blur(6px)', WebkitFilter: 'blur(6px)' }"
						:transition="SWAP"
					>
						<IconLucide-clipboard class="size-3.5" />
					</motion.span>
					<motion.span
						v-else
						key="check"
						class="absolute inset-0 flex items-center justify-center text-primary"
						:initial="{ y: -14, scale: 0.5, filter: 'blur(6px)', WebkitFilter: 'blur(6px)' }"
						:animate="{ y: 0, scale: 1, filter: 'blur(0px)', WebkitFilter: 'blur(0px)' }"
						:exit="{ y: 14, scale: 0.5, filter: 'blur(6px)', WebkitFilter: 'blur(6px)' }"
						:transition="SWAP"
					>
						<IconLucide-check class="size-3.5" />
					</motion.span>
				</AnimatePresence>
			</span>

			<!-- Measured label (hidden, for width calculation) -->
			<span v-if="!iconOnly" ref="measureRef" class="invisible absolute whitespace-nowrap">
				{{ copied ? copiedLabel : label }}
			</span>

			<!-- Label with animated width + text swap -->
			<motion.span
				v-if="!iconOnly"
				class="relative overflow-hidden"
				:animate="{ width: labelWidth }"
				:transition="SPRING"
			>
				<AnimatePresence mode="sync" :initial="false">
					<motion.span
						:key="copied ? 'copied' : 'idle'"
						class="whitespace-nowrap"
						:initial="{
							y: -16,
							opacity: 0,
							filter: 'blur(8px)',
							WebkitFilter: 'blur(8px)',
							position: 'absolute' as const,
						}"
						:animate="{
							y: 0,
							opacity: 1,
							filter: 'blur(0px)',
							WebkitFilter: 'blur(0px)',
							position: 'relative' as const,
						}"
						:exit="{
							y: 16,
							opacity: 0,
							filter: 'blur(8px)',
							WebkitFilter: 'blur(8px)',
							position: 'absolute' as const,
						}"
						:transition="SWAP"
					>
						{{ copied ? copiedLabel : label }}
					</motion.span>
				</AnimatePresence>
			</motion.span>
		</motion.span>
	</motion.button>
</template>
