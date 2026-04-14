<script setup lang="ts">
import { Button, buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const { isDark, toggleDark } = useDarkMode()
</script>

<template>
	<header class="border-b border-border bg-background px-4">
		<div class="mx-auto flex h-12 max-w-4xl items-center justify-between">
			<h1 class="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
				<img src="/favicon.svg" alt="" class="size-5" />
				Powerline Studio
			</h1>

			<div class="flex items-center gap-1">
				<Popover>
					<PopoverTrigger as-child>
						<Button variant="ghost" size="icon-sm">
							<IconLucide-circle-help class="size-4" />
							<span class="sr-only">About</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end" class="w-72 text-sm">
						<p class="font-semibold">Powerline Studio</p>
						<p class="mt-1 text-muted-foreground">
							A visual config editor for
							<a
								href="https://github.com/Owloops/claude-powerline"
								target="_blank"
								rel="noopener noreferrer"
								class="font-medium text-foreground underline underline-offset-4 hover:text-primary"
								>Claude Powerline</a
							>
							&mdash; a vim-style powerline statusline for
							<a
								href="https://code.claude.com/docs/en/overview"
								target="_blank"
								rel="noopener noreferrer"
								class="font-medium text-foreground underline underline-offset-4 hover:text-primary"
								>Claude Code</a
							>
							with real-time usage tracking, git integration, and custom themes.
						</p>
					</PopoverContent>
				</Popover>
				<a
					href="https://github.com/Owloops/claude-powerline"
					target="_blank"
					rel="noopener noreferrer"
					:class="buttonVariants({ variant: 'ghost', size: 'icon-sm' })"
				>
					<IconLucide-github class="size-4" />
					<span class="sr-only">claude-powerline on GitHub</span>
				</a>
				<Button variant="ghost" size="icon-sm" @click="toggleDark()">
					<IconLucide-sun v-if="isDark" class="size-4" />
					<IconLucide-moon v-else class="size-4" />
					<span class="sr-only">Toggle dark mode</span>
				</Button>
			</div>
		</div>
	</header>
</template>
