import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publications, publicationMembers } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, count, sql } from 'drizzle-orm'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ publication: null, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { displayName, displayDescription, cover, visibility } = body

        if (!displayName || !visibility) {
            return NextResponse.json(
                { publication: null, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        let slug = slugify(displayName)

        // Check if slug exists
        const existingPublication = await db.query.publications.findFirst({
            where: eq(publications.slug, slug),
        })

        if (existingPublication) {
            // Find how many publications have slugs starting with this base
            const similarSlugs = await db
                .select({ count: count() })
                .from(publications)
                .where(sql`${publications.slug} LIKE ${slug + '%'}`)

            const randomSuffix = Math.random().toString(36).substring(2, 8)
            slug = `${slug}-${similarSlugs[0].count + 1}${randomSuffix}`
        }

        const [newPublication] = await db.transaction(async (tx) => {
            const [pub] = await tx
                .insert(publications)
                .values({
                    slug,
                    displayName,
                    displayDescription,
                    cover,
                    publicationVisibility: visibility,
                    createdBy: currentUser.id,
                })
                .returning()

            await tx.insert(publicationMembers).values({
                publicationId: pub.id,
                userId: currentUser.id,
                userRole: 'OWNER',
            })

            return [pub]
        })

        return NextResponse.json({
            publication: { id: newPublication.id, slug: newPublication.slug },
            error: null,
        })
    } catch (error: any) {
        console.error('Error creating publication:', error)
        return NextResponse.json({ publication: null, error: 'Internal server error' }, { status: 500 })
    }
}
