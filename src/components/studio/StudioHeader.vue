<script setup lang="ts">
import { Button } from '@/components/ui/button'

const { isDark, toggleDark } = useDarkMode()
const editorStore = useEditorStore()
</script>

<template>
	<header
		class="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4"
	>
		<span class="text-sm font-semibold tracking-tight">Powerline Studio</span>

		<div class="flex items-center gap-1">
			<Button
				variant="ghost"
				size="icon-sm"
				:class="editorStore.showPreviewControls ? 'text-foreground' : 'text-muted-foreground'"
				@click="editorStore.togglePreviewControls()"
			>
				<IconLucide-settings-2 class="size-4" />
				<span class="sr-only">Toggle preview controls</span>
			</Button>
			<Button variant="ghost" size="icon-sm" @click="toggleDark()">
				<IconLucide-sun v-if="isDark" class="size-4" />
				<IconLucide-moon v-else class="size-4" />
				<span class="sr-only">Toggle dark mode</span>
			</Button>
		</div>
	</header>
</template>
