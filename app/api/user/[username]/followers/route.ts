import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { user, userFollows } from '@/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
	try {
		const { username } = await params
		const { searchParams } = new URL(req.url)
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '20')
		const offset = (page - 1) * limit

		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		const targetUser = await db.query.user.findFirst({
			where: eq(user.username, username),
		})

		if (!targetUser) {
			return NextResponse.json(
				{ followers: null, pagination: null, error: 'User not found' },
				{ status: 404 }
			)
		}

		const followersData = await db
			.select({
				id: user.id,
				username: user.username,
				name: user.name,
				image: user.image,
				bio: user.bio,
			})
			.from(userFollows)
			.innerJoin(user, eq(userFollows.followedByUserId, user.id))
			.where(eq(userFollows.followedUserId, targetUser.id))
			.limit(limit)
			.offset(offset)

		const [totalCount] = await db
			.select({ value: count() })
			.from(userFollows)
			.where(eq(userFollows.followedUserId, targetUser.id))

		const followers = await Promise.all(
			followersData.map(async (follower) => {
				let isFollowing = false
				if (currentUser) {
					const followRecord = await db.query.userFollows.findFirst({
						where: and(
							eq(userFollows.followedUserId, follower.id),
							eq(userFollows.followedByUserId, currentUser.id)
						),
					})
					isFollowing = !!followRecord
				}
				return { ...follower, isFollowing }
			})
		)

		return NextResponse.json({
			followers,
			pagination: {
				total: totalCount.value,
				page,
			},
			error: null,
		})
	} catch (error: any) {
		console.error('Error fetching followers:', error)
		return NextResponse.json(
			{ followers: null, pagination: null, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
