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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import StylePreview from '@/components/studio/sections/StylePreview.vue'
import CustomThemeEditor from '@/components/studio/theme/CustomThemeEditor.vue'
import ThemeOverrides from '@/components/studio/theme/ThemeOverrides.vue'
import {
	CANONICAL_THEMES,
	CANONICAL_THEME_LABELS,
	PREVIEW_SEGMENTS,
	getCanonicalThemeColors,
} from '@/lib/themes'

import type { CanonicalTheme, SavedCustomTheme } from '@/lib/themes'

// Periodic table symbols in atomic-number order; single-letter symbols get a `#` suffix.
const ELEMENT_SYMBOLS = [
	'H#',
	'He',
	'Li',
	'Be',
	'B#',
	'C#',
	'N#',
	'O#',
	'F#',
	'Ne',
	'Na',
	'Mg',
	'Al',
	'Si',
	'P#',
	'S#',
	'Cl',
	'Ar',
	'K#',
	'Ca',
	'Sc',
	'Ti',
	'V#',
	'Cr',
	'Mn',
	'Fe',
	'Co',
	'Ni',
	'Cu',
	'Zn',
	'Ga',
	'Ge',
	'As',
	'Se',
	'Br',
	'Kr',
	'Rb',
	'Sr',
	'Y#',
	'Zr',
	'Nb',
	'Mo',
	'Tc',
	'Ru',
	'Rh',
	'Pd',
	'Ag',
	'Cd',
	'In',
	'Sn',
	'Sb',
	'Te',
	'I#',
	'Xe',
	'Cs',
	'Ba',
	'La',
	'Ce',
	'Pr',
	'Nd',
	'Pm',
	'Sm',
	'Eu',
	'Gd',
	'Tb',
	'Dy',
	'Ho',
	'Er',
	'Tm',
	'Yb',
	'Lu',
	'Hf',
	'Ta',
	'W#',
	'Re',
	'Os',
	'Ir',
	'Pt',
	'Au',
	'Hg',
	'Tl',
	'Pb',
	'Bi',
	'Po',
	'At',
	'Rn',
	'Fr',
	'Ra',
	'Ac',
	'Th',
	'Pa',
	'U#',
	'Np',
	'Pu',
	'Am',
	'Cm',
	'Bk',
	'Cf',
	'Es',
	'Fm',
	'Md',
	'No',
	'Lr',
	'Rf',
	'Db',
	'Sg',
	'Bh',
	'Hs',
	'Mt',
	'Ds',
	'Rg',
	'Cn',
	'Nh',
	'Fl',
	'Mc',
	'Lv',
	'Ts',
	'Og',
]

function labelFor(themeIndex: number, segmentIndex: number) {
	const i = (themeIndex * PREVIEW_SEGMENTS.length + segmentIndex) % ELEMENT_SYMBOLS.length
	return ELEMENT_SYMBOLS[i]
}

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

type StyleValue = 'minimal' | 'powerline' | 'capsule' | 'tui'

defineProps<{ step?: number }>()

const configStore = useConfigStore()

const isOpen = ref(true)

const styles: readonly { value: StyleValue; title: string }[] = [
	{ value: 'minimal', title: 'Minimal' },
	{ value: 'powerline', title: 'Powerline' },
	{ value: 'capsule', title: 'Capsule' },
	{ value: 'tui', title: 'Terminal UI' },
]

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
const tuiExtraOpen = shallowRef(false)

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

const SAVED_PREFIX = 'saved:'

type PendingSwitch =
	| { kind: 'builtin'; theme: CanonicalTheme }
	| { kind: 'saved'; saved: SavedCustomTheme }
	| { kind: 'close' }

const showConfirmDialog = ref(false)
const pendingSwitch = ref<PendingSwitch | null>(null)
const customEditorOpen = ref(true)

watch(
	() => configStore.themeEditor.mode,
	(mode) => {
		if (mode === 'custom') customEditorOpen.value = true
	},
)

function applyPendingSwitch(pending: PendingSwitch) {
	if (pending.kind === 'builtin') {
		configStore.confirmSwitchToBuiltIn(pending.theme)
	} else if (pending.kind === 'saved') {
		configStore.loadSavedCustomTheme(pending.saved)
	} else {
		configStore.revertCustomDraft()
		customEditorOpen.value = false
	}
}

function requestSwitch(pending: PendingSwitch) {
	if (configStore.themeEditor.mode === 'custom' && configStore.hasModifiedCustomDraft) {
		pendingSwitch.value = pending
		showConfirmDialog.value = true
		return
	}
	applyPendingSwitch(pending)
}

