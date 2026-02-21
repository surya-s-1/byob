import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { articleDrafts, publicationMembers, articleAuthors } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ draftId: null, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { publicationId } = body

        if (!publicationId) {
            return NextResponse.json({ draftId: null, error: 'publicationId is required' }, { status: 400 })
        }

        // Check permission - must be OWNER, ADMIN, or EDITOR of the publication
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, publicationId),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        const allowedRoles = ['OWNER', 'ADMIN', 'EDITOR']
        if (!member || !allowedRoles.includes(member.userRole)) {
            return NextResponse.json({ draftId: null, error: 'Forbidden' }, { status: 403 })
        }

        const [newDraft] = await db.transaction(async (tx) => {
            const [draft] = await tx
                .insert(articleDrafts)
                .values({
                    publicationId,
                    createdBy: currentUser.id,
                    title: 'Untitled Draft',
                })
                .returning()

            return [draft]
        })

        return NextResponse.json({
            draftId: newDraft.id,
            error: null,
        })
    } catch (error: any) {
        console.error('Error creating draft:', error)
        return NextResponse.json({ draftId: null, error: 'Internal server error' }, { status: 500 })
    }
}
