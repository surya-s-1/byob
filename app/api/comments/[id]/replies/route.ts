import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { comments } from '@/db/schema'
import { eq, and, isNull, count, asc } from 'drizzle-orm'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = (page - 1) * limit

        const parentComment = await db.query.comments.findFirst({
            where: and(eq(comments.id, id), isNull(comments.deletedAt)),
        })

        if (!parentComment) {
            return NextResponse.json({ replies: null, pagination: null, error: 'Comment not found' }, { status: 404 })
        }

        const repliesData = await db.query.comments.findMany({
            where: and(eq(comments.parentId, id), isNull(comments.deletedAt)),
            with: {
                author: true,
            },
            orderBy: [asc(comments.createdAt)],
            limit: limit,
            offset: offset,
        })

        const [totalCount] = await db
            .select({ value: count() })
            .from(comments)
            .where(and(eq(comments.parentId, id), isNull(comments.deletedAt)))

        const formattedReplies = repliesData.map((c: any) => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            author: {
                id: c.author.id,
                username: c.author.username,
                name: c.author.name,
                image: c.author.image,
            },
        }))

        return NextResponse.json({
            replies: formattedReplies,
            pagination: {
                total: totalCount.value,
                page,
            },
            error: null,
        })
    } catch (error: any) {
        console.error('Error fetching replies:', error)
        return NextResponse.json({ replies: null, pagination: null, error: 'Internal server error' }, { status: 500 })
    }
}
