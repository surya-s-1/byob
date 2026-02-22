import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { collections, collectionArticles } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string; articleId: string }> }
) {
	try {
		const { id, articleId } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ removed: false, error: 'Unauthorized' }, { status: 401 })
		}

		const collection = await db.query.collections.findFirst({
			where: and(eq(collections.id, id), isNull(collections.deletedAt)),
		})

		if (!collection) {
			return NextResponse.json(
				{ removed: false, error: 'Collection not found' },
				{ status: 404 }
			)
		}

		if (collection.userId !== currentUser.id) {
			return NextResponse.json({ removed: false, error: 'Forbidden' }, { status: 403 })
		}

		await db
			.delete(collectionArticles)
			.where(
				and(
					eq(collectionArticles.collectionId, id),
					eq(collectionArticles.articleId, articleId)
				)
			)

		return NextResponse.json({ removed: true, error: null })
	} catch (error: any) {
		console.error('Error removing article from collection:', error)
		return NextResponse.json(
			{ removed: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
