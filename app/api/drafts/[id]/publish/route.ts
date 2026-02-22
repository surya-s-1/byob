import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import {
	articleDrafts,
	articles,
	articleAuthors,
	draftAuthors,
	publicationMembers,
} from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, isNull, count, sql } from 'drizzle-orm'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ status: null, error: 'Unauthorized' }, { status: 401 })
		}

		const draftData = await db.query.articleDrafts.findFirst({
			where: and(eq(articleDrafts.id, id), isNull(articleDrafts.deletedAt)),
			with: {
				authors: true,
			},
		})

		if (!draftData) {
			return NextResponse.json({ status: null, error: 'Draft not found' }, { status: 404 })
		}

		// Permission check - OWNER or ADMIN
		const member = await db.query.publicationMembers.findFirst({
			where: and(
				eq(publicationMembers.publicationId, draftData.publicationId),
				eq(publicationMembers.userId, currentUser.id)
			),
		})

		if (!member || (member.userRole !== 'OWNER' && member.userRole !== 'ADMIN')) {
			return NextResponse.json({ status: null, error: 'Forbidden' }, { status: 403 })
		}

		if (!draftData.title) {
			return NextResponse.json(
				{ status: null, error: 'Title is required to publish' },
				{ status: 400 }
			)
		}

		const isScheduled = draftData.scheduledAt && draftData.scheduledAt > new Date()
		const articleStatus = isScheduled ? 'SCHEDULED' : 'PUBLISHED'

		const result = await db.transaction(async (tx) => {
			let articleId = draftData.articleId
			let slug = ''

			if (!articleId) {
				// Create new article
				slug = slugify(draftData.title!)
				const existingArticle = await tx.query.articles.findFirst({
					where: eq(articles.slug, slug),
				})

				if (existingArticle) {
					const similarSlugs = await tx
						.select({ count: count() })
						.from(articles)
						.where(sql`${articles.slug} LIKE ${slug + '%'}`)

					const randomSuffix = Math.random().toString(36).substring(2, 8)
					slug = `${slug}-${similarSlugs[0].count + 1}${randomSuffix}`
				}

				const [newArticle] = await tx
					.insert(articles)
					.values({
						publicationId: draftData.publicationId,
						slug,
						articleStatus,
						articleVisibility: draftData.articleVisibility,
						cover: draftData.cover,
						title: draftData.title,
						subtitle: draftData.subtitle,
						content: draftData.content,
						excerpt: draftData.excerpt,
						publishedAt: isScheduled ? null : new Date(),
						scheduledAt: draftData.scheduledAt,
						createdBy: draftData.createdBy,
					})
					.returning()

				articleId = newArticle.id
			} else {
				// Update existing article
				await tx
					.update(articles)
					.set({
						articleStatus,
						articleVisibility: draftData.articleVisibility,
						cover: draftData.cover,
						title: draftData.title,
						subtitle: draftData.subtitle,
						content: draftData.content,
						excerpt: draftData.excerpt,
						publishedAt: articleStatus === 'PUBLISHED' ? new Date() : null,
						scheduledAt: draftData.scheduledAt,
						updatedAt: new Date(),
					})
					.where(eq(articles.id, articleId))
			}

			// Sync authors
			await tx.delete(articleAuthors).where(eq(articleAuthors.articleId, articleId))
			if (draftData.authors.length > 0) {
				await tx.insert(articleAuthors).values(
					draftData.authors.map((a) => ({
						articleId: articleId!,
						userId: a.userId,
						isPrimary: a.isPrimary,
					}))
				)
			}

			// Mark draft as deleted (it's "moved")
			await tx
				.update(articleDrafts)
				.set({
					deletedAt: new Date(),
					deletedBy: currentUser.id,
					articleId: articleId, // Link it if it wasn't
				})
				.where(eq(articleDrafts.id, id))

			return { status: articleStatus }
		})

		return NextResponse.json({ status: result.status, error: null })
	} catch (error: any) {
		console.error('Error publishing draft:', error)
		return NextResponse.json({ status: null, error: 'Internal server error' }, { status: 500 })
	}
}
