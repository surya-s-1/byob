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

	return (
		<PublicationClient
			publication={publication}
			currentUser={currentUser}
			initialArticles={articles || []}
		/>
	)
}
