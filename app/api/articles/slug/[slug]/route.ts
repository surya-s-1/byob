import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { articles, userFollows, publicationFollows } from '@/db/schema'
import { eq, and, isNull, inArray } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        const articleData = await db.query.articles.findFirst({
            where: and(
                eq(articles.slug, slug),
                eq(articles.articleStatus, 'PUBLISHED'),
                isNull(articles.deletedAt)
            ),
            with: {
                authors: {
                    with: {
                        user: true,
                    },
                },
                publication: true,
                series: {
                    with: {
                        series: true,
                    },
                },
            },
        })

        if (!articleData) {
            return NextResponse.json({ article: null, error: 'Article not found' }, { status: 404 })
        }

        // Fetch follow status if user is logged in
        let followedUserIds: string[] = []
        let followsPublication = false

        if (currentUser) {
            const authorIds = articleData.authors.map((a) => a.user.id)
            const userFollowsRecords = await db.query.userFollows.findMany({
                where: and(
                    eq(userFollows.followedByUserId, currentUser.id),
                    inArray(userFollows.followedUserId, authorIds)
                ),
            })
            followedUserIds = userFollowsRecords.map((f) => f.followedUserId)

            if (articleData.publicationId) {
                const pubFollow = await db.query.publicationFollows.findFirst({
                    where: and(
                        eq(publicationFollows.publicationId, articleData.publicationId),
                        eq(publicationFollows.userId, currentUser.id)
                    ),
                })
                followsPublication = !!pubFollow
            }
        }

        // Calculate read time
        const wordCount = articleData.content?.split(/\s+/).length || 0
        const readTime = Math.ceil(wordCount / 200) || 1

        const formattedArticle = {
            id: articleData.id,
            slug: articleData.slug,
            title: articleData.title,
            subtitle: articleData.subtitle,
            content: articleData.content,
            cover: articleData.cover,
            excerpt: articleData.excerpt,
            readTime,
            publishedAt: articleData.publishedAt,
            visibility: articleData.articleVisibility,
            authors: articleData.authors.map((a) => ({
                id: a.user.id,
                username: a.user.username,
                name: a.user.name,
                image: a.user.image,
                isPrimary: a.isPrimary,
                isFollowing: followedUserIds.includes(a.user.id),
            })),
            publication: articleData.publication
                ? {
                    id: articleData.publication.id,
                    slug: articleData.publication.slug,
                    displayName: articleData.publication.displayName,
                    cover: articleData.publication.cover,
                    isFollowing: followsPublication,
                }
                : null,
            series:
                articleData.series.length > 0
                    ? {
                        id: articleData.series[0].series.id,
                        slug: articleData.series[0].series.slug,
                        displayName: articleData.series[0].series.displayName,
                        sortOrder: articleData.series[0].sortOrder,
                    }
                    : null,
        }

        return NextResponse.json({ article: formattedArticle, error: null })
    } catch (error: any) {
        console.error('Error fetching article:', error)
        return NextResponse.json({ article: null, error: 'Internal server error' }, { status: 500 })
    }
}
