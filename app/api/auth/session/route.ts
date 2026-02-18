import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
	return auth.api.getSession({
		headers: await headers(),
		asResponse: true,
	})
}

export async function POST() {
	return auth.api.getSession({
		headers: await headers(),
		asResponse: true,
	})
}
