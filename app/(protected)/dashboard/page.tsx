import { getCurrentUser } from '@/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
	const headerList = await headers()
	const user = await getCurrentUser(headerList)

	if (!user) {
		redirect('/login')
	}

	const username = user.username

	// Fetch full user profile for stats
	const userRes = await fetch(
		`${process.env.BETTER_AUTH_URL}/api/user/username/${username}/profile`,
		{
			headers: headerList,
		}
	)
	const { user: fullUser } = userRes.ok ? await userRes.json() : { user }

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

	// Fetch invitation invitations
	const invitationsRes = await fetch(
		`${process.env.BETTER_AUTH_URL}/api/user/username/${username}/invitations`,
		{
			headers: headerList,
		}
	)
	const { publications: invitations = [] } = invitationsRes.ok ? await invitationsRes.json() : {}

	return (
		<DashboardClient
			user={fullUser}
			articles={articles || []}
			publications={publications || []}
			invitations={invitations || []}
		/>
	)
}
