import Link from 'next/link'
import Image from 'next/image'
import Card from './Card'
import { Publication } from '@/types'
import { BookOpen, ChevronRight, ShieldCheck } from 'lucide-react'

interface PublicationCardProps {
	publication: Publication
	variant?: 'full' | 'mini'
}

export default function PublicationCard({ publication, variant = 'full' }: PublicationCardProps) {
	if (variant === 'mini') {
		return (
			<Link href={`/publication/${publication.slug}`} className='group block cursor-pointer'>
				<Card className='flex items-center gap-md p-md transition-all hover:bg-secondary'>
					<div className='relative flex h-4xl w-4xl shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-main'>
						{publication.cover ? (
							<Image
								src={publication.cover}
								alt={publication.displayName}
								fill
								className='object-cover transition-transform group-hover:scale-110'
							/>
						) : (
							<BookOpen size={16} />
						)}
					</div>
					<div className='min-w-0 flex-1'>
						<h4 className='truncate text-sm font-bold text-main transition-colors group-hover:text-main'>
							{publication.displayName}
						</h4>
						<div className='flex items-center gap-xs'>
							{publication.myRole && (
								<span className='flex items-center gap-2xs rounded bg-primary/10 px-xs text-[10px] font-semibold text-main'>
									<ShieldCheck size={8} />
									{publication.myRole}
								</span>
							)}
							<p className='truncate text-[10px] text-muted'>
								· {publication.followersCount} followers
							</p>
						</div>
					</div>
				</Card>
			</Link>
		)
	}

	return (
		<Card className='group overflow-hidden p-lg transition-all hover:border-l-primary hover:shadow-md sm:p-xl'>
			<Link href={`/publication/${publication.slug}`} className='cursor-pointer'>
				<div className='flex flex-col items-start gap-lg sm:flex-row sm:items-center'>
					<div className='relative flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 font-bold text-main sm:h-6xl sm:w-6xl'>
						{publication.cover ? (
							<Image
								src={publication.cover}
								alt={publication.displayName}
								fill
								className='object-cover transition-transform group-hover:scale-105'
							/>
						) : (
							<BookOpen size={28} />
						)}
					</div>
					<div className='min-w-0 flex-1 space-y-xs'>
						<div className='flex flex-wrap items-center gap-sm'>
							<h3 className='truncate text-lg font-bold text-main transition-colors group-hover:text-main'>
								{publication.displayName}
							</h3>
							{publication.myRole && (
								<span className='rounded-full bg-primary/10 px-sm py-2xs text-[10px] font-bold tracking-wider text-main uppercase'>
									{publication.myRole}
								</span>
							)}
						</div>
						{publication.displayDescription && (
							<p className='line-clamp-1 text-sm text-subtle'>
								{publication.displayDescription}
							</p>
						)}
						<p className='flex items-center gap-sm text-xs text-muted'>
							<span className='font-medium text-main'>
								{publication.followersCount}
							</span>{' '}
							followers
							{publication.isMember && (
								<span className='font-bold text-green-500'>· Member</span>
							)}
						</p>
					</div>
					<div className='hidden rounded-full p-sm text-muted transition-all hover:bg-secondary hover:text-main sm:block'>
						<ChevronRight size={24} />
					</div>
				</div>
			</Link>
		</Card>
	)
}
