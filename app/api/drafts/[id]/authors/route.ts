import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { articleDrafts, publicationMembers, articleAuthors, draftAuthors } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, isNull } from 'drizzle-orm'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ added: false, error: 'Unauthorized' }, { status: 401 })
        }

        const draftData = await db.query.articleDrafts.findFirst({
            where: and(eq(articleDrafts.id, id), isNull(articleDrafts.deletedAt)),
        })

        if (!draftData) {
            return NextResponse.json({ added: false, error: 'Draft not found' }, { status: 404 })
        }

        // Permission check - OWNER or ADMIN
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, draftData.publicationId),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!member || (member.userRole !== 'OWNER' && member.userRole !== 'ADMIN')) {
            return NextResponse.json({ added: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const authors = body.authors as { userId: string; isPrimary: boolean }[]

        if (!Array.isArray(authors)) {
            return NextResponse.json({ added: false, error: 'Invalid authors array' }, { status: 400 })
        }

        await db.transaction(async (tx) => {
            // Clear existing
            await tx.delete(draftAuthors).where(eq(draftAuthors.draftId, id))

            // Add new
            if (authors.length > 0) {
                await tx.insert(draftAuthors).values(
                    authors.map((a) => ({
                        draftId: id,
                        userId: a.userId,
                        isPrimary: a.isPrimary,
                    }))
                )
            }
        })

        return NextResponse.json({ added: true, error: null })
    } catch (error: any) {
        console.error('Error adding authors to draft:', error)
        return NextResponse.json({ added: false, error: 'Internal server error' }, { status: 500 })
    }
}
