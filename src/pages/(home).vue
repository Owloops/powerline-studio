<script setup lang="ts">
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import StudioHeader from '@/components/studio/StudioHeader.vue'
import TerminalPreview from '@/components/studio/TerminalPreview.vue'
import PreviewControls from '@/components/studio/PreviewControls.vue'
import PresetSection from '@/components/studio/sections/PresetSection.vue'
import StyleThemeSection from '@/components/studio/sections/StyleThemeSection.vue'

useHead({ title: 'Powerline Studio' })

// Activate the rendering pipeline — watches config/mock/preview stores and
// writes htmlOutput to previewStore reactively.
useRenderer()

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

				<!-- Layout Editor Slot (task-023b/023c) -->
				<section class="flex flex-col gap-4">
					<div>
						<h2 class="text-sm font-semibold">Layout Editor</h2>
						<p class="text-xs text-muted-foreground">
							Configure segments and layout (coming in next update)
						</p>
					</div>
					<div
						class="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground"
					>
						Layout editor placeholder
					</div>
				</section>

				<!-- Export & Mock Data Slot (task-023e) -->
				<section class="flex flex-col gap-4">
					<div>
						<h2 class="text-sm font-semibold">Export & Mock Data</h2>
						<p class="text-xs text-muted-foreground">
							Export config and adjust mock data (coming in next update)
						</p>
					</div>
					<div
						class="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground"
					>
						Export & mock data placeholder
					</div>
				</section>
			</div>
		</div>
	</div>
</template>
