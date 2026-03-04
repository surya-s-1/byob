import { User } from '@/types'
import Button from '@/components/ui/Button'
import { User as UserIcon, Settings } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ProfileHeaderProps {
	user: User
	isOwnProfile: boolean
	isFollowing: boolean
	isLoadingFollow: boolean
	onFollow: () => void
}

export default function ProfileHeader({
	user,
	isOwnProfile,
	isFollowing,
	isLoadingFollow,
	onFollow,
}: ProfileHeaderProps) {
	return (
		<div className='relative pt-lg sm:pt-3xl'>
			<div className='flex flex-col items-center gap-lg px-lg text-center sm:flex-row sm:items-end sm:gap-2xl sm:px-3xl sm:text-left'>
				<div className='relative z-10 mx-auto h-24 w-24 overflow-hidden rounded-3xl border-4 border-primary bg-elevated shadow-xl sm:mx-0 sm:h-32 sm:w-32'>
					{user.image ? (
						<Image src={user.image} alt={user.name} fill className='object-cover' />
					) : (
						<div className='flex h-full w-full items-center justify-center bg-secondary'>
							<UserIcon size={48} className='text-muted' />
						</div>
					)}
				</div>

				<div className='flex-1 pb-sm'>
					<h1 className='text-2xl font-extrabold tracking-tight text-main sm:text-3xl'>
						{user.name}
					</h1>
					<p className='text-sm font-medium text-subtle sm:text-base'>@{user.username}</p>
				</div>

				<div className='flex w-full justify-center gap-md pb-sm sm:w-auto'>
					{isOwnProfile ? (
						<Link href='/settings' className='w-full'>
							<Button variant='brand' className='w-full gap-sm'>
								<Settings size={18} />
								Edit Profile
							</Button>
						</Link>
					) : (
						<Button
							onClick={onFollow}
							isLoading={isLoadingFollow}
							variant='brand'
							className='w-fit shadow-lg sm:px-3xl'
						>
							{isFollowing ? 'Unfollow' : 'Follow'}
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
