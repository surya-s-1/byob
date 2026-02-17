import { headers } from 'next/headers'
import { createNeonAuth } from '@neondatabase/auth/next/server'
import { AuthAdapter, AuthUser, OAuthProvider } from '../types'

export const neonAuth = createNeonAuth({
	baseUrl: process.env.NEON_AUTH_URL!,
	cookies: {
		secret: process.env.NEON_AUTH_COOKIE_SECRET!,
	}
})

export const neonAdapter: AuthAdapter = {
	async getSignInUrl(provider: OAuthProvider, redirectTo?: string) {
		let redirect = redirectTo ? `?callbackUrl=${encodeURIComponent(redirectTo)}` : ''

		const callbackUrl = `${process.env.SITE_URL}/api/auth/callback`
		const finalCallback = callbackUrl + redirect

		try {
			const res = await neonAuth.signIn.social({
				provider,
				callbackURL: finalCallback,
				newUserCallbackURL: finalCallback,
				errorCallbackURL: `${process.env.SITE_URL}/auth/error`,
				disableRedirect: true
			})

			return res.data?.url || null
		} catch (error) {
			console.error('Failed to generate Neon sign in URL:', error)
			return null
		}
	},

	async verifySession(): Promise<AuthUser | null> {
		try {
			const session = await neonAuth.getSession({
				fetchOptions: {
					headers: await headers()
				}
			})

			if (!session || !session.data?.user) return null

			const u = session.data.user

			return {
				id: u.id,
				email: u.email,
				name: u.name || 'User',
				avatar: u.image || null,
			}
		} catch (e) {
			console.error('Neon Auth verification failed:', e)
			return null
		}
	},

	async signOut() {
		try {
			await neonAuth.signOut({
				fetchOptions: {
					headers: await headers()
				}
			})
		} catch (error) {
			console.error('Failed to sign out from Neon:', error)
		}
	}
}