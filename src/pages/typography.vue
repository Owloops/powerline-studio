<script setup lang="ts" vapor>
useHead({ title: 'Typography' })
useSeoMeta({
	title: 'Typography — Font Showcase',
	description: 'Side-by-side comparison of recommended fonts for body and display use',
})

const fontWeights = [
	{ weight: 400, label: 'Regular' },
	{ weight: 500, label: 'Medium' },
	{ weight: 600, label: 'Semibold' },
	{ weight: 700, label: 'Bold' },
]

const sampleHeading = 'The quick brown fox jumps over the lazy dog'
const sampleParagraph =
	'Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line spacing, and letter spacing, as well as adjusting the space between pairs of letters.'

const sansFonts = [
	{ name: 'Inter', class: 'font-sans', note: 'Project default — neutral, highly legible' },
	{ name: 'Public Sans', class: 'font-public-sans', note: 'USWDS — strong x-height, open forms' },
	{ name: 'Geist', class: 'font-geist', note: 'Vercel — geometric, modern, tight spacing' },
	{ name: 'Mona Sans', class: 'font-mona-sans', note: 'GitHub — humanist, wide range of weights' },
]

const serifFonts = [
	{
		name: 'DM Serif Display',
		class: 'font-dm-serif',
		note: 'Display only — elegant, high contrast',
	},
	{
		name: 'Playfair Display',
		class: 'font-playfair',
		note: 'Display/headings — classic, high contrast serifs',
	},
]
</script>

