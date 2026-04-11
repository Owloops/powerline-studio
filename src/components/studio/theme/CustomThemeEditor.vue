<script setup lang="ts">
import type { ColorTheme, SegmentColor } from '@owloops/claude-powerline/browser'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import ColorPairRow from './ColorPairRow.vue'
import { SEGMENT_KEYS, SEGMENT_LABELS } from '@/lib/themes'

const props = defineProps<{
	colors: ColorTheme
}>()

const emit = defineEmits<{
	'update:colors': [colors: ColorTheme]
	'save:theme': [name: string]
}>()

const showSaveInput = ref(false)
const themeName = ref('')

function updateBg(segment: keyof ColorTheme, bg: string) {
	const updated = { ...props.colors }
	updated[segment] = { ...updated[segment], bg }
	emit('update:colors', updated)
}

function updateFg(segment: keyof ColorTheme, fg: string) {
	const updated = { ...props.colors }
	updated[segment] = { ...updated[segment], fg }
	emit('update:colors', updated)
}

function handleSave() {
	const name = themeName.value.trim()
	if (!name) return
	emit('save:theme', name)
	themeName.value = ''
	showSaveInput.value = false
}
</script>

<template>
	<div class="custom-editor flex flex-col gap-3">
		<Separator />
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-sm font-medium">Custom Theme</h3>
				<p class="text-xs text-muted-foreground">Edit all segment colors</p>
			</div>
			<Button v-if="!showSaveInput" variant="outline" size="sm" @click="showSaveInput = true">
				<IconLucide-save class="mr-1.5 size-3.5" />
				Save
			</Button>
		</div>

		<!-- Save input -->
		<div v-if="showSaveInput" class="flex items-center gap-2">
			<input
				v-model="themeName"
				class="h-8 flex-1 rounded-md border border-border bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
				placeholder="Theme name..."
				@keydown.enter="handleSave"
			/>
			<Button size="sm" :disabled="!themeName.trim()" @click="handleSave"> Save </Button>
			<Button variant="ghost" size="sm" @click="showSaveInput = false"> Cancel </Button>
		</div>

		<div class="flex flex-col gap-2">
			<ColorPairRow
				v-for="key in SEGMENT_KEYS"
				:key="key"
				:label="SEGMENT_LABELS[key]"
				:bg="colors[key].bg"
				:fg="colors[key].fg"
				@update:bg="updateBg(key, $event)"
				@update:fg="updateFg(key, $event)"
			/>
		</div>
	</div>
</template>

<style scoped>
.custom-editor {
	animation: fadeRise 250ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes fadeRise {
	from {
		opacity: 0;
		transform: translateY(8px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@media (prefers-reduced-motion: reduce) {
	.custom-editor {
		animation: none;
	}
}
</style>
