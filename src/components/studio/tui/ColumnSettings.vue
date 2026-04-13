<script setup lang="ts">
import type { AlignValue } from '@/types/tui'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const props = defineProps<{
	breakpointIndex: number
	columns: string[]
	align?: AlignValue[]
}>()

const configStore = useConfigStore()

const isAlignEnabled = computed(() => !!props.align)

function parseColumnDef(col: string): { type: 'auto' | 'fr' | 'fixed'; value: number } {
	if (col === 'auto') return { type: 'auto', value: 0 }
	if (col.endsWith('fr')) return { type: 'fr', value: Number.parseInt(col) || 1 }
	return { type: 'fixed', value: Number.parseInt(col) || 10 }
}

function handleTypeChange(colIndex: number, type: string) {
	if (type === 'auto') {
		configStore.setColumnDef(props.breakpointIndex, colIndex, 'auto')
	} else if (type === 'fr') {
		configStore.setColumnDef(props.breakpointIndex, colIndex, '1fr')
	} else {
		configStore.setColumnDef(props.breakpointIndex, colIndex, '10')
	}
}

function handleValueChange(colIndex: number, type: 'fr' | 'fixed', rawValue: string) {
	const n = Number.parseInt(rawValue)
	if (Number.isNaN(n) || n < 1) return
	if (type === 'fr') {
		configStore.setColumnDef(props.breakpointIndex, colIndex, `${n}fr`)
	} else {
		configStore.setColumnDef(props.breakpointIndex, colIndex, `${n}`)
	}
}

function handleValueInput(colIndex: number, col: string, value: string | number) {
	const parsed = parseColumnDef(col)
	if (parsed.type === 'fr' || parsed.type === 'fixed') {
		handleValueChange(colIndex, parsed.type, String(value))
	}
}

function handleAlignChange(colIndex: number, value: string) {
	configStore.setColumnAlign(props.breakpointIndex, colIndex, value as AlignValue)
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<div class="text-xs font-medium text-muted-foreground">Columns</div>
			<div class="flex items-center gap-2">
				<Label for="col-align-toggle" class="text-xs text-muted-foreground">Align override</Label>
				<Switch
					id="col-align-toggle"
					:model-value="isAlignEnabled"
					@update:model-value="configStore.toggleAlignOverrides(breakpointIndex, $event)"
				/>
			</div>
		</div>

		<!-- Column header row -->
		<div
			class="grid items-center gap-x-2 gap-y-0 text-xs font-medium text-muted-foreground uppercase tracking-wider"
			:class="isAlignEnabled ? 'grid-cols-[2rem_1fr_1fr_auto]' : 'grid-cols-[2rem_1fr_auto]'"
		>
			<span class="text-center">#</span>
			<span>Size</span>
			<span v-if="isAlignEnabled">Align</span>
			<span class="w-6" />
		</div>

		<!-- Column rows -->
		<div class="flex flex-col gap-1.5">
			<div
				v-for="(col, colIndex) in columns"
				:key="colIndex"
				class="grid items-center gap-x-2"
				:class="isAlignEnabled ? 'grid-cols-[2rem_1fr_1fr_auto]' : 'grid-cols-[2rem_1fr_auto]'"
			>
				<!-- Column number -->
				<span class="text-xs text-muted-foreground text-center tabular-nums">
					{{ colIndex + 1 }}
				</span>

				<!-- Size: type + value in one row -->
				<div class="flex items-center gap-1.5">
					<Select
						:model-value="parseColumnDef(col).type"
						@update:model-value="handleTypeChange(colIndex, $event)"
					>
						<SelectTrigger size="sm" class="h-7 text-xs flex-1 min-w-0">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="auto">auto</SelectItem>
							<SelectItem value="fr">fr</SelectItem>
							<SelectItem value="fixed">fixed</SelectItem>
						</SelectContent>
					</Select>
					<Input
						v-if="parseColumnDef(col).type === 'fr' || parseColumnDef(col).type === 'fixed'"
						type="number"
						:model-value="String(parseColumnDef(col).value)"
						class="h-7 w-14 text-xs tabular-nums"
						:min="1"
						:placeholder="parseColumnDef(col).type === 'fixed' ? 'ch' : 'fr'"
						@update:model-value="handleValueInput(colIndex, col, $event)"
					/>
				</div>

				<!-- Alignment (only when enabled) -->
				<Select
					v-if="isAlignEnabled && align"
					:model-value="align[colIndex] ?? 'left'"
					@update:model-value="handleAlignChange(colIndex, $event)"
				>
					<SelectTrigger size="sm" class="h-7 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="left">
							<span class="flex items-center gap-1.5">
								<IconLucide-align-left class="size-3" />
								Left
							</span>
						</SelectItem>
						<SelectItem value="center">
							<span class="flex items-center gap-1.5">
								<IconLucide-align-center class="size-3" />
								Center
							</span>
						</SelectItem>
						<SelectItem value="right">
							<span class="flex items-center gap-1.5">
								<IconLucide-align-right class="size-3" />
								Right
							</span>
						</SelectItem>
					</SelectContent>
				</Select>

				<!-- Delete button -->
				<button
					v-if="columns.length > 1"
					class="flex items-center justify-center rounded p-1 text-muted-foreground hover:text-destructive"
					@click="configStore.removeColumn(breakpointIndex, colIndex)"
				>
					<IconLucide-trash-2 class="size-3" />
				</button>
				<span v-else class="w-6" />
			</div>
		</div>

		<!-- Add column button -->
		<Button
			variant="outline"
			size="sm"
			class="h-7 gap-1 text-xs self-start"
			@click="configStore.addColumn(breakpointIndex)"
		>
			<IconLucide-plus class="size-3" />
			Add column
		</Button>
	</div>
</template>
