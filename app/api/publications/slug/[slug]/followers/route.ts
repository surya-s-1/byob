import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publications, publicationFollows } from '@/db/schema'
import { eq, count } from 'drizzle-orm'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
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
                { followers: null, pagination: null, error: 'Publication not found' },
                { status: 404 }
            )
        }

        const followersData = await db.query.publicationFollows.findMany({
            where: eq(publicationFollows.publicationId, pub.id),
            with: {
                user: true,
            },
            limit: limit,
            offset: offset,
        })

        const [totalCount] = await db
            .select({ value: count() })
            .from(publicationFollows)
            .where(eq(publicationFollows.publicationId, pub.id))

        const formattedFollowers = followersData.map((f) => ({
            id: f.user.id,
            username: f.user.username,
            name: f.user.name,
            image: f.user.image,
            bio: f.user.bio,
        }))

        return NextResponse.json({
            followers: formattedFollowers,
            pagination: {
                total: totalCount.value,
                page,
            },
            error: null,
        })
    } catch (error: any) {
        console.error('Error fetching publication followers:', error)
        return NextResponse.json(
            { followers: null, pagination: null, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
