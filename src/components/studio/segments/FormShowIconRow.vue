<script setup lang="ts">
import FormTristateRow from './FormTristateRow.vue'
import type { SegmentKey } from './segmentMeta'

defineProps<{
	segmentName: SegmentKey
	disabled?: boolean
	disabledTooltip?: string
}>()
</script>

<template>
	<FormTristateRow
		:segment-name="segmentName"
		option-key="showIcon"
		label="Icon"
		default-label="Default (use global)"
		:disabled="disabled"
		:disabled-tooltip="disabledTooltip"
	/>
</template>
