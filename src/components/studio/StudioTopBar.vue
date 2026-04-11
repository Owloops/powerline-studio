<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'

const { isDark, toggleDark } = useDarkMode()
</script>

<template>
	<header
		class="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-3"
	>
		<div class="flex items-center gap-2">
			<SidebarTrigger />
			<span class="text-sm font-semibold tracking-tight">Powerline Studio</span>
		</div>
		<Button variant="ghost" size="icon-sm" @click="toggleDark()">
			<IconLucide-sun v-if="isDark" class="size-4" />
			<IconLucide-moon v-else class="size-4" />
			<span class="sr-only">Toggle dark mode</span>
		</Button>
	</header>
</template>
