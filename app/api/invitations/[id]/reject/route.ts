import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publicationInvitations } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: publicationId } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ rejected: false, error: 'Unauthorized' }, { status: 401 })
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
				{ rejected: false, error: 'Invitation not found' },
				{ status: 404 }
			)
		}

		await db
			.update(publicationInvitations)
			.set({ rejectedAt: new Date() })
			.where(
				and(
					eq(publicationInvitations.publicationId, publicationId),
					eq(publicationInvitations.userId, currentUser.id)
				)
			)

		return NextResponse.json({ rejected: true, error: null })
	} catch (error: any) {
		console.error('Error rejecting invitation:', error)
		return NextResponse.json(
			{ rejected: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
