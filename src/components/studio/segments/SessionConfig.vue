<script setup lang="ts">
import { useForm } from '@formwerk/core'
import FormSelectField from '@/components/FormSelectField.vue'
import BudgetConfig from './BudgetConfig.vue'
import { sessionConfigSchema } from './schemas'
import { USAGE_TYPE_OPTIONS, COST_SOURCE_OPTIONS } from './options'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const segmentConfig = computed(() => {
	const seg = configStore.currentLineSegments.session
	return {
		type: seg?.type ?? SEGMENT_DEFAULTS.session.type,
		costSource: seg?.costSource ?? SEGMENT_DEFAULTS.session.costSource,
	}
})

const { values } = useForm({
	schema: sessionConfigSchema,
	initialValues: segmentConfig.value,
})

watch(
	values,
	(newValues) => {
		configStore.updateSegmentConfig(editorStore.activeLineIndex, 'session', newValues)
	},
	{ deep: true },
)
</script>

<template>
	<div class="space-y-3">
		<FormSelectField name="type" label="Display Type" :options="USAGE_TYPE_OPTIONS" />
		<FormSelectField name="costSource" label="Cost Source" :options="COST_SOURCE_OPTIONS" />
		<BudgetConfig budget-key="session" />
	</div>
</template>
