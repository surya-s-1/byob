import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { series, publicationMembers } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ series: null, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { slug, publicationId, displayName, description, sortOrder } = body

        if (!slug || !publicationId || !displayName) {
            return NextResponse.json(
                { series: null, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check permission - must be OWNER or ADMIN of the publication
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, publicationId),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!member || (member.userRole !== 'OWNER' && member.userRole !== 'ADMIN')) {
            return NextResponse.json({ series: null, error: 'Forbidden' }, { status: 403 })
        }

        // Check if slug is unique
        const existingSeries = await db.query.series.findFirst({
            where: eq(series.slug, slug),
        })

        if (existingSeries) {
            return NextResponse.json({ series: null, error: 'Slug already taken' }, { status: 400 })
        }

        const [newSeries] = await db
            .insert(series)
            .values({
                slug,
                publicationId,
                displayName,
                displayDescription: description,
                sortOrder: sortOrder || 0,
                createdBy: currentUser.id,
            })
            .returning()

        return NextResponse.json({
            series: { id: newSeries.id, slug: newSeries.slug },
            error: null,
        })
    } catch (error: any) {
        console.error('Error creating series:', error)
        return NextResponse.json({ series: null, error: 'Internal server error' }, { status: 500 })
    }
}
