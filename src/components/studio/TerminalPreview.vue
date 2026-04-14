<script setup lang="ts">
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import PreviewControls from './PreviewControls.vue'
import SegmentOverlay from './SegmentOverlay.vue'
import MockDataModal from './mockdata/MockDataModal.vue'
import { MOCK_DATA_PRESETS } from '@/data/mockPresets'
import { getTerminalFont } from '@/lib/terminalFonts'

const previewStore = usePreviewStore()
const mockDataStore = useMockDataStore()

const mockDataModalOpen = ref(false)

const mockPresetLabel = computed(() => {
	if (mockDataStore.activePreset === 'custom') return 'Custom'
	return (
		MOCK_DATA_PRESETS.find((p) => p.id === mockDataStore.activePreset)?.name ??
		mockDataStore.activePreset
	)
})

function handleMockPresetChange(value: string) {
	if (value !== 'custom') {
		mockDataStore.applyPreset(value)
	}
}

const claudeHeaderTopHtml = computed(() => {
	if (!previewStore.showClaudeHeader) return ''
	const w = previewStore.terminalWidth
	const hr = '─'.repeat(w)
	const model = mockDataStore.hookData.model?.display_name ?? 'Sonnet 4'
	const cwd = mockDataStore.hookData.cwd ?? '~'

	const logoColor = 'color: rgb(215, 119, 87)'
	const dimColor = 'color: inherit; opacity: 0.5'

	const logoLines = [' ▐▛███▜▌ ', '▝▜█████▛▘', '  ▘▘ ▝▝  ']

	const textLines = ['  Claude Code', `  ${model} · Claude Max`, `  ${cwd}`]

	const wrap = (ch: string) => `<span class="tch">${ch}</span>`
	const wrapStr = (s: string) => [...s].map(wrap).join('')

	const lines = logoLines.map(
		(logo, i) => `<span style="${logoColor}">${wrapStr(logo)}</span>${wrapStr(textLines[i] ?? '')}`,
	)

	const hrHtml = `<span style="${dimColor}">${wrapStr(hr)}</span>`

	return lines.join('\n') + '\n' + hrHtml + '\n'
})

const claudeHeaderBottomHtml = computed(() => {
	if (!previewStore.showClaudeHeader) return ''
	const w = previewStore.terminalWidth
	const hr = '─'.repeat(w)
	const dimColor = 'color: inherit; opacity: 0.5'
	const wrap = (ch: string) => `<span class="tch">${ch}</span>`
	const wrapStr = (s: string) => [...s].map(wrap).join('')
	const hrHtml = `<span style="${dimColor}">${wrapStr(hr)}</span>`
	return '\n' + hrHtml + '\n'
})

// --- Typewriter sentences ---

import { delay, wrap as motionWrap } from 'motion-v'
import { Typewriter } from 'motion-plus-vue'

const TYPEWRITER_LINES = [
	'make my statusline look amazing',
	'why do programmers prefer dark mode? because light attracts bugs',
	'is this the best statusline configurator ever? yes. yes it is',
	'a SQL query walks into a bar, sees two tables, and asks... can I join you?',
	'have you tried the TUI layout yet?',
	"there are only 10 types of people in the world: those who understand binary and those who don't",
	'claude-powerline is pretty awesome, not gonna lie',
	'a programmer had a problem, they decided to use regex. now they have two problems',
	"try switching between themes, it's oddly satisfying",
	"the best thing about a boolean is that even if you're wrong, you're only off by a bit",
	'fun fact: the first computer bug was an actual moth found in 1947',
	'drag those segments around, you know you want to',
	"why do Java developers wear glasses? because they can't C#",
	"export your config when you're done, it's just JSON",
	'to understand recursion, you must first understand recursion',
	'fun fact: git was created by Linus Torvalds in just 10 days',
	'have you tried clicking the traffic light buttons?',
	"there's no place like 127.0.0.1",
	'a clean statusline is a happy statusline',
	"!false — it's funny because it's true",
	'fun fact: the Apollo 11 guidance computer had only 74KB of memory',
	'what do you call a mass of poorly-written code? spaghetti',
	'your statusline called. it wants more segments',
	"fun fact: the term 'bug' predates computers — Edison used it in 1878",
	"knock knock. race condition. who's there?",
	'try the capsule style, it looks surprisingly clean',
	'fun fact: the first 1GB hard drive weighed 550 pounds and cost $40,000',
	"why do Python programmers have low self-esteem? they're constantly comparing themselves to others",
	'pro tip: the reserved area shows how much space tmux takes',
	'fun fact: the @ symbol was almost removed from keyboards in the 1800s',
	'an SQL statement walks into a bar and sees two tables. can I join you?',
	'a statusline is worth a thousand keystrokes',
	'fun fact: the first website ever made is still online at info.cern.ch',
	"hey, you're doing great. this config looks nice",
	'what sits on your desk, stares at you, and judges your commit messages?',
	'fun fact: the average developer mass-produces about 100 lines of code per day',
	'try importing an existing config — it just works',
	"it works on my machine. then we'll ship your machine",
	'fun fact: about 70% of all open-source projects are maintained by one person',
	"what is a programmer's favorite hangout place? foo bar",
]

