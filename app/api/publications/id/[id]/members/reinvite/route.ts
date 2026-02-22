import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publicationMembers, publicationInvitations } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: publicationId } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ reinvited: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Check permission - only OWNER or ADMIN can reinvite
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, publicationId),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!member || (member.userRole !== 'OWNER' && member.userRole !== 'ADMIN')) {
            return NextResponse.json({ reinvited: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ reinvited: false, error: 'Missing userId' }, { status: 400 })
        }

        // Check for existing rejected invitation
        const invitation = await db.query.publicationInvitations.findFirst({
            where: and(
                eq(publicationInvitations.publicationId, publicationId),
                eq(publicationInvitations.userId, userId)
            ),
        })

        if (!invitation) {
            return NextResponse.json(
                { reinvited: false, error: 'Invitation not found' },
                { status: 404 }
            )
        }

        // Update invitation status to pending (clear rejection and set new timestamp)
        await db
            .update(publicationInvitations)
            .set({
                rejectedAt: null,
                acceptedAt: null,
                createdAt: new Date(),
                deletedAt: null,
                deletedBy: null,
            })
            .where(
                and(
                    eq(publicationInvitations.publicationId, publicationId),
                    eq(publicationInvitations.userId, userId)
                )
            )

        return NextResponse.json({ reinvited: true, error: null })
    } catch (error: any) {
        console.error('Error reinviting member:', error)
        return NextResponse.json(
            { reinvited: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
