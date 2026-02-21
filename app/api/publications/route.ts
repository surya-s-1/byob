import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publications, publicationMembers } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ publication: null, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { slug, displayName, displayDescription, cover, visibility } = body

        if (!slug || !displayName || !visibility) {
            return NextResponse.json(
                { publication: null, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check if slug is unique
        const existingPublication = await db.query.publications.findFirst({
            where: eq(publications.slug, slug),
        })

        if (existingPublication) {
            return NextResponse.json({ publication: null, error: 'Slug already taken' }, { status: 400 })
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