const typewriterIndex = ref(Math.floor(Math.random() * TYPEWRITER_LINES.length))
const typewriterPaused = ref(false)

const currentTypewriterText = computed(() =>
	typewriterPaused.value ? '' : (TYPEWRITER_LINES[typewriterIndex.value] ?? ''),
)

function handleTypewriterComplete() {
	if (typewriterPaused.value) {
		delay(
			() => {
				typewriterIndex.value = motionWrap(0, TYPEWRITER_LINES.length, typewriterIndex.value + 1)
				typewriterPaused.value = false
			},
			0.5 + Math.random() * 1.5,
		)
	} else {
		delay(
			() => {
				typewriterPaused.value = true
			},
			3 + Math.random() * 4,
		)
	}
}

const EMOJIS_RED = [
	'🔥',
	'❤️',
	'🌹',
	'🍎',
	'🍒',
	'🍓',
	'🎸',
	'🫀',
	'💋',
	'🌶️',
	'🦞',
	'🦀',
	'🐙',
	'🏎️',
	'🎯',
	'🧧',
	'♥️',
	'❣️',
	'🔴',
	'♦️',
	'🥀',
	'🍷',
	'🦑',
	'👺',
	'🎈',
	'🫁',
	'🩸',
	'🥊',
	'🧲',
	'🪸',
	'🐞',
	'🦩',
	'🍄',
	'🏮',
	'🚗',
	'📍',
	'💄',
	'🧣',
	'🎒',
	'🪭',
]

const EMOJIS_YELLOW = [
	'☀️',
	'🌻',
	'🍋',
	'⭐',
	'💛',
	'🌼',
	'🍌',
	'🌕',
	'👑',
	'🏆',
	'🔔',
	'🧈',
	'🍯',
	'✨',
	'💫',
	'🌤️',
	'🐝',
	'🌽',
	'🧀',
	'🪙',
	'🐥',
	'🐤',
	'🌟',
	'💰',
	'🔆',
	'🌾',
	'🍋‍🟩',
	'🎗️',
	'📒',
	'🌙',
	'🍺',
	'🧽',
	'🐠',
	'🦁',
	'🔑',
	'🪅',
	'🎺',
	'🌝',
	'💡',
	'🥐',
]

const EMOJIS_GREEN = [
	'🍀',
	'🌿',
	'🌱',
	'🐸',
	'🍃',
	'💚',
	'🌲',
	'🥝',
	'🥒',
	'🥦',
	'🐊',
	'🦎',
	'🪲',
	'🌴',
	'🍏',
	'🥑',
	'🫑',
	'🐢',
	'🦜',
	'🧩',
	'🌵',
	'🪴',
	'🫛',
	'🥬',
	'🥗',
	'🐍',
	'🦚',
	'☘️',
	'🧃',
	'🎍',
	'🫒',
	'🥎',
	'🐛',
	'🦗',
	'🌳',
	'🎋',
	'🔫',
	'🪖',
	'🐲',
	'🧪',
]

const GRAVITY = 380
const FADE_IN_SPEED = 8

interface Particle {
	id: number
	emoji: string
	x: number
	y: number
	vx: number
	vy: number
	rotation: number
	rotationSpeed: number
	scale: number
	opacity: number
}

let nextId = 0
const particles = shallowRef<Particle[]>([])
let rafId: number | null = null
let lastTime = 0

function tick(time: number) {
	const dt = Math.min((time - lastTime) / 1000, 0.05)
	lastTime = time

	const maxY = window.innerHeight + 100
	const maxX = window.innerWidth + 100

	const updated: Particle[] = []
	for (const p of particles.value) {
		const vy = p.vy + GRAVITY * dt
		const x = p.x + p.vx * dt
		const y = p.y + vy * dt
		const rotation = p.rotation + p.rotationSpeed * dt
		const opacity = Math.min(1, p.opacity + dt * FADE_IN_SPEED)
		const scale = Math.min(1, p.scale + dt * FADE_IN_SPEED)

		if (y < maxY && x > -100 && x < maxX) {
			updated.push({ ...p, x, y, vx: p.vx, vy, rotation, opacity, scale })
		}
	}

	particles.value = updated

	if (updated.length > 0) {
		rafId = requestAnimationFrame(tick)
	} else {
		rafId = null
	}
}

