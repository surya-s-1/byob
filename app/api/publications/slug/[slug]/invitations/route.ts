import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publications, publicationInvitations, publicationMembers } from '@/db/schema'
import { eq, and, count, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = (page - 1) * limit

        const pub = await db.query.publications.findFirst({
            where: eq(publications.slug, slug),
        })

        if (!pub) {
            return NextResponse.json(
                { invitations: null, pagination: null, error: 'Publication not found' },
                { status: 404 }
            )
        }

        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json(
                { invitations: null, pagination: null, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check permission - only OWNER or ADMIN can see invitations
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, pub.id),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!member || (member.userRole !== 'OWNER' && member.userRole !== 'ADMIN')) {
            return NextResponse.json(
                { invitations: null, pagination: null, error: 'Forbidden' },
                { status: 403 }
            )
        }

        const invitationsData = await db.query.publicationInvitations.findMany({
            where: and(
                eq(publicationInvitations.publicationId, pub.id),
                isNull(publicationInvitations.rejectedAt),
                isNull(publicationInvitations.deletedAt)
            ),
            with: {
                user: true,
            },
            limit: limit,
            offset: offset,
        })

        const [totalCount] = await db
            .select({ value: count() })
            .from(publicationInvitations)
            .where(
                and(
                    eq(publicationInvitations.publicationId, pub.id),
                    isNull(publicationInvitations.rejectedAt),
                    isNull(publicationInvitations.deletedAt)
                )
            )

        const formattedInvitations = invitationsData.map((inv) => ({
            user: {
                id: inv.user.id,
                username: inv.user.username,
                name: inv.user.name,
                image: inv.user.image,
            },
            role: inv.userRole,
            invitedAt: inv.createdAt,
        }))

        return NextResponse.json({
            invitations: formattedInvitations,
            pagination: {
                total: totalCount.value,
                page,
            },
            error: null,
        })
    } catch (error: any) {
        console.error('Error fetching invitations:', error)
        return NextResponse.json(
            { invitations: null, pagination: null, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
