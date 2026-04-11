<script setup lang="ts">
import { motion } from 'motion-v'

interface AccordionItem {
	header: string
	content: string[]
}

defineProps<{
	items: AccordionItem[]
}>()

const openIndex = ref<number | null>(null)
const focusedIndex = ref<number | null>(null)

function toggle(i: number) {
	openIndex.value = openIndex.value === i ? null : i
}

function onKeyboardFocus(i: number, e: FocusEvent) {
	const target = e.target as HTMLElement
	if (target.matches(':focus-visible')) {
		focusedIndex.value = i
	}
}
</script>

<template>
	<div class="flex max-w-lg flex-col rounded-lg border border-border bg-card">
		<MotionConfig :transition="{ duration: 0.3 }">
			<motion.section
				v-for="(item, i) in items"
				:key="i"
				initial="closed"
				:animate="openIndex === i ? 'open' : 'closed'"
				class="relative px-5 py-4"
			>
				<h3 class="m-0 flex">
					<motion.button
						class="relative flex flex-1 cursor-pointer items-center justify-between text-left"
						:aria-expanded="openIndex === i"
						whilePress="pressed"
						@click="toggle(i)"
						@focus="(e: FocusEvent) => onKeyboardFocus(i, e)"
						@blur="focusedIndex = null"
					>
						<span class="relative z-10 text-sm font-medium">{{ item.header }}</span>
						<motion.svg
							class="relative z-10 size-5 text-muted-foreground"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							:initial="{ rotate: 0 }"
							:animate="{ rotate: openIndex === i ? 180 : 0 }"
							:transition="{ duration: 0.3 }"
						>
							<path d="m6 9 6 6 6-6" />
						</motion.svg>
						<motion.div
							v-if="focusedIndex === i"
							layoutId="accordion-focus-ring"
							class="absolute -inset-2.5 z-0 rounded bg-accent"
							:variants="{ pressed: { scale: 0.98 } }"
							:transition="{ type: 'spring', visualDuration: 0.2, bounce: 0.2 }"
						/>
					</motion.button>
				</h3>
				<motion.div
					class="overflow-hidden"
					:variants="{
						open: {
							height: 'auto',
							maskImage: 'linear-gradient(to bottom, black 100%, transparent 100%)',
						},
						closed: {
							height: 0,
							maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
						},
					}"
				>
					<motion.div
						:variants="{
							open: { filter: 'blur(0px)', opacity: 1 },
							closed: { filter: 'blur(2px)', opacity: 0 },
						}"
					>
						<div class="pt-3">
							<p
								v-for="(text, j) in item.content"
								:key="j"
								class="text-sm leading-relaxed text-muted-foreground"
								:class="{ 'mt-2': j > 0 }"
							>
								{{ text }}
							</p>
						</div>
					</motion.div>
				</motion.div>
				<hr
					v-if="i < items.length - 1"
					class="absolute inset-x-5 bottom-0 border-0 border-b border-border"
				/>
			</motion.section>
		</MotionConfig>
	</div>
</template>
