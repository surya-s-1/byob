import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { user, publicationMembers, publicationFollows } from '@/db/schema'
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
				{ publications: null, pagination: null, error: 'User not found' },
				{ status: 404 }
			)
		}

		const memberships = await db.query.publicationMembers.findMany({
			where: eq(publicationMembers.userId, targetUser.id),
			with: {
				publication: {
					with: {
						followers: true,
						members: true,
					},
				},
			},
			limit: limit,
			offset: offset,
		})

		const [totalCount] = await db
			.select({ value: count() })
			.from(publicationMembers)
			.where(eq(publicationMembers.userId, targetUser.id))

		const formattedPublications = await Promise.all(
			memberships.map(async (membership) => {
				const pub = membership.publication
				let isFollowing = false
				let myRole = null

				if (currentUser) {
					const followRecord = await db.query.publicationFollows.findFirst({
						where: and(
							eq(publicationFollows.publicationId, pub.id),
							eq(publicationFollows.userId, currentUser.id)
						),
					})
					isFollowing = !!followRecord

					const memberRecord = await db.query.publicationMembers.findFirst({
						where: and(
							eq(publicationMembers.publicationId, pub.id),
							eq(publicationMembers.userId, currentUser.id)
						),
					})
					myRole = memberRecord?.userRole || null
				}

				return {
					id: pub.id,
					slug: pub.slug,
					displayName: pub.displayName,
					displayDescription: pub.displayDescription,
					cover: pub.cover,
					visibility: pub.publicationVisibility,
					followersCount: pub.followers.length,
					isFollowing,
					isMember: !!myRole,
					myRole,
				}
			})
		)

		return NextResponse.json({
			publications: formattedPublications,
			pagination: {
				total: totalCount.value,
				page,
			},
			error: null,
		})
	} catch (error: any) {
		console.error('Error fetching user publications:', error)
		return NextResponse.json(
			{ publications: null, pagination: null, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
