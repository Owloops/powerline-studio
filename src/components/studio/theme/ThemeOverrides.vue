<script setup lang="ts">
import type { ColorTheme, SegmentColor } from '@owloops/claude-powerline/browser'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import ColorPairRow from './ColorPairRow.vue'
import { SEGMENT_KEYS, SEGMENT_LABELS } from '@/lib/themes'

const props = defineProps<{
	baseTheme: ColorTheme
	overrides: Partial<ColorTheme>
}>()

const emit = defineEmits<{
	'update:overrides': [overrides: Partial<ColorTheme>]
	'reset:segment': [key: keyof ColorTheme]
}>()

const overrideCount = computed(() => Object.keys(props.overrides).length)
const isOpen = ref(false)

function effectiveColor(key: keyof ColorTheme): SegmentColor {
	return props.overrides[key] ?? props.baseTheme[key]
}

function isOverridden(key: keyof ColorTheme): boolean {
	return key in props.overrides
}

function updateBg(key: keyof ColorTheme, bg: string) {
	const current = effectiveColor(key)
	const updated = { ...props.overrides, [key]: { bg, fg: current.fg } }
	emit('update:overrides', updated)
}

function updateFg(key: keyof ColorTheme, fg: string) {
	const current = effectiveColor(key)
	const updated = { ...props.overrides, [key]: { bg: current.bg, fg } }
	emit('update:overrides', updated)
}

function resetSegment(key: keyof ColorTheme) {
	emit('reset:segment', key)
}
</script>

<template>
	<div class="flex flex-col gap-3">
		<Collapsible v-model:open="isOpen">
			<CollapsibleTrigger
				class="flex w-full items-center justify-between rounded-md px-1 py-1 text-sm font-medium hover:bg-accent/50"
			>
				<span class="flex items-center gap-2">
					Customize Colors
					<Badge v-if="overrideCount > 0" variant="primary" class="px-1.5 py-0 text-[0.625rem]">
						{{ overrideCount }}
					</Badge>
				</span>
				<IconLucide-chevron-down
					class="size-4 text-muted-foreground transition-transform duration-200"
					:class="isOpen ? 'rotate-180' : ''"
				/>
			</CollapsibleTrigger>
			<CollapsibleContent class="collapsible-content overflow-hidden">
				<div class="flex flex-col gap-2 pt-3">
					<div class="grid grid-cols-[120px_1fr_1fr_auto] items-end gap-x-2">
						<span />
						<span class="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
							>Background</span
						>
						<span class="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
							>Foreground</span
						>
						<span class="size-6" />
					</div>
					<ColorPairRow
						v-for="key in SEGMENT_KEYS"
						:key="key"
						:label="SEGMENT_LABELS[key]"
						:bg="effectiveColor(key).bg"
						:fg="effectiveColor(key).fg"
						:show-reset="true"
						:is-overridden="isOverridden(key)"
						@update:bg="updateBg(key, $event)"
						@update:fg="updateFg(key, $event)"
						@reset="resetSegment(key)"
					/>
				</div>
			</CollapsibleContent>
		</Collapsible>
		<Separator />
	</div>
</template>

<style scoped>
.collapsible-content[data-state='open'] {
	animation: slideDown 200ms ease-out;
}

.collapsible-content[data-state='closed'] {
	animation: slideUp 150ms ease-out;
}

@keyframes slideDown {
	from {
		height: 0;
		opacity: 0;
	}
	to {
		height: var(--reka-collapsible-content-height);
		opacity: 1;
	}
}

@keyframes slideUp {
	from {
		height: var(--reka-collapsible-content-height);
		opacity: 1;
	}
	to {
		height: 0;
		opacity: 0;
	}
}

@media (prefers-reduced-motion: reduce) {
	.collapsible-content[data-state='open'],
	.collapsible-content[data-state='closed'] {
		animation: none;
	}
}
</style>
