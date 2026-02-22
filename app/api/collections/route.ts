import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { collections } from '@/db/schema'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ collection: null, error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { displayName, visibility } = body

		if (!displayName || !visibility) {
			return NextResponse.json(
				{ collection: null, error: 'Missing required fields' },
				{ status: 400 }
			)
		}

		const [newCollection] = await db
			.insert(collections)
			.values({
				displayName,
				visibility: visibility,
				userId: currentUser.id,
			})
			.returning()

		return NextResponse.json({
			collection: { id: newCollection.id },
			error: null,
		})
	} catch (error: any) {
		console.error('Error creating collection:', error)
		return NextResponse.json(
			{ collection: null, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
