<script setup lang="ts">
import FormSwitchField from '@/components/FormSwitchField.vue'
import FormShowIconRow from './FormShowIconRow.vue'
import { gitConfigSchema } from './schemas'

const { values } = useSegmentForm('git', gitConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.git
	return {
		showSha: seg?.showSha ?? false,
		showAheadBehind: seg?.showAheadBehind !== false,
		showWorkingTree: seg?.showWorkingTree ?? false,
		showOperation: seg?.showOperation ?? false,
		showTag: seg?.showTag ?? false,
		showTimeSinceCommit: seg?.showTimeSinceCommit ?? false,
		showStashCount: seg?.showStashCount ?? false,
		showUpstream: seg?.showUpstream ?? false,
		showRepoName: seg?.showRepoName ?? false,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="git" />
		<div class="grid grid-cols-2 gap-x-4 gap-y-2">
			<FormSwitchField name="showAheadBehind" label="Ahead/Behind" />
			<FormSwitchField name="showWorkingTree" label="Working Tree" />
			<FormSwitchField name="showSha" label="SHA" />
			<FormSwitchField name="showOperation" label="Operation" />
			<FormSwitchField name="showTag" label="Tag" />
			<FormSwitchField name="showTimeSinceCommit" label="Time Since Commit" />
			<FormSwitchField name="showStashCount" label="Stash Count" />
			<FormSwitchField name="showUpstream" label="Upstream" />
			<FormSwitchField name="showRepoName" label="Repo Name" />
		</div>
	</div>
</template>
