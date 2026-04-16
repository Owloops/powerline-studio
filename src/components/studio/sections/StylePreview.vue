<script setup lang="ts">
type StyleValue = 'minimal' | 'powerline' | 'capsule' | 'tui'

defineProps<{
	style: StyleValue
}>()
</script>

<template>
	<svg
		v-if="style === 'minimal'"
		viewBox="0 0 144 24"
		class="size-auto -my-1 h-6! w-36! text-muted-foreground"
		fill="none"
		stroke="currentColor"
		stroke-width="1"
		shape-rendering="geometricPrecision"
	>
		<defs>
			<pattern
				id="hatch-minimal-1"
				width="3"
				height="3"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(45)"
			>
				<line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" stroke-width="0.75" />
			</pattern>
			<pattern
				id="hatch-minimal-2"
				width="3"
				height="3"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(45)"
			>
				<line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" stroke-width="0.5" />
			</pattern>
			<pattern
				id="hatch-minimal-3"
				width="3"
				height="3"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(45)"
			>
				<line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" stroke-width="0.25" />
			</pattern>
		</defs>
		<rect x="5.5" y="5.5" width="44" height="13" stroke="none" fill="url(#hatch-minimal-1)" />
		<rect x="49.5" y="5.5" width="44" height="13" stroke="none" fill="url(#hatch-minimal-2)" />
		<rect x="93.5" y="5.5" width="45" height="13" stroke="none" fill="url(#hatch-minimal-3)" />
		<rect x="5.5" y="5.5" width="133" height="13" />
		<line x1="49.5" y1="5.5" x2="49.5" y2="18.5" />
		<line x1="93.5" y1="5.5" x2="93.5" y2="18.5" />
	</svg>

	<svg
		v-else-if="style === 'powerline'"
		viewBox="0 0 144 24"
		class="size-auto -my-1 h-6! w-36! text-muted-foreground"
		fill="none"
		stroke="currentColor"
		stroke-width="1"
		stroke-linejoin="round"
		stroke-linecap="round"
		shape-rendering="geometricPrecision"
	>
		<defs>
			<pattern
				id="hatch-powerline-1"
				width="3"
				height="3"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(45)"
			>
				<line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" stroke-width="0.75" />
			</pattern>
			<pattern
				id="hatch-powerline-2"
				width="3"
				height="3"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(45)"
			>
				<line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" stroke-width="0.5" />
			</pattern>
			<pattern
				id="hatch-powerline-3"
				width="3"
				height="3"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(45)"
			>
				<line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" stroke-width="0.25" />
			</pattern>
		</defs>
		<path
			d="M6.5 5.5 L43.5 5.5 L49.5 12 L43.5 18.5 L6.5 18.5 Z"
			stroke="none"
			fill="url(#hatch-powerline-1)"
		/>
		<path
			d="M43.5 5.5 L87.5 5.5 L93.5 12 L87.5 18.5 L43.5 18.5 L49.5 12 Z"
			stroke="none"
			fill="url(#hatch-powerline-2)"
		/>
		<path
			d="M87.5 5.5 L131.5 5.5 L137.5 12 L131.5 18.5 L87.5 18.5 L93.5 12 Z"
			stroke="none"
			fill="url(#hatch-powerline-3)"
		/>
		<path d="M6.5 5.5 L131.5 5.5 L137.5 12 L131.5 18.5 L6.5 18.5 Z" />
		<path d="M43.5 5.5 L49.5 12 L43.5 18.5" />
		<path d="M87.5 5.5 L93.5 12 L87.5 18.5" />
	</svg>

	<svg
		v-else-if="style === 'capsule'"
		viewBox="0 0 144 24"
		class="size-auto -my-1 h-6! w-36! text-muted-foreground"
		fill="none"
		stroke="currentColor"
		stroke-width="1"
		shape-rendering="geometricPrecision"
	>
		<defs>
			<pattern
				id="hatch-capsule-1"
				width="3"
				height="3"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(45)"
			>
				<line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" stroke-width="0.75" />
			</pattern>
			<pattern
				id="hatch-capsule-2"
				width="3"
				height="3"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(45)"
			>
				<line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" stroke-width="0.5" />
			</pattern>
			<pattern
				id="hatch-capsule-3"
				width="3"
				height="3"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(45)"
			>
				<line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" stroke-width="0.25" />
			</pattern>
		</defs>
		<rect x="4.5" y="5.5" width="39" height="13" rx="6.5" fill="url(#hatch-capsule-1)" />
		<rect x="52.5" y="5.5" width="39" height="13" rx="6.5" fill="url(#hatch-capsule-2)" />
		<rect x="100.5" y="5.5" width="39" height="13" rx="6.5" fill="url(#hatch-capsule-3)" />
	</svg>

	<svg
		v-else-if="style === 'tui'"
		viewBox="0 0 144 24"
		class="size-auto -my-1 h-6! w-36! text-muted-foreground"
		fill="none"
		stroke="currentColor"
		stroke-width="1"
		shape-rendering="geometricPrecision"
	>
		<rect x="4.5" y="3.5" width="135" height="17" rx="3.5" />
		<line x1="49.5" y1="3.5" x2="49.5" y2="20.5" />
		<line x1="93.5" y1="3.5" x2="93.5" y2="20.5" />
	</svg>
</template>
