import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { articleDrafts, publicationMembers, draftAuthors } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, isNull } from 'drizzle-orm'

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; userId: string }> }
) {
    try {
        const { id, userId } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ removed: false, error: 'Unauthorized' }, { status: 401 })
        }

        const draftData = await db.query.articleDrafts.findFirst({
            where: and(eq(articleDrafts.id, id), isNull(articleDrafts.deletedAt)),
        })

        if (!draftData) {
            return NextResponse.json({ removed: false, error: 'Draft not found' }, { status: 404 })
        }

        // Permission check - OWNER or ADMIN
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, draftData.publicationId),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!member || (member.userRole !== 'OWNER' && member.userRole !== 'ADMIN')) {
            return NextResponse.json({ removed: false, error: 'Forbidden' }, { status: 403 })
        }

        await db
            .delete(draftAuthors)
            .where(and(eq(draftAuthors.draftId, id), eq(draftAuthors.userId, userId)))

        return NextResponse.json({ removed: true, error: null })
    } catch (error: any) {
        console.error('Error removing author from draft:', error)
        return NextResponse.json({ removed: false, error: 'Internal server error' }, { status: 500 })
    }
}
