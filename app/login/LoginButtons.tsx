'use client'

import Image from 'next/image'

export default function LoginButtons({ callbackUrl }: { callbackUrl?: string }) {
	const handleSignIn = async (provider: 'google' | 'github') => {
		try {
			const res = await fetch('/api/auth/signin', {
				method: 'POST',
				body: JSON.stringify({
					provider,
					callbackUrl: callbackUrl || '/dashboard',
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			})

			const data = await res.json()

			if (data.url) {
				window.location.href = data.url
			}
		} catch (error) {
			console.error('Failed to sign in:', error)
		}
	}

	return (
		<div className='flex flex-col gap-md'>
			<button
				onClick={() => handleSignIn('google')}
				className='flex items-center justify-center gap-md border border-border rounded-md px-lg py-md text-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-fast cursor-pointer w-full bg-transparent'
			>
				<Image src='/Google.svg' alt='Google' width={20} height={20} />
				<span>Continue with Google</span>
			</button>
			<button
				onClick={() => handleSignIn('github')}
				className='flex items-center justify-center gap-md border border-border rounded-md px-lg py-md text-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-fast cursor-pointer w-full bg-transparent'
			>
				<Image
					src='/GitHub.svg'
					alt='GitHub'
					width={20}
					height={20}
					className='dark:invert'
				/>
				<span>Continue with GitHub</span>
			</button>
		</div>
	)
}
