'use client'

import { User } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { User as UserIcon } from 'lucide-react'
import Button from './Button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface UserCardProps {
	user: User & { isFollowing?: boolean }
	currentUser?: any | null
}

export default function UserCard({ user, currentUser }: UserCardProps) {
	const [isFollowing, setIsFollowing] = useState(user.isFollowing)
	const [isLoading, setIsLoading] = useState(false)
	const isOwnProfile = currentUser?.id === user.id

	console.log('user', user)

	const handleFollow = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (!currentUser) {
			window.location.href = '/login'
			return
		}

		if (isLoading) return

		setIsLoading(true)
		const action = isFollowing ? 'unfollow' : 'follow'
		try {
			const res = await fetch(`/api/user/id/${user.id}/${action}`, {
				method: 'POST',
			})
			if (res.ok) {
				setIsFollowing(!isFollowing)
			}
		} catch (error) {
			console.error(`Error ${action}ing user:`, error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Link href={`/profile/${user.username}`} className='block group'>
			<div className='flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 hover:border-border transition-all hover:shadow-md'>
				<div className='relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden bg-elevated border border-border group-hover:border-primary/30 transition-colors'>
					{user.image ? (
						<Image src={user.image} alt={user.name} fill className='object-cover' />
					) : (
						<div className='h-full w-full flex items-center justify-center bg-secondary'>
							<UserIcon size={24} className='text-muted' />
						</div>
					)}
				</div>

				<div className='flex-1 min-w-0 text-subtle hover:text-main transition-colors'>
					<h3 className='font-bold'>{user.name}</h3>
					<p className='text-sm text-subtle'>@{user.username}</p>
					{user.bio && (
						<p className='text-xs text-muted mt-1 max-w-[50%] hidden sm:block'>
							{user.bio}
						</p>
					)}
				</div>

				{!isOwnProfile && (
					<Button
						onClick={handleFollow}
						isLoading={isLoading}
						className='px-4 py-1.5 h-auto text-xs font-bold btn-brand shadow-sm'
					>
						{isFollowing ? 'Unfollow' : 'Follow'}
					</Button>
				)}
			</div>
		</Link>
	)
}
