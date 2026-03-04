import { User } from '@/types'
import { Calendar } from 'lucide-react'

interface ProfileBioProps {
	user: User
	isOwnProfile: boolean
}

export default function ProfileBio({ user, isOwnProfile }: ProfileBioProps) {
	return (
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
			</div>
		</div>
	)
}