function handleSelectTheme(value: string) {
	if (value.startsWith(SAVED_PREFIX)) {
		const id = value.slice(SAVED_PREFIX.length)
		const saved = configStore.savedCustomThemes.find((t) => t.id === id)
		if (!saved) return
		if (configStore.themeEditor.savedThemeId === saved.id) return
		requestSwitch({ kind: 'saved', saved })
		return
	}
	const theme = value as CanonicalTheme
	if (
		configStore.themeEditor.mode === 'builtin' &&
		configStore.themeEditor.builtinTheme === theme
	) {
		return
	}
	if (configStore.themeEditor.mode === 'custom') {
		requestSwitch({ kind: 'builtin', theme })
	} else {
		configStore.selectBuiltInTheme(theme)
	}
}

function handleConfirmSwitch() {
	if (pendingSwitch.value) {
		applyPendingSwitch(pendingSwitch.value)
	}
	pendingSwitch.value = null
	showConfirmDialog.value = false
}

function handleCancelSwitch() {
	pendingSwitch.value = null
	showConfirmDialog.value = false
}

function handleToggleCustom() {
	if (configStore.themeEditor.mode !== 'custom') {
		configStore.enterCustomTheme()
	}
}

function handleCloseCustom() {
	if (configStore.hasModifiedCustomDraft) {
		pendingSwitch.value = { kind: 'close' }
		showConfirmDialog.value = true
		return
	}
	customEditorOpen.value = false
}

function handleUpdateCustomColors(colors: ColorTheme) {
	for (const key of Object.keys(colors) as (keyof ColorTheme)[]) {
		configStore.updateCustomColor(key, colors[key])
	}
}

function handleSaveCustomTheme(name: string) {
	configStore.saveCustomTheme(name)
}

function handleDeleteCurrentCustom() {
	const id = configStore.themeEditor.savedThemeId
	if (!id) return
	configStore.deleteCustomTheme(id)
}

