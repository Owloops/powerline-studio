<script setup lang="ts">
import type { ComboboxContentEmits, ComboboxContentProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { ComboboxContent, ComboboxPortal, ComboboxViewport, useForwardPropsEmits } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = withDefaults(
	defineProps<ComboboxContentProps & { class?: HTMLAttributes['class']; portal?: boolean }>(),
	{
		position: 'popper',
		align: 'start',
		sideOffset: 4,
		portal: true,
	},
)
const emits = defineEmits<ComboboxContentEmits>()

const delegatedProps = computed(() => {
	const { class: _, portal: __, ...delegated } = props

	return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
	<ComboboxPortal :disabled="!props.portal">
		<ComboboxContent
			v-bind="forwarded"
			:class="
				cn(
					'z-50 min-w-24 w-[var(--reka-combobox-trigger-width)] rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
					props.class,
				)
			"
		>
			<ComboboxViewport class="p-1">
				<slot />
			</ComboboxViewport>
		</ComboboxContent>
	</ComboboxPortal>
</template>
