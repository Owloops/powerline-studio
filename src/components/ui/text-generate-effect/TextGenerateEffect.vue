<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { animate } from 'motion-v'
import { cn } from '@/lib/utils'

const props = withDefaults(
	defineProps<{
		words: string
		filter?: boolean
		duration?: number
		delay?: number
		class?: HTMLAttributes['class']
	}>(),
	{ duration: 0.7, delay: 0, filter: true },
)

const scope = ref(null)
const wordsArray = computed(() => props.words.split(' '))

const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const spanStyle = computed(() => ({
	opacity: 0,
	filter: props.filter ? 'blur(10px)' : 'none',
}))

onMounted(() => {
	if (!scope.value) return
	const spans = (scope.value as HTMLElement).querySelectorAll('span')

	if (reducedMotion.value) {
		spans.forEach((span: HTMLElement) => {
			span.style.opacity = '1'
			span.style.filter = 'none'
		})
		return
	}

	spans.forEach((span: HTMLElement, index: number) => {
		animate(
			span,
			{
				opacity: [0, 1],
				filter: props.filter ? ['blur(10px)', 'blur(0px)'] : undefined,
			},
			{
				duration: props.duration,
				delay: props.delay / 1000 + index * 0.2,
				ease: 'easeOut',
			},
		)
	})
})
</script>

<template>
	<div :class="cn(`leading-snug tracking-wide`, props.class)">
		<div ref="scope">
			<span
				v-for="(word, idx) in wordsArray"
				:key="word + idx"
				class="inline-block"
				:style="spanStyle"
			>
				{{ word }}&nbsp;
			</span>
		</div>
	</div>
</template>
