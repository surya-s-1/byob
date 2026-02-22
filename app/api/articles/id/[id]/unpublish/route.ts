import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { articles, publicationMembers } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ unpublished: false, error: 'Unauthorized' }, { status: 401 })
		}

		const article = await db.query.articles.findFirst({
			where: and(eq(articles.id, id), isNull(articles.deletedAt)),
		})

		if (!article) {
			return NextResponse.json(
				{ unpublished: false, error: 'Article not found' },
				{ status: 404 }
			)
		}

		// Authorization check: Only author or publication OWNER/ADMIN can unpublish
		let isAuthorized = article.createdBy === currentUser.id

		if (!isAuthorized && article.publicationId) {
			const member = await db.query.publicationMembers.findFirst({
				where: and(
					eq(publicationMembers.publicationId, article.publicationId),
					eq(publicationMembers.userId, currentUser.id)
				),
			})
			if (member && (member.userRole === 'OWNER' || member.userRole === 'ADMIN')) {
				isAuthorized = true
			}
		}

		if (!isAuthorized) {
			return NextResponse.json({ unpublished: false, error: 'Forbidden' }, { status: 403 })
		}

		await db
			.update(articles)
			.set({
				articleStatus: 'UNPUBLISHED' as any,
				updatedAt: new Date(),
			})
			.where(eq(articles.id, id))

		return NextResponse.json({ unpublished: true, error: null })
	} catch (error: any) {
		console.error('Error unpublishing article:', error)
		return NextResponse.json(
			{ unpublished: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
