<script setup lang="ts">
import { useForm } from '@formwerk/core'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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

const hasBudget = computed(() => {
	const budget = configStore.config.budget as
		| Record<string, Record<string, unknown> | undefined>
		| undefined
	const item = budget?.[props.budgetKey]
	return item && (item.amount as number) > 0
})

const isOpen = ref(false)

const { values } = useForm({
	schema: budgetItemSchema,
	initialValues: budgetConfig.value,
})

const amountStep = computed(() => (values.type === 'tokens' ? 1 : 0.01))

watch(
	values,
	(newValues) => {
		configStore.setBudget(`${props.budgetKey}.amount`, newValues.amount)
		configStore.setBudget(`${props.budgetKey}.warningThreshold`, newValues.warningThreshold)
		if (!configStore.config.budget) {
			configStore.config.budget = {} as Record<string, unknown>
		}
		const budget = configStore.config.budget as Record<string, Record<string, unknown> | undefined>
		if (!budget[props.budgetKey]) {
			budget[props.budgetKey] = {}
		}
		budget[props.budgetKey]!.type = newValues.type
	},
	{ deep: true },
)
</script>

<template>
	<Collapsible v-model:open="isOpen" class="border-t border-border pt-2">
		<CollapsibleTrigger
			class="flex w-full items-center justify-between rounded-md px-1 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-accent/50"
		>
			<span>Budget Alert</span>
			<IconLucide-chevron-down
				class="size-3.5 transition-transform duration-200"
				:class="isOpen ? 'rotate-180' : ''"
			/>
		</CollapsibleTrigger>
		<CollapsibleContent>
			<div class="space-y-2 pt-2">
				<FormSelectField name="type" label="Budget Type" :options="BUDGET_TYPE_OPTIONS" />
				<FormNumberField name="amount" label="Amount" :min="0" :step="amountStep" />
				<FormNumberField
					name="warningThreshold"
					label="Warning Threshold"
					description="Percentage (0-100) at which to show a warning"
					:min="0"
					:max="100"
					:step="1"
				/>
			</div>
		</CollapsibleContent>
	</Collapsible>
</template>
