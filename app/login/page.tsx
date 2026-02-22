import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/utils'
import Card from '@/components/ui/Card'
import LoginButtons from '@/app/login/LoginButtons'

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ callbackUrl?: string }>
}) {
	const user = await getCurrentUser(await headers())
	if (user) redirect('/dashboard')

	const { callbackUrl } = await searchParams

	return (
		<div className='flex h-full w-full items-center justify-center'>
			<Card className='w-fit max-w-[40%] p-2xl'>
				<div className='mb-xl text-center'>
					<h1 className='text-2xl font-semibold text-main'>Welcome to Running Head!</h1>
					<p className='mt-sm text-sm text-subtle'>Sign in to continue</p>
				</div>
				<LoginButtons callbackUrl={callbackUrl} />
			</Card>
		</div>
	)
}
