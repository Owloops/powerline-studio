<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Textarea } from '@/components/ui/textarea'

const configStore = useConfigStore()

const textareaValue = ref('')
const errorMessage = ref('')

// Clear error when user modifies textarea
watch(textareaValue, () => {
	if (errorMessage.value) {
		errorMessage.value = ''
	}
})

function validateConfig(value: unknown): value is Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return false
	}

	const obj = value as Record<string, unknown>

	if ('theme' in obj && typeof obj.theme !== 'string') return false
	if ('display' in obj && (typeof obj.display !== 'object' || obj.display === null)) return false
	if ('colors' in obj && (typeof obj.colors !== 'object' || obj.colors === null)) return false
	if ('budget' in obj && (typeof obj.budget !== 'object' || obj.budget === null)) return false
	if (
		'modelContextLimits' in obj &&
		(typeof obj.modelContextLimits !== 'object' || obj.modelContextLimits === null)
	)
		return false

	return true
}

function loadConfig() {
	try {
		const parsed = JSON.parse(textareaValue.value)

		if (!validateConfig(parsed)) {
			errorMessage.value = 'Invalid config structure: top-level fields have incorrect types.'
			return
		}

		configStore.loadConfig(parsed)
		toast.success('Config loaded successfully')
		textareaValue.value = ''
		errorMessage.value = ''
	} catch (e) {
		errorMessage.value = e instanceof SyntaxError ? `Invalid JSON: ${e.message}` : 'Failed to parse config.'
	}
}
</script>

<template>
	<div class="flex flex-col gap-4">
		<Textarea
			v-model="textareaValue"
			placeholder="Paste your claude-powerline.json config here..."
			class="min-h-48 font-mono text-xs"
		/>

		<p v-if="errorMessage" class="text-sm text-destructive">
			{{ errorMessage }}
		</p>

		<Button
			variant="outline"
			size="sm"
			class="w-full"
			:disabled="!textareaValue.trim()"
			@click="loadConfig"
		>
			<IconLucide-upload class="size-4" />
			Load Config
		</Button>
	</div>
</template>
