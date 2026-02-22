import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { user } from '@/db/schema'
import { ilike } from 'drizzle-orm'
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

        if (!query || query.length < 6) {
            return NextResponse.json(
                { users: [], error: 'Search query must be at least 6 characters' },
                { status: 400 }
            )
        }

        const searchResults = await db.query.user.findMany({
            where: ilike(user.username, `%${query}%`),
            limit: 10,
        })

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
