import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { articleDrafts, publicationMembers } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, isNull } from 'drizzle-orm'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ draft: null, error: 'Unauthorized' }, { status: 401 })
		}

		const draftData = await db.query.articleDrafts.findFirst({
			where: and(eq(articleDrafts.id, id), isNull(articleDrafts.deletedAt)),
			with: {
				publication: true,
				authors: {
					with: {
						user: true,
					},
				},
			},
		})

		if (!draftData) {
			return NextResponse.json({ draft: null, error: 'Draft not found' }, { status: 404 })
		}

		// Check permission - must be OWNER, ADMIN, or EDITOR of the publication
		const member = await db.query.publicationMembers.findFirst({
			where: and(
				eq(publicationMembers.publicationId, draftData.publicationId),
				eq(publicationMembers.userId, currentUser.id)
			),
		})

		const allowedRoles = ['OWNER', 'ADMIN', 'EDITOR']
		if (!member || !allowedRoles.includes(member.userRole)) {
			return NextResponse.json({ draft: null, error: 'Forbidden' }, { status: 403 })
		}

		const formattedDraft = {
			id: draftData.id,
			title: draftData.title,
			subtitle: draftData.subtitle,
			content: draftData.content,
			cover: draftData.cover,
			excerpt: draftData.excerpt,
			visibility: draftData.articleVisibility,
			scheduledAt: draftData.scheduledAt,
			updatedAt: draftData.updatedAt,
			lockedByUserId: draftData.lockedByUserId,
			lockedUntil: draftData.lockedUntil,
			publication: {
				id: draftData.publication.id,
				slug: draftData.publication.slug,
				displayName: draftData.publication.displayName,
			},
			authors: draftData.authors.map((a) => ({
				id: a.user.id,
				username: a.user.username,
				name: a.user.name,
				image: a.user.image,
				isPrimary: a.isPrimary,
			})),
		}

		return NextResponse.json({ draft: formattedDraft, error: null })
	} catch (error: any) {
		console.error('Error fetching draft:', error)
		return NextResponse.json({ draft: null, error: 'Internal server error' }, { status: 500 })
	}
}
