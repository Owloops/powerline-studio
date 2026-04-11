<script setup lang="ts">
import { useForm } from '@formwerk/core'
import { z } from 'zod'
import { toast } from 'vue-sonner'

const schema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Please enter a valid email'),
	age: z.number().int().min(1, 'Age must be positive').max(150, 'Age must be realistic').optional(),
})

const { handleSubmit } = useForm({
	schema,
	initialValues: {
		name: '',
		email: '',
	},
})

const submittedData = ref<Record<string, unknown> | null>(null)

const onSubmit = handleSubmit((data) => {
	const values = data.toObject()
	submittedData.value = values
	toast.success('Form submitted', {
		description: `Welcome, ${values.name}!`,
	})
})
</script>

<template>
	<form class="flex max-w-md flex-col gap-4" novalidate @submit="onSubmit">
		<FormTextField name="name" label="Name" placeholder="John Doe" />
		<FormTextField name="email" label="Email" placeholder="john@example.com" />
		<FormNumberField name="age" label="Age" placeholder="25" />

		<Button type="submit" class="self-start"> Submit </Button>
	</form>

	<div v-if="submittedData" class="mt-4 max-w-md rounded-lg border border-border bg-muted p-4">
		<h3 class="mb-2 text-sm font-medium">Submitted Data</h3>
		<pre class="text-xs">{{ JSON.stringify(submittedData, null, 2) }}</pre>
	</div>
</template>
