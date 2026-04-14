<script setup lang="ts">
import type { ColorTheme, SegmentColor } from '@owloops/claude-powerline/browser'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ColorPairRow from './ColorPairRow.vue'
import ColorPairHeader from './ColorPairHeader.vue'
import { SEGMENT_KEYS, SEGMENT_LABELS } from '@/lib/themes'

const props = defineProps<{
	baseTheme: ColorTheme
	overrides: Partial<ColorTheme>
	isCustomMode?: boolean
}>()

const emit = defineEmits<{
	'update:overrides': [overrides: Partial<ColorTheme>]
	'reset:segment': [key: keyof ColorTheme]
	'toggle:custom': []
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
			<CollapsibleContent>
				<div class="flex flex-col gap-3 pt-3">
					<Button variant="outline" size="sm" class="w-full" @click="emit('toggle:custom')">
						<IconLucide-palette class="size-3.5" />
						Create Custom Theme
					</Button>
					<ColorPairHeader />
					<ColorPairRow
						v-for="(key, i) in SEGMENT_KEYS"
						:key="key"
						:label="SEGMENT_LABELS[key]"
						:bg="effectiveColor(key).bg"
						:fg="effectiveColor(key).fg"
						:index="i"
						:show-reset="true"
						:is-overridden="isOverridden(key)"
						@update:bg="updateBg(key, $event)"
						@update:fg="updateFg(key, $event)"
						@reset="resetSegment(key)"
					/>
				</div>
			</CollapsibleContent>
		</Collapsible>
	</div>
</template>
