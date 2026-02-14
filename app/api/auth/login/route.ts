import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url)
	const provider = searchParams.get('provider') as 'google' | 'github'
	const callbackUrl = searchParams.get('callbackUrl')

	if (!provider) {
		return NextResponse.redirect(new URL('/login', req.url))
	}

	const loginUrl = await auth.getLoginUrl(provider, callbackUrl || undefined)
	return NextResponse.redirect(loginUrl || '/')
}
