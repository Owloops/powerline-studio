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
		<div class="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6">
			<PresetSection :step="1" />
			<StyleThemeSection :step="2" />

			<!-- Layout Editor -->
			<FlatLayoutEditor v-if="!configStore.isTuiStyle" :step="3" />
			<TuiLayoutEditor v-else :step="3" />

			<!-- Export & Mock Data -->
			<ExportSection :step="4" />
			<MockDataSettingsSection />
		</div>

		<!-- Footer -->
		<footer class="border-t border-border py-8">
			<div
				class="mx-auto flex max-w-4xl items-center justify-center gap-1 px-4 text-xs text-muted-foreground"
			>
				<span>Made with</span>
				<IconLucide-heart class="size-3 text-red-500" />
				<span>by</span>
				<a
					href="https://github.com/FallDownTheSystem"
					target="_blank"
					rel="noopener noreferrer"
					class="font-medium text-foreground hover:underline"
					>FallDownTheSystem</a
				>
			</div>
		</footer>
	</div>
</template>
