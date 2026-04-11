<script setup lang="ts">
import type { Component } from 'vue'
import type { StudioPanel } from '@/types/studio'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import StudioTopBar from '@/components/studio/StudioTopBar.vue'
import StudioSidebar from '@/components/studio/StudioSidebar.vue'
import ThemePanel from '@/components/studio/panels/ThemePanel.vue'
import StylePanel from '@/components/studio/panels/StylePanel.vue'
import SegmentsPanel from '@/components/studio/panels/SegmentsPanel.vue'
import TuiLayoutPanel from '@/components/studio/panels/TuiLayoutPanel.vue'
import MockDataPanel from '@/components/studio/panels/MockDataPanel.vue'
import ExportPanel from '@/components/studio/panels/ExportPanel.vue'

definePage({
	meta: { layout: 'studio' },
})

useHead({ title: 'Powerline Studio' })

const activePanel = ref<StudioPanel>('theme')

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

			<!-- Terminal Preview Region -->
			<div
				class="flex min-h-[120px] shrink-0 items-center justify-center border-b border-border bg-card px-4 py-6 font-nerd text-card-foreground"
			>
				<span class="text-sm text-muted-foreground">
					Terminal preview &mdash; usr ~/project main
				</span>
			</div>

			<!-- Config Panel -->
			<div class="min-h-0 flex-1 overflow-y-auto">
				<component :is="panelComponents[activePanel]" />
			</div>
		</SidebarInset>
	</SidebarProvider>
</template>
