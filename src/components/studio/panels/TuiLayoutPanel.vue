<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTuiValidation } from '@/composables/useTuiValidation'
import { TUI_PRESETS, type TuiPreset } from '@/lib/tuiPresets'
import TuiGlobalOptions from '@/components/studio/tui/TuiGlobalOptions.vue'
import BreakpointManager from '@/components/studio/tui/BreakpointManager.vue'
import BreakpointEditor from '@/components/studio/tui/BreakpointEditor.vue'
import TuiStylingSection from '@/components/studio/tui/TuiStylingSection.vue'

const configStore = useConfigStore()
const editorStore = useEditorStore()
const tui = computed(() => configStore.config.display.tui)

// Assign stable ephemeral IDs to each breakpoint for selection tracking
const breakpointIds = shallowRef<string[]>([])

function syncIds() {
	const bps = tui.value?.breakpoints ?? []
	const current = breakpointIds.value
	if (current.length === bps.length) return
	// Grow: add new IDs
	if (current.length < bps.length) {
		const newIds = [...current]
		for (let i = current.length; i < bps.length; i++) {
			newIds.push(crypto.randomUUID())
		}
		breakpointIds.value = newIds
	} else {
		// Shrink: trim from end (removal always happens at known index)
		breakpointIds.value = current.slice(0, bps.length)
	}
}

// Initialize IDs on first render
watchEffect(() => {
	if (tui.value) syncIds()
})

const selectedBreakpointId = shallowRef<string>('')

// Auto-select first breakpoint if none selected
watchEffect(() => {
	const ids = breakpointIds.value
	if (
		ids.length > 0 &&
		(!selectedBreakpointId.value || !ids.includes(selectedBreakpointId.value))
	) {
		selectedBreakpointId.value = ids[0]!
	}
})

const selectedBpIndex = computed(() => {
	const idx = breakpointIds.value.indexOf(selectedBreakpointId.value)
	return idx >= 0 ? idx : 0
})

const selectedBreakpoint = computed(() => {
	return tui.value?.breakpoints[selectedBpIndex.value]
})

const { errors } = useTuiValidation(() => tui.value)

const globalOptionsCollapsed = shallowRef(true)

function handleAddBreakpoint() {
	configStore.addBreakpoint()
	// Select the newly added breakpoint
	nextTick(() => {
		const ids = breakpointIds.value
		if (ids.length > 0) {
			selectedBreakpointId.value = ids[ids.length - 1]!
		}
	})
}

function handleRemoveBreakpoint(id: string) {
	const idx = breakpointIds.value.indexOf(id)
	if (idx < 0) return
	// Remove the ID
	const newIds = [...breakpointIds.value]
	newIds.splice(idx, 1)
	breakpointIds.value = newIds
	// Remove the breakpoint
	configStore.removeBreakpoint(idx)
	// Reselect
	if (selectedBreakpointId.value === id) {
		selectedBreakpointId.value = newIds[0] ?? ''
	}
}

// --- Highlighted segment in the grid (from preview click) ---
const highlightedSegment = shallowRef<string | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | undefined

// React to TUI area selection from preview clicks
watch(
	() => editorStore.selectedTuiArea,
	(target) => {
		if (!target) return
		if (target.kind === 'segment') {
			highlightedSegment.value = target.name
			// Auto-clear highlight after a few seconds
			clearTimeout(highlightTimer)
			highlightTimer = setTimeout(() => {
				highlightedSegment.value = null
			}, 2000)
		}
		// Clear the selection after processing so it can be re-triggered
		nextTick(() => editorStore.clearTuiArea())
	},
)

// --- Preset confirmation ---

const pendingPreset = shallowRef<TuiPreset | null>(null)
const presetDialogOpen = shallowRef(false)

function requestPreset(preset: TuiPreset) {
	pendingPreset.value = preset
	presetDialogOpen.value = true
}

function confirmPreset() {
	if (pendingPreset.value) {
		configStore.applyTuiPreset(pendingPreset.value)
	}
	pendingPreset.value = null
	presetDialogOpen.value = false
}
</script>

<template>
	<div class="flex flex-col gap-4 p-4">
		<div>
			<h2 class="text-sm font-medium">TUI Layout</h2>
			<p class="text-xs text-muted-foreground">Configure the grid-based TUI panel layout</p>
		</div>

		<!-- Presets -->
		<div class="flex gap-2">
			<Button
				v-for="preset in TUI_PRESETS"
				:key="preset.id"
				variant="outline"
				size="sm"
				class="flex-1"
				@click="requestPreset(preset)"
			>
				<IconLucide-layout-grid class="size-3.5" />
				{{ preset.name }}
			</Button>
		</div>

		<AlertDialog v-model:open="presetDialogOpen">
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Apply {{ pendingPreset?.name }} preset?</AlertDialogTitle>
					<AlertDialogDescription>
						{{ pendingPreset?.description }} This will override your current TUI layout,
						breakpoints, and segment configuration.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction @click="confirmPreset">Apply</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>

		<!-- Validation Errors -->
		<div
			v-if="errors.length > 0"
			class="rounded-md border border-destructive/50 bg-destructive/5 p-3"
		>
			<div class="text-xs font-medium text-destructive mb-1">Validation Issues</div>
			<ul class="space-y-0.5">
				<li v-for="(err, i) in errors" :key="i" class="text-xs text-destructive/80">
					{{ err.message }}
				</li>
			</ul>
		</div>

		<!-- Global Options (collapsible) -->
		<Card>
			<CardHeader
				class="cursor-pointer py-2 px-3"
				@click="globalOptionsCollapsed = !globalOptionsCollapsed"
			>
				<div class="flex items-center justify-between">
					<CardTitle class="text-xs font-medium">Global Options</CardTitle>
					<IconLucide-chevron-down
						class="size-4 text-muted-foreground transition-transform duration-200"
						:class="{ '-rotate-180': !globalOptionsCollapsed }"
					/>
				</div>
			</CardHeader>
			<CardContent v-show="!globalOptionsCollapsed" class="px-3 pb-3 pt-0">
				<TuiGlobalOptions />
			</CardContent>
		</Card>

		<Separator />

		<!-- Breakpoint Manager -->
		<template v-if="tui && tui.breakpoints.length > 0">
			<BreakpointManager
				:breakpoints="tui.breakpoints"
				:selected-id="selectedBreakpointId"
				:breakpoint-ids="breakpointIds"
				@select="selectedBreakpointId = $event"
				@add="handleAddBreakpoint"
				@remove="handleRemoveBreakpoint"
			/>

			<!-- Breakpoint Editor (now includes title/footer/columns/alignment/segment templates) -->
			<Transition
				enter-active-class="transition-opacity duration-150 ease-out"
				leave-active-class="transition-opacity duration-100 ease-in"
				enter-from-class="opacity-0"
				leave-to-class="opacity-0"
				mode="out-in"
			>
				<BreakpointEditor
					v-if="selectedBreakpoint"
					:key="selectedBreakpointId"
					:breakpoint-index="selectedBpIndex"
					:breakpoint="selectedBreakpoint"
					:highlighted-segment="highlightedSegment"
				/>
			</Transition>
		</template>

		<Separator />

		<!-- Visual Style (box, separators, padding) -->
		<TuiStylingSection />
	</div>
</template>
