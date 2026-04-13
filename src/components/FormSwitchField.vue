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
	<div :class="compact ? 'flex items-center gap-2' : 'flex flex-col gap-1.5'">
		<label v-if="compact" v-bind="labelProps" class="w-32 shrink-0 text-xs text-muted-foreground">
			{{ label }}
		</label>
		<template v-if="!compact">
			<div class="flex items-center gap-3">
				<Switch
					v-bind="controlProps"
					:model-value="fieldValue ?? false"
					@update:model-value="onCheckedChange"
				/>
				<label v-bind="labelProps" class="text-sm font-medium text-foreground">
					{{ label }}
				</label>
			</div>
		</template>
		<Switch
			v-if="compact"
			v-bind="controlProps"
			:model-value="fieldValue ?? false"
			@update:model-value="onCheckedChange"
		/>
		<p v-if="isTouched && errorMessage" v-bind="errorMessageProps" class="text-sm text-destructive">
			{{ errorMessage }}
		</p>
	</div>
</template>
