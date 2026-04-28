<script setup lang="ts">
import FormSelectField from '@/components/FormSelectField.vue'
import BudgetConfig from './BudgetConfig.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { todayConfigSchema } from './schemas'
import { USAGE_TYPE_OPTIONS } from './options'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const { values } = useSegmentForm('today', todayConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.today
	return {
		type: seg?.type ?? SEGMENT_DEFAULTS.today.type,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="today" />
		<FormSelectField name="type" label="Display Type" :options="USAGE_TYPE_OPTIONS" />
		<BudgetConfig budget-key="today" />
	</div>
</template>
