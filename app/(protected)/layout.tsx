import Header from '@/components/Header'
import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/utils'

export default async function ProtectedLayout({ children }: any) {
	const user = await getCurrentUser(await headers())

	if (!user) {
		return (
			<script
				dangerouslySetInnerHTML={{
					__html: `window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname + window.location.search)`,
				}}
			/>
		)
	}

	return (
		<div>
			<Header user={user} />
			{children}
		</div>
	)
}
