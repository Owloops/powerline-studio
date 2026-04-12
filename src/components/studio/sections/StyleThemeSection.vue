<script setup lang="ts">
import type { ColorTheme } from '@owloops/claude-powerline/browser'
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import {
	NumberField,
	NumberFieldContent,
	NumberFieldDecrement,
	NumberFieldIncrement,
	NumberFieldInput,
} from '@/components/ui/number-field'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import StyleCard from '@/components/studio/StyleCard.vue'
import ThemeGrid from '@/components/studio/theme/ThemeGrid.vue'
import CustomThemeEditor from '@/components/studio/theme/CustomThemeEditor.vue'
import ThemeOverrides from '@/components/studio/theme/ThemeOverrides.vue'
import { getCanonicalThemeColors } from '@/lib/themes'
import type { CanonicalTheme, SavedCustomTheme } from '@/lib/themes'

type StyleValue = 'minimal' | 'powerline' | 'capsule' | 'tui'

const configStore = useConfigStore()

const styles: readonly { value: StyleValue; title: string; description: string }[] = [
	{
		value: 'minimal',
		title: 'Minimal',
		description: 'Clean, no separators',
	},
	{
		value: 'powerline',
		title: 'Powerline',
		description: 'Classic arrow separators',
	},
	{
		value: 'capsule',
		title: 'Capsule',
		description: 'Rounded pill segments',
	},
	{
		value: 'tui',
		title: 'TUI',
		description: 'Box-drawn grid panels',
	},
]

// --- Theme logic ---

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

function handleSaveCustomTheme(name: string) {
	configStore.saveCustomTheme(name)
}

function handleLoadSaved(saved: SavedCustomTheme) {
	configStore.loadSavedCustomTheme(saved)
}

function handleDeleteSaved(id: string) {
	configStore.deleteCustomTheme(id)
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
	<section class="flex flex-col gap-6">
		<!-- Section Header -->
		<div>
			<h2 class="text-sm font-semibold">Style & Theme</h2>
			<p class="text-xs text-muted-foreground">Choose display style and color scheme</p>
		</div>

		<!-- Display Style -->
		<div class="flex flex-col gap-3">
			<RadioGroupRoot
				:model-value="configStore.config.display.style"
				class="grid grid-cols-4 gap-3"
				@update:model-value="configStore.setStyle($event as StyleValue)"
			>
				<RadioGroupItem v-for="s in styles" :key="s.value" :value="s.value" as-child>
					<StyleCard v-bind="s" />
				</RadioGroupItem>
			</RadioGroupRoot>

			<!-- TUI Info Alert -->
			<Alert v-if="configStore.isTuiStyle" variant="info">
				<IconLucide-info class="size-4" />
				<AlertTitle>TUI Layout</AlertTitle>
				<AlertDescription>
					TUI style uses a grid layout. Configure breakpoints, columns, and box styles in the layout
					editor below.
				</AlertDescription>
			</Alert>

			<!-- Padding & Auto-wrap for non-TUI styles -->
			<div v-if="!configStore.isTuiStyle" class="grid grid-cols-2 gap-4">
				<!-- Padding Stepper -->
				<div class="flex flex-col gap-1.5">
					<NumberField
						id="padding"
						:model-value="configStore.config.display.padding"
						:min="0"
						:max="3"
						:step="1"
						class="max-w-[140px]"
						@update:model-value="configStore.setPadding($event ?? 0)"
					>
						<Label for="padding">Padding</Label>
						<NumberFieldContent>
							<NumberFieldDecrement />
							<NumberFieldInput />
							<NumberFieldIncrement />
						</NumberFieldContent>
					</NumberField>
					<p class="text-xs text-muted-foreground">Spaces inside each segment</p>
				</div>

				<!-- Auto-Wrap Toggle -->
				<div class="flex flex-col gap-3">
					<Label for="auto-wrap">Auto-wrap</Label>
					<div class="flex items-center gap-3">
						<Switch
							id="auto-wrap"
							:model-value="configStore.config.display.autoWrap ?? true"
							@update:model-value="configStore.setAutoWrap($event)"
						/>
						<p class="text-xs text-muted-foreground">Wrap when exceeding width</p>
					</div>
				</div>
			</div>
		</div>

		<Separator />

		<!-- Theme -->
		<div class="flex flex-col gap-3">
			<div>
				<h3 class="text-sm font-medium">Theme</h3>
				<p class="text-xs text-muted-foreground">Choose your statusline color scheme</p>
			</div>

			<ThemeGrid
				:selected-theme="configStore.themeEditor.builtinTheme"
				:mode="configStore.themeEditor.mode"
				:saved-custom-themes="configStore.savedCustomThemes"
				@select:theme="handleSelectTheme"
				@enter:custom="handleEnterCustom"
				@load:saved="handleLoadSaved"
				@delete:saved="handleDeleteSaved"
			/>
		</div>

		<!-- Custom Theme Editor -->
		<CustomThemeEditor
			v-if="configStore.themeEditor.mode === 'custom' && configStore.themeEditor.customDraft"
			:colors="configStore.themeEditor.customDraft"
			@update:colors="handleUpdateCustomColors"
			@save:theme="handleSaveCustomTheme"
		/>

		<!-- Theme Overrides for built-in themes -->
		<ThemeOverrides
			v-if="configStore.themeEditor.mode === 'builtin'"
			:base-theme="baseThemeColors"
			:overrides="configStore.themeEditor.overrides"
			@update:overrides="handleUpdateOverrides"
			@reset:segment="handleResetSegment"
		/>

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
	</section>
</template>
