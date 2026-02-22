import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { articles, comments } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ commented: false, error: 'Unauthorized' }, { status: 401 })
		}

		const article = await db.query.articles.findFirst({
			where: and(eq(articles.id, id), isNull(articles.deletedAt)),
		})

		if (!article) {
			return NextResponse.json(
				{ commented: false, error: 'Article not found' },
				{ status: 404 }
			)
		}

		const body = await req.json()
		const { content, parentId } = body

		if (!content) {
			return NextResponse.json(
				{ commented: false, error: 'Content is required' },
				{ status: 400 }
			)
		}

		if (parentId) {
			const parentComment = await db.query.comments.findFirst({
				where: and(eq(comments.id, parentId), isNull(comments.deletedAt)),
			})
			if (!parentComment) {
				return NextResponse.json(
					{ commented: false, error: 'Parent comment not found' },
					{ status: 404 }
				)
			}
		}

		await db.insert(comments).values({
			articleId: id,
			userId: currentUser.id,
			content,
			parentId: parentId || null,
		})

		return NextResponse.json({ commented: true, error: null })
	} catch (error: any) {
		console.error('Error posting comment:', error)
		return NextResponse.json(
			{ commented: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
