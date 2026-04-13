<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TUI_PRESETS } from '@/lib/tuiPresets'
import { FLAT_PRESETS } from '@/lib/flatPresets'

defineProps<{ step?: number }>()

const configStore = useConfigStore()

const isOpen = ref(true)
const showImportDialog = ref(false)
const importText = ref('')
const importError = ref('')
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

watch(importText, () => {
	if (importError.value) {
		importError.value = ''
	}
})

function handleDragOver(e: DragEvent) {
	e.preventDefault()
	isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
	const target = e.currentTarget as HTMLElement
	if (!target.contains(e.relatedTarget as Node)) {
		isDragging.value = false
	}
}

function handleDrop(e: DragEvent) {
	e.preventDefault()
	isDragging.value = false

	const file = e.dataTransfer?.files[0]
	if (!file) return

	if (!file.name.endsWith('.json')) {
		importError.value = 'Only .json files are supported.'
		return
	}

	const reader = new FileReader()
	reader.onload = () => {
		importText.value = reader.result as string
		loadImportedConfig()
	}
	reader.onerror = () => {
		importError.value = 'Failed to read file.'
	}
	reader.readAsText(file)
}

function handleFileInput(e: Event) {
	const input = e.target as HTMLInputElement
	const file = input.files?.[0]
	if (!file) return

	if (!file.name.endsWith('.json')) {
		importError.value = 'Only .json files are supported.'
		input.value = ''
		return
	}

	const reader = new FileReader()
	reader.onload = () => {
		importText.value = reader.result as string
		loadImportedConfig()
	}
	reader.onerror = () => {
		importError.value = 'Failed to read file.'
	}
	reader.readAsText(file)
	input.value = ''
}

const selectedPresetName = computed(() => {
	const entry = configStore.activePreset
	if (!entry) return undefined
	return entry.preset.name
})

function handlePresetSelect(value: string) {
	const flat = FLAT_PRESETS.find((p) => p.id === value)
	const tui = TUI_PRESETS.find((p) => p.id === value)
	const name = flat?.name ?? tui?.name
	if (name) {
		configStore.selectPreset(value)
		toast.success(`Applied "${name}" preset`)
	}
}

function handleReset() {
	configStore.resetPreset()
	toast.success(`Reset to "${selectedPresetName.value}" preset`)
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

function resetToDefaults() {
	configStore.resetToDefaults()
	toast.success('Config reset to defaults')
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
		<Collapsible v-model:open="isOpen">
			<!-- Section Header -->
			<div class="flex items-center justify-between">
				<SectionTrigger
					title="Presets"
					description="Start from a template or import an existing config"
					:step="step"
					:is-open="isOpen"
				/>
			</div>

			<CollapsibleContent>
				<TooltipProvider :delay-duration="300">
					<div class="flex items-end gap-3 pt-3">
						<!-- Preset -->
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center gap-1.5">
								<Label class="text-xs font-medium text-muted-foreground">Preset</Label>
								<Transition
									enter-active-class="transition-all duration-150 ease-out"
									leave-active-class="transition-all duration-100 ease-in"
									enter-from-class="opacity-0 scale-95"
									leave-to-class="opacity-0 scale-95"
								>
									<span v-if="configStore.isPresetModified" class="flex items-center gap-0.5">
										<span
											class="rounded bg-muted px-1 py-0.5 text-[0.5625rem] leading-none text-muted-foreground"
											>modified</span
										>
										<Tooltip>
											<TooltipTrigger as-child>
												<button
													class="flex size-4 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
													@click="handleReset"
												>
													<IconLucide-rotate-ccw class="size-2.5" />
												</button>
											</TooltipTrigger>
											<TooltipContent side="top" class="text-xs">Reset to preset</TooltipContent>
										</Tooltip>
									</span>
								</Transition>
							</div>
							<Select
								:model-value="configStore.activePresetId ?? undefined"
								@update:model-value="handlePresetSelect"
							>
								<SelectTrigger class="h-8 w-auto min-w-[200px]" size="sm">
									<span
										class="flex items-center gap-1.5"
										:class="selectedPresetName ? 'text-foreground' : 'text-muted-foreground'"
									>
										<IconLucide-layers class="size-3.5 shrink-0 text-muted-foreground" />
										{{ selectedPresetName || 'Choose Preset' }}
									</span>
								</SelectTrigger>
								<SelectContent position="popper" side="bottom" class="min-w-[240px]">
									<SelectGroup>
										<SelectLabel>Statusline</SelectLabel>
										<SelectItem v-for="preset in FLAT_PRESETS" :key="preset.id" :value="preset.id">
											<div class="flex flex-col">
												<span>{{ preset.name }}</span>
												<span class="text-xs text-muted-foreground">{{ preset.description }}</span>
											</div>
										</SelectItem>
									</SelectGroup>
									<SelectGroup>
										<SelectLabel>TUI Layout</SelectLabel>
										<SelectItem v-for="preset in TUI_PRESETS" :key="preset.id" :value="preset.id">
											<div class="flex flex-col">
												<span>{{ preset.name }}</span>
												<span class="text-xs text-muted-foreground">{{ preset.description }}</span>
											</div>
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>

						<!-- Import / Reset -->
						<div class="flex flex-col gap-1.5">
							<Label class="text-xs font-medium text-muted-foreground">&nbsp;</Label>
							<div class="flex items-center gap-3">
								<Dialog v-model:open="showImportDialog">
									<DialogTrigger as-child>
										<Button variant="outline" size="sm" class="h-8">
											<IconLucide-upload class="size-3.5" />
											Import
										</Button>
									</DialogTrigger>
									<DialogContent
										class="sm:max-w-lg"
										@dragover="handleDragOver"
										@dragleave="handleDragLeave"
										@drop="handleDrop"
									>
										<div
											v-if="isDragging"
											class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5"
										>
											<div class="flex flex-col items-center gap-1.5 text-primary">
												<IconLucide-file-json class="size-8" />
												<span class="text-sm font-medium">Drop JSON file</span>
											</div>
										</div>
										<DialogHeader>
											<DialogTitle>Import Config</DialogTitle>
											<DialogDescription>
												Paste JSON, drop a file, or
												<button
													type="button"
													class="cursor-pointer font-medium text-primary underline underline-offset-2 hover:text-primary/80"
													@click="fileInputRef?.click()"
												>
													upload a file</button
												>.
											</DialogDescription>
										</DialogHeader>
										<input
											ref="fileInputRef"
											type="file"
											accept=".json"
											class="hidden"
											@change="handleFileInput"
										/>
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
								<ConfirmPopover action="Reset" @confirm="resetToDefaults">
									<Button variant="destructive" size="sm" class="h-8">
										<IconLucide-rotate-ccw class="size-3.5" />
										Reset to Default
									</Button>
								</ConfirmPopover>
							</div>
						</div>
					</div>
				</TooltipProvider>
			</CollapsibleContent>
		</Collapsible>
		<Separator v-show="isOpen" />
	</section>
</template>
