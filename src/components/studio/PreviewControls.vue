<script setup lang="ts">
import { Slider } from '@/components/ui/slider'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
	NumberField,
	NumberFieldContent,
	NumberFieldDecrement,
	NumberFieldIncrement,
	NumberFieldInput,
} from '@/components/ui/number-field'
import { TERMINAL_FONTS, FONT_WEIGHT_NAMES, getTerminalFont } from '@/lib/terminalFonts'
import { DARK_THEMES, LIGHT_THEMES } from '@/lib/terminalThemes'
import { storeToRefs } from 'pinia'

const previewStore = usePreviewStore()
const configStore = useConfigStore()
const {
	terminalWidth,
	colorMode,
	terminalTheme,
	terminalFont,
	fontWeight,
	fontSize,
	lineHeight,
	reservedWidth,
	charset,
} = storeToRefs(previewStore)

// Slider needs number[] model — bridge to store's number ref
const sliderModel = computed({
	get: () => [terminalWidth.value],
	set: (val: number[]) => {
		terminalWidth.value = val[0]
	},
})

const reservedModel = computed({
	get: () => [reservedWidth.value],
	set: (val: number[]) => {
		reservedWidth.value = val[0]
	},
})

const fontSizeModel = computed({
	get: () => [fontSize.value],
	set: (val: number[]) => {
		fontSize.value = val[0]
	},
})

const lineHeightModel = computed({
	get: () => [lineHeight.value],
	set: (val: number[]) => {
		lineHeight.value = Math.round(val[0] * 100) / 100
	},
})

const resolvedFont = computed(() => getTerminalFont(terminalFont.value))
const ALL_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const
const allWeightOptions = ALL_WEIGHTS.map((w) => ({
	value: String(w),
	label: FONT_WEIGHT_NAMES[w] ?? String(w),
}))

const isCustomWeight = computed(() => !ALL_WEIGHTS.includes(fontWeight.value as any))

const fontWeightSelect = computed({
	get: () => (isCustomWeight.value ? 'custom' : String(fontWeight.value)),
	set: (val: string) => {
		if (val !== 'custom') fontWeight.value = Number(val)
	},
})

function clampWeight(val: number) {
	fontWeight.value = Math.max(100, Math.min(900, Math.round(val)))
}

watch(terminalFont, () => {
	const weights = resolvedFont.value.weights
	if (!weights.includes(fontWeight.value)) {
		const closest = weights.reduce((prev, curr) =>
			Math.abs(curr - fontWeight.value) < Math.abs(prev - fontWeight.value) ? curr : prev,
		)
		fontWeight.value = closest
	}
})

const COLOR_MODE_OPTIONS = [
	{ value: 'truecolor', label: 'Truecolor' },
	{ value: 'ansi256', label: '256 Color' },
	{ value: 'ansi', label: 'Basic ANSI' },
	{ value: 'none', label: 'No Color' },
] as const

const CHARSET_OPTIONS = [
	{ value: 'unicode', label: 'Unicode' },
	{ value: 'text', label: 'ASCII' },
] as const
</script>

