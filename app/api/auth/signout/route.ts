import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	try {
		return auth.api.signOut({
			headers: req.headers,
			asResponse: true,
		})
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}
}
