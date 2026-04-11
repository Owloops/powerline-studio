<script setup lang="ts">
import { useForm } from '@formwerk/core'
import FormSelectField from '@/components/FormSelectField.vue'
import { weeklyConfigSchema } from './schemas'
import { BAR_DISPLAY_STYLE_OPTIONS } from './options'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const segmentConfig = computed(() => {
	const seg = configStore.currentLineSegments.weekly
	return {
		displayStyle: seg?.displayStyle ?? SEGMENT_DEFAULTS.weekly.displayStyle,
	}
})

const { values } = useForm({
	schema: weeklyConfigSchema,
	initialValues: segmentConfig.value,
})

watch(
	values,
	(newValues) => {
		configStore.updateSegmentConfig(editorStore.activeLineIndex, 'weekly', newValues)
	},
	{ deep: true },
)
</script>

<template>
	<div class="space-y-3">
		<FormSelectField
			name="displayStyle"
			label="Display Style"
			:options="BAR_DISPLAY_STYLE_OPTIONS"
		/>
	</div>
</template>
