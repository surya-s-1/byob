import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { userFollows } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: followedUserId } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ unfollowed: false, error: 'Unauthorized' }, { status: 401 })
		}

		await db
			.delete(userFollows)
			.where(
				and(
					eq(userFollows.followedUserId, followedUserId),
					eq(userFollows.followedByUserId, currentUser.id)
				)
			)

		return NextResponse.json({ unfollowed: true, error: null })
	} catch (error: any) {
		console.error('Error unfollowing user:', error)
		return NextResponse.json(
			{ unfollowed: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
