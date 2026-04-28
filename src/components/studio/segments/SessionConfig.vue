<script setup lang="ts">
import FormSelectField from '@/components/FormSelectField.vue'
import BudgetConfig from './BudgetConfig.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { sessionConfigSchema } from './schemas'
import { USAGE_TYPE_OPTIONS, COST_SOURCE_OPTIONS } from './options'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const { values } = useSegmentForm('session', sessionConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.session
	return {
		type: seg?.type ?? SEGMENT_DEFAULTS.session.type,
		costSource: seg?.costSource ?? SEGMENT_DEFAULTS.session.costSource,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="session" />
		<FormSelectField name="type" label="Display Type" :options="USAGE_TYPE_OPTIONS" />
		<FormSelectField name="costSource" label="Cost Source" :options="COST_SOURCE_OPTIONS" />
		<BudgetConfig budget-key="session" />
	</div>
</template>
