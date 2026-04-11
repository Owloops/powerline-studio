<script setup lang="ts">
import { useForm } from '@formwerk/core'
import FormSelectField from '@/components/FormSelectField.vue'
import BudgetConfig from './BudgetConfig.vue'
import { todayConfigSchema } from './schemas'
import { USAGE_TYPE_OPTIONS } from './options'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const segmentConfig = computed(() => {
	const seg = configStore.currentLineSegments.today
	return {
		type: seg?.type ?? SEGMENT_DEFAULTS.today.type,
	}
})

const { values } = useForm({
	schema: todayConfigSchema,
	initialValues: segmentConfig.value,
})

watch(
	values,
	(newValues) => {
		configStore.updateSegmentConfig(editorStore.activeLineIndex, 'today', newValues)
	},
	{ deep: true },
)
</script>

<template>
	<div class="space-y-3">
		<FormSelectField name="type" label="Display Type" :options="USAGE_TYPE_OPTIONS" />
		<BudgetConfig budget-key="today" />
	</div>
</template>
