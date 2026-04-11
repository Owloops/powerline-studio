<script setup lang="ts">
import { type CustomFieldProps, useCustomField } from '@formwerk/core'

const props = defineProps<CustomFieldProps & { description?: string }>()

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
		<div class="flex gap-3">
			<div class="flex h-6 shrink-0 items-center">
				<Checkbox
					v-bind="controlProps"
					:checked="fieldValue ?? false"
					@update:checked="onCheckedChange"
				/>
			</div>
			<div class="text-sm leading-6">
				<label v-bind="labelProps" class="font-medium text-foreground">{{ label }}</label>
				<p v-if="description" class="text-muted-foreground">{{ description }}</p>
			</div>
		</div>
		<p v-if="isTouched && errorMessage" v-bind="errorMessageProps" class="text-sm text-destructive">
			{{ errorMessage }}
		</p>
	</div>
</template>
