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
	<div class="flex flex-col gap-2.5">
		<!-- Column separator -->
		<div class="flex items-center gap-2">
			<Label class="text-xs w-14 shrink-0">Column</Label>
			<Input
				:model-value="separator?.column ?? ''"
				placeholder="  "
				class="h-7 w-20 text-xs font-mono"
				@update:model-value="updateColumn"
			/>
			<Button
				variant="ghost"
				size="icon"
				class="size-7 shrink-0"
				:class="separator?.column === undefined ? 'invisible' : ''"
				@click="resetColumn"
			>
				<IconLucide-rotate-ccw class="size-3 text-muted-foreground" />
			</Button>
		</div>

		<!-- Divider character -->
		<div class="flex items-center gap-2">
			<Label class="text-xs w-14 shrink-0">Divider</Label>
			<Input
				:model-value="separator?.divider ?? ''"
				:placeholder="dividerPlaceholder"
				class="h-7 w-20 text-xs font-mono"
				@update:model-value="updateDivider"
			/>
			<Button
				variant="ghost"
				size="icon"
				class="size-7 shrink-0"
				:class="separator?.divider === undefined ? 'invisible' : ''"
				@click="resetDivider"
			>
				<IconLucide-rotate-ccw class="size-3 text-muted-foreground" />
			</Button>
		</div>
	</div>
</template>
