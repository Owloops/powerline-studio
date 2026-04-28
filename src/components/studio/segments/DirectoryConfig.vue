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
		<p class="text-xs text-muted-foreground">
			In <span class="font-mono">--worktree</span> sessions the directory segment automatically
			renders the original repo path (from
			<span class="font-mono">hookData.worktree.original_cwd</span>) instead of the worktree folder
			— no config required. Set the mock value in Hook Data → Worktree Original CWD to preview the
			behavior.
		</p>
	</div>
</template>
