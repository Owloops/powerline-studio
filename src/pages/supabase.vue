<script setup lang="ts">
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import NumberFlow from '@number-flow/vue'
import { toast } from 'vue-sonner'

definePage({
	meta: { title: 'Supabase' },
})

const configured = isSupabaseConfigured()
const {
	user,
	isAuthenticated,
	loading: authLoading,
	signIn,
	signUp,
	signInWithOAuth,
	signOut,
} = useAuth()

interface Counter {
	id: string
	user_id: string
	name: string
	value: number
	created_at: string
	updated_at: string
}

// Auth form state
const email = ref('')
const password = ref('')
const authMode = ref<'signin' | 'signup'>('signin')
const formLoading = ref(false)
const authError = ref('')

async function handleAuth() {
	formLoading.value = true
	authError.value = ''
	try {
		if (authMode.value === 'signup') {
			const { session: newSession } = await signUp(email.value, password.value, {
				emailRedirectTo: `${window.location.origin}/supabase`,
			})
			if (!newSession) {
				toast.info('Check your email to confirm your account.')
			} else {
				toast.success('Account created!')
			}
		} else {
			await signIn(email.value, password.value)
			toast.success('Signed in!')
		}
		email.value = ''
		password.value = ''
	} catch (err: any) {
		authError.value = err.message
	} finally {
		formLoading.value = false
	}
}

async function handleSignOut() {
	await signOut()
	toast.success('Signed out')
}

// Counter state
const myCounter = ref<Counter | null>(null)
const allCounters = ref<Counter[]>([])
const counterLoading = ref(false)
const rlsTestResult = ref<{ success: boolean; message: string } | null>(null)

async function fetchMyCounter() {
	if (!user.value) return

	const { data, error } = await getSupabase()
		.from('counters')
		.select('*')
		.eq('user_id', user.value.id)
		.maybeSingle()

	if (error) {
		toast.error(`Failed to load counter: ${error.message}`)
		return
	}

	if (data) {
		myCounter.value = data
		return
	}

	// No counter exists — upsert to handle race conditions
	const { data: created, error: insertError } = await getSupabase()
		.from('counters')
		.upsert({ user_id: user.value.id, name: 'My Counter', value: 0 }, { onConflict: 'user_id' })
		.select()
		.single()

	if (insertError) {
		toast.error(`Failed to create counter: ${insertError.message}`)
		return
	}
	myCounter.value = created
}

async function fetchAllCounters() {
	const { data, error } = await getSupabase()
		.from('counters')
		.select('*')
		.order('created_at', { ascending: true })

	if (error) {
		toast.error(`Failed to load counters: ${error.message}`)
		return
	}
	allCounters.value = data ?? []
}

async function updateCounter(delta: number) {
	if (!myCounter.value) return
	counterLoading.value = true

	const { error } = await getSupabase()
		.from('counters')
		.update({ value: myCounter.value.value + delta })
		.eq('id', myCounter.value.id)

	if (error) {
		toast.error(`Failed to update: ${error.message}`)
	}
	counterLoading.value = false
}

async function testRlsUpdate() {
	rlsTestResult.value = null
	const otherCounter = allCounters.value.find((c) => c.user_id !== user.value?.id)

	if (!otherCounter) {
		rlsTestResult.value = {
			success: false,
			message:
				"No other users' counters to test with. Open an incognito window and create a second account.",
		}
		return
	}

	const { data, error } = await getSupabase()
		.from('counters')
		.update({ value: otherCounter.value + 1 })
		.eq('id', otherCounter.id)
		.select()

	if (error) {
		rlsTestResult.value = {
			success: false,
			message: `RLS blocked the update: ${error.message}`,
		}
	} else if (!data || data.length === 0) {
		rlsTestResult.value = {
			success: false,
			message:
				'Update returned 0 rows — RLS policy "Users can update their own counters" prevented modifying another user\'s data.',
		}
	} else {
		rlsTestResult.value = {
			success: true,
			message: "Update succeeded (this shouldn't happen with proper RLS!)",
		}
	}
}

// Realtime
let channel: ReturnType<ReturnType<typeof getSupabase>['channel']> | null = null

