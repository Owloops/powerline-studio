<script setup lang="ts">
import { useForm } from '@formwerk/core'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import FormNumberField from '@/components/FormNumberField.vue'
import FormSelectField from '@/components/FormSelectField.vue'
import { budgetItemSchema } from './schemas'
import { BUDGET_TYPE_OPTIONS } from './options'

const props = defineProps<{
	budgetKey: 'session' | 'today' | 'block'
}>()

const configStore = useConfigStore()

const budgetItem = computed(() => {
	const budget = configStore.config.budget as
		| Record<string, Record<string, unknown> | undefined>
		| undefined
	return budget?.[props.budgetKey]
})

const showPercentage = computed(
	() => (budgetItem.value?.showPercentage as boolean | undefined) ?? true,
)
const showValue = computed(() => (budgetItem.value?.showValue as boolean | undefined) ?? true)

const isOpen = ref(false)

const { values } = useForm({
	schema: budgetItemSchema,
	initialValues: {
		amount: (budgetItem.value?.amount as number) ?? 0,
		warningThreshold: (budgetItem.value?.warningThreshold as number) ?? 80,
		type: (budgetItem.value?.type as 'cost' | 'tokens') ?? 'cost',
	},
})

const amountStep = computed(() => (values.type === 'tokens' ? 1 : 0.01))

const isBlock = computed(() => props.budgetKey === 'block')

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

function setShowPercentage(next: boolean) {
	if (isBlock.value) return
	configStore.setBudget(`${props.budgetKey}.showPercentage`, next)
}

function setShowValue(next: boolean) {
	if (isBlock.value) return
	configStore.setBudget(`${props.budgetKey}.showValue`, next)
}

const blockTooltip =
	'Block does not render a budget suffix today. These flags are accepted for config symmetry only.'
const percentageTooltip =
	'Hide the N% suffix while keeping the budget configured (e.g. for warning thresholds).'
const valueTooltip = 'Hide the base cost/token value, render only the percentage (e.g. ◱ 15%).'
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
				<TooltipProvider :delay-duration="200">
					<div class="flex items-center gap-2">
						<div class="flex w-32 shrink-0 items-center gap-1">
							<Label :for="`${budgetKey}-show-percentage`" class="text-xs text-muted-foreground">
								Show Percentage
							</Label>
							<Tooltip>
								<TooltipTrigger as-child>
									<button
										type="button"
										class="inline-flex cursor-default rounded-sm outline-none focus-visible:outline-0 focus-visible:ring-[3px] focus-visible:ring-primary/50"
										aria-label="More info"
									>
										<IconLucide-info class="size-3 text-muted-foreground/50" />
									</button>
								</TooltipTrigger>
								<TooltipContent side="top" class="max-w-64 text-xs">
									{{ isBlock ? blockTooltip : percentageTooltip }}
								</TooltipContent>
							</Tooltip>
						</div>
						<Switch
							:id="`${budgetKey}-show-percentage`"
							:model-value="showPercentage"
							:disabled="isBlock"
							@update:model-value="setShowPercentage"
						/>
					</div>
					<div class="flex items-center gap-2">
						<div class="flex w-32 shrink-0 items-center gap-1">
							<Label :for="`${budgetKey}-show-value`" class="text-xs text-muted-foreground">
								Show Value
							</Label>
							<Tooltip>
								<TooltipTrigger as-child>
									<button
										type="button"
										class="inline-flex cursor-default rounded-sm outline-none focus-visible:outline-0 focus-visible:ring-[3px] focus-visible:ring-primary/50"
										aria-label="More info"
									>
										<IconLucide-info class="size-3 text-muted-foreground/50" />
									</button>
								</TooltipTrigger>
								<TooltipContent side="top" class="max-w-64 text-xs">
									{{ isBlock ? blockTooltip : valueTooltip }}
								</TooltipContent>
							</Tooltip>
						</div>
						<Switch
							:id="`${budgetKey}-show-value`"
							:model-value="showValue"
							:disabled="isBlock"
							@update:model-value="setShowValue"
						/>
					</div>
				</TooltipProvider>
			</div>
		</CollapsibleContent>
	</Collapsible>
</template>
