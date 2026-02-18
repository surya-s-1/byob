import { auth } from './index'
import { headers } from 'next/headers'

export async function getSession() {
	return await auth.api.getSession({
		headers: await headers(),
	})
}

export async function getCurrentUser() {
	const session = await getSession()
	return session?.user || null
}
