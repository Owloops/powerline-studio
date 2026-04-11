<script setup lang="ts">
import { type CustomFieldProps, useCustomField } from '@formwerk/core'

const props = defineProps<
	CustomFieldProps & {
		options: { label: string; value: string }[]
		placeholder?: string
	}
>()

const { controlProps, labelProps, errorMessage, errorMessageProps, setValue, validate, isTouched } =
	useCustomField<string>(props)

function onValueChange(value: string) {
	setValue(value)
	validate()
}
</script>

<template>
	<div class="flex flex-col gap-1.5">
		<label v-bind="labelProps" class="text-sm font-medium text-foreground">
			{{ label }}
		</label>
		<Select v-bind="controlProps" @update:model-value="onValueChange">
			<SelectTrigger>
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
