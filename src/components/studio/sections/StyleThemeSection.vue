<script setup lang="ts">
import type { ColorTheme, BoxChars } from '@owloops/claude-powerline/browser'
import { BOX_PRESETS, BOX_CHARS } from '@owloops/claude-powerline/browser'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	NumberField,
	NumberFieldContent,
	NumberFieldDecrement,
	NumberFieldIncrement,
	NumberFieldInput,
} from '@/components/ui/number-field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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

// --- TUI options ---

const tui = computed(() => configStore.config.display.tui)
const tuiFitContent = computed(() => tui.value?.fitContent ?? false)
const tuiPadding = computed(() => tui.value?.padding?.horizontal)
const tuiSeparator = computed(() => tui.value?.separator)
const tuiCurrentBox = computed(() => tui.value?.box)

const boxPresets = computed(() => {
	const entries: { name: string; label: string; chars: BoxChars }[] = []
	for (const [name, chars] of Object.entries(BOX_PRESETS)) {
		entries.push({ name, label: name.charAt(0).toUpperCase() + name.slice(1), chars })
	}
	return entries
})

const boxStyleLabel = computed(() => {
	const box = tuiCurrentBox.value
	if (box === undefined) return 'Default'
	if (typeof box === 'string') return box.charAt(0).toUpperCase() + box.slice(1)
	return 'Custom'
})

function boxPreview(chars: BoxChars) {
	return [
		`${chars.topLeft}${chars.horizontal.repeat(4)}${chars.topRight}`,
		`${chars.vertical}    ${chars.vertical}`,
		`${chars.bottomLeft}${chars.horizontal.repeat(4)}${chars.bottomRight}`,
	]
}

const boxStyleOpen = shallowRef(false)

function selectBoxPreset(name: string | undefined) {
	configStore.setTuiBox(name)
	boxStyleOpen.value = false
}

function setMinWidth(value: number | undefined) {
	if (value === undefined || value <= 0) {
		configStore.setTuiOption('minWidth', undefined)
		return
	}
	const max = tui.value?.maxWidth
	if (max !== undefined && value > max) {
		configStore.setTuiOption('maxWidth', value)
	}
	configStore.setTuiOption('minWidth', value)
}

function setMaxWidth(value: number | undefined) {
	if (value === undefined || value <= 0) {
		configStore.setTuiOption('maxWidth', undefined)
		return
	}
	const min = tui.value?.minWidth
	if (min !== undefined && value < min) {
		configStore.setTuiOption('minWidth', value)
	}
	configStore.setTuiOption('maxWidth', value)
}

const dividerPlaceholder = computed(() => {
	const box = tui.value?.box
	if (typeof box === 'string' && BOX_PRESETS[box]) {
		return BOX_PRESETS[box].horizontal
	}
	return BOX_CHARS.horizontal
})

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

		<!-- Row 1: Display Style, Theme, Custom Theme button -->
		<div class="grid grid-cols-[1fr_1fr_auto] gap-3">
			<div class="flex flex-col gap-1.5">
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
							<span
								:class="[
									'flex items-center overflow-hidden rounded bg-[#1e1e2e] px-1 font-nerd text-[10px] leading-tight',
									configStore.config.display.style !== 'tui' && 'py-1',
								]"
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
									>&#x256D;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x252C;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x256E;
&#x2502; <span :style="{ color: '#3b82f6' }">~/proj</span> &#x2502; <span :style="{ color: '#22c55e' }">main</span> &#x2502;
&#x2570;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2534;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x256F;</pre>
								</template>
							</span>
						</span>
					</SelectTrigger>
					<SelectContent position="popper" side="bottom">
						<SelectItem v-for="s in styles" :key="s.value" :value="s.value">
							<div class="flex items-center gap-3">
								<span>{{ s.title }}</span>
								<span
									:class="[
										'flex items-center overflow-hidden rounded bg-[#1e1e2e] px-1 font-nerd text-[10px] leading-tight',
										s.value !== 'tui' && 'py-1',
									]"
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
										>&#x256D;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x252C;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x256E;
