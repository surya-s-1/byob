import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publications, articleDrafts, publicationMembers } from '@/db/schema'
import { eq, and, isNull, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ drafts: [], error: 'Unauthorized' }, { status: 401 })
        }

        const pub = await db.query.publications.findFirst({
            where: eq(publications.slug, slug),
        })

        if (!pub) {
            return NextResponse.json({ drafts: [], error: 'Publication not found' }, { status: 404 })
        }

        // Check permission - only members can see drafts
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, pub.id),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!member) {
            return NextResponse.json({ drafts: [], error: 'Forbidden' }, { status: 403 })
        }

        const drafts = await db.query.articleDrafts.findMany({
            where: and(eq(articleDrafts.publicationId, pub.id), isNull(articleDrafts.deletedAt)),
            orderBy: [desc(articleDrafts.updatedAt)],
            with: {
                creator: true,
                authors: {
                    with: {
                        user: true,
                    },
                },
                lockedBy: true,
            },
        })

        const formattedDrafts = drafts.map((d) => ({
            id: d.id,
            cover: d.cover,
            title: d.title,
            subtitle: d.subtitle,
            updatedAt: d.updatedAt,
            createdAt: d.createdAt,
            visibility: d.articleVisibility,
            scheduledAt: d.scheduledAt,
            creator: {
                id: d.creator.id,
                name: d.creator.name,
                image: d.creator.image,
            },
            publication: {
                id: pub.id,
                slug: pub.slug,
                displayName: pub.displayName,
            },
            authors: d.authors.map((a) => ({
                id: a.user.id,
                name: a.user.name,
                image: a.user.image,
                isPrimary: a.isPrimary,
            })),
            lockedBy: d.lockedBy ? {
                id: d.lockedBy.id,
                name: d.lockedBy.name,
                image: d.lockedBy.image,
            } : null,
            lockedUntil: d.lockedUntil,
        }))

        return NextResponse.json({ drafts: formattedDrafts, error: null })
    } catch (error: any) {
        console.error('Error fetching publication drafts:', error)
        return NextResponse.json({ drafts: [], error: 'Internal server error' }, { status: 500 })
    }
}
