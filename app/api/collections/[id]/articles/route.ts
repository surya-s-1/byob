import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { collections, collectionArticles, articles } from '@/db/schema'
import { eq, and, isNull, count, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = (page - 1) * limit

        const collection = await db.query.collections.findFirst({
            where: and(eq(collections.id, id), isNull(collections.deletedAt)),
        })

        if (!collection) {
            return NextResponse.json({ articles: null, pagination: null, error: 'Collection not found' }, { status: 404 })
        }

        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (collection.visibility === 'PRIVATE' && collection.userId !== currentUser?.id) {
            return NextResponse.json({ articles: null, pagination: null, error: 'Forbidden' }, { status: 403 })
        }

        const collectionArticlesData = await db.query.collectionArticles.findMany({
            where: eq(collectionArticles.collectionId, id),
            with: {
                article: {
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
                },
            },
            orderBy: [desc(collectionArticles.addedAt)],
            limit: limit,
            offset: offset,
        })

        const [totalCount] = await db
            .select({ value: count() })
            .from(collectionArticles)
            .where(eq(collectionArticles.collectionId, id))

        const formattedArticles = collectionArticlesData
            .filter((ca) => ca.article && !ca.article.deletedAt && ca.article.articleStatus === 'PUBLISHED')
            .map((ca) => {
                const article = ca.article!
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
                    authors: article.authors.map((a) => ({
                        id: a.user.id,
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
                    series:
                        article.series.length > 0
                            ? {
                                id: article.series[0].series.id,
                                slug: article.series[0].series.slug,
                                displayName: article.series[0].series.displayName,
                                sortOrder: article.series[0].sortOrder,
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
        console.error('Error fetching collection articles:', error)
        return NextResponse.json({ articles: null, pagination: null, error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ added: false, error: 'Unauthorized' }, { status: 401 })
        }

        const collection = await db.query.collections.findFirst({
            where: and(eq(collections.id, id), isNull(collections.deletedAt)),
        })

        if (!collection) {
            return NextResponse.json({ added: false, error: 'Collection not found' }, { status: 404 })
        }

        if (collection.userId !== currentUser.id) {
            return NextResponse.json({ added: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { articleId } = body

        if (!articleId) {
            return NextResponse.json({ added: false, error: 'Missing articleId' }, { status: 400 })
        }

        // Check if article exists and is published
        const article = await db.query.articles.findFirst({
            where: and(eq(articles.id, articleId), eq(articles.articleStatus, 'PUBLISHED'), isNull(articles.deletedAt)),
        })

        if (!article) {
            return NextResponse.json({ added: false, error: 'Article not found' }, { status: 404 })
        }

        // Check if already in collection
        const existing = await db.query.collectionArticles.findFirst({
            where: and(
                eq(collectionArticles.collectionId, id),
                eq(collectionArticles.articleId, articleId)
            ),
        })

        if (existing) {
            return NextResponse.json({ added: true, error: null })
        }

        await db.insert(collectionArticles).values({
            collectionId: id,
            articleId: articleId,
        })

        return NextResponse.json({ added: true, error: null })
    } catch (error: any) {
        console.error('Error adding article to collection:', error)
        return NextResponse.json({ added: false, error: 'Internal server error' }, { status: 500 })
    }
}
