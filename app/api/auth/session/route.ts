import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
	const { access_token } = await req.json()

	const user = await auth.verifyAccessToken(access_token)

	if (!user) {
		return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
	}

	const res = NextResponse.json({ ok: true })

	res.cookies.set('access-token', access_token, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/',
	})

	return res
}
