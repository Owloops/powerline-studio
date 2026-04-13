<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import TokenPicker from './TokenPicker.vue'
import { SEGMENT_PARTS } from '@owloops/claude-powerline/browser'
import type { SegmentName } from '@owloops/claude-powerline/browser'

const props = defineProps<{
	label: string
	left: string | undefined
	right: string | undefined
	leftPlaceholder?: string
	rightPlaceholder?: string
}>()

const emit = defineEmits<{
	'update:left': [value: string | undefined]
	'update:right': [value: string | undefined]
}>()

const leftInputRef = shallowRef<InstanceType<typeof Input> | null>(null)
const rightInputRef = shallowRef<InstanceType<typeof Input> | null>(null)

// Build token list for title/footer
const titleTokens = computed(() => {
	const tokens: string[] = []
	for (const [segment, parts] of Object.entries(SEGMENT_PARTS)) {
		tokens.push(segment)
		for (const part of parts) {
			tokens.push(`${segment}.${part}`)
		}
	}
	return tokens
})

function handleLeftInput(value: string | number) {
	emit('update:left', String(value))
}

function handleRightInput(value: string | number) {
	emit('update:right', String(value))
}

function resetLeft() {
	emit('update:left', undefined)
}

function resetRight() {
	emit('update:right', undefined)
}

function insertTokenAtInput(
	inputRef: InstanceType<typeof Input> | null,
	token: string,
	target: 'left' | 'right',
) {
	const text = `{${token}}`
	const el = inputRef?.$el as HTMLInputElement | undefined
	if (el) {
		const start = el.selectionStart ?? el.value.length
		const end = el.selectionEnd ?? start
		const before = el.value.slice(0, start)
		const after = el.value.slice(end)
		const newValue = before + text + after
		if (target === 'left') {
			emit('update:left', newValue)
		} else {
			emit('update:right', newValue)
		}
		nextTick(() => {
			const pos = start + text.length
			el.setSelectionRange(pos, pos)
			el.focus()
		})
	} else {
		// No input ref, just append
		if (target === 'left') {
			emit('update:left', (props.left ?? '') + text)
		} else {
			emit('update:right', (props.right ?? '') + text)
		}
	}
}
</script>

<template>
	<div class="flex flex-col gap-3">
		<!-- Left template -->
		<div class="flex flex-col gap-1.5">
			<div class="flex items-center justify-between">
				<Label class="text-xs">Left template</Label>
				<div class="flex items-center gap-1">
					<TokenPicker
						:tokens="titleTokens"
						@select="insertTokenAtInput(leftInputRef, $event, 'left')"
					/>
					<Button
						v-if="left !== undefined"
						variant="ghost"
						size="sm"
						class="h-7 px-2 text-xs text-muted-foreground"
						@click="resetLeft"
					>
						<IconLucide-rotate-ccw class="size-3" />
						Reset
					</Button>
				</div>
			</div>
			<Input
				ref="leftInputRef"
				:model-value="left ?? ''"
				:placeholder="leftPlaceholder"
				class="h-8 text-xs font-mono"
				@update:model-value="handleLeftInput"
			/>
		</div>

		<!-- Right template -->
		<div class="flex flex-col gap-1.5">
			<div class="flex items-center justify-between">
				<Label class="text-xs">Right template</Label>
				<div class="flex items-center gap-1">
					<TokenPicker
						:tokens="titleTokens"
						@select="insertTokenAtInput(rightInputRef, $event, 'right')"
					/>
					<Button
						v-if="right !== undefined"
						variant="ghost"
						size="sm"
						class="h-7 px-2 text-xs text-muted-foreground"
						@click="resetRight"
					>
						<IconLucide-rotate-ccw class="size-3" />
						Reset
					</Button>
				</div>
			</div>
			<Input
				ref="rightInputRef"
				:model-value="right ?? ''"
				:placeholder="rightPlaceholder"
				class="h-8 text-xs font-mono"
				@update:model-value="handleRightInput"
			/>
		</div>
	</div>
</template>
