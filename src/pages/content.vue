<script setup lang="ts">
import { Image as UnpicImage } from '@unpic/vue'
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern'
import CustomSelect from '@/components/CustomSelect/CustomSelect.vue'
import FlagIcon from '@/components/FlagIcon/FlagIcon.vue'

useHead({ title: 'Content & Media' })
useSeoMeta({
	title: 'Content & Media — Vue Template',
	description: 'Unpic responsive images and Inspira UI components',
})

const sampleImages = [
	{
		src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
		alt: 'Mountain landscape',
	},
	{
		src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600',
		alt: 'Forest path',
	},
	{
		src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600',
		alt: 'Sunlit forest',
	},
]

// i18n showcase
const { t, locale } = useI18n()

const languages = [
	{ key: 'en', name: 'English', flag: 'GB' },
	{ key: 'no', name: 'Norsk', flag: 'NO' },
	{ key: 'de', name: 'Deutsch', flag: 'DE' },
	{ key: 'fr', name: 'Français', flag: 'FR' },
	{ key: 'ja', name: '日本語', flag: 'JP' },
]
</script>

<template>
	<div class="flex flex-col gap-12">
		<section>
			<h1 class="text-3xl font-bold tracking-tight">Content & Media</h1>
			<p class="mt-2 text-muted-foreground">Unpic responsive images and Inspira UI components.</p>
		</section>

		<Separator />

		<!-- Inspira UI — Interactive Grid Pattern -->
		<section class="flex flex-col gap-6">
			<h2 class="text-2xl font-semibold">Inspira UI — Interactive Grid Pattern</h2>
			<p class="text-sm text-muted-foreground">
				Installed from the
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">@inspira</code>
				registry — an SVG grid that responds to mouse hover.
			</p>
			<div
				class="relative flex h-80 items-center justify-center overflow-hidden rounded-lg border border-border"
			>
				<p class="z-10 text-center text-2xl font-semibold text-foreground">
					Interactive Grid Pattern
				</p>
				<InteractiveGridPattern
					:width="32"
					:height="32"
					:squares="[30, 12]"
					class="[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
				/>
			</div>
		</section>

		<Separator />

		<!-- Unpic Images -->
		<section class="flex flex-col gap-6">
			<h2 class="text-2xl font-semibold">Unpic Responsive Images</h2>
			<p class="text-sm text-muted-foreground">
				Explicitly imported from
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">@unpic/vue</code>
				— auto-detects CDN, generates srcset, lazy loads by default.
			</p>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div
					v-for="image in sampleImages"
					:key="image.alt"
					class="relative overflow-hidden rounded-lg border border-border"
				>
					<UnpicImage
						:src="image.src"
						:alt="image.alt"
						layout="fullWidth"
						class="h-full w-full object-cover"
					/>
					<div
						class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3"
					>
						<p class="text-sm font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
							{{ image.alt }}
						</p>
					</div>
				</div>
			</div>
		</section>

		<Separator />

		<!-- i18n Showcase -->
		<section class="flex flex-col gap-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 class="text-2xl font-semibold">{{ t('i18n.title') }}</h2>
					<p class="mt-1 text-sm text-muted-foreground">
						{{ t('i18n.description') }}
					</p>
				</div>
				<CustomSelect
					v-model="locale"
					:options="languages"
					:key-selector="(item: any) => item.key"
					:value-selector="(item: any) => item.name"
					trigger-class="w-[200px]"
				>
					<template #display="{ item }">
						<div v-if="item" class="flex items-center gap-2">
							<div class="w-5">
								<FlagIcon :country="item.original.flag" />
							</div>
							<span>{{ item.original.name }}</span>
						</div>
					</template>
					<template #default="{ item }">
						<div class="flex items-center gap-2">
							<div class="w-5">
								<FlagIcon :country="item.original.flag" />
							</div>
							<span>{{ item.original.name }}</span>
						</div>
					</template>
				</CustomSelect>
			</div>

			<div class="grid gap-6 lg:grid-cols-3">
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm leading-relaxed text-foreground">
							{{ t('i18n.paragraph1') }}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm leading-relaxed text-foreground">
							{{ t('i18n.paragraph2') }}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm leading-relaxed text-foreground">
							{{ t('i18n.paragraph3') }}
						</p>
					</CardContent>
				</Card>
			</div>
		</section>
	</div>
</template>
