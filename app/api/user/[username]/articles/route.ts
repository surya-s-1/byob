import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { user, articles, articleAuthors } from '@/db/schema'
import { eq, and, sql, count, desc } from 'drizzle-orm'

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
	try {
		const { username } = await params
		const { searchParams } = new URL(req.url)
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '20')
		const offset = (page - 1) * limit

		const targetUser = await db.query.user.findFirst({
			where: eq(user.username, username),
		})

		if (!targetUser) {
			return NextResponse.json(
				{ articles: null, pagination: null, error: 'User not found' },
				{ status: 404 }
			)
		}

		// Fetch articles where the user is an author
		const articlesData = await db.query.articles.findMany({
			where: and(
				eq(articles.articleStatus, 'PUBLISHED'),
				sql`${articles.id} IN (SELECT article_id FROM article_authors WHERE user_id = ${targetUser.id})`
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
			orderBy: [desc(articles.publishedAt)],
			limit: limit,
			offset: offset,
		})

		const [totalCount] = await db
			.select({ value: count() })
			.from(articles)
			.innerJoin(articleAuthors, eq(articles.id, articleAuthors.articleId))
			.where(
				and(
					eq(articles.articleStatus, 'PUBLISHED'),
					eq(articleAuthors.userId, targetUser.id)
				)
			)

		const formattedArticles = articlesData.map((article) => {
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
		console.error('Error fetching user articles:', error)
		return NextResponse.json(
			{ articles: null, pagination: null, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
