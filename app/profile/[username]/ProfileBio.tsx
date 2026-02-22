import { User } from '@/types'
import { Calendar } from 'lucide-react'

interface ProfileBioProps {
	user: User
	isOwnProfile: boolean
}

export default function ProfileBio({ user, isOwnProfile }: ProfileBioProps) {
	return (
		<div className='space-y-6 rounded-2xl border border-border/50 bg-secondary/30 p-5'>
			<div className='space-y-4'>
				<h3 className='text-sm font-bold tracking-wider text-muted uppercase'>Bio</h3>
				<p className='text-sm leading-relaxed text-main'>
					{user.bio || 'This user prefers to keep their story a mystery.'}
				</p>
			</div>

			<div className='space-y-3 border-t border-border/50 pt-4'>
				{isOwnProfile && user.dob && (
					<div className='flex items-center gap-3 text-xs text-subtle sm:text-sm'>
						<Calendar size={16} className='text-main' />
						<span>Born {new Date(user.dob).toLocaleDateString()}</span>
					</div>
				)}
			</div>
		</div>
	)
}
