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
import { TERMINAL_FONTS } from '@/lib/terminalFonts'
import { DARK_THEMES, LIGHT_THEMES } from '@/lib/terminalThemes'
import { storeToRefs } from 'pinia'

const previewStore = usePreviewStore()
const configStore = useConfigStore()
const {
	terminalWidth,
	colorMode,
	terminalTheme,
	terminalFont,
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
	<div
		class="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border bg-muted/50 px-4 py-2"
	>
		<!-- Width slider group -->
		<div class="flex items-center gap-2">
			<Label for="preview-width">Width</Label>
			<Slider
				id="preview-width"
				v-model="sliderModel"
				:min="30"
				:max="240"
				:step="1"
				class="w-32"
			/>
			<span class="w-14 text-xs tabular-nums text-muted-foreground">{{ terminalWidth }} cols</span>
		</div>

		<!-- Reserved width slider group -->
		<div class="flex items-center gap-2">
			<Label for="preview-reserved">Reserved</Label>
			<Slider
				id="preview-reserved"
				v-model="reservedModel"
				:min="0"
				:max="100"
				:step="1"
				class="w-24"
			/>
			<span class="w-14 text-xs tabular-nums text-muted-foreground">{{ reservedWidth }} cols</span>
		</div>

		<!-- Color mode select group -->
		<div class="flex items-center gap-2">
			<Label for="preview-color-mode">Color</Label>
			<Select v-model="colorMode">
				<SelectTrigger id="preview-color-mode" class="h-8 w-[130px]" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent position="popper" side="bottom">
					<SelectItem v-for="opt in COLOR_MODE_OPTIONS" :key="opt.value" :value="opt.value">
						{{ opt.label }}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<!-- Charset select group -->
		<div class="flex items-center gap-2">
			<Label for="preview-charset">Charset</Label>
			<Select :model-value="charset" @update:model-value="configStore.setCharset">
				<SelectTrigger id="preview-charset" class="h-8 w-[110px]" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent position="popper" side="bottom">
					<SelectItem v-for="opt in CHARSET_OPTIONS" :key="opt.value" :value="opt.value">
						{{ opt.label }}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<!-- Font size slider group -->
		<div class="flex items-center gap-2">
			<Label for="preview-font-size">Size</Label>
			<Slider
				id="preview-font-size"
				v-model="fontSizeModel"
				:min="10"
				:max="24"
				:step="1"
				class="w-24"
			/>
			<span class="w-10 text-xs tabular-nums text-muted-foreground">{{ fontSize }}px</span>
		</div>

		<!-- Line height slider group -->
		<div class="flex items-center gap-2">
			<Label for="preview-line-height">Line Height</Label>
			<Slider
				id="preview-line-height"
				v-model="lineHeightModel"
				:min="0.5"
				:max="1.5"
				:step="0.01"
				class="w-24"
			/>
			<span class="w-8 text-xs tabular-nums text-muted-foreground">{{ lineHeight }}</span>
		</div>

		<!-- Font select group -->
		<div class="flex items-center gap-2">
			<Label for="preview-font">Font</Label>
			<Select v-model="terminalFont">
				<SelectTrigger id="preview-font" class="h-8 w-[170px]" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent position="popper" side="bottom">
					<SelectItem v-for="f in TERMINAL_FONTS" :key="f.id" :value="f.id">
						{{ f.name }}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<!-- Terminal theme select group -->
		<div class="flex items-center gap-2">
			<Label for="preview-terminal-theme">Terminal</Label>
			<Select v-model="terminalTheme">
				<SelectTrigger id="preview-terminal-theme" class="h-8 w-[180px]" size="sm">
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
