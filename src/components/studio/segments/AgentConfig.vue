<script setup lang="ts">
import FormSwitchField from '@/components/FormSwitchField.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { agentConfigSchema } from './schemas'

const { values } = useSegmentForm('agent', agentConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.agent
	return {
		showLabel: seg?.showLabel ?? false,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="agent" />
		<FormSwitchField name="showLabel" label='Show "agent:" label' />
	</div>
</template>
