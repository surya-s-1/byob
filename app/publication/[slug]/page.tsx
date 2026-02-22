import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/utils'
import { notFound } from 'next/navigation'
import PublicationClient from './PublicationClient'

export default async function PublicationPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const headerList = await headers()
	const currentUser = await getCurrentUser(headerList)

	const res = await fetch(`${process.env.BETTER_AUTH_URL}/api/publications/slug/${slug}`, {
		headers: headerList,
	})

	if (!res.ok) {
		if (res.status === 404) notFound()
		throw new Error('Failed to fetch publication')
	}

	const { publication } = await res.json()

	// Fetch articles for this publication
	const articlesRes = await fetch(
		`${process.env.BETTER_AUTH_URL}/api/publications/slug/${slug}/articles`,
		{ headers: headerList }
	)
	const { articles = [] } = articlesRes.ok ? await articlesRes.json() : {}

	// Fetch series for this publication
	const seriesRes = await fetch(
		`${process.env.BETTER_AUTH_URL}/api/publications/slug/${slug}/series`,
		{ headers: headerList }
	)
	const { series = [] } = seriesRes.ok ? await seriesRes.json() : {}

	// Fetch invitations (history) for this publication
	let invitations = []
	let drafts = []
	const canManage = publication.myRole === 'OWNER' || publication.myRole === 'ADMIN'
	const canWrite = canManage || publication.myRole === 'EDITOR'

	if (canManage) {
		const invitationsRes = await fetch(
			`${process.env.BETTER_AUTH_URL}/api/publications/slug/${slug}/invitations`,
			{ headers: headerList }
		)
		const { invitations: fetchedInvitations = [] } = invitationsRes.ok
			? await invitationsRes.json()
			: {}
		invitations = fetchedInvitations
	}

	if (canWrite) {
		const draftsRes = await fetch(
			`${process.env.BETTER_AUTH_URL}/api/publications/slug/${slug}/drafts`,
			{ headers: headerList }
		)
		const { drafts: fetchedDrafts = [] } = draftsRes.ok ? await draftsRes.json() : {}
		drafts = fetchedDrafts
	}

	return (
		<PublicationClient
			publication={publication}
			currentUser={currentUser}
			initialArticles={articles || []}
			series={series || []}
			invitations={invitations || []}
			drafts={drafts || []}
		/>
	)
}
