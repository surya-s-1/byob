import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { series, seriesArticles, publicationMembers } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ updated: false, error: 'Unauthorized' }, { status: 401 })
        }

        const seriesData = await db.query.series.findFirst({
            where: and(eq(series.id, id), isNull(series.deletedAt)),
        })

        if (!seriesData) {
            return NextResponse.json({ updated: false, error: 'Series not found' }, { status: 404 })
        }

        // Check permission - must be OWNER or ADMIN of the publication the series belongs to
        const member = await db.query.publicationMembers.findFirst({
            where: and(
                eq(publicationMembers.publicationId, seriesData.publicationId),
                eq(publicationMembers.userId, currentUser.id)
            ),
        })

        if (!member || (member.userRole !== 'OWNER' && member.userRole !== 'ADMIN')) {
            return NextResponse.json({ updated: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const articlesOrder = body.articles as { articleId: string; sortOrder: number }[]

        if (!Array.isArray(articlesOrder)) {
            return NextResponse.json({ updated: false, error: 'Invalid body' }, { status: 400 })
        }

        await db.transaction(async (tx) => {
            for (const item of articlesOrder) {
                await tx
                    .update(seriesArticles)
                    .set({ sortOrder: item.sortOrder })
                    .where(and(eq(seriesArticles.seriesId, id), eq(seriesArticles.articleId, item.articleId)))
            }
        })

        return NextResponse.json({ updated: true, error: null })
    } catch (error: any) {
        console.error('Error updating series articles order:', error)
        return NextResponse.json({ updated: false, error: 'Internal server error' }, { status: 500 })
    }
}
