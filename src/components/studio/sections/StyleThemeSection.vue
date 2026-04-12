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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import {
	NumberField,
	NumberFieldContent,
	NumberFieldDecrement,
	NumberFieldIncrement,
	NumberFieldInput,
} from '@/components/ui/number-field'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import CustomThemeEditor from '@/components/studio/theme/CustomThemeEditor.vue'
import ThemeOverrides from '@/components/studio/theme/ThemeOverrides.vue'
import {
	CANONICAL_THEMES,
	CANONICAL_THEME_LABELS,
	PREVIEW_SEGMENTS,
	getCanonicalThemeColors,
} from '@/lib/themes'
import type { CanonicalTheme, SavedCustomTheme } from '@/lib/themes'

type StyleValue = 'minimal' | 'powerline' | 'capsule' | 'tui'

const configStore = useConfigStore()

const styles: readonly { value: StyleValue; title: string }[] = [
	{ value: 'minimal', title: 'Minimal' },
	{ value: 'powerline', title: 'Powerline' },
	{ value: 'capsule', title: 'Capsule' },
	{ value: 'tui', title: 'TUI' },
]

const segments = [
	{ label: '~/project', bg: '#3b82f6' },
	{ label: 'main \u2713', bg: '#22c55e' },
	{ label: '\u25C6 Sonnet', bg: '#a855f7' },
] as const

// --- Theme logic ---

const showConfirmDialog = ref(false)
const pendingSwitchTheme = ref<CanonicalTheme | null>(null)

function handleSelectTheme(value: string) {
	const theme = value as CanonicalTheme
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

// Theme select value: empty when in custom mode so no built-in appears selected
const themeSelectValue = computed(() => {
	if (configStore.themeEditor.mode === 'custom') return ''
	return configStore.themeEditor.builtinTheme
})

// Current effective theme colors for the trigger swatch (includes overrides for built-in themes)
const triggerThemeColors = computed(() => configStore.effectiveColors)
</script>

<template>
	<section class="flex flex-col gap-6">
		<!-- Section Header -->
		<div>
			<h2 class="text-sm font-semibold">Style & Theme</h2>
			<p class="text-xs text-muted-foreground">Choose display style and color scheme</p>
		</div>

		<!-- Display Style Select -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-2">
				<Label class="text-xs font-medium text-muted-foreground">Display Style</Label>
				<Select
					:model-value="configStore.config.display.style"
					@update:model-value="configStore.setStyle($event as StyleValue)"
				>
					<SelectTrigger class="w-full" size="sm">
						<span class="flex items-center gap-2">
							<span>{{
								styles.find((s) => s.value === configStore.config.display.style)?.title
							}}</span>
							<!-- Inline mini-preview for current style -->
							<span
								class="flex items-center overflow-hidden rounded bg-[#1e1e2e] px-1.5 py-0.5 font-nerd text-[9px] leading-tight"
							>
								<template v-if="configStore.config.display.style === 'minimal'">
									<span
										v-for="seg in segments"
										:key="seg.label"
										:style="{ background: seg.bg, color: '#fff' }"
										class="inline-block px-0.5"
										>{{ seg.label }}</span
									>
								</template>
								<template v-else-if="configStore.config.display.style === 'powerline'">
									<template v-for="(seg, i) in segments" :key="seg.label">
										<span
											:style="{ background: seg.bg, color: '#fff' }"
											class="inline-block px-0.5"
											>{{ seg.label }}</span
										>
										<span
											:style="{
												color: seg.bg,
												background: i < segments.length - 1 ? segments[i + 1].bg : 'transparent',
											}"
											class="inline-block"
											>&#xE0B0;</span
										>
									</template>
								</template>
								<template v-else-if="configStore.config.display.style === 'capsule'">
									<template v-for="(seg, i) in segments" :key="seg.label">
										<span :style="{ color: seg.bg }" class="inline-block">&#xE0B6;</span>
										<span
											:style="{ background: seg.bg, color: '#fff' }"
											class="inline-block px-0.5"
											>{{ seg.label }}</span
										>
										<span :style="{ color: seg.bg }" class="inline-block">&#xE0B4;</span>
										<span v-if="i < segments.length - 1" class="inline-block w-0.5" />
									</template>
								</template>
								<template v-else-if="configStore.config.display.style === 'tui'">
									<pre
										class="text-[#cdd6f4] leading-none"
										style="font-family: inherit"
									>&#x256D;&#x2500;&#x252C;&#x2500;&#x256E;
