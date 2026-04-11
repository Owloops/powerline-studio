<script setup lang="ts">
import { type CustomFieldProps, useCustomField } from '@formwerk/core'

const props = defineProps<CustomFieldProps>()

const {
	controlProps,
	labelProps,
	errorMessage,
	errorMessageProps,
	setValue,
	validate,
	isTouched,
	fieldValue,
} = useCustomField<boolean>(props)

function onCheckedChange(checked: boolean) {
	setValue(checked)
	validate()
}
</script>

<template>
	<div class="flex flex-col gap-1">
		<div class="flex items-center gap-3">
			<Switch
				v-bind="controlProps"
				:checked="fieldValue ?? false"
				@update:checked="onCheckedChange"
			/>
			<label v-bind="labelProps" class="text-sm font-medium text-foreground">{{ label }}</label>
		</div>
		<p v-if="isTouched && errorMessage" v-bind="errorMessageProps" class="text-sm text-destructive">
			{{ errorMessage }}
		</p>
	</div>
</template>
