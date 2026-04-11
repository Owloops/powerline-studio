<script setup lang="ts">
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import {
	NumberField,
	NumberFieldContent,
	NumberFieldDecrement,
	NumberFieldIncrement,
	NumberFieldInput,
} from '@/components/ui/number-field'
import { Switch } from '@/components/ui/switch'
import StyleCard from '@/components/studio/StyleCard.vue'

type StyleValue = 'minimal' | 'powerline' | 'capsule' | 'tui'

const configStore = useConfigStore()
const editorStore = useEditorStore()

const styles: readonly { value: StyleValue; title: string; description: string }[] = [
	{
		value: 'minimal',
		title: 'Minimal',
		description: 'Clean, no separators',
	},
	{
		value: 'powerline',
		title: 'Powerline',
		description: 'Classic arrow separators',
	},
	{
		value: 'capsule',
		title: 'Capsule',
		description: 'Rounded pill segments',
	},
	{
		value: 'tui',
		title: 'TUI',
		description: 'Box-drawn grid panels',
	},
]
</script>

<template>
	<div class="flex flex-col gap-6 p-4">
		<div>
			<h2 class="text-sm font-medium">Style</h2>
			<p class="text-xs text-muted-foreground">Choose how your statusline looks</p>
		</div>

		<!-- Style Cards RadioGroup -->
		<RadioGroupRoot
			:model-value="configStore.config.display.style"
			class="grid grid-cols-2 gap-3"
			@update:model-value="configStore.setStyle($event as StyleValue)"
		>
			<RadioGroupItem v-for="s in styles" :key="s.value" :value="s.value" as-child>
				<StyleCard v-bind="s" />
			</RadioGroupItem>
		</RadioGroupRoot>

		<!-- TUI Info Alert -->
		<Alert v-if="configStore.isTuiStyle" variant="info">
			<IconLucide-info class="size-4" />
			<AlertTitle>TUI Layout</AlertTitle>
			<AlertDescription>
				TUI style uses a grid layout. Configure breakpoints, columns, and box styles in the
				<button
					class="inline font-medium underline underline-offset-3 hover:text-foreground"
					@click="editorStore.setActivePanel('tui')"
				>
					TUI Layout panel</button
				>.
			</AlertDescription>
		</Alert>

		<!-- Padding Stepper -->
		<div v-if="!configStore.isTuiStyle" class="flex flex-col gap-1.5">
			<NumberField
				id="padding"
				:model-value="configStore.config.display.padding"
				:min="0"
				:max="3"
				:step="1"
				@update:model-value="configStore.setPadding($event ?? 0)"
			>
				<Label for="padding">Padding</Label>
				<NumberFieldContent>
					<NumberFieldDecrement />
					<NumberFieldInput />
					<NumberFieldIncrement />
				</NumberFieldContent>
			</NumberField>
			<p class="text-xs text-muted-foreground">Spaces inside each segment</p>
		</div>

		<!-- Auto-Wrap Toggle -->
		<div v-if="!configStore.isTuiStyle" class="flex items-center justify-between gap-4">
			<div class="flex flex-col gap-0.5">
				<Label for="auto-wrap">Auto-wrap</Label>
				<p class="text-xs text-muted-foreground">
					Wrap segments to new lines when they exceed terminal width
				</p>
			</div>
			<Switch
				id="auto-wrap"
				:checked="configStore.config.display.autoWrap"
				@update:checked="configStore.setAutoWrap($event)"
			/>
		</div>
	</div>
</template>
