import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publicationInvitations, publicationMembers, publicationFollows } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: publicationId } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ accepted: false, error: 'Unauthorized' }, { status: 401 })
		}

		const invitation = await db.query.publicationInvitations.findFirst({
			where: and(
				eq(publicationInvitations.publicationId, publicationId),
				eq(publicationInvitations.userId, currentUser.id),
				isNull(publicationInvitations.rejectedAt),
				isNull(publicationInvitations.deletedAt)
			),
		})

		if (!invitation) {
			return NextResponse.json(
				{ accepted: false, error: 'Invitation not found' },
				{ status: 404 }
			)
		}

		await db.transaction(async (tx) => {
			// Add to members
			await tx.insert(publicationMembers).values({
				publicationId,
				userId: currentUser.id,
				userRole: invitation.userRole,
			})

			// Mark invitation as accepted
			await tx
				.update(publicationInvitations)
				.set({ acceptedAt: new Date() })
				.where(
					and(
						eq(publicationInvitations.publicationId, publicationId),
						eq(publicationInvitations.userId, currentUser.id)
					)
				)

			// Automatically follow
			const existingFollow = await tx.query.publicationFollows.findFirst({
				where: and(
					eq(publicationFollows.publicationId, publicationId),
					eq(publicationFollows.userId, currentUser.id)
				),
			})

			if (!existingFollow) {
				await tx.insert(publicationFollows).values({
					publicationId,
					userId: currentUser.id,
				})
			}
		})

		return NextResponse.json({ accepted: true, error: null })
	} catch (error: any) {
		console.error('Error accepting invitation:', error)
		return NextResponse.json(
			{ accepted: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
