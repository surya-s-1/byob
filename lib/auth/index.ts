import { AUTH_PROVIDER } from './config'
import { AuthAdapter } from './types'
import { supabaseAdapter } from './providers/supabase'

const getAdapter = (): AuthAdapter => {
	switch (AUTH_PROVIDER) {
		case 'supabase':
			return supabaseAdapter

		default:
			throw new Error(`Unsupported auth provider: ${AUTH_PROVIDER}`)
	}
}

export const auth = getAdapter()