function subscribeToChanges() {
	channel = getSupabase()
		.channel('counters-realtime')
		.on('postgres_changes', { event: '*', schema: 'public', table: 'counters' }, (payload) => {
			if (payload.eventType === 'INSERT') {
				const inserted = payload.new as Counter
				if (!allCounters.value.some((c) => c.id === inserted.id)) {
					allCounters.value.push(inserted)
				}
			} else if (payload.eventType === 'UPDATE') {
				const updated = payload.new as Counter
				const idx = allCounters.value.findIndex((c) => c.id === updated.id)
				if (idx !== -1) allCounters.value[idx] = updated
				if (myCounter.value?.id === updated.id) {
					myCounter.value = updated
				}
			} else if (payload.eventType === 'DELETE') {
				const old = payload.old as { id: string }
				allCounters.value = allCounters.value.filter((c) => c.id !== old.id)
				if (myCounter.value?.id === old.id) myCounter.value = null
			}
		})
		.subscribe()
}

watch(
	isAuthenticated,
	async (auth) => {
		if (auth) {
			await fetchMyCounter()
			await fetchAllCounters()
			subscribeToChanges()
		} else {
			channel?.unsubscribe()
			channel = null
			myCounter.value = null
			allCounters.value = []
			rlsTestResult.value = null
		}
	},
	{ immediate: true },
)

onUnmounted(() => {
	channel?.unsubscribe()
})

const otherCountersExist = computed(() =>
	allCounters.value.some((c) => c.user_id !== user.value?.id),
)
</script>

