<script setup lang="ts">
import { toast } from 'vue-sonner'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TUI_PRESETS } from '@/lib/tuiPresets'
import { FLAT_PRESETS } from '@/lib/flatPresets'

const configStore = useConfigStore()

const showImportDialog = ref(false)
const importText = ref('')
const importError = ref('')

// Preset select is an action trigger — always reset to undefined after applying
const presetValue = ref<string>()

watch(importText, () => {
	if (importError.value) {
		importError.value = ''
	}
})

function handlePresetSelect(value: string) {
	const [mode, presetId] = value.split(':') as [string, string]
	if (mode === 'flat') {
		const preset = FLAT_PRESETS.find((p) => p.id === presetId)
		if (preset) {
			configStore.applyFlatPreset(preset)
			toast.success(`Applied "${preset.name}" statusline preset`)
		}
	} else if (mode === 'tui') {
		const preset = TUI_PRESETS.find((p) => p.id === presetId)
		if (preset) {
			configStore.applyTuiPreset(preset)
			toast.success(`Applied "${preset.name}" TUI preset`)
		}
	}
	// Reset to show placeholder again
	nextTick(() => {
		presetValue.value = undefined
	})
}

function validateConfig(value: unknown): value is Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return false
	}

	const obj = value as Record<string, unknown>

	if ('theme' in obj && typeof obj.theme !== 'string') return false
	if ('display' in obj && (typeof obj.display !== 'object' || obj.display === null)) return false
	if ('colors' in obj && (typeof obj.colors !== 'object' || obj.colors === null)) return false
	if ('budget' in obj && (typeof obj.budget !== 'object' || obj.budget === null)) return false
	if (
		'modelContextLimits' in obj &&
		(typeof obj.modelContextLimits !== 'object' || obj.modelContextLimits === null)
	)
		return false

	return true
}

function loadImportedConfig() {
	try {
		const parsed = JSON.parse(importText.value)

		if (!validateConfig(parsed)) {
			importError.value = 'Invalid config structure: top-level fields have incorrect types.'
			return
		}

		configStore.loadConfig(parsed)
		toast.success('Config loaded successfully')
		importText.value = ''
		importError.value = ''
		showImportDialog.value = false
	} catch (e) {
		importError.value =
			e instanceof SyntaxError ? `Invalid JSON: ${e.message}` : 'Failed to parse config.'
	}
}
</script>

<template>
	<section class="flex flex-col gap-3">
		<!-- Section Header -->
		<div>
			<h2 class="text-sm font-semibold">Presets</h2>
			<p class="text-xs text-muted-foreground">
				Start from a template or import an existing config
			</p>
		</div>

		<!-- Compact Preset Row -->
		<div class="flex items-center gap-2">
			<Select :model-value="presetValue" @update:model-value="handlePresetSelect">
				<SelectTrigger class="h-8 w-auto min-w-[160px]" size="sm">
					<span class="flex items-center gap-1.5 text-muted-foreground">
						<IconLucide-layout-template class="size-3.5" />
						Choose Preset
					</span>
				</SelectTrigger>
				<SelectContent position="popper" side="bottom" class="min-w-[220px]">
					<SelectGroup>
						<SelectLabel>Statusline Mode</SelectLabel>
						<SelectItem
							v-for="preset in FLAT_PRESETS"
							:key="`flat:${preset.id}`"
							:value="`flat:${preset.id}`"
						>
							<div class="flex flex-col">
								<span>{{ preset.name }}</span>
								<span class="text-xs text-muted-foreground">{{ preset.description }}</span>
							</div>
						</SelectItem>
					</SelectGroup>
					<SelectGroup>
						<SelectLabel>TUI Mode</SelectLabel>
						<SelectItem
							v-for="preset in TUI_PRESETS"
							:key="`tui:${preset.id}`"
							:value="`tui:${preset.id}`"
						>
							<div class="flex flex-col">
								<span>{{ preset.name }}</span>
								<span class="text-xs text-muted-foreground">{{ preset.description }}</span>
							</div>
						</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>

			<Dialog v-model:open="showImportDialog">
				<DialogTrigger as-child>
					<Button variant="outline" size="sm" class="h-8">
						<IconLucide-upload class="size-3.5" />
						Import Config
					</Button>
				</DialogTrigger>
				<DialogContent class="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Import Config</DialogTitle>
						<DialogDescription>
							Paste an existing
							<code class="rounded bg-muted px-1">claude-powerline.json</code> config to load it
							into the editor.
						</DialogDescription>
					</DialogHeader>
					<div class="flex flex-col gap-4">
						<Textarea
							v-model="importText"
							placeholder='{ "theme": "dark", "display": { ... } }'
							class="min-h-48 font-mono text-xs"
						/>
						<p v-if="importError" class="text-sm text-destructive">
							{{ importError }}
						</p>
						<Button
							variant="outline"
							size="sm"
							class="w-full"
							:disabled="!importText.trim()"
							@click="loadImportedConfig"
						>
							<IconLucide-upload class="size-4" />
							Load Config
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	</section>
</template>
