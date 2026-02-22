import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publicationMembers, publicationInvitations, user } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ invited: false, error: 'Unauthorized' }, { status: 401 })
		}

		// Check permission - only OWNER or ADMIN can invite
		const member = await db.query.publicationMembers.findFirst({
			where: and(
				eq(publicationMembers.publicationId, id),
				eq(publicationMembers.userId, currentUser.id)
			),
		})

		if (!member || (member.userRole !== 'OWNER' && member.userRole !== 'ADMIN')) {
			return NextResponse.json({ invited: false, error: 'Forbidden' }, { status: 403 })
		}

		const body = await req.json()
		const { userId, role } = body

		if (!userId || !role) {
			return NextResponse.json({ invited: false, error: 'Missing fields' }, { status: 400 })
		}

		// Check if user exists
		const targetUser = await db.query.user.findFirst({
			where: eq(user.id, userId),
		})

		if (!targetUser) {
			return NextResponse.json({ invited: false, error: 'User not found' }, { status: 404 })
		}

		// Check if already a member
		const existingMember = await db.query.publicationMembers.findFirst({
			where: and(
				eq(publicationMembers.publicationId, id),
				eq(publicationMembers.userId, userId)
			),
		})

		if (existingMember) {
			return NextResponse.json(
				{ invited: false, error: 'User is already a member' },
				{ status: 400 }
			)
		}

		// Create invitation (upsert or insert)
		await db
			.insert(publicationInvitations)
			.values({
				publicationId: id,
				userId: userId,
				userRole: role,
			})
			.onConflictDoUpdate({
				target: [publicationInvitations.publicationId, publicationInvitations.userId],
				set: {
					userRole: role,
					createdAt: new Date(),
					rejectedAt: null,
					deletedAt: null,
				},
			})

		return NextResponse.json({ invited: true, error: null })
	} catch (error: any) {
		console.error('Error inviting member:', error)
		return NextResponse.json(
			{ invited: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
