<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ExportTab from './ExportTab.vue'
import ImportTab from './ImportTab.vue'

const configStore = useConfigStore()

function resetToDefaults() {
	configStore.resetToDefaults()
	toast.success('Config reset to defaults')
}
</script>

<template>
	<div class="flex h-full flex-col">
		<Tabs default-value="export" class="flex-1">
			<TabsList class="w-full">
				<TabsTrigger value="export" class="flex-1">
					Export
				</TabsTrigger>
				<TabsTrigger value="import" class="flex-1">
					Import
				</TabsTrigger>
			</TabsList>
			<TabsContent value="export" class="p-1">
				<ExportTab />
			</TabsContent>
			<TabsContent value="import" class="p-1">
				<ImportTab />
			</TabsContent>
		</Tabs>

		<div class="border-t p-3">
			<Button
				variant="destructive"
				size="sm"
				class="w-full"
				@click="resetToDefaults"
			>
				<IconLucide-rotate-ccw class="size-4" />
				Reset to Defaults
			</Button>
		</div>
	</div>
</template>
