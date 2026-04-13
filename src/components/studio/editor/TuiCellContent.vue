<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
	NumberField,
	NumberFieldContent,
	NumberFieldDecrement,
	NumberFieldIncrement,
	NumberFieldInput,
} from '@/components/ui/number-field'
import { segmentConfigMap } from '@/components/studio/segments'
import {
	SEGMENT_META,
	isSegmentKey,
	type SegmentKey,
} from '@/components/studio/segments/segmentMeta'
import ColorPairRow from '@/components/studio/theme/ColorPairRow.vue'
import SegmentTemplateItem from '@/components/studio/tui/SegmentTemplateItem.vue'
import { SEGMENT_NAME_LIST, SEGMENT_PART_REFS } from '@/types/tui'
import { SEGMENT_PARTS } from '@owloops/claude-powerline/browser'
import type { SegmentName, SegmentTemplate } from '@owloops/claude-powerline/browser'

const props = defineProps<{
	cellSegment: string
	span?: number
	maxSpan?: number
}>()

const emit = defineEmits<{
	'update:span': [value: number]
	swap: [newSegment: string]
}>()

const configStore = useConfigStore()

provide('formCompact', true)

// --- Segment picker ---

const pickerOpen = shallowRef(false)
const pickerSearch = shallowRef('')

const pickerGroups = computed(() => {
	const q = pickerSearch.value.toLowerCase()
	const filter = (items: string[]) => items.filter((s) => s.toLowerCase().includes(q))
	return [
		{ label: 'Special', items: filter(['.']) },
		{ label: 'Segments', items: filter(SEGMENT_NAME_LIST as unknown as string[]) },
		{ label: 'Segment Parts', items: filter(SEGMENT_PART_REFS) },
	].filter((g) => g.items.length > 0)
})

function selectSegment(seg: string) {
	pickerOpen.value = false
	pickerSearch.value = ''
	emit('swap', seg)
}

// Parse the cell segment reference into base segment name and optional part
const baseSegment = computed(() => {
	const dotIdx = props.cellSegment.indexOf('.')
	return dotIdx > 0 ? props.cellSegment.slice(0, dotIdx) : props.cellSegment
})

const isKnownSegment = computed(() => isSegmentKey(baseSegment.value))

const meta = computed(() => {
	if (isKnownSegment.value) {
		return SEGMENT_META[baseSegment.value as SegmentKey]
	}
	return { name: props.cellSegment, icon: null }
})

const isSubSegment = computed(() => props.cellSegment.indexOf('.') > 0)

const hasConfigForm = computed(() => {
	return !isSubSegment.value && !!segmentConfigMap[baseSegment.value]
})

// Color overrides from effective colors
const effectiveColors = computed(() => configStore.effectiveColors)

const segmentColors = computed(() => {
	const key = baseSegment.value as keyof typeof effectiveColors.value
	const colors = effectiveColors.value[key]
	if (colors) return { bg: colors.bg, fg: colors.fg }
	return null
})

const isColorOverridden = computed(() => {
	const key = baseSegment.value as keyof typeof effectiveColors.value
	if (configStore.themeEditor.mode === 'custom') return false
	return configStore.themeEditor.overrides[key] != null
})

function handleColorReset() {
	const key = baseSegment.value as keyof typeof effectiveColors.value
	configStore.resetSegmentOverride(key)
}

function handleColorUpdate(channel: 'bg' | 'fg', value: string) {
	if (configStore.themeEditor.mode === 'custom') {
		const key = baseSegment.value as keyof typeof effectiveColors.value
		const current = effectiveColors.value[key]
		if (current) {
			configStore.updateCustomColor(key, {
				...current,
				[channel]: value,
			})
		}
	} else {
		const key = baseSegment.value as keyof typeof effectiveColors.value
		const current = effectiveColors.value[key]
		if (current) {
			configStore.setColorOverride(key, {
				...current,
				[channel]: value,
			})
		}
	}
}

// Template management
const template = computed(() => configStore.config.display.tui?.segments?.[props.cellSegment])

const templateSectionOpen = shallowRef(false)
const colorSectionOpen = shallowRef(false)

const LATE_RESOLVE_REFS = new Set(['context.bar', 'block.bar', 'weekly.bar'])
const isLateResolved = computed(() => LATE_RESOLVE_REFS.has(props.cellSegment))

