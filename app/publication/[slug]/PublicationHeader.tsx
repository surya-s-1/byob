import { Publication } from '@/types'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import { BookOpen, PlusCircle, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PublicationHeaderProps {
    publication: Publication
    canManage: boolean
    isFollowing: boolean
    isLoadingFollow: boolean
    onFollow: () => void
    onWriteArticle: () => void
}

export default function PublicationHeader({
    publication,
    canManage,
    isFollowing,
    isLoadingFollow,
    onFollow,
    onWriteArticle,
}: PublicationHeaderProps) {
    return (
        <div className='flex flex-col md:flex-row gap-8 items-start md:items-center'>
            <div className='relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-secondary border-2 border-border shadow-xl flex-shrink-0 mx-auto md:mx-0'>
                {publication.cover ? (
                    <Image
                        src={publication.cover}
                        alt={publication.displayName}
                        fill
                        className='object-cover'
                    />
                ) : (
                    <div className='absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center'>
                        <BookOpen size={48} className='text-main/20' />
                    </div>
                )}
            </div>

            <div className='flex-1 space-y-4 text-center md:text-left'>
                <div className='space-y-1'>
                    <h1 className='text-3xl md:text-5xl font-bold text-main tracking-tight'>
                        {publication.displayName}
                    </h1>
                    {publication.displayDescription && (
                        <p className='text-lg md:text-xl text-subtle max-w-full md:max-w-[90%] mx-auto md:mx-0'>
                            {publication.displayDescription}
                        </p>
                    )}
                </div>

                <div className='flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2'>
                    {!publication.isMember && (
                        <Button
                            onClick={onFollow}
                            isLoading={isLoadingFollow}
                            className={cn(
                                'rounded-full px-6',
                                isFollowing ? 'btn-secondary' : 'btn-brand'
                            )}
                        >
                            {isFollowing ? 'Unsubscribe' : 'Subscribe'}
                        </Button>
                    )}
                    {canManage && (
                        <Button onClick={onWriteArticle} className='hidden md:flex rounded-full px-6 btn-brand items-center gap-2'>
                            <PlusCircle size={18} />
                            Write Article
                        </Button>
                    )}
                    <Button className='rounded-full p-2.5 btn-brand'>
                        <Share2 size={18} />
                    </Button>
                </div>
            </div>
        </div>
    )
}
