import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { AuthAdapter, AuthUser, OAuthProvider } from '../types'

export const supabaseAuth = async () => {
	const cookieStore = await cookies()

	return createServerClient(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll()
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) => {
							cookieStore.set(name, value, options)
						})
					} catch (error) {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.			
					}
				},
			},
		}
	)
}

export const supabaseAdapter: AuthAdapter = {
	async getSignInUrl(provider: OAuthProvider, redirectTo?: string) {
		const supabase = await supabaseAuth()

		let redirect = redirectTo ? `?callbackUrl=${encodeURIComponent(redirectTo)}` : ''

		const callbackUrl = `${process.env.SITE_URL}/api/auth/callback`
		const finalCallback = callbackUrl + redirect

		const { data } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: finalCallback,
				skipBrowserRedirect: true,
			},
		})

		return data.url || null
	},

	async exchangeCode(code) {
		const supabase = await supabaseAuth()
		const { error } = await supabase.auth.exchangeCodeForSession(code)
		return error
	},

	async verifySession(): Promise<AuthUser | null> {
		const supabase = await supabaseAuth()

		const { data, error } = await supabase.auth.getClaims()

		if (error || !data?.claims) return null

		const claims = data.claims

		return {
			id: claims.sub,
			email: claims.email ?? '',
			name: claims.user_metadata?.full_name || 'User',
			avatar: claims.user_metadata?.avatar_url || null,
		}
	},

	async signOut() {
		const supabase = await supabaseAuth()
		await supabase.auth.signOut()
	}
}