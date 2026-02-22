import { User } from '@/types'
import { Calendar } from 'lucide-react'

interface ProfileBioProps {
    user: User
    isOwnProfile: boolean
}

export default function ProfileBio({ user, isOwnProfile }: ProfileBioProps) {
    return (
        <div className='space-y-6 bg-secondary/30 p-5 rounded-2xl border border-border/50'>
            <div className='space-y-4'>
                <h3 className='text-sm font-bold uppercase tracking-wider text-muted'>
                    Bio
                </h3>
                <p className='text-main leading-relaxed text-sm'>
                    {user.bio || 'This user prefers to keep their story a mystery.'}
                </p>
            </div>

            <div className='space-y-3 pt-4 border-t border-border/50'>
                {isOwnProfile && user.dob && (
                    <div className='flex items-center gap-3 text-xs sm:text-sm text-subtle'>
                        <Calendar size={16} className='text-main' />
                        <span>Born {new Date(user.dob).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
