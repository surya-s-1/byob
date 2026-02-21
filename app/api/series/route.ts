import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { series, publicationMembers } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, count, sql } from 'drizzle-orm'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ series: null, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { publicationId, displayName, description, sortOrder } = body

        if (!publicationId || !displayName) {
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

        let slug = slugify(displayName)

        // Check if slug exists
        const existingSeries = await db.query.series.findFirst({
            where: eq(series.slug, slug),
        })

        if (existingSeries) {
            const similarSlugs = await db
                .select({ count: count() })
                .from(series)
                .where(sql`${series.slug} LIKE ${slug + '%'}`)

            const randomSuffix = Math.random().toString(36).substring(2, 8)
            slug = `${slug}-${similarSlugs[0].count + 1}${randomSuffix}`
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
