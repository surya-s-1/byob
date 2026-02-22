import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { series, publicationMembers } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ updated: false, error: 'Unauthorized' }, { status: 401 })
		}

		// Check permission - only OWNER or ADMIN can update
		const member = await db.query.publicationMembers.findFirst({
			where: and(
				eq(publicationMembers.publicationId, id),
				eq(publicationMembers.userId, currentUser.id)
			),
		})

		if (!member || (member.userRole !== 'OWNER' && member.userRole !== 'ADMIN')) {
			return NextResponse.json({ updated: false, error: 'Forbidden' }, { status: 403 })
		}

		const body = await req.json()
		const seriesOrder = body.series as { seriesId: string; sortOrder: number }[]

		if (!Array.isArray(seriesOrder)) {
			return NextResponse.json({ updated: false, error: 'Invalid body' }, { status: 400 })
		}

		await db.transaction(async (tx) => {
			for (const item of seriesOrder) {
				await tx
					.update(series)
					.set({ sortOrder: item.sortOrder })
					.where(and(eq(series.id, item.seriesId), eq(series.publicationId, id)))
			}
		})

		return NextResponse.json({ updated: true, error: null })
	} catch (error: any) {
		console.error('Error updating series order:', error)
		return NextResponse.json(
			{ updated: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
