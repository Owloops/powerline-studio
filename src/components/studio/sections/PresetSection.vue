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
import { Textarea } from '@/components/ui/textarea'
import { TUI_PRESETS } from '@/lib/tuiPresets'
import { FLAT_PRESETS } from '@/lib/flatPresets'

const configStore = useConfigStore()

const showImportDialog = ref(false)
const importText = ref('')
const importError = ref('')

watch(importText, () => {
	if (importError.value) {
		importError.value = ''
	}
})

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
	<section class="flex flex-col gap-4">
		<!-- Section Header -->
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-sm font-semibold">Presets</h2>
				<p class="text-xs text-muted-foreground">
					Start from a template or import an existing config
				</p>
			</div>
			<Dialog v-model:open="showImportDialog">
				<DialogTrigger as-child>
					<Button variant="outline" size="sm">
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

		<!-- Flat Presets -->
		<div class="flex flex-col gap-2">
			<h3 class="text-xs font-medium text-muted-foreground">Flat Mode</h3>
			<div class="grid grid-cols-3 gap-3">
				<button
					v-for="preset in FLAT_PRESETS"
					:key="preset.id"
					class="flex flex-col gap-1 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent/50"
					@click="configStore.applyFlatPreset(preset)"
				>
					<span class="text-sm font-medium">{{ preset.name }}</span>
					<span class="text-xs text-muted-foreground">{{ preset.description }}</span>
				</button>
			</div>
		</div>

		<!-- TUI Presets -->
		<div class="flex flex-col gap-2">
			<h3 class="text-xs font-medium text-muted-foreground">TUI Mode</h3>
			<div class="grid grid-cols-3 gap-3">
				<button
					v-for="preset in TUI_PRESETS"
					:key="preset.id"
					class="flex flex-col gap-1 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent/50"
					@click="configStore.applyTuiPreset(preset)"
				>
					<span class="text-sm font-medium">{{ preset.name }}</span>
					<span class="text-xs text-muted-foreground">{{ preset.description }}</span>
				</button>
			</div>
		</div>
	</section>
</template>
