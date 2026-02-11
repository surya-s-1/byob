export type OAuthProvider = 'google' | 'github'

export interface AuthUser {
	id: string
	email: string
	name?: string
	avatar?: string
}

export interface AuthAdapter {
	getLoginUrl(provider: OAuthProvider): Promise<string | null>
	verifyAccessToken(token: string): Promise<AuthUser | null>
}
