import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Provider, Session, User } from '@supabase/supabase-js'

const session = shallowRef<Session | null>(null)
const user = computed<User | null>(() => session.value?.user ?? null)
const isAuthenticated = computed(() => !!session.value)
const loading = ref(true)

let initialized = false

function init() {
	if (initialized) return
	initialized = true

	if (!isSupabaseConfigured()) {
		loading.value = false
		return
	}

	void getSupabase()
		.auth.getSession()
		.then(({ data }) => {
			session.value = data.session
			loading.value = false
		})

	getSupabase().auth.onAuthStateChange((_event, newSession) => {
		session.value = newSession
		loading.value = false

		// Clean up Supabase auth callback hash (email confirmation, magic link, etc.)
		if (window.location.hash.includes('access_token')) {
			window.history.replaceState(null, '', window.location.pathname + window.location.search)
		}
	})
}

export function useAuth() {
	init()

	async function signUp(email: string, password: string, options?: { emailRedirectTo?: string }) {
		const { data, error } = await getSupabase().auth.signUp({
			email,
			password,
			options: { emailRedirectTo: options?.emailRedirectTo },
		})
		if (error) throw error
		return data
	}

	async function signIn(email: string, password: string) {
		const { data, error } = await getSupabase().auth.signInWithPassword({ email, password })
		if (error) throw error
		return data
	}

	async function signInWithOAuth(provider: Provider) {
		const { error } = await getSupabase().auth.signInWithOAuth({
			provider,
			options: { redirectTo: `${window.location.origin}${window.location.pathname}` },
		})
		if (error) throw error
	}

	async function signOut() {
		const { error } = await getSupabase().auth.signOut()
		if (error) throw error
	}

	return {
		session: readonly(session),
		user,
		isAuthenticated,
		loading: readonly(loading),
		signUp,
		signIn,
		signInWithOAuth,
		signOut,
	}
}
