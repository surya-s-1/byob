'use client'

import { useState } from 'react'
import { Publication } from '@/types'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import { BookOpen, PlusCircle, Share2, Check } from 'lucide-react'
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
	const [isCopied, setIsCopied] = useState(false)

	const handleShare = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href)
			setIsCopied(true)
			setTimeout(() => setIsCopied(false), 2000)
		} catch (error) {
			console.error('Failed to copy linking', error)
		}
	}

	return (
		<>
			<div className='flex flex-col items-center gap-3xl md:flex-row'>
				<div className='relative mx-auto h-[128px] w-[128px] shrink-0 overflow-hidden rounded-3xl border-2 border-border bg-secondary shadow-xl md:mx-0 md:h-[160px] md:w-[160px]'>
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

				<div className='flex-1 space-y-lg text-center md:text-left'>
					<div className='space-y-xs'>
						<h1 className='text-3xl font-bold tracking-tight text-main md:text-5xl'>
							{publication.displayName}
						</h1>
						{publication.displayDescription && (
							<p className='mx-auto max-w-full text-lg text-subtle md:mx-0 md:max-w-[90%] md:text-xl'>
								{publication.displayDescription}
							</p>
						)}
					</div>

					<div className='flex flex-col gap-md pt-sm'>
						<div className='flex flex-wrap items-center justify-center gap-sm md:justify-start'>
							{!publication.isMember && (
								<Button
									onClick={onFollow}
									isLoading={isLoadingFollow}
									variant={isFollowing ? 'secondary' : 'brand'}
									className='rounded-full'
								>
									{isFollowing ? 'Unsubscribe' : 'Subscribe'}
								</Button>
							)}
							{canManage && (
								<Button
									onClick={onWriteArticle}
									variant='brand'
									className='hidden items-center gap-sm rounded-full md:flex'
								>
									<PlusCircle size={18} />
									Write Article
								</Button>
							)}
							<Button
								onClick={handleShare}
								variant='secondary'
								className='rounded-full p-md transition-all w-fit h-fit'
							>
								{isCopied ? <Check size={18} className='text-brand' /> : <Share2 size={18} />}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>)
}