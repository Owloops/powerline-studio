<script setup lang="ts">
withDefaults(
	defineProps<{
		gridClass?: string
	}>(),
	{
		gridClass: 'grid-cols-[120px_1fr_1fr_1fr_auto]',
	},
)
</script>

<template>
	<div class="grid items-end gap-x-2" :class="gridClass">
		<span />
		<span class="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
			>Background</span
		>
		<span class="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
			>Foreground</span
		>
		<span class="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
			>Preview</span
		>
		<span class="size-6" />
	</div>
</template>
