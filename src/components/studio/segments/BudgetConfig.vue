<script setup lang="ts">
import { useForm } from '@formwerk/core'
import FormNumberField from '@/components/FormNumberField.vue'
import FormSelectField from '@/components/FormSelectField.vue'
import { budgetItemSchema } from './schemas'
import { BUDGET_TYPE_OPTIONS } from './options'

const props = defineProps<{
	budgetKey: 'session' | 'today' | 'block'
}>()

const configStore = useConfigStore()

const budgetConfig = computed(() => {
	const budget = configStore.config.budget as
		| Record<string, Record<string, unknown> | undefined>
		| undefined
	const item = budget?.[props.budgetKey]
	return {
		amount: (item?.amount as number) ?? 0,
		warningThreshold: (item?.warningThreshold as number) ?? 80,
		type: (item?.type as 'cost' | 'tokens') ?? 'cost',
	}
})

const { values } = useForm({
	schema: budgetItemSchema,
	initialValues: budgetConfig.value,
})

watch(
	values,
	(newValues) => {
		configStore.setBudget(`${props.budgetKey}.amount`, newValues.amount)
		configStore.setBudget(`${props.budgetKey}.warningThreshold`, newValues.warningThreshold)
		// setBudget only sets numbers; for 'type' we need to write directly
		if (!configStore.config.budget) {
			configStore.config.budget = {} as Record<string, unknown>
		}
		const budget = configStore.config.budget as Record<
			string,
			Record<string, unknown> | undefined
		>
		if (!budget[props.budgetKey]) {
			budget[props.budgetKey] = {}
		}
		budget[props.budgetKey]!.type = newValues.type
	},
	{ deep: true },
)
</script>

<template>
	<div class="space-y-3 border-t border-border pt-3">
		<h4 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Budget</h4>
		<FormSelectField name="type" label="Budget Type" :options="BUDGET_TYPE_OPTIONS" />
		<FormNumberField name="amount" label="Amount" :min="0" :step="0.01" />
		<FormNumberField
			name="warningThreshold"
			label="Warning Threshold"
			description="Percentage (0-100) at which to show a warning"
			:min="0"
			:max="100"
			:step="1"
		/>
	</div>
</template>
