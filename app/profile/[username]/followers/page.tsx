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
		<div className='mx-auto max-w-3xl space-y-8 px-4 py-12'>
			<div className='flex items-center gap-4'>
				<Link
					href={`/profile/${username}`}
					className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50 text-main transition-colors hover:bg-secondary'
				>
					<ArrowLeft size={20} />
				</Link>
				<div>
					<h1 className='text-2xl font-extrabold tracking-tight text-main sm:text-3xl'>
						Followers
					</h1>
					<p className='text-sm text-subtle'>People following @{username}</p>
				</div>
			</div>

			<div className='grid grid-cols-1 gap-4'>
				{followers.length > 0 ? (
					followers.map((user: any) => (
						<UserCard key={user.id} user={user} currentUser={currentUser} />
					))
				) : (
					<div className='space-y-4 rounded-3xl border border-dashed border-border/50 bg-secondary/20 py-24 text-center'>
						<div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50'>
							<Users size={32} className='text-muted/30' />
						</div>
						<p className='font-medium text-muted'>No followers yet.</p>
					</div>
				)}
			</div>
		</div>
	)
}
