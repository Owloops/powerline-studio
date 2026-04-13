<script setup lang="ts">
import FormSelectField from '@/components/FormSelectField.vue'
import FormSwitchField from '@/components/FormSwitchField.vue'
import FormNumberField from '@/components/FormNumberField.vue'
import { contextConfigSchema } from './schemas'
import { BAR_DISPLAY_STYLE_OPTIONS, PERCENTAGE_MODE_OPTIONS } from './options'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const { values } = useSegmentForm('context', contextConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.context
	const displayStyle = seg?.displayStyle ?? SEGMENT_DEFAULTS.context.displayStyle
	return {
		displayStyle,
		showPercentageOnly: seg?.showPercentageOnly ?? false,
		percentageMode: seg?.percentageMode ?? (displayStyle === 'text' ? 'remaining' : 'used'),
		autocompactBuffer: seg?.autocompactBuffer ?? SEGMENT_DEFAULTS.context.autocompactBuffer,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormSelectField
			name="displayStyle"
			label="Display Style"
			:options="BAR_DISPLAY_STYLE_OPTIONS"
		/>
		<FormSwitchField name="showPercentageOnly" label="Show Percentage Only" />
		<FormSelectField
			name="percentageMode"
			label="Percentage Mode"
			:options="PERCENTAGE_MODE_OPTIONS"
		/>
		<FormNumberField
			name="autocompactBuffer"
			label="Auto-compact Buffer"
			description="Token count threshold for auto-compact trigger (0 to disable)"
			:min="0"
			:step="1000"
		/>
	</div>
</template>
