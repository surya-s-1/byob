import { Publication } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Globe, Users, Shield, PlusCircle } from 'lucide-react'

interface PublicationAboutProps {
    publication: Publication
    followersCount: number
    canManage: boolean
}

export default function PublicationAbout({
    publication,
    followersCount,
    canManage,
}: PublicationAboutProps) {
    return (
        <Card className='p-6 space-y-6 sticky top-24'>
            <div className='space-y-4'>
                <h4 className='text-xs font-bold uppercase tracking-widest text-muted'>
                    About
                </h4>
                <div className='space-y-3'>
                    <div className='flex items-center justify-between text-sm'>
                        <span className='text-subtle flex items-center gap-2'>
                            <Globe size={16} /> Visibility
                        </span>
                        <span className='font-bold text-main capitalize'>
                            {publication.visibility.toLowerCase()}
                        </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                        <span className='text-subtle flex items-center gap-2'>
                            <Users size={16} /> Followers
                        </span>
                        <span className='font-bold text-main'>{followersCount}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                        <span className='text-subtle flex items-center gap-2'>
                            <Shield size={16} /> Members
                        </span>
                        <span className='font-bold text-main'>
                            {publication.memberCount || 0}
                        </span>
                    </div>
                </div>
            </div>

            {canManage && (
                <div className='pt-6 border-t border-border space-y-3'>
                    <Button className='w-full btn-brand flex items-center justify-center gap-2'>
                        <PlusCircle size={16} />
                        Invite Member
                    </Button>
                </div>
            )}
        </Card>
    )
}
