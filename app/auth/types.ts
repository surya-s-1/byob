export type OAuthProvider = 'google' | 'github'

export interface AuthUser {
	id: string
	email: string
	name: string
	avatar: string | null
}

export interface AuthAdapter {
	getSignInUrl(provider: OAuthProvider, redirectTo?: string): Promise<string | null>
	exchangeCode(code: string, callbackUrl: string): Promise<any>
	verifySession(): Promise<AuthUser | null>
	signOut(): Promise<void>
}
