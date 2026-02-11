import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import Card from '@/components/ui/Card'

export default async function LoginPage() {
	const user = await getCurrentUser()
	if (user) redirect('/dashboard')

	return (
		<div className='w-screen h-screen flex items-center justify-center bg-secondary'>
			<Card className='w-fit max-w-[40%]'>
				<div className='text-center mb-xl'>
					<h1 className='text-2xl font-semibold text-main'>Welcome to BYOB!</h1>
					<p className='text-subtle text-sm mt-sm'>Sign in to continue</p>
				</div>

				<div className='flex flex-col gap-md'>
					<a
						href='/api/auth/login?provider=google'
						className='border border-border rounded-md px-lg py-md text-center hover:bg-secondary transition-all duration-fast'
					>
						Continue with Google
					</a>

					<a
						href='/api/auth/login?provider=github'
						className='border border-border rounded-md px-lg py-md text-center hover:bg-secondary transition-all duration-fast'
					>
						Continue with GitHub
					</a>
				</div>
			</Card>
		</div>
	)
}
