<script setup lang="ts">
import { type NumberFieldProps, useNumberField } from '@formwerk/core'
import { cn } from '@/lib/utils'

const props = defineProps<NumberFieldProps>()

const compact = inject('formCompact', false)

const { inputProps, labelProps, errorMessage, errorMessageProps, descriptionProps, isTouched } =
	useNumberField(props)

const hasError = computed(() => isTouched.value && !!errorMessage.value)
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
		<input
			v-bind="inputProps"
			:class="
				cn(
					compact
						? 'flex h-7 w-full rounded-md border border-input bg-transparent px-2 py-0.5 text-xs shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 flex-1 min-w-0'
						: 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
					hasError &&
						'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
				)
			"
		/>
		<p
			v-if="description && !compact"
			v-bind="descriptionProps"
			class="text-sm text-muted-foreground"
		>
			{{ description }}
		</p>
		<p v-if="isTouched && errorMessage" v-bind="errorMessageProps" class="text-sm text-destructive">
			{{ errorMessage }}
		</p>
	</div>
</template>
