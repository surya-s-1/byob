import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publications, publicationMembers } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
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
            return NextResponse.json({ publication: null, error: 'Unauthorized' }, { status: 401 })
        }

        // Check permission - only OWNER or ADMIN can update
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, id),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!member || (member.userRole !== 'OWNER' && member.userRole !== 'ADMIN')) {
            return NextResponse.json({ publication: null, error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { displayName, displayDescription, cover, visibility } = body

        const [updatedPub] = await db
            .update(publications)
            .set({
                displayName,
                displayDescription,
                cover,
                publicationVisibility: visibility,
            })
            .where(eq(publications.id, id))
            .returning()

        if (!updatedPub) {
            return NextResponse.json({ publication: null, error: 'Publication not found' }, { status: 404 })
        }

        // Fetch with relations for consistent response
        const fullPub = await db.query.publications.findFirst({
            where: eq(publications.id, id),
            with: {
                followers: true,
                members: true,
            },
        })

        return NextResponse.json({
            publication: {
                ...fullPub,
                visibility: fullPub?.publicationVisibility,
                followersCount: fullPub?.followers.length,
                isFollowing: false,
                isMember: true,
                myRole: member.userRole,
            },
            error: null,
        })
    } catch (error: any) {
        console.error('Error updating publication:', error)
        return NextResponse.json({ publication: null, error: 'Internal server error' }, { status: 500 })
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

        // Check permission - only OWNER can delete
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, id),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!member || member.userRole !== 'OWNER') {
            return NextResponse.json({ deleted: false, error: 'Forbidden' }, { status: 403 })
        }

        await db
            .update(publications)
            .set({ deletedAt: new Date(), deletedBy: currentUser.id })
            .where(eq(publications.id, id))

        return NextResponse.json({ deleted: true, error: null })
    } catch (error: any) {
        console.error('Error deleting publication:', error)
        return NextResponse.json({ deleted: false, error: 'Internal server error' }, { status: 500 })
    }
}
