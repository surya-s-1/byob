import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { articles, articleDrafts, publicationMembers, articleAuthors, draftAuthors } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth.api.getSession({ headers: req.headers })
        const currentUser = session?.user

        if (!currentUser) {
            return NextResponse.json({ draftId: null, error: 'Unauthorized' }, { status: 401 })
        }

        const article = await db.query.articles.findFirst({
            where: and(eq(articles.id, id), isNull(articles.deletedAt)),
            with: {
                authors: true,
            },
        })

        if (!article) {
            return NextResponse.json({ draftId: null, error: 'Article not found' }, { status: 404 })
        }

        // Authorization check: Only author or publication OWNER/ADMIN/EDITOR can edit
        let isAuthorized = article.createdBy === currentUser.id

        if (!isAuthorized && article.publicationId) {
            const member = await db.query.publicationMembers.findFirst({
                where: and(
                    eq(publicationMembers.publicationId, article.publicationId),
                    eq(publicationMembers.userId, currentUser.id)
                ),
            })
            const allowedRoles = ['OWNER', 'ADMIN', 'EDITOR']
            if (member && allowedRoles.includes(member.userRole)) {
                isAuthorized = true
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ draftId: null, error: 'Forbidden' }, { status: 403 })
        }

        // Check if there's already an active draft for this article
        const existingDraft = await db.query.articleDrafts.findFirst({
            where: and(eq(articleDrafts.articleId, id), isNull(articleDrafts.deletedAt)),
        })

        if (existingDraft) {
            return NextResponse.json({
                draftId: existingDraft.id,
                message: 'Using existing draft',
                error: null
            })
        }

        // Create new draft from article content
        const [newDraft] = await db.transaction(async (tx) => {
            const [draft] = await tx
                .insert(articleDrafts)
                .values({
                    publicationId: article.publicationId,
                    articleId: article.id,
                    title: article.title,
                    subtitle: article.subtitle,
                    content: article.content,
                    cover: article.cover,
                    excerpt: article.excerpt,
                    articleVisibility: article.articleVisibility,
                    scheduledAt: article.scheduledAt,
                    createdBy: currentUser.id,
                })
                .returning()

            // Copy authors
            if (article.authors.length > 0) {
                await tx.insert(draftAuthors).values(
                    article.authors.map((a) => ({
                        draftId: draft.id,
                        userId: a.userId,
                        isPrimary: a.isPrimary,
                    }))
                )
            }

            return [draft]
        })

        return NextResponse.json({ draftId: newDraft.id, error: null })
    } catch (error: any) {
        console.error('Error creating edit draft:', error)
        return NextResponse.json({ draftId: null, error: 'Internal server error' }, { status: 500 })
    }
}
