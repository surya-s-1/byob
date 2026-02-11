import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export default async function LoginPage() {
	const user = await getCurrentUser()
	if (user) redirect('/dashboard')

	return (
		<div>
			<h1>Login</h1>
			<a href='/api/auth/login?provider=google'>Google</a>
			<br />
			<a href='/api/auth/login?provider=github'>GitHub</a>
		</div>
	)
}
