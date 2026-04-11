<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useShikiHighlighter } from '@/composables/useShikiHighlighter'

const configStore = useConfigStore()

const { html, isLoading } = useShikiHighlighter(() => configStore.configJson)

const INSTALL_COMMAND = 'npm install -g @owloops/claude-powerline'
const CONFIG_PATH = '~/.claude/claude-powerline.json'
const SETTINGS_SNIPPET = '{ "statusLine": { "command": "claude-powerline" } }'

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
	<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
		<!-- Your Config -->
		<section class="flex flex-col gap-3">
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-medium">Your Config</h3>
				<Button variant="outline" size="sm" @click="copyJson">
					<IconLucide-clipboard v-if="!jsonClipboard.copied.value" class="size-3.5" />
					<IconLucide-check v-else class="size-3.5 text-primary" />
					{{ jsonClipboard.copied.value ? 'Copied!' : 'Copy JSON' }}
				</Button>
			</div>
			<div
				v-if="!isLoading"
				v-html="html"
				class="max-h-120 overflow-auto rounded-md border p-4 text-sm [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:text-xs"
			/>
			<pre
				v-else
				class="max-h-120 overflow-auto rounded-md border p-4 text-xs text-muted-foreground"
				>{{ configStore.configJson }}</pre
			>
		</section>

		<!-- Installation -->
		<section class="flex flex-col gap-3">
			<h3 class="text-sm font-medium">Installation</h3>

			<ol class="flex flex-col gap-4 text-sm text-muted-foreground">
				<!-- Step 1 -->
				<li class="flex flex-col gap-1.5">
					<span class="font-medium text-foreground">1. Install the package</span>
					<div class="flex items-center gap-2">
						<code class="flex-1 rounded-md border px-3 py-1.5 text-xs">{{ INSTALL_COMMAND }}</code>
						<Button
							variant="ghost"
							size="icon-sm"
							@click="copySnippet(installClipboard, INSTALL_COMMAND)"
						>
							<IconLucide-clipboard v-if="!installClipboard.copied.value" class="size-3.5" />
							<IconLucide-check v-else class="size-3.5 text-primary" />
						</Button>
					</div>
				</li>

				<!-- Step 2 -->
				<li class="flex flex-col gap-1.5">
					<span class="font-medium text-foreground">2. Save config to file</span>
					<p class="text-xs">Copy the JSON and save it to:</p>
					<div class="flex items-center gap-2">
						<code class="flex-1 rounded-md border px-3 py-1.5 text-xs">{{ CONFIG_PATH }}</code>
						<Button variant="ghost" size="icon-sm" @click="copySnippet(pathClipboard, CONFIG_PATH)">
							<IconLucide-clipboard v-if="!pathClipboard.copied.value" class="size-3.5" />
							<IconLucide-check v-else class="size-3.5 text-primary" />
						</Button>
					</div>
				</li>

				<!-- Step 3 -->
				<li class="flex flex-col gap-1.5">
					<span class="font-medium text-foreground">3. Enable in Claude Code</span>
					<p class="text-xs">
						Add this to your Claude Code <code class="rounded bg-muted px-1">settings.json</code>:
					</p>
					<div class="flex items-center gap-2">
						<code class="flex-1 rounded-md border px-3 py-1.5 text-xs">{{ SETTINGS_SNIPPET }}</code>
						<Button
							variant="ghost"
							size="icon-sm"
							@click="copySnippet(settingsClipboard, SETTINGS_SNIPPET)"
						>
							<IconLucide-clipboard v-if="!settingsClipboard.copied.value" class="size-3.5" />
							<IconLucide-check v-else class="size-3.5 text-primary" />
						</Button>
					</div>
				</li>
			</ol>
		</section>
	</div>
</template>