<template>
	<div class="space-y-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Supabase</h1>
			<p class="mt-1 text-muted-foreground">
				Auth, database, realtime subscriptions, and Row Level Security.
			</p>
		</div>

		<!-- Not configured -->
		<Card v-if="!configured" class="mx-auto max-w-md">
			<CardHeader>
				<CardTitle>Not Configured</CardTitle>
				<CardDescription>
					Set
					<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">VITE_SUPABASE_URL</code>
					and
					<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs"
						>VITE_SUPABASE_PUBLISHABLE_KEY</code
					>
					in your
					<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env</code>
					file to enable auth, database, and realtime features.
				</CardDescription>
			</CardHeader>
		</Card>

		<!-- Loading auth state -->
		<div v-else-if="authLoading" class="flex items-center justify-center py-12">
			<Spinner class="size-8" />
		</div>

		<!-- Auth form -->
		<Card v-else-if="!isAuthenticated" class="mx-auto max-w-md">
			<CardHeader>
				<CardTitle>{{ authMode === 'signin' ? 'Sign In' : 'Create Account' }}</CardTitle>
				<CardDescription>
					{{
						authMode === 'signin'
							? 'Sign in with your email and password.'
							: 'Create a new account to get started.'
					}}
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<Button variant="outline" class="w-full" @click="signInWithOAuth('github')">
					<svg class="mr-2 size-4" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
						/>
					</svg>
					Continue with GitHub
				</Button>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<Separator />
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-card px-2 text-muted-foreground">or continue with email</span>
					</div>
				</div>

				<form class="space-y-4" @submit.prevent="handleAuth">
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input id="email" v-model="email" type="email" placeholder="you@example.com" required />
					</div>
					<div class="space-y-2">
						<Label for="password">Password</Label>
						<Input
							id="password"
							v-model="password"
							type="password"
							placeholder="••••••••"
							required
							minlength="6"
						/>
					</div>

					<Alert v-if="authError" variant="destructive">
						<AlertDescription>{{ authError }}</AlertDescription>
					</Alert>

					<Button type="submit" class="w-full" :disabled="formLoading">
						<Spinner v-if="formLoading" class="mr-2 size-4" />
						{{ authMode === 'signin' ? 'Sign In' : 'Sign Up' }}
					</Button>
				</form>
			</CardContent>
			<CardFooter class="justify-center">
				<Button variant="link" @click="authMode = authMode === 'signin' ? 'signup' : 'signin'">
					{{
						authMode === 'signin'
							? "Don't have an account? Sign up"
							: 'Already have an account? Sign in'
					}}
				</Button>
			</CardFooter>
		</Card>

		<!-- Authenticated content -->
		<template v-else>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<Badge variant="outline">{{ user?.email }}</Badge>
					<span class="font-mono text-xs text-muted-foreground">
						{{ user?.id.slice(0, 8) }}...
					</span>
				</div>
				<Button variant="outline" size="sm" @click="handleSignOut">
					<IconLucide-log-out class="mr-2 size-4" />
					Sign Out
				</Button>
			</div>

			<Separator />

			<div class="grid gap-6 lg:grid-cols-2">
				<!-- Your Counter -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							Your Counter
							<Badge variant="secondary" class="text-xs">Owned</Badge>
						</CardTitle>
						<CardDescription>
							Increment or decrement your counter. Changes persist to Supabase and broadcast via
							Realtime.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div v-if="myCounter" class="flex flex-col items-center gap-4">
							<NumberFlow :value="myCounter.value" class="text-6xl font-bold tabular-nums" />
							<div class="flex gap-2">
								<Button
									size="lg"
									variant="outline"
									:disabled="counterLoading"
									@click="updateCounter(-1)"
								>
									<IconLucide-minus class="size-5" />
								</Button>
								<Button size="lg" :disabled="counterLoading" @click="updateCounter(1)">
									<IconLucide-plus class="size-5" />
								</Button>
							</div>
						</div>
						<div v-else class="flex justify-center py-8">
							<Spinner class="size-6" />
						</div>
					</CardContent>
				</Card>

				<!-- RLS Security Test -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							RLS Security Test
							<Badge variant="outline" class="text-xs">Row Level Security</Badge>
						</CardTitle>
						<CardDescription>
							Try to update another user's counter. RLS policies will block the attempt.
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-1 rounded-lg bg-muted p-3 font-mono text-sm">
							<p class="text-muted-foreground">Active policies:</p>
							<p>
								SELECT →
								<span class="text-green-600 dark:text-green-400"> anyone can view </span>
							</p>
							<p>
								INSERT →
								<span class="text-yellow-600 dark:text-yellow-400"> own rows only </span>
							</p>
							<p>
								UPDATE →
								<span class="text-yellow-600 dark:text-yellow-400"> own rows only </span>
							</p>
							<p>
								DELETE →
								<span class="text-yellow-600 dark:text-yellow-400"> own rows only </span>
							</p>
						</div>

						<Button
							variant="destructive"
							class="w-full"
							:disabled="!otherCountersExist"
							@click="testRlsUpdate"
						>
							<IconLucide-shield-alert class="mr-2 size-4" />
							Attempt to Update Other User's Counter
						</Button>

						<Alert
							v-if="rlsTestResult"
							:variant="rlsTestResult.success ? 'default' : 'destructive'"
						>
							<AlertDescription>{{ rlsTestResult.message }}</AlertDescription>
						</Alert>

						<p v-if="!otherCountersExist" class="text-center text-xs text-muted-foreground">
							Open an incognito window and create a second account to test RLS.
						</p>
					</CardContent>
				</Card>
			</div>

			<!-- All Counters - Realtime -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						All Counters
						<Badge class="border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400">
							<span class="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-green-500" />
							Live
						</Badge>
					</CardTitle>
					<CardDescription>
						All users' counters updated in real-time via Supabase Realtime Postgres Changes. You can
						see all rows but can only modify your own.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table v-if="allCounters.length > 0">
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Name</TableHead>
								<TableHead class="text-right">Value</TableHead>
								<TableHead class="text-right">Owner</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow v-for="c in allCounters" :key="c.id">
								<TableCell class="font-mono text-xs"> {{ c.user_id.slice(0, 8) }}... </TableCell>
								<TableCell>{{ c.name }}</TableCell>
								<TableCell class="text-right font-medium tabular-nums">
									<NumberFlow :value="c.value" />
								</TableCell>
								<TableCell class="text-right">
									<Badge v-if="c.user_id === user?.id" variant="default"> You </Badge>
									<Badge v-else variant="secondary">Other</Badge>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
					<p v-else class="py-4 text-center text-muted-foreground">No counters yet.</p>
				</CardContent>
			</Card>
		</template>
	</div>
</template>