function handleResetCustomSegment(key: keyof ColorTheme) {
	configStore.resetCustomColorToSource(key)
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

const customSourceColors = computed(() => {
	const src = configStore.themeEditor.customSourceTheme
	return src ? getCanonicalThemeColors(src) : null
})

// Theme select value: `saved:<id>` for saved custom, canonical name for built-in,
// empty for an unsaved custom draft
const themeSelectValue = computed(() => {
	if (configStore.themeEditor.mode === 'custom') {
		return configStore.themeEditor.savedThemeId
			? `${SAVED_PREFIX}${configStore.themeEditor.savedThemeId}`
			: ''
	}
	return configStore.themeEditor.builtinTheme
})

const currentSavedTheme = computed(() =>
	configStore.themeEditor.savedThemeId
		? (configStore.savedCustomThemes.find((t) => t.id === configStore.themeEditor.savedThemeId) ??
			null)
		: null,
)

const triggerLabel = computed(() => {
	if (configStore.themeEditor.mode === 'custom') {
		return currentSavedTheme.value?.name ?? 'Custom Theme'
	}
	return CANONICAL_THEME_LABELS[configStore.themeEditor.builtinTheme]
})

// Current effective theme colors for the trigger swatch (includes overrides for built-in themes)
const triggerThemeColors = computed(() => configStore.effectiveColors)

// Index used to pick this theme's slice of element symbols for the trigger swatch.
// Built-in themes use their canonical index; saved customs continue past the built-ins;
// an unsaved custom draft falls back to 0.
const triggerThemeIndex = computed(() => {
	if (configStore.themeEditor.mode === 'builtin') {
		return CANONICAL_THEMES.indexOf(configStore.themeEditor.builtinTheme)
	}
	const savedId = configStore.themeEditor.savedThemeId
	if (savedId) {
		const idx = configStore.savedCustomThemes.findIndex((t) => t.id === savedId)
		if (idx >= 0) return CANONICAL_THEMES.length + idx
	}
	return 0
})
</script>

<template>
	<section class="flex flex-col gap-4">
		<Collapsible v-model:open="isOpen">
			<SectionTrigger
				title="Style & Theme"
				description="Choose display style and color scheme"
				:step="step"
				:is-open="isOpen"
			/>

			<CollapsibleContent>
				<div class="flex flex-col gap-6 pt-4">
					<!-- Style, Theme, and style-specific controls -->
					<TooltipProvider :delay-duration="300">
						<div class="flex flex-col gap-4">
							<!-- Main row: vertical on mobile, 2×2 grid at sm, single fit-content row above 960px -->
							<div
								class="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-x-3 sm:gap-y-4 wide:flex wide:flex-row wide:flex-wrap wide:items-end wide:gap-3"
							>
								<div class="flex flex-col gap-1.5">
									<Label class="text-xs font-medium text-muted-foreground">Display Style</Label>
									<Select
										:model-value="configStore.config.display.style"
										@update:model-value="configStore.setStyle($event as StyleValue)"
									>
										<SelectTrigger class="w-full wide:w-fit" size="sm">
											<span class="flex items-center gap-2">
												<span>{{
													styles.find((s) => s.value === configStore.config.display.style)?.title
												}}</span>
												<StylePreview :style="configStore.config.display.style" />
											</span>
										</SelectTrigger>
										<SelectContent position="popper" side="bottom">
											<SelectItem v-for="s in styles" :key="s.value" :value="s.value">
												<div class="flex items-center gap-3">
													<span class="w-24">{{ s.title }}</span>
													<StylePreview :style="s.value" />
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div class="flex flex-col gap-1.5">
									<Label class="text-xs font-medium text-muted-foreground">Theme</Label>
									<Select :model-value="themeSelectValue" @update:model-value="handleSelectTheme">
										<SelectTrigger class="w-full wide:w-fit" size="sm">
											<span class="flex items-center gap-2">
												<span class="flex items-center gap-1.5">
													<span>{{ triggerLabel }}</span>
													<span
														v-if="
															configStore.themeEditor.mode === 'builtin' &&
															configStore.overrideCount > 0
														"
														class="rounded bg-muted px-1 py-0.5 text-[0.625rem] leading-none text-muted-foreground"
														>modified</span
													>
												</span>
												<span
													class="flex gap-px overflow-hidden rounded text-[0.625rem] font-medium leading-none"
												>
													<span
														v-for="(seg, i) in PREVIEW_SEGMENTS"
														:key="seg"
														class="flex h-3.5 w-6 items-center justify-center"
														:style="{
															backgroundColor: triggerThemeColors[seg].bg,
															color: triggerThemeColors[seg].fg,
														}"
														>{{ labelFor(triggerThemeIndex, i) }}</span
													>
												</span>
											</span>
										</SelectTrigger>
										<SelectContent position="popper" side="bottom">
											<SelectGroup>
												<SelectItem
													v-for="(name, themeIdx) in CANONICAL_THEMES"
													:key="name"
													:value="name"
												>
													<div class="flex items-center gap-3">
														<span class="w-24">{{ CANONICAL_THEME_LABELS[name] }}</span>
														<span
															class="flex gap-px overflow-hidden rounded text-[0.625rem] font-medium leading-none"
														>
															<span
																v-for="(seg, i) in PREVIEW_SEGMENTS"
																:key="seg"
																class="flex h-3.5 w-6 items-center justify-center"
																:style="{
																	backgroundColor: getCanonicalThemeColors(name)[seg].bg,
																	color: getCanonicalThemeColors(name)[seg].fg,
																}"
																>{{ labelFor(themeIdx, i) }}</span
															>
														</span>
													</div>
												</SelectItem>
											</SelectGroup>
											<template v-if="configStore.savedCustomThemes.length > 0">
												<SelectSeparator />
												<SelectGroup>
													<SelectLabel>Custom</SelectLabel>
													<SelectItem
														v-for="(saved, savedIdx) in configStore.savedCustomThemes"
														:key="saved.id"
														:value="`${SAVED_PREFIX}${saved.id}`"
													>
														<div class="flex items-center gap-3">
															<span class="w-24 truncate">{{ saved.name }}</span>
															<span
																class="flex gap-px overflow-hidden rounded text-[0.625rem] font-medium leading-none"
															>
																<span
																	v-for="(seg, i) in PREVIEW_SEGMENTS"
																	:key="seg"
																	class="flex h-3.5 w-6 items-center justify-center"
																	:style="{
																		backgroundColor: saved.colors[seg].bg,
																		color: saved.colors[seg].fg,
																	}"
																	>{{ labelFor(CANONICAL_THEMES.length + savedIdx, i) }}</span
																>
															</span>
														</div>
													</SelectItem>
												</SelectGroup>
											</template>
										</SelectContent>
									</Select>
								</div>

								<!-- Non-TUI: Padding, Auto-wrap -->
								<template v-if="!configStore.isTuiStyle">
									<div class="flex flex-col gap-1.5 wide:w-28">
										<Label for="padding" class="text-xs font-medium text-muted-foreground"
											>Padding</Label
										>
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
										<Label for="auto-wrap" class="text-xs font-medium text-muted-foreground"
											>Auto-wrap</Label
										>
										<div class="flex h-8 items-center gap-2">
											<Switch
												id="auto-wrap"
												:model-value="configStore.config.display.autoWrap ?? true"
												@update:model-value="configStore.setAutoWrap($event)"
											/>
											<span class="text-xs text-muted-foreground">Wrap at width</span>
										</div>
									</div>

									<div class="flex flex-col gap-1.5">
										<div class="flex items-center gap-1">
											<Label for="show-icons" class="text-xs font-medium text-muted-foreground"
												>Show Icons</Label
											>
											<Tooltip>
												<TooltipTrigger as-child>
													<button
														type="button"
														class="inline-flex cursor-default rounded-sm outline-none focus-visible:outline-0 focus-visible:ring-[3px] focus-visible:ring-primary/50"
														aria-label="More info"
													>
														<IconLucide-info class="size-3 text-muted-foreground/50" />
													</button>
												</TooltipTrigger>
												<TooltipContent side="top" class="max-w-64 text-xs">
													Hide leading icons on segments. Status glyphs, separators, and metrics
													sub-icons are unaffected.
												</TooltipContent>
											</Tooltip>
										</div>
										<div class="flex h-8 items-center">
											<Switch
												id="show-icons"
												:model-value="configStore.config.display.showIcons ?? true"
												@update:model-value="configStore.setShowIcons($event)"
											/>
										</div>
									</div>
								</template>

								<!-- TUI: Box Style, Fit Content -->
								<template v-else>
									<div class="flex flex-col gap-1.5 wide:w-40">
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
														class="flex flex-col items-center gap-1 rounded-md border p-1.5 text-xs hover:bg-accent outline-none focus-visible:border-primary dark:focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/50"
														:class="
															tuiCurrentBox === undefined
																? 'ring-2 ring-primary border-primary'
																: 'border-border'
														"
														@click="selectBoxPreset(undefined)"
													>
														<span class="text-muted-foreground text-[0.625rem]">Default</span>
														<span
															class="font-mono text-[0.625rem] leading-tight text-muted-foreground"
															>(auto)</span
														>
													</button>
													<button
														v-for="preset in boxPresets"
														:key="preset.name"
														class="flex flex-col items-center gap-0.5 rounded-md border p-1.5 text-xs hover:bg-accent outline-none focus-visible:border-primary dark:focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/50"
														:class="
															tuiCurrentBox === preset.name
																? 'ring-2 ring-primary border-primary'
																: 'border-border'
														"
														@click="selectBoxPreset(preset.name)"
													>
														<span class="text-muted-foreground text-[0.625rem]">{{
															preset.label
														}}</span>
														<div class="font-mono text-[0.625rem] leading-tight whitespace-pre">
															<div v-for="(line, i) in boxPreview(preset.chars)" :key="i">
																{{ line }}
															</div>
														</div>
													</button>
												</div>
											</PopoverContent>
										</Popover>
									</div>

									<div class="flex flex-col gap-1.5">
										<div class="flex items-center gap-1">
											<Label for="fit-content" class="text-xs font-medium text-muted-foreground"
												>Fit Content</Label
											>
											<Tooltip>
												<TooltipTrigger as-child>
													<button
														type="button"
														class="inline-flex cursor-default rounded-sm outline-none focus-visible:outline-0 focus-visible:ring-[3px] focus-visible:ring-primary/50"
														aria-label="More info"
													>
														<IconLucide-info class="size-3 text-muted-foreground/50" />
													</button>
												</TooltipTrigger>
												<TooltipContent side="top" class="max-w-56 text-xs">
													Shrink the panel to fit its content width instead of filling available
													space.
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

									<div class="flex flex-col gap-1.5">
										<div class="flex items-center gap-1">
											<Label for="show-icons-tui" class="text-xs font-medium text-muted-foreground"
												>Show Icons</Label
											>
											<Tooltip>
												<TooltipTrigger as-child>
													<button
														type="button"
														class="inline-flex cursor-default rounded-sm outline-none focus-visible:outline-0 focus-visible:ring-[3px] focus-visible:ring-primary/50"
														aria-label="More info"
													>
														<IconLucide-info class="size-3 text-muted-foreground/50" />
													</button>
												</TooltipTrigger>
												<TooltipContent side="top" class="max-w-64 text-xs">
													Hide leading icons on segments. Status glyphs, separators, and metrics
													sub-icons are unaffected.
												</TooltipContent>
											</Tooltip>
										</div>
										<div class="flex h-8 items-center">
											<Switch
												id="show-icons-tui"
												:model-value="configStore.config.display.showIcons ?? true"
												@update:model-value="configStore.setShowIcons($event)"
											/>
										</div>
									</div>
								</template>
							</div>

							<!-- TUI: Extra options, trigger right-aligned -->
							<Collapsible
								v-if="configStore.isTuiStyle"
								v-model:open="tuiExtraOpen"
								class="flex flex-col gap-3"
							>
								<CollapsibleTrigger
									class="flex h-8 w-fit items-center gap-1 self-end rounded-md px-2 text-xs text-muted-foreground hover:bg-accent/50 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50"
								>
									<span>Show more options</span>
									<IconLucide-chevron-down
										class="size-3.5 transition-transform duration-200"
										:class="tuiExtraOpen ? 'rotate-180' : ''"
									/>
								</CollapsibleTrigger>

								<CollapsibleContent class="grid grid-cols-2 gap-x-3 gap-y-3 md:grid-cols-5">
									<!-- Min Width -->
									<div class="flex flex-col gap-1.5">
										<div class="flex items-center gap-1">
											<Label for="tui-min-width" class="text-xs font-medium text-muted-foreground"
												>Min Width</Label
											>
											<Tooltip>
												<TooltipTrigger as-child>
													<button
														type="button"
														class="inline-flex cursor-default rounded-sm outline-none focus-visible:outline-0 focus-visible:ring-[3px] focus-visible:ring-primary/50"
														aria-label="More info"
													>
														<IconLucide-info class="size-3 text-muted-foreground/50" />
													</button>
												</TooltipTrigger>
												<TooltipContent side="top" class="max-w-56 text-xs">
													Minimum panel width in columns. The panel won't shrink below this even if
													content is narrower. Leave empty for no minimum.
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
													<button
														type="button"
														class="inline-flex cursor-default rounded-sm outline-none focus-visible:outline-0 focus-visible:ring-[3px] focus-visible:ring-primary/50"
														aria-label="More info"
													>
														<IconLucide-info class="size-3 text-muted-foreground/50" />
													</button>
												</TooltipTrigger>
												<TooltipContent side="top" class="max-w-56 text-xs">
													Maximum panel width in columns. The panel won't grow beyond this. Leave
													empty to let it fill the available terminal width.
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
													<button
														type="button"
														class="inline-flex cursor-default rounded-sm outline-none focus-visible:outline-0 focus-visible:ring-[3px] focus-visible:ring-primary/50"
														aria-label="More info"
													>
														<IconLucide-info class="size-3 text-muted-foreground/50" />
													</button>
												</TooltipTrigger>
												<TooltipContent side="top" class="max-w-56 text-xs">
													Horizontal padding inside each cell. Only applies when Fit Content is
													enabled.
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
								</CollapsibleContent>
							</Collapsible>
						</div>
					</TooltipProvider>

					<!-- Custom Theme Editor -->
					<Transition
						enter-active-class="transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]"
						leave-active-class="transition-[opacity,transform] duration-150 ease-in"
						enter-from-class="opacity-0 translate-y-2"
						leave-to-class="opacity-0 translate-y-2"
					>
						<CustomThemeEditor
							v-if="
								configStore.themeEditor.mode === 'custom' && configStore.themeEditor.customDraft
							"
							v-model:open="customEditorOpen"
							:colors="configStore.themeEditor.customDraft"
							:source-colors="customSourceColors"
							:saved-theme-id="configStore.themeEditor.savedThemeId"
							:saved-theme-name="currentSavedTheme?.name ?? ''"
							@update:colors="handleUpdateCustomColors"
							@save:theme="handleSaveCustomTheme"
							@delete:theme="handleDeleteCurrentCustom"
							@reset:segment="handleResetCustomSegment"
							@close="handleCloseCustom"
						/>
					</Transition>

					<!-- Theme Overrides for built-in themes -->
					<ThemeOverrides
						v-if="configStore.themeEditor.mode === 'builtin'"
						:base-theme="baseThemeColors"
						:overrides="configStore.themeEditor.overrides"
						@update:overrides="handleUpdateOverrides"
						@reset:segment="handleResetSegment"
						@toggle:custom="handleToggleCustom"
					/>

					<!-- Confirmation Dialog -->
					<AlertDialog :open="showConfirmDialog">
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
								<AlertDialogDescription>
									You have unsaved changes to your custom theme. Continuing will discard them.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel @click="handleCancelSwitch">Cancel</AlertDialogCancel>
								<AlertDialogAction @click="handleConfirmSwitch">Discard</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</CollapsibleContent>
		</Collapsible>
		<Separator v-show="isOpen" />
	</section>
</template>
