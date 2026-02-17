import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST() {
	await auth.signOut()
	const res = NextResponse.json({ ok: true })

	res.cookies.delete('access-token')

	return res
}
