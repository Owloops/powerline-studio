import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
	return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
}

export function getSupabase(): SupabaseClient {
	if (!_client) {
		const url = import.meta.env.VITE_SUPABASE_URL
		const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
		if (!url || !key)
			throw new Error(
				'Supabase not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY',
			)
		_client = createClient(url, key)
	}
	return _client
}
