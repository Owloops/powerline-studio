<script setup lang="ts">
import FormSwitchField from '@/components/FormSwitchField.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { thinkingConfigSchema } from './schemas'

const { values } = useSegmentForm('thinking', thinkingConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.thinking
	return {
		showEnabled: seg?.showEnabled !== false,
		showEffort: seg?.showEffort !== false,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="thinking" />
		<FormSwitchField name="showEnabled" label="Show enabled state" />
		<FormSwitchField name="showEffort" label="Show effort level" />
	</div>
</template>
