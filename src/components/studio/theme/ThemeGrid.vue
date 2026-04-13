<script setup lang="ts">
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui'
import { Button } from '@/components/ui/button'
import ThemeCard from './ThemeCard.vue'
import { CANONICAL_THEMES, getCanonicalThemeColors } from '@/lib/themes'
import type { CanonicalTheme, SavedCustomTheme } from '@/lib/themes'

defineProps<{
	selectedTheme: CanonicalTheme
	mode: 'builtin' | 'custom'
	savedCustomThemes: SavedCustomTheme[]
}>()

const emit = defineEmits<{
	'select:theme': [themeName: CanonicalTheme]
	'enter:custom': []
	'load:saved': [saved: SavedCustomTheme]
	'delete:saved': [id: string]
}>()
</script>

<template>
	<div class="flex flex-col gap-3">
		<RadioGroupRoot
			:model-value="mode === 'builtin' ? selectedTheme : ''"
			class="flex flex-wrap gap-3"
			@update:model-value="emit('select:theme', $event as CanonicalTheme)"
		>
			<RadioGroupItem v-for="name in CANONICAL_THEMES" :key="name" :value="name" as-child>
				<ThemeCard
					:theme-name="name"
					:theme="getCanonicalThemeColors(name)"
					:selected="mode === 'builtin' && selectedTheme === name"
					class="min-w-[120px] flex-1"
				/>
			</RadioGroupItem>
		</RadioGroupRoot>

		<!-- Saved custom themes -->
		<template v-if="savedCustomThemes.length > 0">
			<div class="flex items-center gap-2 pt-1">
				<span class="text-xs font-medium text-muted-foreground">Saved Custom Themes</span>
				<div class="h-px flex-1 bg-border" />
			</div>
			<div class="flex flex-wrap gap-3">
				<div
					v-for="saved in savedCustomThemes"
					:key="saved.id"
					class="group relative min-w-[120px] flex-1"
				>
					<ThemeCard
						:theme-name="saved.id"
						:theme="saved.colors"
						:selected="false"
						:label="saved.name"
						class="w-full"
						@click="emit('load:saved', saved)"
					/>
					<ConfirmPopover @confirm="emit('delete:saved', saved.id)">
						<button
							class="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
							:aria-label="`Delete ${saved.name}`"
							@click.stop
						>
							<IconLucide-trash-2 class="size-3" />
						</button>
					</ConfirmPopover>
				</div>
			</div>
		</template>

		<Button
			variant="outline"
			size="sm"
			class="w-full"
			:class="mode === 'custom' ? 'border-primary bg-primary/5 text-primary' : ''"
			@click="emit('enter:custom')"
		>
			<IconLucide-palette class="size-4" />
			{{ mode === 'custom' ? 'Editing Custom Theme' : 'Create Custom Theme' }}
		</Button>
	</div>
</template>
