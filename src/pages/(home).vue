<script setup lang="ts">
import type { Component } from 'vue'
import type { StudioPanel } from '@/types/studio'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import StudioTopBar from '@/components/studio/StudioTopBar.vue'
import StudioSidebar from '@/components/studio/StudioSidebar.vue'
import TerminalPreview from '@/components/studio/TerminalPreview.vue'
import PreviewControls from '@/components/studio/PreviewControls.vue'
import ThemePanel from '@/components/studio/panels/ThemePanel.vue'
import StylePanel from '@/components/studio/panels/StylePanel.vue'
import SegmentsPanel from '@/components/studio/panels/SegmentsPanel.vue'
import TuiLayoutPanel from '@/components/studio/panels/TuiLayoutPanel.vue'
import MockDataPanel from '@/components/studio/panels/MockDataPanel.vue'
import ExportPanel from '@/components/studio/panels/ExportPanel.vue'

useHead({ title: 'Powerline Studio' })

// Activate the rendering pipeline — watches config/mock/preview stores and
// writes htmlOutput to previewStore reactively.
useRenderer()

const editorStore = useEditorStore()
const activePanel = ref<StudioPanel>(editorStore.activePanel)

// Sync local panel with editor store (for hitbox → segments panel navigation)
watch(
	() => editorStore.activePanel,
	(panel) => {
		activePanel.value = panel
	},
)

watch(activePanel, (panel) => {
	editorStore.setActivePanel(panel)
})

const panelComponents: Record<StudioPanel, Component> = {
	theme: ThemePanel,
	style: StylePanel,
	segments: SegmentsPanel,
	tui: TuiLayoutPanel,
	mockData: MockDataPanel,
	export: ExportPanel,
}
</script>

<template>
	<SidebarProvider>
		<StudioSidebar v-model:active-panel="activePanel" />
		<SidebarInset class="flex flex-col overflow-hidden">
			<StudioTopBar />

			<!-- Terminal Preview -->
			<div class="shrink-0 border-b border-border">
				<div class="px-4 py-6">
					<TerminalPreview />
				</div>
				<PreviewControls />
			</div>

			<!-- Config Panel -->
			<div class="min-h-0 flex-1 overflow-y-auto">
				<component :is="panelComponents[activePanel]" />
			</div>
		</SidebarInset>
	</SidebarProvider>
</template>
