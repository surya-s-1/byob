import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { series, seriesArticles, articles } from '@/db/schema'
import { eq, and, isNull, count, asc } from 'drizzle-orm'

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

        const seriesData = await db.query.series.findFirst({
            where: and(eq(series.slug, slug), isNull(series.deletedAt)),
        })

        if (!seriesData) {
            return NextResponse.json({ articles: null, pagination: null, error: 'Series not found' }, { status: 404 })
        }

        const seriesArticlesData = await db.query.seriesArticles.findMany({
            where: eq(seriesArticles.seriesId, seriesData.id),
            with: {
                article: {
                    with: {
                        authors: {
                            with: {
                                user: true,
                            },
                        },
                        publication: true,
                    },
                },
            },
            orderBy: [asc(seriesArticles.sortOrder)],
            limit: limit,
            offset: offset,
        })

        const [totalCount] = await db
            .select({ value: count() })
            .from(seriesArticles)
            .where(eq(seriesArticles.seriesId, seriesData.id))

        const formattedArticles = seriesArticlesData
            .filter((sa) => sa.article && sa.article.articleStatus === 'PUBLISHED' && !sa.article.deletedAt)
            .map((sa) => {
                const article = sa.article!
                const wordCount = article.content?.split(/\s+/).length || 0
                const readTime = Math.ceil(wordCount / 200) || 1

                return {
                    id: article.id,
                    slug: article.slug,
                    title: article.title,
                    subtitle: article.subtitle,
                    cover: article.cover,
                    excerpt: article.excerpt,
                    readTime,
                    publishedAt: article.publishedAt,
                    visibility: article.articleVisibility,
                    sortOrder: sa.sortOrder,
                    authors: article.authors.map((a) => ({
                        id: a.user.id,
                        username: a.user.username,
                        name: a.user.name,
                        image: a.user.image,
                        isPrimary: a.isPrimary,
                    })),
                    publication: article.publication
                        ? {
                            id: article.publication.id,
                            slug: article.publication.slug,
                            displayName: article.publication.displayName,
                        }
                        : null,
                }
            })

        return NextResponse.json({
            articles: formattedArticles,
            pagination: {
                total: totalCount.value,
                page,
            },
            error: null,
        })
    } catch (error: any) {
        console.error('Error fetching series articles:', error)
        return NextResponse.json({ articles: null, pagination: null, error: 'Internal server error' }, { status: 500 })
    }
}
