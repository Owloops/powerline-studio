<script setup lang="ts">
import FormSwitchField from '@/components/FormSwitchField.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { sessionIdConfigSchema } from './schemas'

const { values } = useSegmentForm('sessionId', sessionIdConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.sessionId
	return {
		showIdLabel: seg?.showIdLabel !== false,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="sessionId" />
		<FormSwitchField name="showIdLabel" label="Show ID Label" />
	</div>
</template>
