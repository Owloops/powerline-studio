<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{
	title: string
	description: string
	icon?: string
	enabled?: boolean
	/** Whether to show the enable/disable toggle in the header */
	toggleable?: boolean
}>()

const emit = defineEmits<{
	'update:enabled': [value: boolean]
}>()

const isOpen = ref(false)

const toggleEnabled = (v: boolean) => {
	emit('update:enabled', v)
	// Auto-expand when enabling
	if (v && !isOpen.value) {
		isOpen.value = true
	}
}
</script>

<template>
	<Collapsible v-model:open="isOpen">
		<div :class="cn('rounded-lg border', enabled === false && 'opacity-60')">
			<!-- Header -->
			<div class="flex items-center gap-3 px-3 py-2.5">
				<CollapsibleTrigger
					class="flex flex-1 items-center gap-2.5 text-left hover:text-foreground"
				>
					<IconLucide-chevron-right
						class="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200"
						:class="isOpen && 'rotate-90'"
					/>
					<slot name="icon" />
					<div class="flex flex-col gap-0">
						<span class="text-xs font-medium leading-tight">{{ title }}</span>
						<span class="text-[11px] leading-tight text-muted-foreground">{{ description }}</span>
					</div>
				</CollapsibleTrigger>
				<Switch
					v-if="toggleable"
					:model-value="enabled"
					class="shrink-0"
					@update:model-value="toggleEnabled"
				/>
			</div>

			<!-- Content -->
			<CollapsibleContent>
				<div v-if="enabled !== false" class="border-t px-3 py-3">
					<slot />
				</div>
				<div v-else class="border-t px-3 py-2.5">
					<p class="text-[11px] text-muted-foreground italic">
						Enable to configure mock values for this section
					</p>
				</div>
			</CollapsibleContent>
		</div>
	</Collapsible>
</template>
