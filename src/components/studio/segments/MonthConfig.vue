<script setup lang="ts">
import FormSelectField from '@/components/FormSelectField.vue'
import FormSwitchField from '@/components/FormSwitchField.vue'
import BudgetConfig from './BudgetConfig.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { monthConfigSchema } from './schemas'
import { USAGE_TYPE_OPTIONS } from './options'
import { SEGMENT_DEFAULTS } from '@/stores/config'

useSegmentForm('month', monthConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.month
	return {
		type: seg?.type ?? SEGMENT_DEFAULTS.month.type,
		showUnits: seg?.showUnits !== false,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="month" />
		<FormSelectField name="type" label="Display Type" :options="USAGE_TYPE_OPTIONS" />
		<FormSwitchField name="showUnits" label='Show "tokens" suffix' />
		<BudgetConfig budget-key="month" />
	</div>
</template>
