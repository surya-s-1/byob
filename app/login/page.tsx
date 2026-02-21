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
		<div className='w-full h-full flex items-center justify-center'>
			<Card className='w-fit max-w-[40%] p-2xl'>
				<div className='text-center mb-xl'>
					<h1 className='text-2xl font-semibold text-main'>Welcome to BYOB!</h1>
					<p className='text-subtle text-sm mt-sm'>Sign in to continue</p>
				</div>
				<LoginButtons callbackUrl={callbackUrl} />
			</Card>
		</div>
	)
}
