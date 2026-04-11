<script setup lang="ts">
import { Slider } from '@/components/ui/slider'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { storeToRefs } from 'pinia'

const previewStore = usePreviewStore()
const configStore = useConfigStore()
const { terminalWidth, colorMode, darkBackground, charset } = storeToRefs(previewStore)

// Slider needs number[] model — bridge to store's number ref
const sliderModel = computed({
	get: () => [terminalWidth.value],
	set: (val: number[]) => {
		terminalWidth.value = val[0]
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
				:max="200"
				:step="1"
				class="w-32"
			/>
			<span class="w-14 text-xs tabular-nums text-muted-foreground">{{ terminalWidth }} cols</span>
		</div>

		<!-- Color mode select group -->
		<div class="flex items-center gap-2">
			<Label for="preview-color-mode">Color</Label>
			<Select v-model="colorMode">
				<SelectTrigger id="preview-color-mode" class="h-8 w-[130px]" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem v-for="opt in COLOR_MODE_OPTIONS" :key="opt.value" :value="opt.value">
						{{ opt.label }}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<!-- Charset select group -->
		<div class="flex items-center gap-2">
			<Label for="preview-charset">Charset</Label>
			<Select
				:model-value="charset"
				@update:model-value="configStore.setCharset"
			>
				<SelectTrigger id="preview-charset" class="h-8 w-[110px]" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem v-for="opt in CHARSET_OPTIONS" :key="opt.value" :value="opt.value">
						{{ opt.label }}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<!-- Dark/light background toggle group -->
		<div class="flex items-center gap-2">
			<Label for="preview-background">Background</Label>
			<Switch id="preview-background" v-model="darkBackground" />
			<span class="text-xs text-muted-foreground">{{ darkBackground ? 'Dark' : 'Light' }}</span>
		</div>
	</div>
</template>
