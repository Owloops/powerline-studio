<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { SelectLabel, type SelectLabelProps } from 'reka-ui'

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
	<SelectLabel :class="cn('py-1.5 px-2 text-sm font-semibold text-muted-foreground', props.class)">
		<slot />
	</SelectLabel>
</template>
