<script setup lang="ts">
import { useForm } from '@formwerk/core'
import { refDebounced } from '@vueuse/core'
import FormTextField from '@/components/FormTextField.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { envConfigSchema } from './schemas'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const segmentConfig = computed(() => {
	const seg = configStore.currentLineSegments.env
	return {
		variable: seg?.variable ?? SEGMENT_DEFAULTS.env.variable,
		prefix: ((seg as Record<string, unknown>)?.prefix as string | undefined) ?? '',
	}
})

const { values } = useForm({
	schema: envConfigSchema,
	initialValues: segmentConfig.value,
})

const debouncedValues = refDebounced(values, 300)

watch(
	debouncedValues,
	(newValues) => {
		configStore.updateSegmentConfig(editorStore.activeLineIndex, 'env', newValues)
	},
	{ deep: true },
)
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="env" />
		<FormTextField
			name="variable"
			label="Variable"
			required
			description="Name of the environment variable to display"
		/>
		<FormTextField
			name="prefix"
			label="Prefix"
			description="Optional display prefix shown before the value"
		/>
	</div>
</template>
