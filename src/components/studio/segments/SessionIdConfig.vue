<script setup lang="ts">
import { useForm } from '@formwerk/core'
import FormSwitchField from '@/components/FormSwitchField.vue'
import { sessionIdConfigSchema } from './schemas'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const segmentConfig = computed(() => {
	const seg = configStore.currentLineSegments.sessionId
	return {
		showIdLabel: seg?.showIdLabel !== false,
	}
})

const { values } = useForm({
	schema: sessionIdConfigSchema,
	initialValues: segmentConfig.value,
})

watch(
	values,
	(newValues) => {
		configStore.updateSegmentConfig(editorStore.activeLineIndex, 'sessionId', newValues)
	},
	{ deep: true },
)
</script>

<template>
	<div class="space-y-3">
		<FormSwitchField name="showIdLabel" label="Show ID Label" />
	</div>
</template>
