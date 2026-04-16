<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	NumberField,
	NumberFieldContent,
	NumberFieldDecrement,
	NumberFieldIncrement,
	NumberFieldInput,
} from '@/components/ui/number-field'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SEGMENT_PARTS } from '@owloops/claude-powerline/browser'
import type { SegmentName, SegmentTemplate, JustifyValue } from '@owloops/claude-powerline/browser'

const props = defineProps<{
	segRef: string
	template: SegmentTemplate
}>()

const emit = defineEmits<{
	'update:template': [template: SegmentTemplate]
	reset: []
}>()

const addPopoverOpen = shallowRef(false)
const literalDraft = shallowRef('')

// Get the base segment name for token lookup
const baseSegment = computed(() => {
	const dotIdx = props.segRef.indexOf('.')
	return dotIdx > 0 ? props.segRef.slice(0, dotIdx) : props.segRef
})

// Available tokens for this segment
const availableTokens = computed(() => {
	return SEGMENT_PARTS[baseSegment.value as SegmentName] ?? []
})

function updateItems(items: string[]) {
	emit('update:template', { ...props.template, items })
}

function updateGap(gap: number | undefined) {
	const updated = { ...props.template }
	if (gap === undefined || gap === 1) {
		delete updated.gap
	} else {
		updated.gap = Math.max(0, gap)
	}
	emit('update:template', updated)
}

function updateJustify(justify: string) {
	const updated = { ...props.template }
	if (justify === 'start') {
		delete updated.justify
	} else {
		updated.justify = justify as JustifyValue
	}
	emit('update:template', updated)
}

function removeItem(index: number) {
	const items = [...props.template.items]
	items.splice(index, 1)
	updateItems(items)
}

function moveItem(index: number, direction: -1 | 1) {
	const items = [...props.template.items]
	const targetIndex = index + direction
	if (targetIndex < 0 || targetIndex >= items.length) return
	const temp = items[index]!
	items[index] = items[targetIndex]!
	items[targetIndex] = temp
	updateItems(items)
}

function addToken(token: string) {
	const items = [...props.template.items, `{${token}}`]
	updateItems(items)
	addPopoverOpen.value = false
}

function addLiteral() {
	if (!literalDraft.value) return
	const items = [...props.template.items, literalDraft.value]
	updateItems(items)
	literalDraft.value = ''
	addPopoverOpen.value = false
}

function wrapToken(token: string) {
	return '{' + token + '}'
}
</script>

<template>
	<div class="flex flex-col gap-3">
		<!-- Items list -->
		<div class="flex flex-col gap-1">
			<Label class="text-xs text-muted-foreground">Items</Label>
			<div v-if="template.items.length === 0" class="text-xs text-muted-foreground italic">
				No items configured
			</div>
			<div v-for="(item, i) in template.items" :key="i" class="flex items-center gap-1 group">
				<span class="text-[0.625rem] text-muted-foreground w-4 text-right shrink-0">{{
					i + 1
				}}</span>
				<Badge
					:variant="item.startsWith('{') && item.endsWith('}') ? 'secondary' : 'outline'"
					class="text-xs font-mono flex-1 justify-start"
				>
					{{ item }}
				</Badge>
				<div
					class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
				>
					<Button
						variant="ghost"
						size="sm"
						class="h-6 w-6 p-0"
						:disabled="i === 0"
						@click="moveItem(i, -1)"
					>
						<IconLucide-chevron-up class="size-3" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						class="h-6 w-6 p-0"
						:disabled="i === template.items.length - 1"
						@click="moveItem(i, 1)"
					>
						<IconLucide-chevron-down class="size-3" />
					</Button>
					<ConfirmPopover @confirm="removeItem(i)">
						<Button
							variant="ghost"
							size="sm"
							class="h-6 w-6 p-0 text-destructive hover:text-destructive"
						>
							<IconLucide-trash-2 class="size-3" />
						</Button>
					</ConfirmPopover>
				</div>
			</div>
		</div>

		<!-- Add item -->
		<Popover v-model:open="addPopoverOpen">
			<PopoverTrigger as-child>
				<Button variant="outline" size="sm" class="h-7 text-xs gap-1 w-fit">
					<IconLucide-plus class="size-3" />
					Add item
				</Button>
			</PopoverTrigger>
			<PopoverContent class="w-72 p-3" align="start">
				<!-- Token chips -->
				<div class="flex flex-col gap-1.5 pb-3">
					<div class="text-xs font-medium">Add token</div>
					<div class="flex flex-wrap gap-1">
						<Badge
							v-for="token in availableTokens"
							:key="token"
							role="button"
							tabindex="0"
							variant="secondary"
							class="cursor-pointer hover:bg-primary/10 text-xs"
							@click="addToken(token)"
							@keydown.enter="addToken(token)"
							@keydown.space.prevent="addToken(token)"
						>
							{{ wrapToken(token) }}
						</Badge>
					</div>
				</div>
				<!-- Literal text -->
				<div class="flex flex-col gap-1.5">
					<div class="text-xs font-medium">Add literal text</div>
					<div class="flex gap-1.5">
						<Input
							v-model="literalDraft"
							placeholder="literal text"
							class="h-7 text-xs flex-1"
							@keydown.enter="addLiteral"
						/>
						<Button
							variant="secondary"
							size="sm"
							class="h-7 text-xs"
							:disabled="!literalDraft"
							@click="addLiteral"
						>
							Add
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>

		<!-- Gap and Justify -->
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-2">
				<Label class="w-32 shrink-0 text-xs text-muted-foreground">Gap</Label>
				<NumberField
					:model-value="template.gap ?? 1"
					:min="0"
					:max="10"
					:step="1"
					class="h-7 flex-1 min-w-0"
					@update:model-value="updateGap"
				>
					<NumberFieldContent>
						<NumberFieldDecrement class="p-1" />
						<NumberFieldInput class="h-7 text-xs" />
						<NumberFieldIncrement class="p-1" />
					</NumberFieldContent>
				</NumberField>
			</div>
			<div class="flex items-center gap-2">
				<Label class="w-32 shrink-0 text-xs text-muted-foreground">Justify</Label>
				<Select :model-value="template.justify ?? 'start'" @update:model-value="updateJustify">
					<SelectTrigger size="sm" class="h-7 text-xs flex-1 min-w-0">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="start" class="text-xs">Start</SelectItem>
						<SelectItem value="between" class="text-xs">Between</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>

		<!-- Reset button -->
		<ConfirmPopover action="Reset" @confirm="emit('reset')">
			<Button variant="ghost" size="sm" class="h-7 text-xs text-muted-foreground self-start gap-1">
				<IconLucide-rotate-ccw class="size-3" />
				Reset to default
			</Button>
		</ConfirmPopover>
	</div>
</template>