<template>
	<div class="flex flex-col gap-3 p-4">
		<!-- Width slider -->
		<div class="flex items-center justify-between gap-3">
			<Label for="preview-width" class="w-20 shrink-0 text-xs">Width</Label>
			<div class="flex flex-1 items-center gap-2">
				<Slider
					id="preview-width"
					v-model="sliderModel"
					:min="30"
					:max="240"
					:step="1"
					class="flex-1"
				/>
				<span class="w-14 text-right text-xs tabular-nums text-muted-foreground"
					>{{ terminalWidth }} cols</span
				>
			</div>
		</div>

		<!-- Reserved width slider -->
		<div class="flex items-center justify-between gap-3">
			<Label for="preview-reserved" class="w-20 shrink-0 text-xs">Reserved</Label>
			<div class="flex flex-1 items-center gap-2">
				<Slider
					id="preview-reserved"
					v-model="reservedModel"
					:min="0"
					:max="100"
					:step="1"
					class="flex-1"
				/>
				<span class="w-14 text-right text-xs tabular-nums text-muted-foreground"
					>{{ reservedWidth }} cols</span
				>
			</div>
		</div>

		<!-- Color mode select -->
		<div class="flex items-center justify-between gap-3">
			<Label for="preview-color-mode" class="w-20 shrink-0 text-xs">Color</Label>
			<Select v-model="colorMode">
				<SelectTrigger id="preview-color-mode" class="h-8 flex-1" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent position="popper" side="bottom">
					<SelectItem v-for="opt in COLOR_MODE_OPTIONS" :key="opt.value" :value="opt.value">
						{{ opt.label }}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<!-- Charset select -->
		<div class="flex items-center justify-between gap-3">
			<Label for="preview-charset" class="w-20 shrink-0 text-xs">Charset</Label>
			<Select :model-value="charset" @update:model-value="configStore.setCharset">
				<SelectTrigger id="preview-charset" class="h-8 flex-1" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent position="popper" side="bottom">
					<SelectItem v-for="opt in CHARSET_OPTIONS" :key="opt.value" :value="opt.value">
						{{ opt.label }}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<!-- Font size slider -->
		<div class="flex items-center justify-between gap-3">
			<Label for="preview-font-size" class="w-20 shrink-0 text-xs">Font Size</Label>
			<div class="flex flex-1 items-center gap-2">
				<Slider
					id="preview-font-size"
					v-model="fontSizeModel"
					:min="10"
					:max="24"
					:step="1"
					class="flex-1"
				/>
				<span class="w-10 text-right text-xs tabular-nums text-muted-foreground"
					>{{ fontSize }}px</span
				>
			</div>
		</div>

		<!-- Line height slider -->
		<div class="flex items-center justify-between gap-3">
			<Label for="preview-line-height" class="w-20 shrink-0 text-xs">Line Height</Label>
			<div class="flex flex-1 items-center gap-2">
				<Slider
					id="preview-line-height"
					v-model="lineHeightModel"
					:min="0.5"
					:max="1.5"
					:step="0.01"
					class="flex-1"
				/>
				<span class="w-8 text-right text-xs tabular-nums text-muted-foreground">{{
					lineHeight.toFixed(2)
				}}</span>
			</div>
		</div>

		<!-- Font select -->
		<div class="flex items-center justify-between gap-3">
			<Label for="preview-font" class="w-20 shrink-0 text-xs">Font</Label>
			<Select v-model="terminalFont">
				<SelectTrigger id="preview-font" class="h-8 flex-1" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent position="popper" side="bottom">
					<SelectItem v-for="f in TERMINAL_FONTS" :key="f.id" :value="f.id">
						{{ f.name }}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<!-- Font weight -->
		<div class="flex items-center justify-between gap-3">
			<Label for="preview-font-weight" class="w-20 shrink-0 text-xs">Weight</Label>
			<div class="flex flex-1 items-center justify-end gap-1.5">
				<Select v-model="fontWeightSelect">
					<SelectTrigger id="preview-font-weight" class="h-8 min-w-0 flex-1" size="sm">
						<SelectValue />
					</SelectTrigger>
					<SelectContent position="popper" side="bottom">
						<SelectItem v-for="w in allWeightOptions" :key="w.value" :value="w.value">
							{{ w.label }}
						</SelectItem>
						<SelectItem v-if="isCustomWeight" value="custom"> Custom </SelectItem>
					</SelectContent>
				</Select>
				<NumberField
					:model-value="fontWeight"
					:min="100"
					:max="900"
					:step="50"
					class="w-22 shrink-0 gap-0"
					@update:model-value="clampWeight($event ?? 400)"
				>
					<NumberFieldContent>
						<NumberFieldDecrement />
						<NumberFieldInput class="h-8 text-xs tabular-nums" />
						<NumberFieldIncrement />
					</NumberFieldContent>
				</NumberField>
			</div>
		</div>

		<!-- Terminal theme select -->
		<div class="flex items-center justify-between gap-3">
			<Label for="preview-terminal-theme" class="w-20 shrink-0 text-xs">Theme</Label>
			<Select v-model="terminalTheme">
				<SelectTrigger id="preview-terminal-theme" class="h-8 flex-1" size="sm">
					<span class="flex items-center gap-2">
						<span
							class="inline-block size-3 shrink-0 rounded-sm border border-border"
							:style="{ backgroundColor: previewStore.terminalBgColor }"
						/>
						<SelectValue />
					</span>
				</SelectTrigger>
				<SelectContent position="popper" side="bottom">
					<SelectGroup>
						<SelectLabel>Dark</SelectLabel>
						<SelectItem v-for="t in DARK_THEMES" :key="t.id" :value="t.id">
							<span class="flex items-center gap-2">
								<span
									class="inline-block size-3 shrink-0 rounded-sm border border-border"
									:style="{ backgroundColor: t.bg }"
								/>
								{{ t.name }}
							</span>
						</SelectItem>
					</SelectGroup>
					<SelectGroup>
						<SelectLabel>Light</SelectLabel>
						<SelectItem v-for="t in LIGHT_THEMES" :key="t.id" :value="t.id">
							<span class="flex items-center gap-2">
								<span
									class="inline-block size-3 shrink-0 rounded-sm border border-border"
									:style="{ backgroundColor: t.bg }"
								/>
								{{ t.name }}
							</span>
						</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	</div>
</template>
