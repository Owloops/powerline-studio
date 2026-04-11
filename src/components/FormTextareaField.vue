<script setup lang="ts">
import { type TextFieldProps, useTextField } from '@formwerk/core'
import { cn } from '@/lib/utils'

const props = defineProps<TextFieldProps & { rows?: number }>()

const { inputProps, labelProps, errorMessage, errorMessageProps, descriptionProps, isTouched } =
	useTextField({ ...props, multiline: true })

const hasError = computed(() => isTouched.value && !!errorMessage.value)
</script>

<template>
	<div class="flex flex-col gap-1.5">
		<label v-bind="labelProps" class="text-sm font-medium text-foreground">
			{{ label }}
		</label>
		<textarea
			v-bind="inputProps"
			:rows="rows ?? 3"
			:class="
				cn(
					'flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors field-sizing-content placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
					hasError &&
						'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
				)
			"
		/>
		<p v-if="description" v-bind="descriptionProps" class="text-sm text-muted-foreground">
			{{ description }}
		</p>
		<p v-if="isTouched && errorMessage" v-bind="errorMessageProps" class="text-sm text-destructive">
			{{ errorMessage }}
		</p>
	</div>
</template>
