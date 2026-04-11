<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import BoxStylePicker from './BoxStylePicker.vue'
import SeparatorConfig from './SeparatorConfig.vue'
import PaddingConfig from './PaddingConfig.vue'
</script>

<template>
	<div class="rounded-lg border border-border">
		<!-- Section header -->
		<div class="px-3 py-2 border-b border-border">
			<div class="flex items-center gap-1.5">
				<IconLucide-palette class="size-3.5 text-muted-foreground" />
				<span class="text-xs font-medium">Visual Style</span>
			</div>
		</div>

		<div class="flex flex-col gap-3 p-3">
			<!-- Box style presets -->
			<div class="flex flex-col gap-1.5">
				<span class="text-[11px] font-medium text-muted-foreground">Box Style</span>
				<BoxStylePicker />
			</div>

			<Separator />

			<!-- Separators + Padding side by side -->
			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-1.5">
					<span class="text-[11px] font-medium text-muted-foreground">Separators</span>
					<SeparatorConfig />
				</div>

				<div class="flex flex-col gap-1.5">
					<span class="text-[11px] font-medium text-muted-foreground">Padding</span>
					<PaddingConfig />
				</div>
			</div>
		</div>
	</div>
</template>
