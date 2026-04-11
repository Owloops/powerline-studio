<script setup lang="ts">
import { motion } from 'motion-v'

const { isDark, toggleDark } = useDarkMode()
const route = useRoute()

const navLinks = [
	{ to: '/', label: 'Home' },
	{ to: '/components', label: 'Components' },
	{ to: '/charts', label: 'Charts' },
	{ to: '/content', label: 'Content' },
	{ to: '/animations', label: 'Animations' },
	{ to: '/typography', label: 'Typography' },
	{ to: '/markdown', label: 'Markdown' },
	{ to: '/forms', label: 'Forms' },
	{ to: '/eui-components', label: 'EUI' },
	{ to: '/supabase', label: 'Supabase' },
]

const isMobileMenuOpen = ref(false)

function isActive(to: string) {
	return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
	<MotionConfig reducedMotion="user">
		<div class="min-h-screen bg-background text-foreground">
			<header
				class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
			>
				<nav class="container mx-auto flex h-14 items-center justify-between px-4">
					<div class="flex items-center gap-6">
						<RouterLink to="/" class="text-lg font-semibold tracking-tight">
							Vue Template
						</RouterLink>
						<div class="hidden items-center gap-1 md:flex">
							<RouterLink
								v-for="link in navLinks"
								:key="link.to"
								:to="link.to"
								class="relative rounded-md px-3 py-2 text-sm font-medium transition-colors"
								:class="
									isActive(link.to)
										? 'text-foreground'
										: 'text-muted-foreground hover:text-foreground'
								"
							>
								<motion.div
									v-if="isActive(link.to)"
									layoutId="nav-active"
									class="absolute inset-0 rounded-md bg-accent"
									:style="{ borderRadius: '6px' }"
									:transition="{ type: 'spring', bounce: 0.15, duration: 0.5 }"
								/>
								<span class="relative z-10">{{ link.label }}</span>
							</RouterLink>
						</div>
					</div>

					<div class="flex items-center gap-2">
						<Button variant="ghost" size="icon" @click="toggleDark()">
							<IconLucide-sun v-if="isDark" class="size-5" />
							<IconLucide-moon v-else class="size-5" />
							<span class="sr-only">Toggle dark mode</span>
						</Button>

						<Button
							variant="ghost"
							size="icon"
							class="md:hidden"
							@click="isMobileMenuOpen = !isMobileMenuOpen"
						>
							<IconLucide-menu class="size-5" />
							<span class="sr-only">Toggle menu</span>
						</Button>
					</div>
				</nav>

				<div v-if="isMobileMenuOpen" class="border-t border-border md:hidden">
					<div class="container mx-auto flex flex-col gap-1 px-4 py-2">
						<RouterLink
							v-for="link in navLinks"
							:key="link.to"
							:to="link.to"
							class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
							active-class="!text-foreground bg-accent"
							@click="isMobileMenuOpen = false"
						>
							{{ link.label }}
						</RouterLink>
					</div>
				</div>
			</header>

			<main class="container mx-auto px-4 py-4 sm:py-8">
				<RouterView />
			</main>

			<Sonner />
		</div>
	</MotionConfig>
</template>
