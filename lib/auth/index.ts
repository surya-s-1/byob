import 'server-only'

import { AUTH_PROVIDER } from './config'
import { AuthAdapter } from './types'
import { supabaseAdapter } from './providers/supabase'
import { neonAdapter } from './providers/neon'

const getAdapter = (): AuthAdapter => {
	switch (AUTH_PROVIDER) {
		case 'supabase':
			return supabaseAdapter

		case 'neon':
			return neonAdapter

		default:
			throw new Error(`Unsupported auth provider: ${AUTH_PROVIDER}`)
	}
}

export const auth = getAdapter()

export async function getCurrentUser() {
	return await auth.verifySession()
}