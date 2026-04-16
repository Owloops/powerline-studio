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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import StyleCard from '@/components/studio/StyleCard.vue'
import ThemeGrid from '@/components/studio/theme/ThemeGrid.vue'
import CustomThemeEditor from '@/components/studio/theme/CustomThemeEditor.vue'
import ThemeOverrides from '@/components/studio/theme/ThemeOverrides.vue'
import { getCanonicalThemeColors } from '@/lib/themes'
import type { CanonicalTheme, SavedCustomTheme } from '@/lib/themes'

type StyleValue = 'minimal' | 'powerline' | 'capsule' | 'tui'

const configStore = useConfigStore()
const editorStore = useEditorStore()

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
		title: 'Terminal UI',
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
	<ScrollArea class="h-full">
		<div class="flex flex-col gap-6 p-4">
			<!-- Display Style Section -->
			<section class="flex flex-col gap-3">
				<div>
					<h2 class="text-sm font-medium">Display Style</h2>
					<p class="text-xs text-muted-foreground">Choose how your statusline looks</p>
				</div>

				<RadioGroupRoot
					:model-value="configStore.config.display.style"
					class="flex flex-wrap gap-3"
					@update:model-value="configStore.setStyle($event as StyleValue)"
				>
					<RadioGroupItem v-for="s in styles" :key="s.value" :value="s.value" as-child>
						<StyleCard v-bind="s" class="min-w-[120px] flex-1" />
					</RadioGroupItem>
				</RadioGroupRoot>

				<!-- TUI Info Alert -->
				<Alert v-if="configStore.isTuiStyle" variant="info">
					<IconLucide-info class="size-4" />
					<AlertTitle>Terminal UI Layout</AlertTitle>
					<AlertDescription>
						TUI style uses a grid layout. Configure breakpoints, columns, and box styles in the
						<button
							class="inline font-medium underline underline-offset-3 hover:text-foreground"
							@click="editorStore.setActivePanel('tui')"
						>
							TUI Layout panel</button
						>.
					</AlertDescription>
				</Alert>

				<!-- Padding & Auto-wrap for non-TUI styles -->
				<template v-if="!configStore.isTuiStyle">
					<div class="grid grid-cols-2 gap-4">
						<!-- Padding Stepper -->
						<div class="flex flex-col gap-1.5 max-w-[140px]">
							<NumberField
								id="padding"
								:model-value="configStore.config.display.padding"
								:min="0"
								:max="3"
								:step="1"
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
				</template>
			</section>

			<Separator />

			<!-- Theme Section -->
			<section class="flex flex-col gap-3">
				<div>
					<h2 class="text-sm font-medium">Theme</h2>
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
			</section>

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
