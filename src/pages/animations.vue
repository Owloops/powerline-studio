<script setup lang="ts">
import { motion, useMotionValue, animate, useTime, useTransform } from 'motion-v'

useHead({ title: 'Animations' })
useSeoMeta({
	title: 'Animations — Vue Template',
	description: 'Motion-v animation examples — presence, springs, stagger, and gestures',
})

const isVisible = ref(true)
const count = ref(0)
const staggerKey = ref(0)

const BADGE_STATES = {
	idle: 'Start',
	processing: 'Processing',
	success: 'Done',
	error: 'Something went wrong',
} as const

type BadgeState = keyof typeof BADGE_STATES

const SPRING_CONFIG = { type: 'spring' as const, stiffness: 600, damping: 30 }

const badgeState = ref<BadgeState>('idle')
const badgeRef = ref<HTMLElement | null>(null)
const measureRef = ref<HTMLElement | null>(null)
const labelWidth = ref(0)

const time = useTime()
const badgeRotate = useTransform(time, [0, 1000], [0, 360], { clamp: false })

function nextBadgeState() {
	const states = Object.keys(BADGE_STATES) as BadgeState[]
	const nextIndex = (states.indexOf(badgeState.value) + 1) % states.length
	badgeState.value = states[nextIndex]!
}

function measureLabel() {
	if (measureRef.value) {
		labelWidth.value = measureRef.value.getBoundingClientRect().width
	}
}

watch(badgeState, (newState) => {
	if (!badgeRef.value) return
	if (newState === 'error') {
		animate(
			badgeRef.value,
			{ x: [0, -6, 6, -6, 0] },
			{
				duration: 0.3,
				ease: 'easeInOut',
				times: [0, 0.25, 0.5, 0.75, 1],
			},
		)
	} else if (newState === 'success') {
		animate(
			badgeRef.value,
			{ scale: [1, 1.2, 1] },
			{
				duration: 0.3,
				ease: 'easeInOut',
				times: [0, 0.5, 1],
			},
		)
	}
})

watch(badgeState, () => nextTick(measureLabel))
onMounted(measureLabel)

const baseZIndex = 2000
const zStack = ['overlay', 'thumbnail', 'image'] as const

const accordionItems = [
	{
		header: 'What is Motion for Vue?',
		content: [
			'Motion for Vue brings the power of the Motion animation library to Vue. It provides spring-based animations, layout animations, gesture recognition, and scroll-linked animations with a declarative API.',
		],
	},
	{
		header: 'How do layout animations work?',
		content: [
			"Layout animations use the FLIP technique — they measure an element's position before and after a change, then animate the difference using performant transforms.",
			'Just add the layout prop to any motion component and position/size changes animate automatically.',
		],
	},
	{
		header: 'Can I animate between different elements?',
		content: [
			"Yes! Using layoutId, you can animate between completely different elements. When a new element mounts with a matching layoutId, Motion crossfades and morphs from the old element's position to the new one.",
		],
	},
]

const cards = [
	{
		id: 'mountain',
		image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
		title: 'Alpine Peaks',
		summary: 'Towering summits above the clouds.',
		body: 'The Alps stretch across eight countries, forming a natural barrier that has shaped European history, culture, and ecology for millennia. Their jagged peaks, carved by ancient glaciers, rise above pristine valleys where traditional mountain communities have thrived for centuries.',
	},
	{
		id: 'forest',
		image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
		title: 'Ancient Forests',
		summary: 'Where sunlight filters through the canopy.',
		body: 'Old-growth forests are among the most complex ecosystems on Earth. A single hectare can contain hundreds of species of trees, fungi, mosses, and lichens, all interconnected through underground mycelial networks.',
	},
	{
		id: 'coast',
		image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
		title: 'Coastal Light',
		summary: 'Golden hour where land meets sea.',
		body: 'Coastlines are among the most dynamic landscapes on Earth, constantly reshaped by tides, storms, and the slow rise of sea levels. The interplay of light and water at the shore creates ever-changing compositions.',
	},
]

