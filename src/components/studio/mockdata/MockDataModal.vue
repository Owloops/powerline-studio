<script setup lang="ts">
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import MockDataSections from './MockDataSections.vue'

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
	<Dialog v-model:open="open">
		<DialogContent class="max-h-[85svh] overflow-hidden sm:max-w-lg">
			<DialogHeader>
				<DialogTitle>Mock Data</DialogTitle>
				<DialogDescription> Simulate Claude Code hook data for the live preview </DialogDescription>
			</DialogHeader>
			<ScrollArea class="max-h-[calc(85svh-6rem)] pr-3">
				<MockDataSections />
			</ScrollArea>
		</DialogContent>
	</Dialog>
</template>
