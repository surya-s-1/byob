import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { series, publicationMembers } from '@/db/schema'
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

        const seriesData = await db.query.series.findFirst({
            where: and(eq(series.id, id), isNull(series.deletedAt)),
        })

        if (!seriesData) {
            return NextResponse.json({ updated: false, error: 'Series not found' }, { status: 404 })
        }

        // Check permission - must be OWNER or ADMIN of the publication the series belongs to
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, seriesData.publicationId),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!member || (member.userRole !== 'OWNER' && member.userRole !== 'ADMIN')) {
            return NextResponse.json({ updated: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { displayName, description } = body

        await db
            .update(series)
            .set({
                displayName: displayName ?? seriesData.displayName,
                displayDescription: description ?? seriesData.displayDescription,
            })
            .where(eq(series.id, id))

        return NextResponse.json({ updated: true, error: null })
    } catch (error: any) {
        console.error('Error updating series:', error)
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

        const seriesData = await db.query.series.findFirst({
            where: and(eq(series.id, id), isNull(series.deletedAt)),
        })

        if (!seriesData) {
            return NextResponse.json({ deleted: false, error: 'Series not found' }, { status: 404 })
        }

        // Check permission - Only OWNER of the publication can delete series
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, seriesData.publicationId),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!member || member.userRole !== 'OWNER') {
            return NextResponse.json({ deleted: false, error: 'Forbidden' }, { status: 403 })
        }

        await db
            .update(series)
            .set({
                deletedAt: new Date(),
                deletedBy: currentUser.id,
            })
            .where(eq(series.id, id))

        return NextResponse.json({ deleted: true, error: null })
    } catch (error: any) {
        console.error('Error deleting series:', error)
        return NextResponse.json({ deleted: false, error: 'Internal server error' }, { status: 500 })
    }
}
