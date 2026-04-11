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
	<div class="flex flex-col gap-1.5">
		<Label class="text-xs">Horizontal padding</Label>
		<NumberField
			:model-value="padding"
			:min="0"
			:max="10"
			:step="1"
			@update:model-value="updatePadding"
		>
			<NumberFieldContent class="max-w-32">
				<NumberFieldDecrement />
				<NumberFieldInput placeholder="0" />
				<NumberFieldIncrement />
			</NumberFieldContent>
		</NumberField>
	</div>
</template>
