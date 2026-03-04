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
		<Link href={`/profile/${user.username}`} className='group block'>
			<div className='flex items-center gap-lg rounded-2xl border border-border/50 bg-secondary/30 p-lg transition-all hover:border-border hover:bg-secondary/50 hover:shadow-md'>
				<div className='relative h-5xl w-5xl overflow-hidden rounded-full border border-border bg-elevated transition-colors group-hover:border-primary/30 sm:h-[56px] sm:w-[56px]'>
					{user.image ? (
						<Image src={user.image} alt={user.name} fill className='object-cover' />
					) : (
						<div className='flex h-full w-full items-center justify-center bg-secondary'>
							<UserIcon size={24} className='text-muted' />
						</div>
					)}
				</div>

				<div className='min-w-0 flex-1 text-subtle transition-colors hover:text-main'>
					<h3 className='font-bold'>{user.name}</h3>
					<p className='text-sm text-subtle'>@{user.username}</p>
					{user.bio && (
						<p className='mt-xs hidden max-w-[50%] text-xs text-muted sm:block'>
							{user.bio}
						</p>
					)}
				</div>

				{!isOwnProfile && (
					<Button
						onClick={handleFollow}
						isLoading={isLoading}
						variant='brand'
						size='xs'
						className='h-auto font-bold shadow-sm'
					>
						{isFollowing ? 'Unfollow' : 'Follow'}
					</Button>
				)}
			</div>
		</Link>
	)
}