&#x2502;<span :style="{ color: '#3b82f6' }">~</span>&#x2502;<span :style="{ color: '#22c55e' }">m</span>&#x2502;
&#x2570;&#x2500;&#x2534;&#x2500;&#x256F;</pre>
								</template>
							</span>
						</span>
					</SelectTrigger>
					<SelectContent position="popper" side="bottom">
						<SelectItem v-for="s in styles" :key="s.value" :value="s.value">
							<div class="flex items-center gap-3">
								<span>{{ s.title }}</span>
								<!-- Mini-preview per option -->
								<span
									class="flex items-center overflow-hidden rounded bg-[#1e1e2e] px-1.5 py-0.5 font-nerd text-[9px] leading-tight"
								>
									<template v-if="s.value === 'minimal'">
										<span
											v-for="seg in segments"
											:key="seg.label"
											:style="{ background: seg.bg, color: '#fff' }"
											class="inline-block px-0.5"
											>{{ seg.label }}</span
										>
									</template>
									<template v-else-if="s.value === 'powerline'">
										<template v-for="(seg, i) in segments" :key="seg.label">
											<span
												:style="{ background: seg.bg, color: '#fff' }"
												class="inline-block px-0.5"
												>{{ seg.label }}</span
											>
											<span
												:style="{
													color: seg.bg,
													background: i < segments.length - 1 ? segments[i + 1].bg : 'transparent',
												}"
												class="inline-block"
												>&#xE0B0;</span
											>
										</template>
									</template>
									<template v-else-if="s.value === 'capsule'">
										<template v-for="(seg, i) in segments" :key="seg.label">
											<span :style="{ color: seg.bg }" class="inline-block">&#xE0B6;</span>
											<span
												:style="{ background: seg.bg, color: '#fff' }"
												class="inline-block px-0.5"
												>{{ seg.label }}</span
											>
											<span :style="{ color: seg.bg }" class="inline-block">&#xE0B4;</span>
											<span v-if="i < segments.length - 1" class="inline-block w-0.5" />
										</template>
									</template>
									<template v-else-if="s.value === 'tui'">
										<pre
											class="text-[#cdd6f4] leading-none"
											style="font-family: inherit"
										>&#x256D;&#x2500;&#x252C;&#x2500;&#x256E;
&#x2502;<span :style="{ color: '#3b82f6' }">~</span>&#x2502;<span :style="{ color: '#22c55e' }">m</span>&#x2502;
&#x2570;&#x2500;&#x2534;&#x2500;&#x256F;</pre>
									</template>
								</span>
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

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

			<!-- Theme Select -->
			<Select :model-value="themeSelectValue" @update:model-value="handleSelectTheme">
				<SelectTrigger class="w-full" size="sm">
					<span class="flex items-center gap-2">
						<!-- Theme name -->
						<span v-if="configStore.themeEditor.mode === 'custom'">Custom Theme</span>
						<span v-else>{{ CANONICAL_THEME_LABELS[configStore.themeEditor.builtinTheme] }}</span>
						<!-- Override indicator -->
						<span
							v-if="configStore.themeEditor.mode === 'builtin' && configStore.overrideCount > 0"
							class="rounded bg-muted px-1 py-0.5 text-[10px] leading-none text-muted-foreground"
							>modified</span
						>
						<!-- Compact 5-color palette strip -->
						<span class="flex gap-px overflow-hidden rounded">
							<span
								v-for="seg in PREVIEW_SEGMENTS"
								:key="seg"
								class="block size-3.5"
								:style="{ backgroundColor: triggerThemeColors[seg].bg }"
							/>
						</span>
					</span>
				</SelectTrigger>
				<SelectContent position="popper" side="bottom">
					<SelectItem v-for="name in CANONICAL_THEMES" :key="name" :value="name">
						<div class="flex items-center gap-3">
							<span>{{ CANONICAL_THEME_LABELS[name] }}</span>
							<span class="flex gap-px overflow-hidden rounded">
								<span
									v-for="seg in PREVIEW_SEGMENTS"
									:key="seg"
									class="block size-3.5"
									:style="{ backgroundColor: getCanonicalThemeColors(name)[seg].bg }"
								/>
							</span>
						</div>
					</SelectItem>
				</SelectContent>
			</Select>

			<!-- Saved custom themes -->
			<template v-if="configStore.savedCustomThemes.length > 0">
				<div class="flex items-center gap-2">
					<span class="text-xs font-medium text-muted-foreground">Saved Custom Themes</span>
					<div class="h-px flex-1 bg-border" />
				</div>
				<div class="flex flex-col gap-1">
					<div
						v-for="saved in configStore.savedCustomThemes"
						:key="saved.id"
						class="group flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/50"
					>
						<button
							class="flex flex-1 cursor-pointer items-center gap-2 text-left text-sm"
							@click="handleLoadSaved(saved)"
						>
							<span class="flex gap-px overflow-hidden rounded">
								<span
									v-for="seg in PREVIEW_SEGMENTS"
									:key="seg"
									class="block size-3"
									:style="{ backgroundColor: saved.colors[seg].bg }"
								/>
							</span>
							<span>{{ saved.name }}</span>
						</button>
						<button
							class="flex size-5 cursor-pointer items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
							:aria-label="`Delete ${saved.name}`"
							@click.stop="handleDeleteSaved(saved.id)"
						>
							<IconLucide-x class="size-3" />
						</button>
					</div>
				</div>
			</template>

			<!-- Theme editor buttons -->
			<div class="flex gap-2">
				<Button
					v-if="configStore.themeEditor.mode === 'builtin'"
					variant="outline"
					size="sm"
					class="flex-1"
					@click="handleEnterCustom"
				>
					<IconLucide-palette class="size-3.5" />
					Create Custom Theme
				</Button>
				<Button
					v-if="configStore.themeEditor.mode === 'custom'"
					variant="outline"
					size="sm"
					class="flex-1 border-primary bg-primary/5 text-primary"
					disabled
				>
					<IconLucide-palette class="size-3.5" />
					Editing Custom Theme
				</Button>
			</div>
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
