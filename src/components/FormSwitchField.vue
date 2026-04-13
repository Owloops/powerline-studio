<script setup lang="ts">
import { type CustomFieldProps, useCustomField } from '@formwerk/core'

const props = defineProps<CustomFieldProps>()

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
} = useCustomField<boolean>(props)

function onCheckedChange(checked: boolean) {
	setValue(checked)
	validate()
}
</script>

<template>
	<div class="flex flex-col gap-1.5">
		<div class="flex items-center" :class="compact ? 'justify-between gap-2' : 'gap-3'">
			<label
				v-if="compact"
				v-bind="labelProps"
				:class="compact ? 'text-xs text-muted-foreground' : 'text-sm font-medium text-foreground'"
			>
				{{ label }}
			</label>
			<Switch
				v-bind="controlProps"
				:model-value="fieldValue ?? false"
				@update:model-value="onCheckedChange"
			/>
			<label v-if="!compact" v-bind="labelProps" class="text-sm font-medium text-foreground">
				{{ label }}
			</label>
		</div>
		<p v-if="isTouched && errorMessage" v-bind="errorMessageProps" class="text-sm text-destructive">
			{{ errorMessage }}
		</p>
	</div>
</template>
