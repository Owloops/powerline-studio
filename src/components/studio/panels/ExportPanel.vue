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
		<div class="flex-1 p-4">
			<Tabs default-value="export">
				<TabsList>
					<TabsTrigger value="export">
						<IconLucide-download class="size-3.5" />
						Export
					</TabsTrigger>
					<TabsTrigger value="import">
						<IconLucide-upload class="size-3.5" />
						Import
					</TabsTrigger>
				</TabsList>
				<TabsContent value="export" class="pt-4">
					<ExportTab />
				</TabsContent>
				<TabsContent value="import" class="pt-4">
					<ImportTab />
				</TabsContent>
			</Tabs>
		</div>

		<div class="border-t p-4">
			<Button variant="destructive" size="sm" class="w-full" @click="resetToDefaults">
				<IconLucide-rotate-ccw class="size-4" />
				Reset to Defaults
			</Button>
		</div>
	</div>
</template>
