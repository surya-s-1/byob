import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { user, comments } from '@/db/schema'
import { eq, and, count, isNull, desc } from 'drizzle-orm'

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
	try {
		const { username } = await params
		const { searchParams } = new URL(req.url)
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '20')
		const offset = (page - 1) * limit

		const targetUser = await db.query.user.findFirst({
			where: eq(user.username, username),
		})

		if (!targetUser) {
			return NextResponse.json(
				{ comments: null, pagination: null, error: 'User not found' },
				{ status: 404 }
			)
		}

		const commentsData = await db.query.comments.findMany({
			where: and(eq(comments.userId, targetUser.id), isNull(comments.deletedAt)),
			with: {
				author: true,
				replies: true,
			},
			orderBy: [desc(comments.createdAt)],
			limit: limit,
			offset: offset,
		})

		const [totalCount] = await db
			.select({ value: count() })
			.from(comments)
			.where(and(eq(comments.userId, targetUser.id), isNull(comments.deletedAt)))

		const formattedComments = commentsData.map((comment) => ({
			id: comment.id,
			content: comment.content,
			createdAt: comment.createdAt,
			user: {
				id: comment.author.id,
				name: comment.author.name,
				image: comment.author.image,
			},
			parentId: comment.parentId,
			articleId: comment.articleId,
			replyCount: comment.replies.length,
		}))

		return NextResponse.json({
			comments: formattedComments,
			pagination: {
				total: totalCount.value,
				page,
			},
			error: null,
		})
	} catch (error: any) {
		console.error('Error fetching user comments:', error)
		return NextResponse.json(
			{ comments: null, pagination: null, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
