'use client'

import { User } from '@/types'
import { Calendar } from 'lucide-react'
import { useState } from 'react'
import UsersListModal from '@/components/ui/UsersListModal'

interface ProfileBioProps {
	user: User
	isOwnProfile: boolean
	currentUser: any | null
}

export default function ProfileBio({ user, isOwnProfile, currentUser }: ProfileBioProps) {
	const [followersOpen, setFollowersOpen] = useState(false)
	const [followingOpen, setFollowingOpen] = useState(false)

	return (
		<>
			<div className='space-y-2xl rounded-2xl border border-border/50 bg-secondary/30 p-xl'>
				<div className='space-y-lg'>
					<h3 className='text-sm font-bold tracking-wider text-muted uppercase'>Bio</h3>
					<p className='text-sm leading-relaxed text-main'>
						{user.bio || 'This user prefers to keep their story a mystery.'}
					</p>
				</div>

				<div className='space-y-md border-t border-border/50 pt-lg'>
					{isOwnProfile && user.dob && (
						<div className='flex items-center gap-md text-xs text-subtle sm:text-sm'>
							<Calendar size={16} className='text-main' />
							<span>Born {new Date(user.dob).toLocaleDateString()}</span>
						</div>
					)}

					<div className='flex gap-lg pt-md'>
						<button
							onClick={() => setFollowersOpen(true)}
							className='flex-1 rounded-lg border border-border/50 px-md py-sm text-center text-sm transition-all hover:bg-secondary/50 hover:border-border'
						>
							<p className='font-bold text-main'>{user.followersCount || 0}</p>
							<p className='text-xs text-subtle'>Followers</p>
						</button>
						<button
							onClick={() => setFollowingOpen(true)}
							className='flex-1 rounded-lg border border-border/50 px-md py-sm text-center text-sm transition-all hover:bg-secondary/50 hover:border-border'
						>
							<p className='font-bold text-main'>{user.followingCount || 0}</p>
							<p className='text-xs text-subtle'>Following</p>
						</button>
					</div>
				</div>
			</div>

			<UsersListModal
				isOpen={followersOpen}
				onClose={() => setFollowersOpen(false)}
				title='Followers'
				currentUser={currentUser}
				endpoint={`/api/user/username/${user.username}/followers`}
				emptyMessage='No followers yet'
			/>

			<UsersListModal
				isOpen={followingOpen}
				onClose={() => setFollowingOpen(false)}
				title='Following'
				currentUser={currentUser}
				endpoint={`/api/user/username/${user.username}/following`}
				emptyMessage='Not following anyone yet'
			/>
		</>
	)
}
