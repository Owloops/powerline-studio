<script setup lang="ts">
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import StudioHeader from '@/components/studio/StudioHeader.vue'
import TerminalPreview from '@/components/studio/TerminalPreview.vue'
import PreviewControls from '@/components/studio/PreviewControls.vue'
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
const editorStore = useEditorStore()
</script>

<template>
	<div class="flex h-full flex-col">
		<StudioHeader />

		<!-- Scrollable content -->
		<div class="flex-1 overflow-y-auto">
			<!-- Terminal Preview -->
			<div class="shrink-0 border-b border-border">
				<div class="overflow-x-auto px-4 py-6">
					<TerminalPreview class="mx-auto" />
				</div>

				<!-- Collapsible Preview Controls -->
				<Collapsible :open="editorStore.showPreviewControls">
					<CollapsibleContent>
						<PreviewControls />
					</CollapsibleContent>
				</Collapsible>
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
	</div>
</template>
