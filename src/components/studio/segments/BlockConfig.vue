<script setup lang="ts">
import { useForm } from '@formwerk/core'
import FormSelectField from '@/components/FormSelectField.vue'
import BudgetConfig from './BudgetConfig.vue'
import { blockConfigSchema } from './schemas'
import { BLOCK_TYPE_OPTIONS, BURN_TYPE_OPTIONS, BAR_DISPLAY_STYLE_OPTIONS } from './options'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const segmentConfig = computed(() => {
	const seg = configStore.currentLineSegments.block
	return {
		type: seg?.type ?? SEGMENT_DEFAULTS.block.type,
		burnType: seg?.burnType ?? SEGMENT_DEFAULTS.block.burnType,
		displayStyle: seg?.displayStyle ?? SEGMENT_DEFAULTS.block.displayStyle,
	}
})

const { values } = useForm({
	schema: blockConfigSchema,
	initialValues: segmentConfig.value,
})

watch(
	values,
	(newValues) => {
		configStore.updateSegmentConfig(editorStore.activeLineIndex, 'block', newValues)
	},
	{ deep: true },
)
</script>

<template>
	<div class="space-y-3">
		<FormSelectField name="type" label="Display Type" :options="BLOCK_TYPE_OPTIONS" />
		<FormSelectField name="burnType" label="Burn Type" :options="BURN_TYPE_OPTIONS" />
		<FormSelectField
			name="displayStyle"
			label="Display Style"
			:options="BAR_DISPLAY_STYLE_OPTIONS"
		/>
		<BudgetConfig budget-key="block" />
	</div>
</template>
