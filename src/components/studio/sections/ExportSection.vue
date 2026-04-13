<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button, CopyButton } from '@/components/ui/button'
import { useShikiHighlighter } from '@/composables/useShikiHighlighter'

defineProps<{ step?: number }>()

const configStore = useConfigStore()

const isOpen = ref(true)

const { html, isLoading } = useShikiHighlighter(() => configStore.configJson)

const INSTALL_COMMAND = 'npm install -g @owloops/claude-powerline'
const CONFIG_PATH = '~/.claude/claude-powerline.json'
const SETTINGS_SNIPPET = '"statusLine": { "command": "claude-powerline" }'

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

function downloadJson() {
	const blob = new Blob([configStore.configJson], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = 'claude-powerline.json'
	a.click()
	URL.revokeObjectURL(url)
	toast.success('Downloaded claude-powerline.json')
}
</script>

<template>
	<section class="flex flex-col gap-4">
		<Collapsible v-model:open="isOpen">
			<!-- Section Header -->
			<div class="flex items-center justify-between">
				<CollapsibleTrigger
					class="relative flex cursor-pointer items-center rounded-md px-1 py-0.5 -ml-1 text-left transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
				>
					<span
						v-if="step"
						class="absolute -left-18 top-0.5 flex size-8 items-center justify-center rounded-full border border-muted-foreground/15 text-xs font-semibold tabular-nums text-muted-foreground/25"
						>{{ step }}</span
					>
					<IconLucide-chevron-right
						class="absolute -left-7 top-2 size-4 text-muted-foreground transition-transform duration-200"
						:class="isOpen && 'rotate-90'"
					/>
					<div>
						<h2 class="text-sm font-semibold">Export</h2>
						<p class="text-xs text-muted-foreground">
							Copy your config JSON and installation instructions
						</p>
					</div>
				</CollapsibleTrigger>
				<div class="flex items-center gap-2">
					<CopyButton
						variant="outline"
						size="sm"
						:icon-only="false"
						:copied="jsonClipboard.copied.value"
						label="Copy JSON"
						@click="copyJson"
					/>
					<span class="text-xs text-muted-foreground">or</span>
					<Button variant="outline" size="sm" @click="downloadJson">
						<IconLucide-download class="size-3.5" />
						Download
					</Button>
				</div>
			</div>

			<CollapsibleContent>
				<div class="grid grid-cols-1 gap-6 pt-4 xl:grid-cols-2">
					<!-- Your Config -->
					<div class="flex flex-col gap-3">
						<h3 class="text-xs font-medium text-muted-foreground">Your Config</h3>
						<div
							v-if="!isLoading"
							v-html="html"
							class="max-h-64 overflow-auto rounded-lg border bg-card p-4 text-sm [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:text-xs"
						/>
						<pre
							v-else
							class="max-h-64 overflow-auto rounded-lg border bg-card p-4 text-xs text-muted-foreground"
							>{{ configStore.configJson }}</pre
						>
					</div>

					<!-- Installation -->
					<div class="flex flex-col gap-3">
						<h3 class="text-xs font-medium text-muted-foreground">Installation</h3>

						<ol role="list" class="flex flex-col gap-4 text-sm text-muted-foreground">
							<!-- Step 1 -->
							<li class="flex flex-col gap-1.5">
								<span class="font-medium text-foreground">1. Install the package</span>
								<div class="flex items-center gap-2">
									<code class="flex-1 rounded-md border px-3 py-1.5 text-xs">{{
										INSTALL_COMMAND
									}}</code>
									<CopyButton
										:copied="installClipboard.copied.value"
										@click="copySnippet(installClipboard, INSTALL_COMMAND)"
									/>
								</div>
							</li>

							<!-- Step 2 -->
							<li class="flex flex-col gap-1.5">
								<span class="font-medium text-foreground">2. Save config to file</span>
								<p class="text-xs">Copy the JSON and save it to:</p>
								<div class="flex items-center gap-2">
									<code class="flex-1 rounded-md border px-3 py-1.5 text-xs">{{
										CONFIG_PATH
									}}</code>
									<CopyButton
										:copied="pathClipboard.copied.value"
										@click="copySnippet(pathClipboard, CONFIG_PATH)"
									/>
								</div>
							</li>

							<!-- Step 3 -->
							<li class="flex flex-col gap-1.5">
								<span class="font-medium text-foreground">3. Enable in Claude Code</span>
								<p class="text-xs">
									Add this to your Claude Code
									<code class="rounded bg-muted px-1">settings.json</code>:
								</p>
								<div class="flex items-center gap-2">
									<code class="flex-1 rounded-md border px-3 py-1.5 text-xs">{{
										SETTINGS_SNIPPET
									}}</code>
									<CopyButton
										:copied="settingsClipboard.copied.value"
										@click="copySnippet(settingsClipboard, SETTINGS_SNIPPET)"
									/>
								</div>
							</li>
						</ol>
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
		<Separator v-show="isOpen" />
	</section>
</template>
