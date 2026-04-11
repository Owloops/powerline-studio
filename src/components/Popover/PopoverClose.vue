<script setup lang="ts">
import { PopoverClose, type PopoverCloseProps } from 'reka-ui'

const props = defineProps<PopoverCloseProps>()
</script>

<template>
	<PopoverClose v-bind="props">
		<slot />
	</PopoverClose>
</template>
