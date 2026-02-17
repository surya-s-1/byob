import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import Card from '@/components/ui/Card'

export default async function LoginPage({ searchParams }: any) {
	const user = await getCurrentUser()
	if (user) redirect('/dashboard')

	const { callbackUrl } = await searchParams
	const callbackParam = callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ''

	return (
		<div className='w-screen h-screen flex items-center justify-center bg-secondary'>
			<Card className='w-fit max-w-[40%] p-2xl'>
				<div className='text-center mb-xl'>
					<h1 className='text-2xl font-semibold text-main'>Welcome to BYOB!</h1>
					<p className='text-subtle text-sm mt-sm'>Sign in to continue</p>
				</div>

				<div className='flex flex-col gap-md'>
					<a
						href={`/api/auth/login?provider=google${callbackParam}`}
						className='flex items-center justify-center gap-md border border-border rounded-md px-lg py-md text-center hover:bg-secondary hover:scale-[1.02] active:scale-[0.98] transition-all duration-fast'
					>
						<Image src='/Google.svg' alt='Google' width={20} height={20} />
						<span>Continue with Google</span>
					</a>

					<a
						href={`/api/auth/login?provider=github${callbackParam}`}
						className='flex items-center justify-center gap-md border border-border rounded-md px-lg py-md text-center hover:bg-secondary hover:scale-[1.02] active:scale-[0.98] transition-all duration-fast'
					>
						<Image src='/GitHub.svg' alt='GitHub' width={20} height={20} className='dark:invert' />
						<span>Continue with GitHub</span>
					</a>
				</div>
			</Card>
		</div>
	)
}
