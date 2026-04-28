<script setup lang="ts">
import FormSwitchField from '@/components/FormSwitchField.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { agentConfigSchema } from './schemas'

const { values } = useSegmentForm('agent', agentConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.agent
	return {
		showLabel: seg?.showLabel ?? false,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="agent" />
		<div class="flex flex-col gap-1.5">
			<FormSwitchField name="showLabel" label='Show "agent:" label' />
			<p class="text-sm text-muted-foreground">
				Prefix the name with 'agent:' (e.g., '◇ agent: researcher')
			</p>
		</div>
	</div>
</template>
