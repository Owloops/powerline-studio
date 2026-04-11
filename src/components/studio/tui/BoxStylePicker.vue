<script setup lang="ts">
import { BOX_PRESETS } from '@owloops/claude-powerline/browser'
import type { BoxChars } from '@owloops/claude-powerline/browser'

const configStore = useConfigStore()
const currentBox = computed(() => configStore.config.display.tui?.box)

const presets = computed(() => {
	const entries: { name: string; label: string; chars: BoxChars }[] = []
	for (const [name, chars] of Object.entries(BOX_PRESETS)) {
		entries.push({ name, label: name.charAt(0).toUpperCase() + name.slice(1), chars })
	}
	return entries
})

function selectPreset(name: string | undefined) {
	configStore.setTuiBox(name)
}

function boxPreview(chars: BoxChars) {
	return [
		`${chars.topLeft}${chars.horizontal.repeat(4)}${chars.topRight}`,
		`${chars.vertical}    ${chars.vertical}`,
		`${chars.bottomLeft}${chars.horizontal.repeat(4)}${chars.bottomRight}`,
	]
}
</script>

<template>
	<div class="grid grid-cols-3 gap-2">
		<!-- Default (auto) -->
		<button
			class="flex flex-col items-center gap-1.5 rounded-md border p-2 text-xs transition-colors hover:bg-accent"
			:class="currentBox === undefined ? 'ring-2 ring-primary border-primary' : 'border-border'"
			@click="selectPreset(undefined)"
		>
			<span class="text-muted-foreground text-[10px]">Default</span>
			<span class="font-mono text-[10px] leading-tight text-muted-foreground">(auto)</span>
		</button>

		<!-- Preset cards -->
		<button
			v-for="preset in presets"
			:key="preset.name"
			class="flex flex-col items-center gap-1 rounded-md border p-2 text-xs transition-colors hover:bg-accent"
			:class="currentBox === preset.name ? 'ring-2 ring-primary border-primary' : 'border-border'"
			@click="selectPreset(preset.name)"
		>
			<span class="text-muted-foreground text-[10px]">{{ preset.label }}</span>
			<div class="font-mono text-[10px] leading-tight whitespace-pre">
				<div v-for="(line, i) in boxPreview(preset.chars)" :key="i">{{ line }}</div>
			</div>
		</button>
	</div>
</template>
