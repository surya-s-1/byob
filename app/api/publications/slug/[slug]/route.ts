import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publications, publicationMembers, publicationFollows } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        const pub = await db.query.publications.findFirst({
            where: eq(publications.slug, slug),
            with: {
                followers: true,
                members: true,
            },
        })

        if (!pub) {
            return NextResponse.json({ publication: null, error: 'Publication not found' }, { status: 404 })
        }

        let isFollowing = false
        let myRole: 'OWNER' | 'EDITOR' | 'REVIEWER' | 'ADMIN' | null = null

        if (currentUser) {
            const followRecord = await db.query.publicationFollows.findFirst({
                where: and(
                    eq(publicationFollows.publicationId, pub.id),
                    eq(publicationFollows.userId, currentUser.id)
                ),
            })
            isFollowing = !!followRecord

            const memberRecord = await db.query.publicationMembers.findFirst({
                where: and(
                    eq(publicationMembers.publicationId, pub.id),
                    eq(publicationMembers.userId, currentUser.id)
                ),
            })
            myRole = memberRecord?.userRole || null
        }

        console.log('Publication found:', pub)

        const responsePub = {
            id: pub.id,
            slug: pub.slug,
            displayName: pub.displayName,
            displayDescription: pub.displayDescription,
            cover: pub.cover,
            visibility: pub.publicationVisibility,
            followersCount: pub.followers.length,
            isFollowing,
            isMember: !!myRole,
            myRole,
        }

        return NextResponse.json({ publication: responsePub, error: null })
    } catch (error: any) {
        console.error('Error fetching publication:', error)
        return NextResponse.json({ publication: null, error: 'Internal server error' }, { status: 500 })
    }
}
