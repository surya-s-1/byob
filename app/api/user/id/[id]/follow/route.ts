import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { userFollows, user } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: followedUserId } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ followed: false, error: 'Unauthorized' }, { status: 401 })
		}

		if (currentUser.id === followedUserId) {
			return NextResponse.json(
				{ followed: false, error: 'Cannot follow yourself' },
				{ status: 400 }
			)
		}

		// Check if target user exists
		const targetUser = await db.query.user.findFirst({
			where: eq(user.id, followedUserId),
		})

		if (!targetUser) {
			return NextResponse.json({ followed: false, error: 'User not found' }, { status: 404 })
		}

		// Check if already following
		const existingFollow = await db.query.userFollows.findFirst({
			where: and(
				eq(userFollows.followedUserId, followedUserId),
				eq(userFollows.followedByUserId, currentUser.id)
			),
		})

		if (existingFollow) {
			return NextResponse.json({ followed: true, error: null })
		}

		await db.insert(userFollows).values({
			followedUserId,
			followedByUserId: currentUser.id,
		})

		return NextResponse.json({ followed: true, error: null })
	} catch (error: any) {
		console.error('Error following user:', error)
		return NextResponse.json(
			{ followed: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
