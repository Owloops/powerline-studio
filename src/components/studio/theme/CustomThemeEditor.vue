<script setup lang="ts">
import type { ColorTheme, SegmentColor } from '@owloops/claude-powerline/browser'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import ColorPairRow from './ColorPairRow.vue'
import ColorPairHeader from './ColorPairHeader.vue'
import { SEGMENT_KEYS, SEGMENT_LABELS } from '@/lib/themes'

const props = defineProps<{
	colors: ColorTheme
}>()

const emit = defineEmits<{
	'update:colors': [colors: ColorTheme]
	'save:theme': [name: string]
	cancel: []
}>()

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
}
</script>

<template>
	<div class="flex flex-col gap-3">
		<Separator />
		<div>
			<h3 class="text-sm font-medium">Custom Theme</h3>
			<p class="text-xs text-muted-foreground">Edit all segment colors</p>
		</div>

		<div class="grid grid-cols-[120px_1fr_1fr_1fr_auto] items-center gap-2">
			<input
				v-model="themeName"
				class="col-span-2 h-8 rounded-md border border-border bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
				placeholder="Theme name..."
				@keydown.enter="handleSave"
			/>
			<div class="flex gap-1.5">
				<Button size="sm" class="flex-1 gap-1.5" :disabled="!themeName.trim()" @click="handleSave">
					<IconLucide-save class="size-3.5" />
					Save
				</Button>
				<Button variant="outline" size="sm" @click="$emit('cancel')"> Cancel </Button>
			</div>
			<div class="size-6" />
		</div>

		<div class="flex flex-col gap-2 pt-1">
			<ColorPairHeader />
			<ColorPairRow
				v-for="(key, i) in SEGMENT_KEYS"
				:key="key"
				:label="SEGMENT_LABELS[key]"
				:bg="colors[key].bg"
				:fg="colors[key].fg"
				:index="i"
				@update:bg="updateBg(key, $event)"
				@update:fg="updateFg(key, $event)"
			/>
		</div>
	</div>
</template>
