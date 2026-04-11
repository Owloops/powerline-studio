<script setup lang="ts">
import { useForm } from '@formwerk/core'
import FormSwitchField from '@/components/FormSwitchField.vue'
import { metricsConfigSchema } from './schemas'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const segmentConfig = computed(() => {
	const seg = configStore.currentLineSegments.metrics
	return {
		showResponseTime: seg?.showResponseTime !== false,
		showLastResponseTime: seg?.showLastResponseTime ?? false,
		showDuration: seg?.showDuration !== false,
		showMessageCount: seg?.showMessageCount !== false,
		showLinesAdded: seg?.showLinesAdded !== false,
		showLinesRemoved: seg?.showLinesRemoved !== false,
	}
})

const { values } = useForm({
	schema: metricsConfigSchema,
	initialValues: segmentConfig.value,
})

watch(
	values,
	(newValues) => {
		configStore.updateSegmentConfig(editorStore.activeLineIndex, 'metrics', newValues)
	},
	{ deep: true },
)
</script>

<template>
	<div class="grid grid-cols-2 gap-x-4 gap-y-2">
		<FormSwitchField name="showResponseTime" label="Response Time" />
		<FormSwitchField name="showLastResponseTime" label="Last Response Time" />
		<FormSwitchField name="showDuration" label="Duration" />
		<FormSwitchField name="showMessageCount" label="Message Count" />
		<FormSwitchField name="showLinesAdded" label="Lines Added" />
		<FormSwitchField name="showLinesRemoved" label="Lines Removed" />
	</div>
</template>
