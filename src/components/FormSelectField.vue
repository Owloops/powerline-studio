<script setup lang="ts">
import { type CustomFieldProps, useCustomField } from '@formwerk/core'

const props = defineProps<
	CustomFieldProps & {
		options: { label: string; value: string }[]
		placeholder?: string
	}
>()

const compact = inject('formCompact', false)

const {
	controlProps,
	labelProps,
	errorMessage,
	errorMessageProps,
	setValue,
	validate,
	isTouched,
	fieldValue,
} = useCustomField<string>(props)

function onValueChange(value: string) {
	setValue(value)
	validate()
}
</script>

<template>
	<div :class="compact ? 'flex items-center gap-2' : 'flex flex-col gap-1.5'">
		<label
			v-bind="labelProps"
			:class="
				compact
					? 'text-xs text-muted-foreground shrink-0 min-w-0 flex-[0_0_auto]'
					: 'text-sm font-medium text-foreground'
			"
		>
			{{ label }}
		</label>
		<Select v-bind="controlProps" :model-value="fieldValue" @update:model-value="onValueChange">
			<SelectTrigger
				:size="compact ? 'sm' : undefined"
				:class="compact ? 'h-7 text-xs flex-1 min-w-0' : ''"
			>
				<SelectValue :placeholder="placeholder ?? 'Select an option'" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem v-for="opt in options" :key="opt.value" :value="opt.value">
					{{ opt.label }}
				</SelectItem>
			</SelectContent>
		</Select>
		<p v-if="isTouched && errorMessage" v-bind="errorMessageProps" class="text-sm text-destructive">
			{{ errorMessage }}
		</p>
	</div>
</template>
