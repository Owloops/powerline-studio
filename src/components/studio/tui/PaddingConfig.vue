<script setup lang="ts">
import { Label } from '@/components/ui/label'
import {
	NumberField,
	NumberFieldContent,
	NumberFieldDecrement,
	NumberFieldIncrement,
	NumberFieldInput,
} from '@/components/ui/number-field'

const configStore = useConfigStore()

const padding = computed(() => configStore.config.display.tui?.padding?.horizontal)

function updatePadding(value: number | undefined) {
	configStore.setTuiPadding(value === undefined ? undefined : Math.max(0, Math.min(10, value)))
}
</script>

<template>
	<div class="flex items-center gap-2">
		<Label class="text-xs w-14 shrink-0">Horizontal</Label>
		<NumberField
			:model-value="padding"
			:min="0"
			:max="10"
			:step="1"
			@update:model-value="updatePadding"
		>
			<NumberFieldContent class="w-24 h-7">
				<NumberFieldDecrement />
				<NumberFieldInput class="tabular-nums" placeholder="0" />
				<NumberFieldIncrement />
			</NumberFieldContent>
		</NumberField>
	</div>
</template>
