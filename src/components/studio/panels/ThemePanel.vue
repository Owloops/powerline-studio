<script setup lang="ts">
import type { ColorTheme } from '@owloops/claude-powerline/browser'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import ThemeGrid from '@/components/studio/theme/ThemeGrid.vue'
import CustomThemeEditor from '@/components/studio/theme/CustomThemeEditor.vue'
import ThemeOverrides from '@/components/studio/theme/ThemeOverrides.vue'
import { getCanonicalThemeColors } from '@/lib/themes'
import type { CanonicalTheme } from '@/lib/themes'

const configStore = useConfigStore()

const showConfirmDialog = ref(false)
const pendingSwitchTheme = ref<CanonicalTheme | null>(null)

function handleSelectTheme(theme: CanonicalTheme) {
	if (configStore.themeEditor.mode === 'custom' && configStore.hasModifiedCustomDraft) {
		pendingSwitchTheme.value = theme
		showConfirmDialog.value = true
		return
	}
	if (configStore.themeEditor.mode === 'custom') {
		configStore.confirmSwitchToBuiltIn(theme)
	} else {
		configStore.selectBuiltInTheme(theme)
	}
}

function handleConfirmSwitch() {
	if (pendingSwitchTheme.value) {
		configStore.confirmSwitchToBuiltIn(pendingSwitchTheme.value)
	}
	pendingSwitchTheme.value = null
	showConfirmDialog.value = false
}

function handleCancelSwitch() {
	pendingSwitchTheme.value = null
	showConfirmDialog.value = false
}

function handleEnterCustom() {
	configStore.enterCustomTheme()
}

function handleUpdateCustomColors(colors: ColorTheme) {
	for (const key of Object.keys(colors) as (keyof ColorTheme)[]) {
		configStore.updateCustomColor(key, colors[key])
	}
}

function handleUpdateOverrides(overrides: Partial<ColorTheme>) {
	for (const key of Object.keys(overrides) as (keyof ColorTheme)[]) {
		const override = overrides[key]
		if (override) {
			configStore.setColorOverride(key, override)
		}
	}
}

function handleResetSegment(key: keyof ColorTheme) {
	configStore.resetSegmentOverride(key)
}

const baseThemeColors = computed(() =>
	getCanonicalThemeColors(configStore.themeEditor.builtinTheme),
)
</script>

<template>
	<ScrollArea class="h-full">
		<div class="flex flex-col gap-6 p-4">
			<div>
				<h2 class="text-sm font-medium">Theme</h2>
				<p class="text-xs text-muted-foreground">Choose your statusline color scheme</p>
			</div>

			<ThemeGrid
				:selected-theme="configStore.themeEditor.builtinTheme"
				:mode="configStore.themeEditor.mode"
				@select:theme="handleSelectTheme"
				@enter:custom="handleEnterCustom"
			/>

			<CustomThemeEditor
				v-if="configStore.themeEditor.mode === 'custom' && configStore.themeEditor.customDraft"
				:colors="configStore.themeEditor.customDraft"
				@update:colors="handleUpdateCustomColors"
			/>

			<ThemeOverrides
				v-if="configStore.themeEditor.mode === 'builtin'"
				:base-theme="baseThemeColors"
				:overrides="configStore.themeEditor.overrides"
				@update:overrides="handleUpdateOverrides"
				@reset:segment="handleResetSegment"
			/>
		</div>

		<!-- Confirmation Dialog -->
		<AlertDialog :open="showConfirmDialog">
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Discard custom theme?</AlertDialogTitle>
					<AlertDialogDescription>
						You have unsaved changes to your custom theme. Switching to a built-in theme will
						discard these changes.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel @click="handleCancelSwitch">Cancel</AlertDialogCancel>
					<AlertDialogAction @click="handleConfirmSwitch"> Discard & Switch </AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	</ScrollArea>
</template>
