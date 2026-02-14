import { createClient } from '@supabase/supabase-js'
import { AuthAdapter, AuthUser, OAuthProvider } from '../types'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export const supabaseAdapter: AuthAdapter = {
	async getLoginUrl(provider: OAuthProvider, redirectTo?: string) {
		const defaultRedirect = 'http://localhost:3000/auth/callback'
		const finalRedirect = redirectTo
			? `${defaultRedirect}?callbackUrl=${encodeURIComponent(redirectTo)}`
			: defaultRedirect

		const { data } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: finalRedirect,
				skipBrowserRedirect: true,
			},
		})

		return data.url
	},

	async verifyAccessToken(token: string): Promise<AuthUser | null> {
		const { data, error } = await supabase.auth.getUser(token)

		if (error || !data.user) return null

		const u = data.user

		return {
			id: u.id,
			email: u.email ?? '',
			name: u.user_metadata?.full_name,
			avatar: u.user_metadata?.avatar_url,
		}
	},
}
