<script setup lang="ts">
import type { TooltipArrowProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { TooltipArrow } from 'reka-ui'
import { cn } from '@/lib/utils'

defineOptions({
	inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipArrowProps & { class?: HTMLAttributes['class'] }>(), {
	width: 10,
	height: 5,
	as: 'svg',
})
</script>

<template>
	<TooltipArrow
		v-bind="{ ...props, ...$attrs }"
		:class="cn('fill-popover stroke-border will-change-transform', props.class)"
		:style="{ strokeWidth: 1.0, strokeLinejoin: 'round' }"
	/>
</template>
