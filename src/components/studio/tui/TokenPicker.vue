<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

defineProps<{
	tokens: string[]
}>()

const emit = defineEmits<{
	select: [token: string]
}>()

const open = shallowRef(false)

// Group tokens by base segment name for display
function groupTokens(tokens: string[]) {
	const groups = new Map<string, string[]>()
	for (const token of tokens) {
		const dotIdx = token.indexOf('.')
		const group = dotIdx > 0 ? token.slice(0, dotIdx) : ''
		if (!groups.has(group)) groups.set(group, [])
		groups.get(group)!.push(token)
	}
	return groups
}

function handleSelect(token: string) {
	emit('select', token)
	open.value = false
}

function wrapToken(token: string) {
	return '{' + token + '}'
}
</script>

<template>
	<Popover v-model:open="open">
		<PopoverTrigger as-child>
			<Button variant="ghost" size="sm" class="h-7 px-2 text-xs gap-1">
				<IconLucide-braces class="size-3" />
				Insert token
			</Button>
		</PopoverTrigger>
		<PopoverContent class="w-80 max-h-64 overflow-y-auto p-3" align="start">
			<div class="text-xs font-medium text-muted-foreground pb-2">Available tokens</div>
			<template v-for="[group, groupTokens] in groupTokens(tokens)" :key="group">
				<div v-if="group" class="text-xs text-muted-foreground pt-2 pb-1">{{ group }}</div>
				<div class="flex flex-wrap gap-1">
					<Badge
						v-for="token in groupTokens"
						:key="token"
						role="button"
						tabindex="0"
						variant="secondary"
						class="cursor-pointer hover:bg-primary/10 text-xs"
						@click="handleSelect(token)"
						@keydown.enter="handleSelect(token)"
						@keydown.space.prevent="handleSelect(token)"
					>
						{{ wrapToken(token) }}
					</Badge>
				</div>
			</template>
		</PopoverContent>
	</Popover>
</template>
