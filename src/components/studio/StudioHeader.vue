<script setup lang="ts">
import { Button, buttonVariants } from '@/components/ui/button'

const { isDark, toggleDark } = useDarkMode()
</script>

<template>
	<header class="border-b border-border bg-background px-4">
		<div class="mx-auto flex h-12 max-w-4xl items-center justify-between">
			<span class="text-sm font-semibold tracking-tight">Powerline Studio</span>

			<div class="flex items-center gap-1">
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
