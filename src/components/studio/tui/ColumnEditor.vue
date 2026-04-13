<script setup lang="ts">
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const props = defineProps<{
	breakpointIndex: number
	columns: string[]
}>()

const configStore = useConfigStore()

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
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="text-xs font-medium text-muted-foreground">Columns</div>

		<div class="flex flex-wrap items-end gap-2">
			<div
				v-for="(col, colIndex) in columns"
				:key="colIndex"
				class="flex flex-col gap-1 rounded-md border border-border bg-card p-2"
			>
				<div class="flex items-center gap-1">
					<span class="text-[0.625rem] text-muted-foreground">Col {{ colIndex + 1 }}</span>
					<ConfirmPopover
						v-if="columns.length > 1"
						@confirm="configStore.removeColumn(breakpointIndex, colIndex)"
					>
						<button class="ml-auto rounded p-0.5 text-muted-foreground hover:text-destructive">
							<IconLucide-trash-2 class="size-3" />
						</button>
					</ConfirmPopover>
				</div>
				<Select
					:model-value="parseColumnDef(col).type"
					@update:model-value="handleTypeChange(colIndex, $event)"
				>
					<SelectTrigger size="sm" class="h-7 w-20 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="auto">auto</SelectItem>
						<SelectItem value="fr">fr</SelectItem>
						<SelectItem value="fixed">fixed</SelectItem>
					</SelectContent>
				</Select>
				<Input
					v-if="parseColumnDef(col).type === 'fr'"
					type="number"
					:model-value="String(parseColumnDef(col).value)"
					class="h-7 w-16 text-xs"
					:min="1"
					@update:model-value="handleValueChange(colIndex, 'fr', $event as string)"
				/>
				<Input
					v-if="parseColumnDef(col).type === 'fixed'"
					type="number"
					:model-value="String(parseColumnDef(col).value)"
					class="h-7 w-16 text-xs"
					:min="1"
					placeholder="chars"
					@update:model-value="handleValueChange(colIndex, 'fixed', $event as string)"
				/>
			</div>

			<Button
				variant="outline"
				size="sm"
				class="h-7 gap-1 text-xs"
				@click="configStore.addColumn(breakpointIndex)"
			>
				<IconLucide-plus class="size-3" />
				Add
			</Button>
		</div>
	</div>
</template>
