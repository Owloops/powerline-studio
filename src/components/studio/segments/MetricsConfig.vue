<script setup lang="ts">
import FormSwitchField from '@/components/FormSwitchField.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { metricsConfigSchema } from './schemas'

const { values } = useSegmentForm('metrics', metricsConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.metrics
	return {
		showResponseTime: seg?.showResponseTime !== false,
		showLastResponseTime: seg?.showLastResponseTime ?? false,
		showDuration: seg?.showDuration !== false,
		showMessageCount: seg?.showMessageCount !== false,
		showLinesAdded: seg?.showLinesAdded !== false,
		showLinesRemoved: seg?.showLinesRemoved !== false,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow
			segment-name="metrics"
			disabled
			disabled-tooltip="Metrics sub-icons (+12 / -4) carry semantic meaning. This toggle is accepted by the config but has no effect."
		/>
		<div class="grid grid-cols-2 gap-x-4 gap-y-2">
			<FormSwitchField name="showResponseTime" label="Response Time" />
			<FormSwitchField name="showLastResponseTime" label="Last Response Time" />
			<FormSwitchField name="showDuration" label="Duration" />
			<FormSwitchField name="showMessageCount" label="Message Count" />
			<FormSwitchField name="showLinesAdded" label="Lines Added" />
			<FormSwitchField name="showLinesRemoved" label="Lines Removed" />
		</div>
	</div>
</template>
