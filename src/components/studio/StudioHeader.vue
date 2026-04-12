<script setup lang="ts">
import { Button } from '@/components/ui/button'

const { isDark, toggleDark } = useDarkMode()
</script>

<template>
	<header class="border-b border-border bg-background px-4">
		<div class="mx-auto flex h-12 max-w-4xl items-center justify-between">
			<span class="text-sm font-semibold tracking-tight">Powerline Studio</span>

			<div class="flex items-center gap-1">
				<Button variant="ghost" size="icon-sm" @click="toggleDark()">
					<IconLucide-sun v-if="isDark" class="size-4" />
					<IconLucide-moon v-else class="size-4" />
					<span class="sr-only">Toggle dark mode</span>
				</Button>
			</div>
		</div>
	</header>
</template>