const selectedIndex = ref<number | false>(false)
const cardZIndices = cards.map(() => useMotionValue(0))

function openCard(i: number) {
	selectedIndex.value = i
}

function closeCard() {
	selectedIndex.value = false
}

const selectedCardData = computed(() =>
	selectedIndex.value !== false ? cards[selectedIndex.value] : null,
)

watch(
	selectedIndex,
	(val) => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape' && val !== false) closeCard()
		}
		if (val !== false) {
			window.addEventListener('keydown', handleKeyDown)
		}
		return () => window.removeEventListener('keydown', handleKeyDown)
	},
	{ immediate: true },
)
</script>

<template>
	<div class="flex flex-col gap-12">
		<section>
			<h1 class="text-3xl font-bold tracking-tight">Animations</h1>
			<p class="mt-2 text-muted-foreground">
				Motion-v animation examples — explicitly imported from
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">motion-v</code>.
			</p>
		</section>

		<Separator />

		<!-- Fade in/out -->
		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-semibold">Animate Presence</h2>
			<div>
				<Button variant="outline" @click="isVisible = !isVisible">
					{{ isVisible ? 'Hide' : 'Show' }} Element
				</Button>
				<AnimatePresence>
					<Motion
						v-if="isVisible"
						:initial="{ opacity: 0, height: 0 }"
						:animate="{ opacity: 1, height: 'auto' }"
						:exit="{ opacity: 0, height: 0 }"
						:transition="{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }"
						class="overflow-hidden"
					>
						<div class="mt-3 rounded-lg border border-border bg-card p-6">
							<p class="text-sm">This element animates in and out with fade + height collapse.</p>
						</div>
					</Motion>
				</AnimatePresence>
			</div>
		</section>

		<Separator />

		<!-- Spring animation -->
		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-semibold">Spring Counter</h2>
			<div class="flex items-center gap-4">
				<Button @click="count++">Increment</Button>
				<Motion
					:key="count"
					:initial="{ scale: 0.5, opacity: 0 }"
					:animate="{ scale: 1, opacity: 1 }"
					:transition="{ type: 'spring', stiffness: 300, damping: 20 }"
					class="flex size-16 items-center justify-center rounded-xl border border-border bg-primary text-2xl font-bold text-primary-foreground"
				>
					{{ count }}
				</Motion>
			</div>
		</section>

		<Separator />

		<!-- Staggered list -->
		<section class="flex flex-col gap-3">
			<div class="flex items-center gap-2">
				<h2 class="text-2xl font-semibold">Staggered Entry</h2>
				<Button variant="ghost" size="icon-sm" @click="staggerKey++">
					<IconLucide-repeat class="size-4" />
					<span class="sr-only">Replay</span>
				</Button>
			</div>
			<div :key="staggerKey" class="grid gap-3 sm:grid-cols-3">
				<Motion
					v-for="(item, i) in ['First', 'Second', 'Third']"
					:key="item"
					:initial="{ opacity: 0, x: -20 }"
					:animate="{ opacity: 1, x: 0 }"
					:transition="{ delay: i * 0.15, duration: 0.4 }"
					class="rounded-lg border border-border bg-card p-4 text-center text-sm"
				>
					{{ item }} item
				</Motion>
			</div>
		</section>

		<Separator />

		<!-- Hover animation -->
		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-semibold">Hover &amp; Tap</h2>
			<div class="flex gap-4">
				<motion.button
					:whileHover="{ scale: 1.05 }"
					:whilePress="{ scale: 0.9 }"
					style="will-change: transform"
					class="cursor-pointer rounded-lg border border-border bg-card p-6 text-center text-sm font-medium"
				>
					Hover & tap me
				</motion.button>
			</div>
		</section>

		<Separator />

		<!-- Multi-State Badge -->
		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-semibold">Multi-State Badge</h2>
			<p class="text-sm text-muted-foreground">
				Animated badge with icon transitions, path drawing, shake on error, and scale on success.
			</p>
			<div class="flex h-20 items-center justify-center">
				<button class="cursor-pointer" @click="nextBadgeState">
					<motion.div
						ref="badgeRef"
						class="flex items-center justify-center overflow-hidden rounded-full bg-muted px-5 py-3 text-foreground will-change-[transform,filter]"
						:style="{ gap: badgeState === 'idle' ? '0px' : '8px' }"
					>
						<!-- Icon -->
						<motion.span
							class="relative flex h-5 items-center justify-center"
							:animate="{ width: badgeState === 'idle' ? 0 : '20px' }"
							:transition="SPRING_CONFIG"
						>
							<AnimatePresence>
								<motion.span
									:key="badgeState"
									class="absolute left-0 top-0"
									:initial="{ y: -40, scale: 0.5, filter: 'blur(6px)' }"
									:animate="{ y: 0, scale: 1, filter: 'blur(0px)' }"
									:exit="{ y: 40, scale: 0.5, filter: 'blur(6px)' }"
									:transition="{ duration: 0.15, ease: 'easeInOut' }"
								>
									<!-- Processing spinner -->
									<motion.div
										v-if="badgeState === 'processing'"
										:style="{ rotate: badgeRotate }"
										class="flex size-5 items-center justify-center"
									>
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<motion.path
												d="M21 12a9 9 0 1 1-6.219-8.56"
												:initial="{ pathLength: 0 }"
												:animate="{ pathLength: 1 }"
												:transition="SPRING_CONFIG"
											/>
										</svg>
									</motion.div>
									<!-- Success check -->
									<svg
										v-if="badgeState === 'success'"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<motion.polyline
											points="4 12 9 17 20 6"
											:initial="{ pathLength: 0 }"
											:animate="{ pathLength: 1 }"
											:transition="SPRING_CONFIG"
										/>
									</svg>
									<!-- Error X -->
									<svg
										v-if="badgeState === 'error'"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<motion.line
											x1="6"
											y1="6"
											x2="18"
											y2="18"
											:initial="{ pathLength: 0 }"
											:animate="{ pathLength: 1 }"
											:transition="SPRING_CONFIG"
										/>
										<motion.line
											x1="18"
											y1="6"
											x2="6"
											y2="18"
											:initial="{ pathLength: 0 }"
											:animate="{ pathLength: 1 }"
											:transition="{ ...SPRING_CONFIG, delay: 0.1 }"
										/>
									</svg>
								</motion.span>
							</AnimatePresence>
						</motion.span>

						<!-- Label -->
						<div ref="measureRef" class="invisible absolute whitespace-nowrap">
							{{ BADGE_STATES[badgeState] }}
						</div>
						<motion.span
							class="relative"
							:animate="{ width: labelWidth }"
							:transition="SPRING_CONFIG"
						>
							<AnimatePresence mode="sync" :initial="false">
								<motion.div
									:key="badgeState"
									class="whitespace-nowrap text-sm font-medium"
									:initial="{ y: -20, opacity: 0, filter: 'blur(10px)', position: 'absolute' }"
									:animate="{ y: 0, opacity: 1, filter: 'blur(0px)', position: 'relative' }"
									:exit="{ y: 20, opacity: 0, filter: 'blur(10px)', position: 'absolute' }"
									:transition="{ duration: 0.2, ease: 'easeInOut' }"
								>
									{{ BADGE_STATES[badgeState] }}
								</motion.div>
							</AnimatePresence>
						</motion.span>
					</motion.div>
				</button>
			</div>
		</section>

		<Separator />

		<!-- Accordion -->
		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-semibold">Accordion</h2>
			<p class="text-sm text-muted-foreground">
				Height animation with mask gradient, content blur, chevron rotation, and shared focus ring
				via
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">layoutId</code>.
			</p>
			<MotionAccordion :items="accordionItems" />
		</section>

		<Separator />

		<!-- Shared Layout Animation — Card to Dialog -->
		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-semibold">Shared Layout Animation</h2>
			<p class="text-sm text-muted-foreground">
				Click a card — it morphs into an expanded view using
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">layoutId</code>. Press Escape
				or click the overlay to close.
			</p>

			<MotionConfig :transition="{ type: 'spring', bounce: 0.1, visualDuration: 0.3 }">
				<AnimatePresence>
					<!-- Gallery — always rendered -->
					<div class="flex gap-3">
						<motion.div
							v-for="(card, i) in cards"
							:key="card.id"
							:layoutId="card.id"
							class="w-48 cursor-pointer overflow-hidden bg-muted shadow dark:bg-card select-none touch-none"
							:style="{
								borderRadius: '12px',
								zIndex: cardZIndices[i],
								willChange: 'transform, opacity',
							}"
							@press="
								() => {
									openCard(i)
									cardZIndices[i]!.set(baseZIndex + zStack.indexOf('thumbnail'))
								}
							"
							@layoutAnimationStart="
								() => cardZIndices[i]!.set(baseZIndex + zStack.indexOf('thumbnail'))
							"
							@layoutAnimationComplete="() => cardZIndices[i]!.set(0)"
						>
							<motion.img
								:layoutId="`${card.id}-image`"
								:src="card.image"
								:alt="card.title"
								class="aspect-[3/2] w-full object-cover"
								:style="{ willChange: 'transform' }"
							/>
							<div class="p-3">
								<p class="text-xs font-medium">{{ card.title }}</p>
								<p class="mt-0.5 text-xs text-muted-foreground">{{ card.summary }}</p>
							</div>
						</motion.div>
					</div>

					<!-- Overlay -->
					<motion.div
						v-if="selectedIndex !== false"
						key="overlay"
						:initial="{ opacity: 0 }"
						:animate="{ opacity: 1 }"
						:exit="{ opacity: 0 }"
						class="fixed inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-none"
						:style="{ zIndex: baseZIndex + zStack.indexOf('overlay'), willChange: 'opacity' }"
					/>
				</AnimatePresence>

				<!-- Expanded card -->
				<AnimatePresence :unwrap-element="true">
					<div
						v-if="selectedIndex !== false && selectedCardData"
						class="fixed inset-0 flex items-center justify-center"
						:style="{ zIndex: baseZIndex + zStack.indexOf('image') }"
						@click="closeCard"
					>
						<motion.div
							:layoutId="selectedCardData.id"
							class="w-full max-w-lg overflow-hidden bg-card shadow-2xl"
							:style="{ borderRadius: '16px', willChange: 'transform, opacity' }"
						>
							<motion.img
								:layoutId="`${selectedCardData.id}-image`"
								:src="selectedCardData.image"
								:alt="selectedCardData.title"
								class="aspect-[2/1] w-full object-cover"
								:style="{ willChange: 'transform' }"
							/>
							<div class="p-5" @click.stop>
								<div class="flex items-start justify-between gap-4">
									<div>
										<p class="text-lg font-semibold">{{ selectedCardData.title }}</p>
										<p class="mt-0.5 text-sm text-muted-foreground">
											{{ selectedCardData.summary }}
										</p>
									</div>
									<Button variant="ghost" size="icon-sm" class="shrink-0" @click="closeCard">
										<IconLucide-x class="size-4" />
										<span class="sr-only">Close</span>
									</Button>
								</div>
								<Motion
									:initial="{ opacity: 0 }"
									:animate="{ opacity: 1 }"
									:transition="{ duration: 0.2, delay: 0.15 }"
								>
									<p class="mt-4 text-sm leading-relaxed text-muted-foreground">
										{{ selectedCardData.body }}
									</p>
								</Motion>
							</div>
						</motion.div>
					</div>
				</AnimatePresence>
			</MotionConfig>
		</section>
	</div>
</template>