function spawnParticle(pool: string[], event: MouseEvent) {
	const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2
	const speed = 120 + Math.random() * 180

	const particle: Particle = {
		id: nextId++,
		emoji: pool[Math.floor(Math.random() * pool.length)],
		x: event.clientX,
		y: event.clientY,
		vx: Math.cos(angle) * speed,
		vy: Math.sin(angle) * speed,
		rotation: 0,
		rotationSpeed: (Math.random() - 0.5) * 400,
		scale: 0,
		opacity: 0,
	}

	particles.value = [...particles.value, particle]

	if (rafId === null) {
		lastTime = performance.now()
		rafId = requestAnimationFrame(tick)
	}
}

onScopeDispose(() => {
	if (rafId !== null) cancelAnimationFrame(rafId)
})

const popoverOpen = ref(false)
const triggerRef = ref<InstanceType<typeof Button> | null>(null)
const anchorStyle = ref<{
	position: string
	top: string
	left: string
	width: string
	height: string
}>()

watch(popoverOpen, (open) => {
	const el = triggerRef.value?.$el as HTMLElement | undefined
	if (open && el) {
		const rect = el.getBoundingClientRect()
		anchorStyle.value = {
			position: 'fixed',
			top: `${rect.top}px`,
			left: `${rect.left}px`,
			width: `${rect.width}px`,
			height: `${rect.height}px`,
		}
	} else {
		anchorStyle.value = undefined
	}
})

const terminalStyle = computed(() => ({
	'--terminal-bg': previewStore.terminalBgColor,
	'--terminal-fg': previewStore.terminalFgColor,
}))

const preStyle = computed(() => ({
	fontFamily: previewStore.terminalFontFamily,
	fontWeight: previewStore.fontWeight,
	fontFeatureSettings: "'calt' 0, 'liga' 0",
	fontSize: `${previewStore.fontSize}px`,
	lineHeight: previewStore.effectiveLineHeight,
}))

const headerLineHeight = computed(
	() => getTerminalFont(previewStore.terminalFont).tuiLineHeight - 0.05,
)

const contentStyle = computed(() => ({
	width: `${previewStore.terminalWidth}ch`,
}))

const reservedStyle = computed(() => {
	const tw = previewStore.terminalWidth
	const rw = previewStore.reservedWidth
	if (rw <= 0 || rw >= tw) return null
	return {
		left: `${tw - rw}ch`,
		width: `${rw}ch`,
	}
})

const effectiveWidth = computed(() =>
	Math.max(1, previewStore.terminalWidth - previewStore.reservedWidth),
)
</script>

