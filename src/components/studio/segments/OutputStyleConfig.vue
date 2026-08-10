<script setup lang="ts">
import FormSwitchField from '@/components/FormSwitchField.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { outputStyleConfigSchema } from './schemas'

useSegmentForm('outputStyle', outputStyleConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.outputStyle
	return {
		showLabel: seg?.showLabel ?? false,
		hideDefault: seg?.hideDefault ?? false,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="outputStyle" />
		<FormSwitchField name="showLabel" label='Show "style:" label' />
		<FormSwitchField name="hideDefault" label="Hide when style is default" />
	</div>
</template>
