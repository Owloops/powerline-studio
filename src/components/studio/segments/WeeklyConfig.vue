<script setup lang="ts">
import FormSelectField from '@/components/FormSelectField.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { weeklyConfigSchema } from './schemas'
import { BAR_DISPLAY_STYLE_OPTIONS } from './options'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const { values } = useSegmentForm('weekly', weeklyConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.weekly
	return {
		displayStyle: seg?.displayStyle ?? SEGMENT_DEFAULTS.weekly.displayStyle,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="weekly" />
		<FormSelectField
			name="displayStyle"
			label="Display Style"
			:options="BAR_DISPLAY_STYLE_OPTIONS"
		/>
	</div>
</template>
