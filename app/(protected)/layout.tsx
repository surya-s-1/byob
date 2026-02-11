import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'

export default async function ProtectedLayout({ children }: any) {
	const user = await getCurrentUser()
	if (!user) redirect('/login')

	return (
		<div>
			<Header user={user} />
			{children}
		</div>
	)
}
