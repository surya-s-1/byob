import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { articleDrafts, publicationMembers } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, isNull } from 'drizzle-orm'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ locked: false, error: 'Unauthorized' }, { status: 401 })
		}

		const draftData = await db.query.articleDrafts.findFirst({
			where: and(eq(articleDrafts.id, id), isNull(articleDrafts.deletedAt)),
		})

		if (!draftData) {
			return NextResponse.json({ locked: false, error: 'Draft not found' }, { status: 404 })
		}

		// Check if already locked by someone else
		if (draftData.lockedByUserId && draftData.lockedByUserId !== currentUser.id) {
			const isLockExpired =
				draftData.lockedUntil && new Date(draftData.lockedUntil).getTime() < Date.now()

			if (!isLockExpired) {
				return NextResponse.json(
					{
						locked: false,
						error: 'Draft is currently being edited by another user',
					},
					{ status: 423 }
				)
			}
		}

		// Acquire/Refresh lock (5 mins from now)
		await db
			.update(articleDrafts)
			.set({
				lockedByUserId: currentUser.id,
				lockedUntil: new Date(Date.now() + 5 * 60 * 1000),
			})
			.where(eq(articleDrafts.id, id))

		return NextResponse.json({ locked: true, error: null })
	} catch (error: any) {
		console.error('Error locking draft:', error)
		return NextResponse.json({ locked: false, error: 'Internal server error' }, { status: 500 })
	}
}
