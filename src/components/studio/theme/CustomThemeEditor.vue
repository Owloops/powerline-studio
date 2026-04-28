<script setup lang="ts">
import type { ColorTheme } from '@owloops/claude-powerline/browser'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import ColorPairRow from './ColorPairRow.vue'
import ColorPairHeader from './ColorPairHeader.vue'
import { SEGMENT_KEYS, SEGMENT_LABELS } from '@/lib/themes'

const props = defineProps<{
	colors: ColorTheme
	sourceColors?: ColorTheme | null
	savedThemeId?: string | null
	savedThemeName?: string
	open?: boolean
}>()

const emit = defineEmits<{
	'update:colors': [colors: ColorTheme]
	'update:open': [value: boolean]
	'save:theme': [name: string]
	'delete:theme': []
	'reset:segment': [key: keyof ColorTheme]
	close: []
}>()

const isOpen = computed<boolean>({
	get: () => props.open ?? true,
	set: (v) => emit('update:open', v),
})

const themeName = ref(props.savedThemeName ?? '')

watch(
	() => [props.savedThemeId, props.savedThemeName] as const,
	([, name]) => {
		themeName.value = name ?? ''
	},
)

const isSaved = computed(() => !!props.savedThemeId)
const saveLabel = computed(() => (isSaved.value ? 'Update' : 'Save'))
const triggerLabel = computed(() => (isSaved.value ? 'Edit Custom Theme' : 'Custom Theme'))
const hasSource = computed(() => !!props.sourceColors)

function isOverridden(key: keyof ColorTheme): boolean {
	if (!props.sourceColors) return false
	const src = props.sourceColors[key]
	const cur = props.colors[key]
	return src.bg !== cur.bg || src.fg !== cur.fg || (src.bold ?? false) !== (cur.bold ?? false)
}

function updateBg(segment: keyof ColorTheme, bg: string) {
	const updated = { ...props.colors }
	updated[segment] = { ...updated[segment], bg }
	emit('update:colors', updated)
}

function updateFg(segment: keyof ColorTheme, fg: string) {
	const updated = { ...props.colors }
	updated[segment] = { ...updated[segment], fg }
	emit('update:colors', updated)
}

function updateBold(segment: keyof ColorTheme, bold: boolean) {
	const updated = { ...props.colors }
	updated[segment] = { ...updated[segment], bold }
	emit('update:colors', updated)
}

function handleSave() {
	const name = themeName.value.trim()
	if (!name) return
	emit('save:theme', name)
	if (!isSaved.value) themeName.value = ''
}
</script>

<template>
	<div class="@container flex flex-col gap-3">
		<Collapsible v-model:open="isOpen">
			<CollapsibleTrigger
				class="flex w-full items-center justify-between rounded-md px-1 py-1 text-sm font-medium hover:bg-accent/50 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50"
			>
				<span>{{ triggerLabel }}</span>
				<IconLucide-chevron-down
					class="size-4 text-muted-foreground transition-transform duration-200"
					:class="isOpen ? 'rotate-180' : ''"
				/>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div class="flex flex-col gap-3 pt-3">
					<div class="flex flex-wrap items-center gap-2">
						<input
							v-model="themeName"
							class="h-8 min-w-0 flex-1 basis-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring sm:basis-0"
							placeholder="Theme name..."
							@keydown.enter="handleSave"
						/>
						<Button
							size="sm"
							class="shrink-0 gap-1.5"
							:disabled="!themeName.trim()"
							@click="handleSave"
						>
							<IconLucide-save class="size-3.5" />
							{{ saveLabel }}
						</Button>
						<ConfirmPopover v-if="isSaved" action="Delete" @confirm="emit('delete:theme')">
							<Button variant="outline" size="sm" class="shrink-0 gap-1.5 text-destructive">
								<IconLucide-trash-2 class="size-3.5" />
								Delete
							</Button>
						</ConfirmPopover>
						<Button variant="outline" size="sm" class="shrink-0" @click="emit('close')">
							Close
						</Button>
					</div>

					<ColorPairHeader />
					<ColorPairRow
						v-for="(key, i) in SEGMENT_KEYS"
						:key="key"
						:label="SEGMENT_LABELS[key]"
						:bg="colors[key].bg"
						:fg="colors[key].fg"
						:bold="colors[key].bold ?? false"
						:index="i"
						:show-reset="hasSource"
						:is-overridden="isOverridden(key)"
						@update:bg="updateBg(key, $event)"
						@update:fg="updateFg(key, $event)"
						@update:bold="updateBold(key, $event)"
						@reset="emit('reset:segment', key)"
					/>
				</div>
			</CollapsibleContent>
		</Collapsible>
	</div>
</template>
