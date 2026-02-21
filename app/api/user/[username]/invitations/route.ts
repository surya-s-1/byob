import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publicationInvitations } from '@/db/schema'
import { eq, and, isNull, count } from 'drizzle-orm'
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

		if (!currentUser || currentUser.username !== username) {
			return NextResponse.json(
				{ publications: null, pagination: null, error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		const invitations = await db.query.publicationInvitations.findMany({
			where: and(
				eq(publicationInvitations.userId, currentUser.id),
				isNull(publicationInvitations.rejectedAt),
				isNull(publicationInvitations.deletedAt)
			),
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
			.from(publicationInvitations)
			.where(
				and(
					eq(publicationInvitations.userId, currentUser.id),
					isNull(publicationInvitations.rejectedAt),
					isNull(publicationInvitations.deletedAt)
				)
			)

		const formattedPublications = invitations.map((invitation) => {
			const pub = invitation.publication
			return {
				id: pub.id,
				slug: pub.slug,
				displayName: pub.displayName,
				displayDescription: pub.displayDescription,
				cover: pub.cover,
				visibility: pub.publicationVisibility,
				followersCount: pub.followers.length,
				isFollowing: false, // Default for invitations
				isMember: false,
				myRole: invitation.userRole, // This is the role they are invited for
			}
		})

		return NextResponse.json({
			publications: formattedPublications,
			pagination: {
				total: totalCount.value,
				page,
			},
			error: null,
		})
	} catch (error: any) {
		console.error('Error fetching invitations:', error)
		return NextResponse.json(
			{ publications: null, pagination: null, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
