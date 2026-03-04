import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { user, publicationMembers } from '@/db/schema'
import { ilike, and, inArray, sql, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ users: [], error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = req.nextUrl.searchParams
        const query = searchParams.get('q')
        const publicationId = searchParams.get('publicationId')

        if (!query || query.length < 3) {
            return NextResponse.json(
                { users: [], error: 'Search query must be at least 3 characters' },
                { status: 400 }
            )
        }

        let searchResults;

        if (publicationId) {
            // Filter users who are members of the publication with valid roles
            searchResults = await db
                .select({
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    image: user.image,
                })
                .from(user)
                .innerJoin(
                    publicationMembers,
                    and(
                        eq(publicationMembers.userId, user.id),
                        eq(publicationMembers.publicationId, publicationId),
                        inArray(publicationMembers.userRole, ['OWNER', 'ADMIN', 'EDITOR'])
                    )
                )
                .where(ilike(user.username, `%${query}%`))
                .limit(10);
        } else {
            searchResults = await db.query.user.findMany({
                where: ilike(user.username, `%${query}%`),
                limit: 10,
            })
        }

        const formattedUsers = searchResults.map((u: any) => ({
            id: u.id,
            username: u.username,
            name: u.name,
            image: u.image,
        }))

        return NextResponse.json({ users: formattedUsers, error: null })
    } catch (error: any) {
        console.error('Error searching users:', error)
        return NextResponse.json({ users: [], error: 'Internal server error' }, { status: 500 })
    }
}

