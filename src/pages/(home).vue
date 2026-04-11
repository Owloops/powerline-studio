<script setup lang="ts">
import confetti from 'canvas-confetti'
import IconCode2 from '~icons/lucide/code-2'
import IconPalette from '~icons/lucide/palette'
import IconFileInput from '~icons/lucide/file-input'
import IconSparkles from '~icons/lucide/sparkles'
import IconGlobe from '~icons/lucide/globe'
import IconServer from '~icons/lucide/server'

const { t } = useI18n()
const router = useRouter()

useSeoMeta({
	title: t('app.title'),
	description: t('app.description'),
	ogTitle: t('app.title'),
	ogDescription: t('app.description'),
})

useHead({
	title: t('app.title'),
})

const { isDark } = useDarkMode()

const containerRef = ref<HTMLElement>()
const centerRef = ref<HTMLElement>()
const coreRef = ref<HTMLElement>()
const stylingRef = ref<HTMLElement>()
const formsRef = ref<HTMLElement>()
const animationsRef = ref<HTMLElement>()
const i18nRef = ref<HTMLElement>()
const backendRef = ref<HTMLElement>()

const features = [
	{
		key: 'core',
		icon: IconCode2,
		ref: coreRef,
		duration: 4 + Math.random() * 3,
		curvature: -75,
		endYOffset: -10,
	},
	{
		key: 'styling',
		icon: IconPalette,
		ref: stylingRef,
		duration: 4 + Math.random() * 3,
		curvature: 0,
		endYOffset: 0,
	},
	{
		key: 'forms',
		icon: IconFileInput,
		ref: formsRef,
		duration: 4 + Math.random() * 3,
		curvature: 75,
		endYOffset: 10,
	},
	{
		key: 'animations',
		icon: IconSparkles,
		ref: animationsRef,
		duration: 4 + Math.random() * 3,
		curvature: -75,
		endYOffset: -10,
	},
	{
		key: 'i18n',
		icon: IconGlobe,
		ref: i18nRef,
		duration: 4 + Math.random() * 3,
		curvature: 0,
		endYOffset: 0,
	},
	{
		key: 'backend',
		icon: IconServer,
		ref: backendRef,
		duration: 4 + Math.random() * 3,
		curvature: 75,
		endYOffset: 10,
	},
]

const leftFeatures = features.slice(0, 3)
const rightFeatures = features.slice(3)

const beamsReady = ref(false)
onMounted(() => {
	beamsReady.value = true
})

function handleExplore(event: MouseEvent) {
	const target = event.currentTarget as HTMLElement
	const rect = target.getBoundingClientRect()
	const x = (rect.left + rect.width / 2) / window.innerWidth
	const y = (rect.top + rect.height / 2) / window.innerHeight

	confetti({
		particleCount: 150,
		spread: 80,
		origin: { x, y },
	})

	setTimeout(() => {
		router.push('/components')
	}, 3000)
}
</script>

<template>
	<div
		class="relative flex min-h-[calc(100svh-5.5rem)] flex-col items-center justify-center gap-8 overflow-hidden sm:min-h-[calc(100svh-7.5rem)] sm:gap-16"
	>
		<FlickeringGrid
			class="absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_60%)]"
			:square-size="4"
			:grid-gap="6"
			color="#60A5FA"
			:max-opacity="0.3"
			:flicker-chance="0.1"
		/>

		<BlurReveal
			class="flex flex-col items-center gap-16"
			:delay="0.2"
			:duration="0.8"
			:initial-delay="0.5"
		>
			<div class="flex flex-col items-center gap-2 text-center sm:gap-4">
				<h1
					class="max-w-[20ch] text-3xl font-bold tracking-tight text-balance sm:text-5xl md:text-7xl"
				>
					{{ t('home.heading') }}
				</h1>
				<p class="max-w-[48ch] text-sm text-pretty text-muted-foreground sm:text-lg">
					{{ t('home.subheading') }}
				</p>
			</div>

			<section
				ref="containerRef"
				class="relative mx-auto flex w-full max-w-4xl items-stretch justify-between gap-6 px-4 py-8 sm:gap-24"
			>
				<div class="flex flex-col justify-center gap-8 sm:gap-12">
					<div
						v-for="feature in leftFeatures"
						:key="feature.key"
						class="flex flex-col items-center gap-1 sm:flex-row-reverse sm:gap-3"
					>
						<div
							:ref="
								(el: any) => {
									feature.ref.value = el as HTMLElement
								}
							"
							class="z-10 flex size-12 items-center justify-center rounded-xl border border-border bg-background shadow-sm"
						>
							<component :is="feature.icon" class="size-5 text-foreground" />
						</div>
						<span
							class="max-w-16 text-center text-[10px] leading-tight font-medium text-muted-foreground sm:max-w-none sm:text-sm sm:text-foreground"
						>
							{{ t(`home.features.${feature.key}`) }}
						</span>
					</div>
				</div>

				<div class="flex items-center justify-center">
					<div
						ref="centerRef"
						class="z-10 flex size-16 items-center justify-center rounded-2xl border border-border bg-background shadow-md"
					>
						<IconLucide-zap class="size-7 text-primary" />
					</div>
				</div>

				<div class="flex flex-col justify-center gap-8 sm:gap-12">
					<div
						v-for="feature in rightFeatures"
						:key="feature.key"
						class="flex flex-col items-center gap-1 sm:flex-row sm:gap-3"
					>
						<div
							:ref="
								(el: any) => {
									feature.ref.value = el as HTMLElement
								}
							"
							class="z-10 flex size-12 items-center justify-center rounded-xl border border-border bg-background shadow-sm"
						>
							<component :is="feature.icon" class="size-5 text-foreground" />
						</div>
						<span
							class="max-w-16 text-center text-[10px] leading-tight font-medium text-muted-foreground sm:max-w-none sm:text-sm sm:text-foreground"
						>
							{{ t(`home.features.${feature.key}`) }}
						</span>
					</div>
				</div>

				<template v-if="beamsReady && containerRef && centerRef">
					<AnimatedBeam
						v-for="feature in features"
						:key="feature.key"
						:container-ref="containerRef"
						:from-ref="feature.ref.value!"
						:to-ref="centerRef"
						:curvature="feature.curvature"
						:end-y-offset="feature.endYOffset"
						:duration="feature.duration"
						gradient-start-color="#FFAA40"
						gradient-stop-color="#9C40FF"
					/>
				</template>
			</section>

			<RainbowButton class="dark:text-black" @click="handleExplore">
				{{ t('home.explore') }}
			</RainbowButton>
		</BlurReveal>
	</div>
</template>