<template>
	<div class="flex flex-col gap-12">
		<section>
			<h1 class="text-3xl font-bold tracking-tight">Typography</h1>
			<p class="mt-2 text-muted-foreground">
				Recommended fonts for body and display use. All self-hosted via Fontsource.
			</p>
		</section>

		<Separator />

		<!-- Inter Font Weights -->
		<section class="flex flex-col gap-6">
			<h2 class="text-2xl font-semibold">Inter Font Weights</h2>
			<p class="text-sm text-muted-foreground">
				Self-hosted via
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs"
					>@fontsource-variable/inter</code
				>
				with unplugin-fonts preloading.
			</p>
			<div class="flex flex-col gap-4">
				<div
					v-for="fw in fontWeights"
					:key="fw.weight"
					class="flex items-baseline gap-4 rounded-lg border border-border p-4"
				>
					<span class="w-24 text-sm text-muted-foreground">{{ fw.weight }}</span>
					<span :style="{ fontWeight: fw.weight }" class="text-2xl">
						{{ fw.label }} — The quick brown fox jumps over the lazy dog
					</span>
				</div>
			</div>
		</section>

		<Separator />

		<!-- Type Scale -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Type Scale</h2>
			<div class="flex flex-col gap-2">
				<h1 class="text-4xl font-bold tracking-tight">Heading 1</h1>
				<h2 class="text-3xl font-semibold tracking-tight">Heading 2</h2>
				<h3 class="text-2xl font-semibold tracking-tight">Heading 3</h3>
				<h4 class="text-xl font-semibold tracking-tight">Heading 4</h4>
				<p class="text-base leading-7">
					Body text using Inter Variable font. The quick brown fox jumps over the lazy dog.
				</p>
				<p class="text-sm text-muted-foreground">Muted text for secondary information.</p>
				<code class="inline-block rounded bg-muted px-2 py-1 font-mono text-sm">
					Monospace code text
				</code>
			</div>
		</section>

		<Separator />

		<!-- Sans-Serif Fonts -->
		<section class="flex flex-col gap-8">
			<h2 class="text-2xl font-semibold">Sans-Serif — Body &amp; UI</h2>

			<div
				v-for="font in sansFonts"
				:key="font.name"
				class="flex flex-col gap-4 rounded-lg border border-border p-6"
			>
				<div class="flex items-baseline justify-between gap-4">
					<h3 :class="[font.class, 'text-xl font-semibold']">{{ font.name }}</h3>
					<span class="text-xs text-muted-foreground">{{ font.note }}</span>
				</div>

				<div :class="[font.class, 'flex flex-col gap-3']">
					<p class="text-3xl font-bold tracking-tight">{{ sampleHeading }}</p>
					<p class="text-xl font-semibold tracking-tight">{{ sampleHeading }}</p>
					<p class="text-base leading-7">{{ sampleParagraph }}</p>
					<p class="text-sm leading-6 text-muted-foreground">{{ sampleParagraph }}</p>
				</div>

				<div :class="[font.class, 'flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground']">
					<span class="font-normal">400 Regular</span>
					<span class="font-medium">500 Medium</span>
					<span class="font-semibold">600 Semibold</span>
					<span class="font-bold">700 Bold</span>
				</div>
			</div>
		</section>

		<Separator />

		<!-- Serif Fonts -->
		<section class="flex flex-col gap-8">
			<h2 class="text-2xl font-semibold">Serif — Display &amp; Headings</h2>

			<div
				v-for="font in serifFonts"
				:key="font.name"
				class="flex flex-col gap-4 rounded-lg border border-border p-6"
			>
				<div class="flex items-baseline justify-between gap-4">
					<h3 :class="[font.class, 'text-xl font-semibold']">{{ font.name }}</h3>
					<span class="text-xs text-muted-foreground">{{ font.note }}</span>
				</div>

				<div :class="[font.class, 'flex flex-col gap-3']">
					<p class="text-4xl font-bold tracking-tight">{{ sampleHeading }}</p>
					<p class="text-2xl font-semibold tracking-tight">{{ sampleHeading }}</p>
					<p class="text-xl">{{ sampleHeading }}</p>
				</div>

				<div :class="[font.class, 'flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground']">
					<span v-if="font.name === 'DM Serif Display'" class="font-normal">400 Regular</span>
					<template v-else>
						<span class="font-normal">400 Regular</span>
						<span class="font-medium">500 Medium</span>
						<span class="font-semibold">600 Semibold</span>
						<span class="font-bold">700 Bold</span>
					</template>
				</div>
			</div>
		</section>

		<Separator />

		<!-- Pairing Examples -->
		<section class="flex flex-col gap-8">
			<h2 class="text-2xl font-semibold">Pairing Examples</h2>

			<div class="grid gap-6 lg:grid-cols-2">
				<div class="flex flex-col gap-3 rounded-lg border border-border p-6">
					<span class="text-xs font-medium text-muted-foreground">Playfair Display + Inter</span>
					<h3 class="font-playfair text-3xl font-bold tracking-tight">Crafted with precision</h3>
					<p class="font-sans text-sm leading-6 text-muted-foreground">
						{{ sampleParagraph }}
					</p>
				</div>

				<div class="flex flex-col gap-3 rounded-lg border border-border p-6">
					<span class="text-xs font-medium text-muted-foreground">DM Serif Display + Geist</span>
					<h3 class="font-dm-serif text-3xl tracking-tight">Crafted with precision</h3>
					<p class="font-geist text-sm leading-6 text-muted-foreground">
						{{ sampleParagraph }}
					</p>
				</div>

				<div class="flex flex-col gap-3 rounded-lg border border-border p-6">
					<span class="text-xs font-medium text-muted-foreground"
						>Playfair Display + Public Sans</span
					>
					<h3 class="font-playfair text-3xl font-bold tracking-tight">Crafted with precision</h3>
					<p class="font-public-sans text-sm leading-6 text-muted-foreground">
						{{ sampleParagraph }}
					</p>
				</div>

				<div class="flex flex-col gap-3 rounded-lg border border-border p-6">
					<span class="text-xs font-medium text-muted-foreground"
						>DM Serif Display + Mona Sans</span
					>
					<h3 class="font-dm-serif text-3xl tracking-tight">Crafted with precision</h3>
					<p class="font-mona-sans text-sm leading-6 text-muted-foreground">
						{{ sampleParagraph }}
					</p>
				</div>
			</div>
		</section>
	</div>
</template>
