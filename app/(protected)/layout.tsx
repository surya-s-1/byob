import Header from '@/components/Header'
import { getCurrentUser } from '@/lib/auth/server'

export default async function ProtectedLayout({ children }: any) {
	const user = await getCurrentUser()

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