&#x2502; <span :style="{ color: '#3b82f6' }">~/proj</span> &#x2502; <span :style="{ color: '#22c55e' }">main</span> &#x2502;
&#x2570;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2534;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x256F;</pre>
									</template>
								</span>
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div class="flex flex-col gap-1.5">
				<Label class="text-xs font-medium text-muted-foreground">Theme</Label>
				<Select :model-value="themeSelectValue" @update:model-value="handleSelectTheme">
					<SelectTrigger class="w-full" size="sm">
						<span class="flex items-center gap-2">
							<span v-if="configStore.themeEditor.mode === 'custom'">Custom Theme</span>
							<span v-else>{{ CANONICAL_THEME_LABELS[configStore.themeEditor.builtinTheme] }}</span>
							<span
								v-if="configStore.themeEditor.mode === 'builtin' && configStore.overrideCount > 0"
								class="rounded bg-muted px-1 py-0.5 text-[10px] leading-none text-muted-foreground"
								>modified</span
							>
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
			</div>

			<!-- Custom Theme Button -->
			<div class="flex flex-col gap-1.5">
				<Label class="text-xs font-medium text-muted-foreground">&nbsp;</Label>
				<Button
					variant="outline"
					size="sm"
					class="w-full whitespace-nowrap"
					:class="
						configStore.themeEditor.mode === 'custom'
							? 'border-primary bg-primary/5 text-primary'
							: ''
					"
					:disabled="configStore.themeEditor.mode === 'custom'"
					@click="handleEnterCustom"
				>
					<IconLucide-palette class="size-3.5" />
					{{ configStore.themeEditor.mode === 'custom' ? 'Editing Custom' : 'Custom Theme' }}
				</Button>
			</div>
		</div>

		<!-- Non-TUI: Padding, Auto-wrap -->
		<template v-if="!configStore.isTuiStyle">
			<div class="grid grid-cols-2 items-end gap-3">
				<div class="flex flex-col gap-1.5">
					<Label for="padding" class="text-xs font-medium text-muted-foreground">Padding</Label>
					<NumberField
						id="padding"
						:model-value="configStore.config.display.padding"
						:min="0"
						:max="3"
						:step="1"
						@update:model-value="configStore.setPadding($event ?? 0)"
					>
						<NumberFieldContent>
							<NumberFieldDecrement />
							<NumberFieldInput />
							<NumberFieldIncrement />
						</NumberFieldContent>
					</NumberField>
				</div>

				<div class="flex flex-col gap-1.5">
					<Label for="auto-wrap" class="text-xs font-medium text-muted-foreground">Auto-wrap</Label>
					<div class="flex h-8 items-center gap-2">
						<Switch
							id="auto-wrap"
							:model-value="configStore.config.display.autoWrap ?? true"
							@update:model-value="configStore.setAutoWrap($event)"
						/>
						<span class="text-xs text-muted-foreground">Wrap at width</span>
					</div>
				</div>
			</div>
		</template>

		<!-- TUI: box style + sizing + separators + padding -->
		<TooltipProvider v-else :delay-duration="300">
			<!-- TUI: All options in one row -->
			<div class="grid grid-cols-7 items-end gap-3">
				<!-- Box Style Popover -->
				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-medium text-muted-foreground">Box Style</Label>
					<Popover v-model:open="boxStyleOpen">
						<PopoverTrigger as-child>
							<Button variant="outline" size="sm" class="w-full justify-between">
								<span class="text-xs">{{ boxStyleLabel }}</span>
								<IconLucide-chevron-down class="size-3.5 text-muted-foreground" />
							</Button>
						</PopoverTrigger>
						<PopoverContent class="w-auto p-2" align="start">
							<div class="grid grid-cols-3 gap-1.5">
								<button
									class="flex flex-col items-center gap-1 rounded-md border p-1.5 text-xs transition-colors hover:bg-accent"
									:class="
										tuiCurrentBox === undefined
											? 'ring-2 ring-primary border-primary'
											: 'border-border'
									"
									@click="selectBoxPreset(undefined)"
								>
									<span class="text-muted-foreground text-[10px]">Default</span>
									<span class="font-mono text-[10px] leading-tight text-muted-foreground"
										>(auto)</span
									>
								</button>
								<button
									v-for="preset in boxPresets"
									:key="preset.name"
									class="flex flex-col items-center gap-0.5 rounded-md border p-1.5 text-xs transition-colors hover:bg-accent"
									:class="
										tuiCurrentBox === preset.name
											? 'ring-2 ring-primary border-primary'
											: 'border-border'
									"
									@click="selectBoxPreset(preset.name)"
								>
									<span class="text-muted-foreground text-[10px]">{{ preset.label }}</span>
									<div class="font-mono text-[10px] leading-tight whitespace-pre">
										<div v-for="(line, i) in boxPreview(preset.chars)" :key="i">{{ line }}</div>
									</div>
								</button>
							</div>
						</PopoverContent>
					</Popover>
				</div>

				<!-- Fit Content -->
				<div class="flex flex-col gap-1.5">
					<div class="flex items-center gap-1">
						<Label for="fit-content" class="text-xs font-medium text-muted-foreground"
							>Fit Content</Label
						>
						<Tooltip>
							<TooltipTrigger as-child>
								<IconLucide-info class="size-3 text-muted-foreground/50" />
							</TooltipTrigger>
							<TooltipContent side="top" class="max-w-56 text-xs">
								Shrink the panel to fit its content width instead of filling available space
							</TooltipContent>
						</Tooltip>
					</div>
					<div class="flex h-8 items-center">
						<Switch
							id="fit-content"
							:model-value="tuiFitContent"
							@update:model-value="configStore.setTuiOption('fitContent', $event)"
						/>
					</div>
				</div>

				<!-- Min Width -->
				<div class="flex flex-col gap-1.5">
					<div class="flex items-center gap-1">
						<Label for="tui-min-width" class="text-xs font-medium text-muted-foreground"
							>Min Width</Label
						>
						<Tooltip>
							<TooltipTrigger as-child>
								<IconLucide-info class="size-3 text-muted-foreground/50" />
							</TooltipTrigger>
							<TooltipContent side="top" class="max-w-56 text-xs">
								Minimum panel width in columns. The panel won't shrink below this even if content is
								narrower. Leave empty for no minimum.
							</TooltipContent>
						</Tooltip>
					</div>
					<NumberField
						id="tui-min-width"
						:model-value="tui?.minWidth"
						:min="0"
						:step="1"
						@update:model-value="setMinWidth($event)"
					>
						<NumberFieldContent>
							<NumberFieldDecrement />
							<NumberFieldInput placeholder="32" />
							<NumberFieldIncrement />
						</NumberFieldContent>
					</NumberField>
				</div>

				<!-- Max Width -->
				<div class="flex flex-col gap-1.5">
					<div class="flex items-center gap-1">
						<Label for="tui-max-width" class="text-xs font-medium text-muted-foreground"
							>Max Width</Label
						>
						<Tooltip>
							<TooltipTrigger as-child>
								<IconLucide-info class="size-3 text-muted-foreground/50" />
							</TooltipTrigger>
							<TooltipContent side="top" class="max-w-56 text-xs">
								Maximum panel width in columns. The panel won't grow beyond this. Leave empty to let
								it fill the available terminal width.
							</TooltipContent>
						</Tooltip>
					</div>
					<NumberField
						id="tui-max-width"
						:model-value="tui?.maxWidth"
						:min="0"
						:step="1"
						@update:model-value="setMaxWidth($event)"
					>
						<NumberFieldContent>
							<NumberFieldDecrement />
							<NumberFieldInput />
							<NumberFieldIncrement />
						</NumberFieldContent>
					</NumberField>
				</div>

				<!-- Column Separator -->
				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-medium text-muted-foreground">Column Sep.</Label>
					<Input
						:model-value="tuiSeparator?.column ?? ''"
						placeholder="  "
						class="h-8 text-xs font-mono"
						@update:model-value="configStore.setTuiSeparator({ column: String($event) })"
					/>
				</div>

				<!-- Divider -->
				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-medium text-muted-foreground">Divider Sep.</Label>
					<Input
						:model-value="tuiSeparator?.divider ?? ''"
						:placeholder="dividerPlaceholder"
						maxlength="1"
						class="h-8 text-xs font-mono"
						@update:model-value="configStore.setTuiSeparator({ divider: String($event) })"
					/>
				</div>

				<!-- TUI Padding -->
				<div class="flex flex-col gap-1.5">
					<div class="flex items-center gap-1">
						<Label class="text-xs font-medium text-muted-foreground">Padding</Label>
						<Tooltip>
							<TooltipTrigger as-child>
								<IconLucide-info class="size-3 text-muted-foreground/50" />
							</TooltipTrigger>
							<TooltipContent side="top" class="max-w-56 text-xs">
								Horizontal padding inside each cell. Only applies when Fit Content is enabled.
							</TooltipContent>
						</Tooltip>
					</div>
					<NumberField
						:model-value="tuiPadding"
						:min="0"
						:max="10"
						:step="1"
						:disabled="!tuiFitContent"
						@update:model-value="
							configStore.setTuiPadding(
								$event === undefined ? undefined : Math.max(0, Math.min(10, $event)),
							)
						"
					>
						<NumberFieldContent>
							<NumberFieldDecrement />
							<NumberFieldInput placeholder="0" />
							<NumberFieldIncrement />
						</NumberFieldContent>
					</NumberField>
				</div>
			</div>
		</TooltipProvider>

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
