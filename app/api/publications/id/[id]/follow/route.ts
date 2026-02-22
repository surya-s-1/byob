import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publications, publicationFollows } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ followed: false, error: 'Unauthorized' }, { status: 401 })
		}

		// Check if publication exists
		const pub = await db.query.publications.findFirst({
			where: eq(publications.id, id),
		})

		if (!pub) {
			return NextResponse.json(
				{ followed: false, error: 'Publication not found' },
				{ status: 404 }
			)
		}

		// Check if already following
		const existingFollow = await db.query.publicationFollows.findFirst({
			where: and(
				eq(publicationFollows.publicationId, id),
				eq(publicationFollows.userId, currentUser.id)
			),
		})

		if (existingFollow) {
			return NextResponse.json({ followed: true, error: null })
		}

		await db.insert(publicationFollows).values({
			publicationId: id,
			userId: currentUser.id,
		})

		return NextResponse.json({ followed: true, error: null })
	} catch (error: any) {
		console.error('Error following publication:', error)
		return NextResponse.json(
			{ followed: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
