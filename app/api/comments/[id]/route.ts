import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { comments } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ updated: false, error: 'Unauthorized' }, { status: 401 })
        }

        const comment = await db.query.comments.findFirst({
            where: and(eq(comments.id, id), isNull(comments.deletedAt)),
        })

        if (!comment) {
            return NextResponse.json({ updated: false, error: 'Comment not found' }, { status: 404 })
        }

        if (comment.userId !== currentUser.id) {
            return NextResponse.json({ updated: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { content } = body

        if (!content) {
            return NextResponse.json({ updated: false, error: 'Content is required' }, { status: 400 })
        }

        await db
            .update(comments)
            .set({ content, updatedAt: new Date() })
            .where(eq(comments.id, id))

        return NextResponse.json({ updated: true, error: null })
    } catch (error: any) {
        console.error('Error updating comment:', error)
        return NextResponse.json({ updated: false, error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ deleted: false, error: 'Unauthorized' }, { status: 401 })
        }

        const comment = await db.query.comments.findFirst({
            where: and(eq(comments.id, id), isNull(comments.deletedAt)),
        })

        if (!comment) {
            return NextResponse.json({ deleted: false, error: 'Comment not found' }, { status: 404 })
        }

        if (comment.userId !== currentUser.id) {
            return NextResponse.json({ deleted: false, error: 'Forbidden' }, { status: 403 })
        }

        await db
            .update(comments)
            .set({ deletedAt: new Date() })
            .where(eq(comments.id, id))

        return NextResponse.json({ deleted: true, error: null })
    } catch (error: any) {
        console.error('Error deleting comment:', error)
        return NextResponse.json({ deleted: false, error: 'Internal server error' }, { status: 500 })
    }
}
