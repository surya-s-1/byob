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
		<div className='flex flex-col items-start gap-8 md:flex-row md:items-center'>
			<div className='relative mx-auto h-32 w-32 flex-shrink-0 overflow-hidden rounded-3xl border-2 border-border bg-secondary shadow-xl md:mx-0 md:h-40 md:w-40'>
				{publication.cover ? (
					<Image
						src={publication.cover}
						alt={publication.displayName}
						fill
						className='object-cover'
					/>
				) : (
					<div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary'>
						<BookOpen size={48} className='text-main/20' />
					</div>
				)}
			</div>

			<div className='flex-1 space-y-4 text-center md:text-left'>
				<div className='space-y-1'>
					<h1 className='text-3xl font-bold tracking-tight text-main md:text-5xl'>
						{publication.displayName}
					</h1>
					{publication.displayDescription && (
						<p className='mx-auto max-w-full text-lg text-subtle md:mx-0 md:max-w-[90%] md:text-xl'>
							{publication.displayDescription}
						</p>
					)}
				</div>

				<div className='flex flex-wrap items-center justify-center gap-2 pt-2 md:justify-start'>
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
						<Button
							onClick={onWriteArticle}
							className='btn-brand hidden items-center gap-2 rounded-full px-6 md:flex'
						>
							<PlusCircle size={18} />
							Write Article
						</Button>
					)}
					<Button className='btn-brand rounded-full p-2.5'>
						<Share2 size={18} />
					</Button>
				</div>
			</div>
		</div>
	)
}
