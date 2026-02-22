import { notFound } from 'next/navigation'
import ProfileClient from './ProfileClient'
import { getCurrentUser } from '@/lib/utils'
import { headers } from 'next/headers'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
	const { username } = await params
	const headerList = await headers()
	const currentUser = await getCurrentUser(headerList)

	// Fetch profile data
	// We can use the API directly or bypass it if we are on the server
	// Bypassing API for better performance and to avoid URL issues
	const res = await fetch(
		`${process.env.BETTER_AUTH_URL}/api/user/username/${username}/profile`,
		{
			headers: headerList,
		}
	)

	if (!res.ok) {
		if (res.status === 404) notFound()
		throw new Error('Failed to fetch profile')
	}

	const { user } = await res.json()

	// Fetch articles
	const articlesRes = await fetch(
		`${process.env.BETTER_AUTH_URL}/api/user/username/${username}/articles`,
		{
			headers: headerList,
		}
	)
	const { articles = [] } = articlesRes.ok ? await articlesRes.json() : {}

	// Fetch publications
	const publicationsRes = await fetch(
		`${process.env.BETTER_AUTH_URL}/api/user/username/${username}/publications`,
		{
			headers: headerList,
		}
	)
	const { publications = [] } = publicationsRes.ok ? await publicationsRes.json() : {}

	// Fetch invitations if it's the current user's profile
	let invitations = []
	if (currentUser && currentUser.username === username) {
		const invitationsRes = await fetch(
			`${process.env.BETTER_AUTH_URL}/api/user/username/${username}/invitations`,
			{
				headers: headerList,
			}
		)
		const { publications: invitedPubs = [] } = invitationsRes.ok
			? await invitationsRes.json()
			: {}
		invitations = invitedPubs
	}

	return (
		<ProfileClient
			user={user}
			currentUser={currentUser}
			initialArticles={articles || []}
			initialPublications={publications || []}
			initialInvitations={invitations}
		/>
	)
}
