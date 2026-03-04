import { db } from '@/db/client'
import { articleDrafts, publicationMembers } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import EditorClient from './EditorClient'
import { Draft } from '@/types'
import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

async function getDraftData(id: string) {
	const d = await db.query.articleDrafts.findFirst({
		where: and(eq(articleDrafts.id, id), isNull(articleDrafts.deletedAt)),
		with: {
			authors: {
				with: {
					user: true,
				},
			},
			publication: true,
			creator: true,
			lockedBy: true,
		},
	})

	if (!d) return null

	// Map to Draft type
	const draft: Draft = {
		...d,
		authors: d.authors.map((a) => ({
			id: a.user.id,
			name: a.user.name,
			image: a.user.image,
			isPrimary: a.isPrimary,
		})),
		publication: d.publication,
		createdBy: d.creator,
		lockedByUser: d.lockedBy,
	} as any

	return draft
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
	const { id } = await params
	const draft = await getDraftData(id)
	return {
		title: draft?.title ? `${draft.title} - Editor` : 'Edit Draft - BYOB',
		description: draft?.subtitle || 'Write your next great story on BYOB.',
	}
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const draft = await getDraftData(id)
	const session = await auth.api.getSession({ headers: await headers() })
	const currentUser = session?.user

	if (!draft) {
		notFound()
	}

	// Fetch user role in the publication
	const member = await db.query.publicationMembers.findFirst({
		where: and(
			eq(publicationMembers.publicationId, draft.publication.id),
			eq(publicationMembers.userId, currentUser?.id || '')
		),
	})

	return <EditorClient draft={draft} currentUser={currentUser} userRole={member?.userRole} />
}


