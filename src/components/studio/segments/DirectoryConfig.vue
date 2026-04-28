<script setup lang="ts">
import FormSelectField from '@/components/FormSelectField.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { directoryConfigSchema } from './schemas'
import { DIRECTORY_STYLE_OPTIONS } from './options'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const { values } = useSegmentForm('directory', directoryConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.directory
	return {
		style: seg?.style ?? SEGMENT_DEFAULTS.directory.style,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="directory" />
		<FormSelectField name="style" label="Directory Style" :options="DIRECTORY_STYLE_OPTIONS" />
	</div>
</template>
