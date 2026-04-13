<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

withDefaults(
	defineProps<{
		action?: string
		disabled?: boolean
	}>(),
	{
		action: 'Delete',
	},
)

const emit = defineEmits<{
	confirm: []
}>()

const open = ref(false)

function handleConfirm() {
	open.value = false
	emit('confirm')
}
</script>

<template>
	<Popover v-model:open="open">
		<PopoverTrigger as-child :disabled="disabled">
			<slot />
		</PopoverTrigger>
		<PopoverContent class="w-auto p-3" align="center" @open-auto-focus.prevent>
			<div class="flex flex-col gap-2">
				<p class="text-xs text-muted-foreground">Are you sure?</p>
				<div class="flex items-center justify-end gap-2">
					<Button variant="outline" size="sm" class="h-7 text-xs" @click="open = false">
						Cancel
					</Button>
					<Button variant="destructive" size="sm" class="h-7 text-xs" @click="handleConfirm">
						{{ action }}
					</Button>
				</div>
			</div>
		</PopoverContent>
	</Popover>
</template>
