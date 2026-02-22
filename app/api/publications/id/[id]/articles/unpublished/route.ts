import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publications, articles, publicationMembers } from '@/db/schema'
import { eq, and, count, desc, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: publicationId } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ articles: null, error: 'Unauthorized' }, { status: 401 })
		}

		// Check if publication exists
		const pub = await db.query.publications.findFirst({
			where: eq(publications.id, publicationId),
		})

		if (!pub) {
			return NextResponse.json(
				{ articles: null, error: 'Publication not found' },
				{ status: 404 }
			)
		}

		// Permission check - OWNER, ADMIN, or EDITOR
		const member = await db.query.publicationMembers.findFirst({
			where: and(
				eq(publicationMembers.publicationId, publicationId),
				eq(publicationMembers.userId, currentUser.id)
			),
		})

		const allowedRoles = ['OWNER', 'ADMIN', 'EDITOR']
		if (!member || !allowedRoles.includes(member.userRole)) {
			return NextResponse.json({ articles: null, error: 'Forbidden' }, { status: 403 })
		}

		const { searchParams } = new URL(req.url)
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '20')
		const offset = (page - 1) * limit

		const articlesData = await db.query.articles.findMany({
			where: and(
				eq(articles.publicationId, publicationId),
				eq(articles.articleStatus, 'UNPUBLISHED' as any),
				isNull(articles.deletedAt)
			),
			with: {
				authors: {
					with: {
						user: true,
					},
				},
			},
			orderBy: [desc(articles.updatedAt)],
			limit: limit,
			offset: offset,
		})

		const [totalResult] = await db
			.select({ value: count() })
			.from(articles)
			.where(
				and(
					eq(articles.publicationId, publicationId),
					eq(articles.articleStatus, 'UNPUBLISHED' as any),
					isNull(articles.deletedAt)
				)
			)

		const formattedArticles = articlesData.map((article) => ({
			id: article.id,
			slug: article.slug,
			title: article.title,
			subtitle: article.subtitle,
			cover: article.cover,
			excerpt: article.excerpt,
			updatedAt: article.updatedAt,
			visibility: article.articleVisibility,
			authors: article.authors.map((a) => ({
				id: a.user.id,
				name: a.user.name,
				image: a.user.image,
				isPrimary: a.isPrimary,
			})),
		}))

		return NextResponse.json({
			articles: formattedArticles,
			pagination: {
				total: totalResult.value,
				page,
			},
			error: null,
		})
	} catch (error: any) {
		console.error('Error fetching unpublished articles:', error)
		return NextResponse.json(
			{ articles: null, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
