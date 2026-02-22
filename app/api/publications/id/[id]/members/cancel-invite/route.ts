import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publicationMembers, publicationInvitations } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ canceled: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Check permission - only OWNER or ADMIN can cancel invites
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, id),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!member || !['OWNER', 'ADMIN'].includes(member.userRole)) {
            return NextResponse.json({ canceled: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json().catch(() => ({}))
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ canceled: false, error: 'Missing userId' }, { status: 400 })
        }

        const existingInvitation = await db.query.publicationInvitations.findFirst({
            where: and(
                eq(publicationInvitations.publicationId, id),
                eq(publicationInvitations.userId, userId),
                isNull(publicationInvitations.deletedAt)
            ),
        })

        if (!existingInvitation) {
            return NextResponse.json(
                { canceled: false, error: 'Invitation not found' },
                { status: 404 }
            )
        }

        await db
            .update(publicationInvitations)
            .set({
                deletedAt: new Date(),
                deletedBy: currentUser.id,
            })
            .where(
                and(
                    eq(publicationInvitations.publicationId, id),
                    eq(publicationInvitations.userId, userId),
                    isNull(publicationInvitations.deletedAt)
                )
            )

        return NextResponse.json({ canceled: true, error: null })
    } catch (error: any) {
        console.error('Error canceling invitation:', error)
        return NextResponse.json(
            { canceled: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
