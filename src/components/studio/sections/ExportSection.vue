<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
</script>

<template>
	<section class="flex flex-col gap-4">
		<Collapsible v-model:open="isOpen">
			<!-- Section Header -->
			<div class="flex items-center justify-between">
				<CollapsibleTrigger class="relative flex items-center text-left">
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
				<Button variant="outline" size="sm" @click="copyJson">
					<IconLucide-clipboard v-if="!jsonClipboard.copied.value" class="size-3.5" />
					<IconLucide-check v-else class="size-3.5 text-primary" />
					{{ jsonClipboard.copied.value ? 'Copied!' : 'Copy JSON' }}
				</Button>
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
									<code class="flex-1 rounded-md border px-3 py-1.5 text-xs">{{
										CONFIG_PATH
									}}</code>
									<Button
										variant="ghost"
										size="icon-sm"
										@click="copySnippet(pathClipboard, CONFIG_PATH)"
									>
										<IconLucide-clipboard v-if="!pathClipboard.copied.value" class="size-3.5" />
										<IconLucide-check v-else class="size-3.5 text-primary" />
									</Button>
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
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	</section>
</template>