function seedTemplate(): SegmentTemplate {
	const dotIdx = props.cellSegment.indexOf('.')
	if (dotIdx > 0) {
		const part = props.cellSegment.slice(dotIdx + 1)
		return { items: [`{${part}}`] }
	}
	const parts = SEGMENT_PARTS[props.cellSegment as SegmentName]
	if (parts) {
		return { items: parts.map((p) => `{${p}}`) }
	}
	return { items: [] }
}

function createTemplate() {
	configStore.setTuiSegmentTemplate(props.cellSegment, seedTemplate())
	templateSectionOpen.value = true
}

function updateTemplate(tpl: SegmentTemplate) {
	configStore.setTuiSegmentTemplate(props.cellSegment, tpl)
}

function resetTemplate() {
	configStore.setTuiSegmentTemplate(props.cellSegment, undefined)
}
</script>

<template>
	<!-- Header -->
	<div class="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
		<component v-if="meta.icon" :is="meta.icon" class="size-4 shrink-0 text-muted-foreground" />
		<IconLucide-layout-grid v-else class="size-4 shrink-0 text-muted-foreground" />
		<div class="min-w-0 flex-1 flex flex-col">
			<span class="text-sm font-semibold leading-tight">
				{{
					isSubSegment
						? `${meta.name} ${cellSegment.slice(cellSegment.indexOf('.') + 1)}`
						: meta.name
				}}
			</span>
			<span v-if="isSubSegment" class="text-[0.625rem] font-mono text-muted-foreground">
				{{ cellSegment }}
			</span>
		</div>
		<Popover v-model:open="pickerOpen">
			<PopoverTrigger as-child>
				<button
					class="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
					title="Change segment"
				>
					<IconLucide-replace class="size-3.5" />
				</button>
			</PopoverTrigger>
			<PopoverContent class="w-56 p-0" align="end" @open-auto-focus.prevent>
				<div class="p-2">
					<Input
						v-model="pickerSearch"
						placeholder="Search segments..."
						class="h-8 text-xs"
						autofocus
						@keydown.escape="pickerOpen = false"
					/>
				</div>
				<div class="max-h-48 overflow-y-auto">
					<div class="px-1 py-0.5">
						<div v-for="group in pickerGroups" :key="group.label" class="py-0.5">
							<div
								class="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>
								{{ group.label }}
							</div>
							<button
								v-for="seg in group.items"
								:key="seg"
								class="flex w-full items-center rounded-md px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground"
								@click="selectSegment(seg)"
							>
								<span class="font-mono">{{ seg === '.' ? '\u00B7 (empty)' : seg }}</span>
								<span v-if="seg === cellSegment" class="ml-auto text-[0.625rem] text-primary">
									current
								</span>
							</button>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	</div>

	<!-- Colspan control -->
	<div
		v-if="span != null && maxSpan != null && maxSpan > 1"
		class="flex items-center gap-2 px-3 py-1.5"
	>
		<span class="text-xs text-muted-foreground shrink-0">Span</span>
		<NumberField
			:model-value="span"
			:min="1"
			:max="maxSpan"
			class="w-20 gap-0"
			@update:model-value="emit('update:span', $event ?? 1)"
		>
			<NumberFieldContent>
				<NumberFieldDecrement class="p-1">
					<IconLucide-minus class="size-2.5" />
				</NumberFieldDecrement>
				<NumberFieldInput class="h-6 text-xs tabular-nums border-input" />
				<NumberFieldIncrement class="p-1">
					<IconLucide-plus class="size-2.5" />
				</NumberFieldIncrement>
			</NumberFieldContent>
		</NumberField>
		<span class="text-[0.625rem] text-muted-foreground">/ {{ maxSpan }} col</span>
	</div>

	<Separator />

	<ScrollArea class="max-h-[420px]">
		<div class="flex flex-col">
			<!-- Segment config form -->
			<div v-if="hasConfigForm" class="compact-config-form px-3 py-2">
				<component :is="segmentConfigMap[baseSegment]" :key="cellSegment" />
			</div>
			<div v-else class="px-3 py-2 text-xs text-muted-foreground">
				{{
					isSubSegment
						? `Configure ${meta.name} options from the full segment cell.`
						: 'No configuration options for this segment.'
				}}
			</div>

			<!-- Color overrides section -->
			<template v-if="segmentColors">
				<Separator />
				<Collapsible v-model:open="colorSectionOpen">
					<CollapsibleTrigger
						class="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-accent/50"
					>
						<div class="flex items-center gap-1.5">
							<IconLucide-palette class="size-3.5 text-muted-foreground" />
							<span class="text-xs font-medium">Color Override</span>
						</div>
						<IconLucide-chevron-right
							class="size-3.5 text-muted-foreground transition-transform duration-200"
							:class="{ 'rotate-90': colorSectionOpen }"
						/>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<div class="flex flex-col gap-1 px-3 pb-2">
							<div class="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
								<span class="pl-1 text-[0.625rem] uppercase tracking-wider text-muted-foreground/50"
									>Background</span
								>
								<span class="pl-1 text-[0.625rem] uppercase tracking-wider text-muted-foreground/50"
									>Foreground</span
								>
								<span class="pl-1 text-[0.625rem] uppercase tracking-wider text-muted-foreground/50"
									>Preview</span
								>
								<span class="size-6" />
							</div>
							<ColorPairRow
								:label="meta.name"
								:bg="segmentColors.bg"
								:fg="segmentColors.fg"
								:show-label="false"
								:show-reset="true"
								:is-overridden="isColorOverridden"
								@update:bg="handleColorUpdate('bg', $event)"
								@update:fg="handleColorUpdate('fg', $event)"
								@reset="handleColorReset"
							/>
						</div>
					</CollapsibleContent>
				</Collapsible>
			</template>

			<!-- Template override section -->
			<template v-if="!isLateResolved">
				<Separator />
				<Collapsible v-model:open="templateSectionOpen">
					<CollapsibleTrigger
						class="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-accent/50"
					>
						<div class="flex items-center gap-1.5">
							<IconLucide-layout-template class="size-3.5 text-muted-foreground" />
							<span class="text-xs font-medium">Template Override</span>
						</div>
						<IconLucide-chevron-right
							class="size-3.5 text-muted-foreground transition-transform duration-200"
							:class="{ 'rotate-90': templateSectionOpen }"
						/>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<div class="px-3 pb-2">
							<template v-if="template">
								<SegmentTemplateItem
									:seg-ref="cellSegment"
									:template="template"
									@update:template="updateTemplate"
									@reset="resetTemplate"
								/>
							</template>
							<template v-else>
								<div class="flex items-center justify-between">
									<span class="text-xs text-muted-foreground">Using default template</span>
									<button class="text-xs text-primary hover:underline" @click="createTemplate">
										Customize
									</button>
								</div>
							</template>
						</div>
					</CollapsibleContent>
				</Collapsible>
			</template>
			<template v-else>
				<Separator />
				<div class="px-3 py-2">
					<div class="flex items-center gap-1.5">
						<IconLucide-layout-template class="size-3.5 text-muted-foreground" />
						<span class="text-xs text-muted-foreground">Width-dependent, not templateable</span>
					</div>
				</div>
			</template>
		</div>
	</ScrollArea>
</template>

<style scoped>
.compact-config-form :deep(> .flex.flex-col) {
	gap: 0.5rem;
}

.compact-config-form :deep(.flex.flex-col.gap-1\.5) {
	flex-direction: row;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.375rem;
}

.compact-config-form :deep(.flex.flex-col.gap-1\.5 > label) {
	flex-shrink: 0;
	width: 5.5rem;
	font-size: 0.75rem;
}

.compact-config-form :deep(.flex.flex-col.gap-1\.5 > input),
.compact-config-form :deep(.flex.flex-col.gap-1\.5 > button[role='combobox']) {
	flex: 1;
	min-width: 0;
}

.compact-config-form :deep(.flex.flex-col.gap-1\.5 > p) {
	width: 100%;
	font-size: 0.75rem;
}

.compact-config-form :deep(input) {
	height: 2rem;
	font-size: 0.75rem;
}

.compact-config-form :deep(button[role='combobox']) {
	height: 2rem;
	font-size: 0.75rem;
}

.compact-config-form :deep(.flex.flex-col.gap-1 > .flex.items-center.gap-3 > label) {
	font-size: 0.75rem;
}
</style>
