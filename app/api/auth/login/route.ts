import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url)
	const provider = searchParams.get('provider') as 'google' | 'github'

	if (!provider) {
		return NextResponse.redirect('http://localhost:3000/login')
	}

	const loginUrl = await auth.getLoginUrl(provider)
	return NextResponse.redirect(loginUrl || '/')
}
