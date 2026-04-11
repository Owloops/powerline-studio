<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useShikiHighlighter } from '@/composables/useShikiHighlighter'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const configStore = useConfigStore()

const { html, isLoading } = useShikiHighlighter(() => configStore.configJson)

const INSTALL_COMMAND = 'npm install -g @owloops/claude-powerline'
const CONFIG_PATH = '~/.claude/claude-powerline.json'
const SETTINGS_SNIPPET = '{ "statusLine": { "command": "claude-powerline" } }'

// Each copy button gets its own useClipboard instance to isolate `copied` state
const jsonClipboard = useClipboard({ legacy: true })
const installClipboard = useClipboard({ legacy: true })
const pathClipboard = useClipboard({ legacy: true })
const settingsClipboard = useClipboard({ legacy: true })

async function copyJson() {
	try {
		await jsonClipboard.copy(configStore.configJson)
		toast.success('Copied to clipboard!')
	} catch {
		toast.error('Failed to copy to clipboard')
	}
}

async function copySnippet(clipboard: typeof jsonClipboard, text: string) {
	try {
		await clipboard.copy(text)
		toast.success('Copied to clipboard!')
	} catch {
		toast.error('Failed to copy to clipboard')
	}
}
</script>

<template>
	<div class="flex flex-col gap-4">
		<!-- JSON Output -->
		<div class="relative">
			<div
				v-if="!isLoading"
				v-html="html"
				class="max-h-100 overflow-auto rounded-md border bg-muted/30 p-4 text-sm [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:text-xs"
			/>
			<pre
				v-else
				class="max-h-100 overflow-auto rounded-md border bg-muted/30 p-4 text-xs text-muted-foreground"
			>{{ configStore.configJson }}</pre>
		</div>

		<!-- Copy JSON Button -->
		<Button
			variant="outline"
			size="sm"
			class="w-full"
			@click="copyJson"
		>
			<IconLucide-clipboard v-if="!jsonClipboard.copied.value" class="size-4" />
			<IconLucide-check v-else class="size-4 text-primary" />
			{{ jsonClipboard.copied.value ? 'Copied!' : 'Copy JSON' }}
		</Button>

		<!-- Installation Instructions -->
		<Collapsible>
			<CollapsibleTrigger as-child>
				<Button variant="ghost" size="sm" class="w-full justify-between">
					Installation Instructions
					<IconLucide-chevron-down class="size-4 transition-transform [[data-state=open]_&]:rotate-180" />
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div class="flex flex-col gap-3 pt-2">
					<!-- Install command -->
					<div class="space-y-1">
						<p class="text-xs font-medium text-muted-foreground">Install</p>
						<div class="flex items-center gap-2">
							<code class="flex-1 rounded bg-muted px-2 py-1 text-xs">{{ INSTALL_COMMAND }}</code>
							<Button
								variant="ghost"
								size="icon-sm"
								@click="copySnippet(installClipboard, INSTALL_COMMAND)"
							>
								<IconLucide-clipboard v-if="!installClipboard.copied.value" class="size-3" />
								<IconLucide-check v-else class="size-3 text-primary" />
							</Button>
						</div>
					</div>

					<!-- Config file path -->
					<div class="space-y-1">
						<p class="text-xs font-medium text-muted-foreground">Save config to</p>
						<div class="flex items-center gap-2">
							<code class="flex-1 rounded bg-muted px-2 py-1 text-xs">{{ CONFIG_PATH }}</code>
							<Button
								variant="ghost"
								size="icon-sm"
								@click="copySnippet(pathClipboard, CONFIG_PATH)"
							>
								<IconLucide-clipboard v-if="!pathClipboard.copied.value" class="size-3" />
								<IconLucide-check v-else class="size-3 text-primary" />
							</Button>
						</div>
					</div>

					<!-- settings.json snippet -->
					<div class="space-y-1">
						<p class="text-xs font-medium text-muted-foreground">Add to settings.json</p>
						<div class="flex items-center gap-2">
							<code class="flex-1 rounded bg-muted px-2 py-1 text-xs">{{ SETTINGS_SNIPPET }}</code>
							<Button
								variant="ghost"
								size="icon-sm"
								@click="copySnippet(settingsClipboard, SETTINGS_SNIPPET)"
							>
								<IconLucide-clipboard v-if="!settingsClipboard.copied.value" class="size-3" />
								<IconLucide-check v-else class="size-3 text-primary" />
							</Button>
						</div>
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	</div>
</template>
