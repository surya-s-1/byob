import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'

export async function getCurrentUser() {
	const token = (await cookies()).get('access-token')?.value
	if (!token) return null
	return await auth.verifyAccessToken(token)
}
