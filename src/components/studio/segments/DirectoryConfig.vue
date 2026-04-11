<script setup lang="ts">
import { useForm } from '@formwerk/core'
import FormSelectField from '@/components/FormSelectField.vue'
import { directoryConfigSchema } from './schemas'
import { DIRECTORY_STYLE_OPTIONS } from './options'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const segmentConfig = computed(() => {
	const seg = configStore.currentLineSegments.directory
	return {
		style: seg?.style ?? SEGMENT_DEFAULTS.directory.style,
	}
})

const { values } = useForm({
	schema: directoryConfigSchema,
	initialValues: segmentConfig.value,
})

watch(
	values,
	(newValues) => {
		configStore.updateSegmentConfig(editorStore.activeLineIndex, 'directory', newValues)
	},
	{ deep: true },
)
</script>

<template>
	<div class="space-y-3">
		<FormSelectField name="style" label="Directory Style" :options="DIRECTORY_STYLE_OPTIONS" />
	</div>
</template>
