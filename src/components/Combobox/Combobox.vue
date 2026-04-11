<script setup lang="ts">
import {
	ComboboxRoot,
	type ComboboxRootEmits,
	type ComboboxRootProps,
	useForwardPropsEmits,
} from 'reka-ui'

const props = defineProps<ComboboxRootProps>()
const emits = defineEmits<ComboboxRootEmits>()

const forwarded: any = useForwardPropsEmits(props, emits)
</script>

<template>
	<ComboboxRoot v-bind="forwarded" class="relative flex-1">
		<slot />
	</ComboboxRoot>
</template>