<template>
	<div class="w-fit max-w-full overflow-hidden rounded-xl border border-border shadow-lg">
		<!-- Emoji particles (fixed, can drift anywhere) -->
		<Teleport to="body">
			<span
				v-for="p in particles"
				:key="p.id"
				class="pointer-events-none fixed z-[9999] text-4xl leading-none"
				:style="{
					left: `${p.x}px`,
					top: `${p.y}px`,
					transform: `translate(-50%, -50%) scale(${p.scale}) rotate(${p.rotation}deg)`,
					opacity: p.opacity,
					willChange: 'transform, opacity',
				}"
			>
				{{ p.emoji }}
			</span>
		</Teleport>
		<!-- Title Bar -->
		<div class="relative flex h-9 items-center border-b border-border bg-muted px-4">
			<div class="flex gap-2">
				<button
					class="size-3 cursor-pointer rounded-full border-0 bg-[#FF5F56] p-0 transition-transform hover:scale-125 active:scale-90"
					aria-hidden="true"
					tabindex="-1"
					@click="spawnParticle(EMOJIS_RED, $event)"
				/>
				<button
					class="size-3 cursor-pointer rounded-full border-0 bg-[#FFBD2E] p-0 transition-transform hover:scale-125 active:scale-90"
					aria-hidden="true"
					tabindex="-1"
					@click="spawnParticle(EMOJIS_YELLOW, $event)"
				/>
				<button
					class="size-3 cursor-pointer rounded-full border-0 bg-[#27C93F] p-0 transition-transform hover:scale-125 active:scale-90"
					aria-hidden="true"
					tabindex="-1"
					@click="spawnParticle(EMOJIS_GREEN, $event)"
				/>
			</div>
			<span class="flex-1 text-center text-xs text-muted-foreground">
				powerline-studio — bash
			</span>
			<div class="flex shrink-0 items-center gap-1">
				<Badge variant="secondary" class="hidden sm:inline-flex">
					{{ effectiveWidth }}/{{ previewStore.terminalWidth }} cols
				</Badge>

				<!-- Mock Data Controls -->
				<TooltipProvider :delay-duration="300" :disable-hoverable-content="true">
					<DropdownMenu>
						<DropdownMenuTrigger as-child>
							<button
								class="ml-3 flex h-7 cursor-pointer items-center gap-1 rounded-md border-none bg-transparent px-2 text-xs hover:bg-foreground/10"
								:aria-label="`Mock data preset: ${mockPresetLabel}`"
							>
								<IconLucide-clipboard-list class="size-3.5 shrink-0 text-muted-foreground" />
								<span class="hidden text-muted-foreground sm:inline">{{ mockPresetLabel }}</span>
								<IconLucide-chevron-down class="size-3.5 text-muted-foreground" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" class="min-w-[220px]">
							<DropdownMenuItem class="gap-2" @click="mockDataModalOpen = true">
								<IconLucide-sliders-horizontal class="size-3.5" />
								Configure custom mock data
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuRadioGroup
								:model-value="mockDataStore.activePreset"
								@update:model-value="handleMockPresetChange"
							>
								<DropdownMenuRadioItem
									v-for="preset in MOCK_DATA_PRESETS"
									:key="preset.id"
									:value="preset.id"
									class="flex flex-col items-start gap-0 py-2 [&>span:first-child]:top-3"
								>
									<span class="font-medium">{{ preset.name }}</span>
									<span class="text-xs text-muted-foreground">{{ preset.description }}</span>
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>

					<!-- Preview Settings -->
					<Tooltip :disabled="popoverOpen">
						<TooltipTrigger as-child>
							<div class="inline-flex">
								<Popover v-model:open="popoverOpen">
									<PopoverTrigger as-child>
										<Button
											ref="triggerRef"
											variant="ghost"
											size="icon-sm"
											class="size-7 hover:!bg-foreground/10"
										>
											<IconLucide-settings-2 class="size-3.5" />
											<span class="sr-only">Configure terminal preview</span>
										</Button>
									</PopoverTrigger>
									<PopoverAnchor
										v-if="anchorStyle"
										as="div"
										class="pointer-events-none"
										:style="anchorStyle"
									/>
									<PopoverContent
										align="end"
										side="bottom"
										:side-offset="8"
										class="w-[calc(100vw-2rem)] p-0 sm:w-84"
									>
										<PreviewControls />
									</PopoverContent>
								</Popover>
							</div>
						</TooltipTrigger>
						<TooltipContent side="bottom" :side-offset="8">
							Configure terminal preview
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>

		<!-- Mock Data Modal -->
		<MockDataModal v-model:open="mockDataModalOpen" />

		<!-- Terminal Body -->
		<ScrollArea
			class="min-h-[3rem] max-h-[40svh] bg-(--terminal-bg) text-(--terminal-fg)"
			:style="terminalStyle"
		>
			<pre
				v-if="previewStore.htmlOutput"
				class="whitespace-pre px-4 py-3"
				:style="preStyle"
				role="group"
				aria-label="Terminal preview of powerline statusline"
			><div :style="contentStyle"><div v-if="previewStore.showClaudeHeader" :style="{ lineHeight: headerLineHeight }"><span v-html="claudeHeaderTopHtml" /><span class="tch">❯</span><span class="tch"> </span><Typewriter
	as="span"
	:speed="40"
	:cursor-style="{ background: previewStore.terminalFgColor, width: '1ch', opacity: 0.7 }"
	:text-style="{ fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', color: 'inherit' }"
	backspace="character"
	:backspace-factor="0.5"
	@complete="handleTypewriterComplete"
>{{ currentTypewriterText }}</Typewriter><span v-html="claudeHeaderBottomHtml" /></div><div class="relative"><div aria-hidden="true" v-html="previewStore.htmlOutput" /><SegmentOverlay class="absolute inset-0" /><div
					v-if="reservedStyle"
					class="pointer-events-none absolute inset-y-0"
					:style="reservedStyle"
				><div class="reserved-stripes absolute inset-0" /><div class="absolute inset-0 flex items-center justify-center"><span class="reserved-label">RESERVED</span></div></div></div></div></pre>
			<p v-else class="px-4 py-3 text-sm italic text-muted-foreground">
				Preview will appear here...
			</p>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	</div>
</template>

<style scoped>
.reserved-stripes {
	border-left: 1px dashed currentColor;
	opacity: 0.2;
	background: repeating-linear-gradient(
		-45deg,
		currentColor 0,
		currentColor 1px,
		transparent 0,
		transparent 6px
	);
}

.reserved-label {
	font-size: 10px;
	font-weight: 700;
	letter-spacing: 0.15em;
	text-transform: uppercase;
	opacity: 0.5;
}
</style>
