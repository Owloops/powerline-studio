<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BOX_PRESETS, BOX_CHARS } from '@owloops/claude-powerline/browser'

const configStore = useConfigStore()

const separator = computed(() => configStore.config.display.tui?.separator)

// Dynamic divider placeholder based on current box selection
const dividerPlaceholder = computed(() => {
	const box = configStore.config.display.tui?.box
	if (typeof box === 'string' && BOX_PRESETS[box]) {
		return BOX_PRESETS[box].horizontal
	}
	return BOX_CHARS.horizontal
})

function updateColumn(value: string | number) {
	configStore.setTuiSeparator({ column: String(value) })
}

function updateDivider(value: string | number) {
	configStore.setTuiSeparator({ divider: String(value) })
}

function resetColumn() {
	configStore.setTuiSeparator({ column: undefined })
}

function resetDivider() {
	configStore.setTuiSeparator({ divider: undefined })
}
</script>

<template>
	<div class="grid grid-cols-2 gap-3">
		<!-- Column separator -->
		<div class="flex flex-col gap-1.5">
			<div class="flex items-center justify-between">
				<Label class="text-xs">Column</Label>
				<Button
					v-if="separator?.column !== undefined"
					variant="ghost"
					size="sm"
					class="h-6 px-1.5 text-[10px] text-muted-foreground"
					@click="resetColumn"
				>
					<IconLucide-rotate-ccw class="size-3" />
				</Button>
			</div>
			<Input
				:model-value="separator?.column ?? ''"
				placeholder="  "
				class="h-8 text-xs font-mono"
				@update:model-value="updateColumn"
			/>
			<span class="text-[10px] text-muted-foreground">Default: two spaces</span>
		</div>

		<!-- Divider character -->
		<div class="flex flex-col gap-1.5">
			<div class="flex items-center justify-between">
				<Label class="text-xs">Divider</Label>
				<Button
					v-if="separator?.divider !== undefined"
					variant="ghost"
					size="sm"
					class="h-6 px-1.5 text-[10px] text-muted-foreground"
					@click="resetDivider"
				>
					<IconLucide-rotate-ccw class="size-3" />
				</Button>
			</div>
			<Input
				:model-value="separator?.divider ?? ''"
				:placeholder="dividerPlaceholder"
				class="h-8 text-xs font-mono"
				@update:model-value="updateDivider"
			/>
			<span class="text-[10px] text-muted-foreground">Default: box horizontal char</span>
		</div>
	</div>
</template>
