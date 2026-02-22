import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publicationFollows, publicationMembers } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ unfollowed: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is a member
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, id),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (member) {
            return NextResponse.json(
                { unfollowed: false, error: 'A member cannot unfollow the publication' },
                { status: 400 }
            )
        }

        await db
            .delete(publicationFollows)
            .where(
                and(
                    eq(publicationFollows.publicationId, id),
                    eq(publicationFollows.userId, currentUser.id)
                )
            )

        return NextResponse.json({ unfollowed: true, error: null })
    } catch (error: any) {
        console.error('Error unfollowing publication:', error)
        return NextResponse.json({ unfollowed: false, error: 'Internal server error' }, { status: 500 })
    }
}
