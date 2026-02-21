import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publicationMembers } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; userId: string }> }
) {
    try {
        const { id, userId } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ updated: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Check permission - only OWNER or ADMIN can update roles
        const currentMember = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, id),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!currentMember || (currentMember.userRole !== 'OWNER' && currentMember.userRole !== 'ADMIN')) {
            return NextResponse.json({ updated: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { role } = body

        if (!role) {
            return NextResponse.json({ updated: false, error: 'Missing role' }, { status: 400 })
        }

        // Prevent changing the role of the OWNER if not OWNER (ADMINs can't demote OWNERs)
        const targetMember = await db.query.publicationMembers.findFirst({
            where: and(eq(publicationMembers.publicationId, id), eq(publicationMembers.userId, userId)),
        })

        if (!targetMember) {
            return NextResponse.json({ updated: false, error: 'Member not found' }, { status: 404 })
        }

        if (targetMember.userRole === 'OWNER' && currentUser.id !== userId) {
            return NextResponse.json({ updated: false, error: 'Cannot modify OWNER role' }, { status: 403 })
        }

        await db
            .update(publicationMembers)
            .set({ userRole: role })
            .where(and(eq(publicationMembers.publicationId, id), eq(publicationMembers.userId, userId)))

        return NextResponse.json({ updated: true, error: null })
    } catch (error: any) {
        console.error('Error updating member role:', error)
        return NextResponse.json({ updated: false, error: 'Internal server error' }, { status: 500 })
    }
}

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

        // Check permission - OWNER can remove anyone, ADMIN can remove others (but not OWNER), User can remove themselves
        const currentMember = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, id),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!currentMember && currentUser.id !== userId) {
            return NextResponse.json({ removed: false, error: 'Forbidden' }, { status: 403 })
        }

        const targetMember = await db.query.publicationMembers.findFirst({
            where: and(eq(publicationMembers.publicationId, id), eq(publicationMembers.userId, userId)),
        })

        if (!targetMember) {
            return NextResponse.json({ removed: false, error: 'Member not found' }, { status: 404 })
        }

        const isSelfRemoval = currentUser.id === userId
        const isOwner = currentMember?.userRole === 'OWNER'
        const isAdmin = currentMember?.userRole === 'ADMIN'

        if (isSelfRemoval) {
            if (currentMember?.userRole === 'OWNER') {
                return NextResponse.json(
                    { removed: false, error: 'OWNER must transfer ownership before leaving' },
                    { status: 400 }
                )
            }
        } else if (isOwner) {
            // Owner can remove anyone
        } else if (isAdmin) {
            if (targetMember.userRole === 'OWNER' || targetMember.userRole === 'ADMIN') {
                return NextResponse.json({ removed: false, error: 'Forbidden' }, { status: 403 })
            }
        } else {
            return NextResponse.json({ removed: false, error: 'Forbidden' }, { status: 403 })
        }

        await db
            .delete(publicationMembers)
            .where(and(eq(publicationMembers.publicationId, id), eq(publicationMembers.userId, userId)))

        return NextResponse.json({ removed: true, error: null })
    } catch (error: any) {
        console.error('Error removing member:', error)
        return NextResponse.json({ removed: false, error: 'Internal server error' }, { status: 500 })
    }
}
