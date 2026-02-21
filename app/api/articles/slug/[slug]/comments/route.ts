import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { articles, comments } from '@/db/schema'
import { eq, and, isNull, count, desc } from 'drizzle-orm'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = (page - 1) * limit

        const article = await db.query.articles.findFirst({
            where: and(eq(articles.slug, slug), isNull(articles.deletedAt)),
        })

        if (!article) {
            return NextResponse.json({ comments: null, pagination: null, error: 'Article not found' }, { status: 404 })
        }

        const commentsData = await db.query.comments.findMany({
            where: and(
                eq(comments.articleId, article.id),
                isNull(comments.parentId), // Top level only
                isNull(comments.deletedAt)
            ),
            with: {
                author: true,
                replies: {
                    where: (comment, { isNull }) => isNull(comment.deletedAt),
                },
            },
            orderBy: [desc(comments.createdAt)],
            limit: limit,
            offset: offset,
        })

        const [totalCount] = await db
            .select({ value: count() })
            .from(comments)
            .where(
                and(
                    eq(comments.articleId, article.id),
                    isNull(comments.parentId),
                    isNull(comments.deletedAt)
                )
            )

        const formattedComments = commentsData.map((c: any) => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            author: {
                id: c.author.id,
                username: c.author.username,
                name: c.author.name,
                image: c.author.image,
            },
            replyCount: c.replies.length,
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
        console.error('Error fetching article comments:', error)
        return NextResponse.json({ comments: null, pagination: null, error: 'Internal server error' }, { status: 500 })
    }
}
