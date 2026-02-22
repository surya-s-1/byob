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
        <div className='relative pt-4 sm:pt-8'>
            <div className='flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 sm:px-8 px-4 text-center sm:text-left'>
                <div className='relative h-24 w-24 sm:h-32 sm:w-32 rounded-3xl border-4 border-primary overflow-hidden bg-elevated shadow-xl z-10 mx-auto sm:mx-0'>
                    {user.image ? (
                        <Image src={user.image} alt={user.name} fill className='object-cover' />
                    ) : (
                        <div className='h-full w-full flex items-center justify-center bg-secondary'>
                            <UserIcon size={48} className='text-muted' />
                        </div>
                    )}
                </div>

                <div className='flex-1 pb-2'>
                    <h1 className='text-2xl sm:text-3xl font-extrabold text-main tracking-tight'>
                        {user.name}
                    </h1>
                    <p className='text-sm sm:text-base text-subtle font-medium'>
                        @{user.username}
                    </p>
                </div>

                <div className='flex justify-center gap-3 pb-2 w-full sm:w-auto'>
                    {isOwnProfile ? (
                        <Link href='/settings' className='w-full'>
                            <Button className='flex items-center justify-center gap-2 w-full btn-brand'>
                                <Settings size={18} />
                                Edit Profile
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={onFollow}
                            isLoading={isLoadingFollow}
                            className='w-fit btn-brand sm:px-8 shadow-lg'
                        >
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
