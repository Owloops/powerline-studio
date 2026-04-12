<script setup lang="ts">
import StudioHeader from '@/components/studio/StudioHeader.vue'
import TerminalPreview from '@/components/studio/TerminalPreview.vue'
import PresetSection from '@/components/studio/sections/PresetSection.vue'
import StyleThemeSection from '@/components/studio/sections/StyleThemeSection.vue'
import FlatLayoutEditor from '@/components/studio/editor/FlatLayoutEditor.vue'
import TuiLayoutEditor from '@/components/studio/editor/TuiLayoutEditor.vue'
import ExportSection from '@/components/studio/sections/ExportSection.vue'
import MockDataSettingsSection from '@/components/studio/sections/MockDataSettingsSection.vue'

useHead({ title: 'Powerline Studio' })

// Activate the rendering pipeline — watches config/mock/preview stores and
// writes htmlOutput to previewStore reactively.
useRenderer()

const configStore = useConfigStore()
</script>

<template>
	<div class="flex flex-col">
		<StudioHeader />

		<!-- Terminal Preview — sticky after header scrolls away -->
		<div class="sticky top-0 z-30 border-b border-border bg-background px-4 py-3">
			<TerminalPreview class="mx-auto" />
		</div>

		<!-- Section Flow -->
		<div class="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-6">
			<PresetSection />
			<StyleThemeSection />

			<!-- Layout Editor -->
			<FlatLayoutEditor v-if="!configStore.isTuiStyle" />
			<TuiLayoutEditor v-else />

			<!-- Export & Mock Data -->
			<ExportSection />
			<MockDataSettingsSection />
		</div>
	</div>
</template>
