import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import UserCard from '@/components/ui/UserCard'

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
	const { username } = await params
	const headerList = await headers()
	const currentUser = await getCurrentUser(headerList)

	const res = await fetch(
		`${process.env.BETTER_AUTH_URL}/api/user/username/${username}/followers`,
		{ headers: headerList }
	)

	if (!res.ok) {
		if (res.status === 404) notFound()
		throw new Error('Failed to fetch followers')
	}

	const { followers = [] } = await res.json()

	return (
		<div className='max-w-3xl mx-auto px-4 py-12 space-y-8'>
			<div className='flex items-center gap-4'>
				<Link
					href={`/profile/${username}`}
					className='h-10 w-10 flex items-center justify-center rounded-full bg-secondary/50 text-main hover:bg-secondary transition-colors'
				>
					<ArrowLeft size={20} />
				</Link>
				<div>
					<h1 className='text-2xl sm:text-3xl font-extrabold text-main tracking-tight'>
						Followers
					</h1>
					<p className='text-subtle text-sm'>People following @{username}</p>
				</div>
			</div>

			<div className='grid grid-cols-1 gap-4'>
				{followers.length > 0 ? (
					followers.map((user: any) => (
						<UserCard key={user.id} user={user} currentUser={currentUser} />
					))
				) : (
					<div className='py-24 text-center space-y-4 bg-secondary/20 rounded-3xl border border-dashed border-border/50'>
						<div className='bg-secondary/50 h-16 w-16 rounded-full flex items-center justify-center mx-auto'>
							<Users size={32} className='text-muted/30' />
						</div>
						<p className='text-muted font-medium'>No followers yet.</p>
					</div>
				)}
			</div>
		</div>
	)
}
