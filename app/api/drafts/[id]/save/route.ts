import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { articleDrafts, publicationMembers } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, isNull } from 'drizzle-orm'

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

        const draftData = await db.query.articleDrafts.findFirst({
            where: and(eq(articleDrafts.id, id), isNull(articleDrafts.deletedAt)),
        })

        if (!draftData) {
            return NextResponse.json({ updated: false, error: 'Draft not found' }, { status: 404 })
        }

        // Check lock
        if (draftData.lockedByUserId && draftData.lockedByUserId !== currentUser.id) {
            const isLockExpired = draftData.lockedUntil && (new Date(draftData.lockedUntil).getTime() < Date.now())

            if (!isLockExpired) {
                return NextResponse.json({ updated: false, error: 'Draft is locked by another user' }, { status: 423 })
            }
        }

        // Check permission - must be OWNER, ADMIN, or EDITOR
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, draftData.publicationId),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        const allowedRoles = ['OWNER', 'ADMIN', 'EDITOR']
        if (!member || !allowedRoles.includes(member.userRole)) {
            return NextResponse.json({ updated: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { title, subtitle, content, cover, visibility, scheduledAt, excerpt } = body

        await db
            .update(articleDrafts)
            .set({
                title: title ?? draftData.title,
                subtitle: subtitle ?? draftData.subtitle,
                content: content ?? draftData.content,
                cover: cover ?? draftData.cover,
                articleVisibility: visibility ?? draftData.articleVisibility,
                scheduledAt: scheduledAt !== undefined ? (scheduledAt ? new Date(scheduledAt) : null) : draftData.scheduledAt,
                excerpt: excerpt ?? draftData.excerpt,
                updatedAt: new Date(),
                // Automatically refresh lock when saving (5 mins from now)
                lockedByUserId: currentUser.id,
                lockedUntil: new Date(Date.now() + 5 * 60 * 1000),
            })
            .where(eq(articleDrafts.id, id))

        return NextResponse.json({ updated: true, error: null })
    } catch (error: any) {
        console.error('Error saving draft:', error)
        return NextResponse.json({ updated: false, error: 'Internal server error' }, { status: 500 })
    }
}
