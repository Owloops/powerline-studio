<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const props = defineProps<{
	color: string
	label: string
}>()

const emit = defineEmits<{
	'update:color': [hex: string]
}>()

const localHex = ref(props.color)
const isOpen = ref(false)

watch(
	() => props.color,
	(val) => {
		localHex.value = val
	},
)

function onHexInput(e: Event) {
	const value = (e.target as HTMLInputElement).value
	localHex.value = value
	if (/^#[0-9a-fA-F]{6}$/.test(value)) {
		emit('update:color', value)
	}
}

function onHexBlur() {
	if (/^#[0-9a-fA-F]{6}$/.test(localHex.value)) {
		emit('update:color', localHex.value)
	} else {
		localHex.value = props.color
	}
}

function onNativeInput(e: Event) {
	const value = (e.target as HTMLInputElement).value
	localHex.value = value
	emit('update:color', value)
}
</script>

<template>
	<Popover v-model:open="isOpen">
		<PopoverTrigger as-child>
			<button
				type="button"
				class="color-input-trigger flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-1.5 text-xs font-mono hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				:aria-label="label"
			>
				<span
					class="size-4 shrink-0 rounded border border-border/50"
					:style="{ backgroundColor: props.color }"
				/>
				<span class="text-muted-foreground select-none">{{ props.color }}</span>
			</button>
		</PopoverTrigger>
		<PopoverContent class="w-auto p-3" :side-offset="8" align="start">
			<div class="flex flex-col gap-3">
				<div class="flex items-center gap-2">
					<span
						class="size-8 shrink-0 rounded-md border border-border"
						:style="{ backgroundColor: props.color }"
					/>
					<div class="flex flex-col gap-0.5">
						<span class="text-xs text-muted-foreground">{{ label }}</span>
						<input
							:value="localHex"
							class="h-7 w-24 rounded-md border border-border bg-background px-2 font-mono text-xs uppercase text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
							spellcheck="false"
							maxlength="7"
							@input="onHexInput"
							@blur="onHexBlur"
						/>
					</div>
				</div>
				<div class="native-picker-wrap relative size-[180px] overflow-hidden rounded-md">
					<input
						type="color"
						:value="props.color"
						class="native-color-input"
						:aria-label="label"
						@input="onNativeInput"
					/>
				</div>
			</div>
		</PopoverContent>
	</Popover>
</template>

<style scoped>
.color-input-trigger {
	transition: border-color 150ms ease-out;
}

.native-picker-wrap {
	background: var(--color-background);
}

.native-color-input {
	position: absolute;
	inset: -8px;
	width: calc(100% + 16px);
	height: calc(100% + 16px);
	border: none;
	padding: 0;
	cursor: pointer;
	background: transparent;
}

.native-color-input::-webkit-color-swatch-wrapper {
	padding: 0;
}

.native-color-input::-webkit-color-swatch {
	border: none;
	border-radius: 6px;
}

.native-color-input::-moz-color-swatch {
	border: none;
	border-radius: 6px;
}

@media (prefers-reduced-motion: reduce) {
	.color-input-trigger {
		transition: none;
	}
}
</style>
