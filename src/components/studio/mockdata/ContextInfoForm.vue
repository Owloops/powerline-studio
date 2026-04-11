<script setup lang="ts">
import { DEFAULT_MOCK_DATA } from '@/data/mockPresets'

const store = useMockDataStore()

const enabled = computed({
	get: () => store.contextInfo !== null,
	set: (v: boolean) => {
		if (v) {
			const preset = store.getActivePresetData()
			const restored = preset.contextInfo ?? structuredClone(DEFAULT_MOCK_DATA.contextInfo)
			store.contextInfo = structuredClone(restored)
		} else {
			store.contextInfo = null
		}
		store.markCustom()
	},
})

function numField(key: keyof NonNullable<typeof store.contextInfo>) {
	return computed({
		get: () => store.contextInfo?.[key] ?? '',
		set: (v: string | number) => {
			if (!store.contextInfo) return
			const n = Number(v)
			if (v !== '' && !Number.isNaN(n)) {
				;(store.contextInfo as Record<string, number>)[key] = n
			}
			store.markCustom()
		},
	})
}

const totalTokens = numField('totalTokens')
const percentage = numField('percentage')
const usablePercentage = numField('usablePercentage')
const contextLeftPercentage = numField('contextLeftPercentage')
const maxTokens = numField('maxTokens')
const usableTokens = numField('usableTokens')
</script>

<template>
	<div class="flex flex-col gap-2">
		<template v-if="enabled">
			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Total Tokens</Label>
					<Input v-model="totalTokens" type="number" class="h-8 text-xs" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Max Tokens</Label>
					<Input v-model="maxTokens" type="number" class="h-8 text-xs" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Percentage <span class="text-muted-foreground/60">(%)</span></Label
					>
					<Input
						v-model="percentage"
						type="number"
						class="h-8 text-xs"
						min="0"
						max="100"
						step="0.1"
					/>
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Usable % <span class="text-muted-foreground/60">(%)</span></Label
					>
					<Input v-model="usablePercentage" type="number" class="h-8 text-xs" min="0" step="0.1" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground"
						>Context Left <span class="text-muted-foreground/60">(%)</span></Label
					>
					<Input
						v-model="contextLeftPercentage"
						type="number"
						class="h-8 text-xs"
						min="0"
						max="100"
						step="0.1"
					/>
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Usable Tokens</Label>
					<Input v-model="usableTokens" type="number" class="h-8 text-xs" />
				</div>
			</div>
		</template>
	</div>
</template>
