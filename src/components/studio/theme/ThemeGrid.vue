<script setup lang="ts">
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui'
import { Button } from '@/components/ui/button'
import ThemeCard from './ThemeCard.vue'
import { CANONICAL_THEMES, getCanonicalThemeColors } from '@/lib/themes'
import type { CanonicalTheme } from '@/lib/themes'

defineProps<{
	selectedTheme: CanonicalTheme
	mode: 'builtin' | 'custom'
}>()

const emit = defineEmits<{
	'select:theme': [themeName: CanonicalTheme]
	'enter:custom': []
}>()
</script>

<template>
	<div class="flex flex-col gap-3">
		<RadioGroupRoot
			:model-value="mode === 'builtin' ? selectedTheme : ''"
			class="grid grid-cols-2 gap-3"
			@update:model-value="emit('select:theme', $event as CanonicalTheme)"
		>
			<RadioGroupItem v-for="name in CANONICAL_THEMES" :key="name" :value="name" as-child>
				<ThemeCard
					:theme-name="name"
					:theme="getCanonicalThemeColors(name)"
					:selected="mode === 'builtin' && selectedTheme === name"
				/>
			</RadioGroupItem>
		</RadioGroupRoot>

		<Button
			variant="outline"
			size="sm"
			class="w-full"
			:class="mode === 'custom' ? 'border-primary bg-primary/5 text-primary' : ''"
			@click="emit('enter:custom')"
		>
			<IconLucide-palette class="mr-2 size-4" />
			{{ mode === 'custom' ? 'Editing Custom Theme' : 'Create Custom Theme' }}
		</Button>
	</div>
</template>
