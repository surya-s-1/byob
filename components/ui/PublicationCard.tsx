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
			<Link href={`/publication/${publication.slug}`} className='block group cursor-pointer'>
				<Card className='p-3 hover:bg-secondary transition-all flex items-center gap-3'>
					<div className='h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-main relative overflow-hidden flex-shrink-0'>
						{publication.cover ? (
							<Image
								src={publication.cover}
								alt={publication.displayName}
								fill
								className='object-cover group-hover:scale-110 transition-transform'
							/>
						) : (
							<BookOpen size={16} />
						)}
					</div>
					<div className='flex-1 min-w-0'>
						<h4 className='font-bold text-main text-sm truncate group-hover:text-main transition-colors'>
							{publication.displayName}
						</h4>
						<div className='flex items-center gap-1'>
							{publication.myRole && (
								<span className='text-[10px] font-semibold text-main bg-primary/10 px-1 rounded flex items-center gap-0.5'>
									<ShieldCheck size={8} />
									{publication.myRole}
								</span>
							)}
							<p className='text-[10px] text-muted truncate'>
								· {publication.followersCount} followers
							</p>
						</div>
					</div>
				</Card>
			</Link>
		)
	}

	return (
		<Card className='p-4 sm:p-5 hover:shadow-md transition-all group overflow-hidden border-l-4 border-l-primary/20 hover:border-l-primary'>
			<Link href={`/publication/${publication.slug}`} className='cursor-pointer'>
				<div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
					<div className='w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex items-center justify-center text-main font-bold overflow-hidden relative flex-shrink-0'>
						{publication.cover ? (
							<Image
								src={publication.cover}
								alt={publication.displayName}
								fill
								className='object-cover group-hover:scale-105 transition-transform'
							/>
						) : (
							<BookOpen size={28} />
						)}
					</div>
					<div className='flex-1 min-w-0 space-y-1'>
						<div className='flex items-center gap-2 flex-wrap'>
							<h3 className='font-bold text-lg text-main group-hover:text-main transition-colors truncate'>
								{publication.displayName}
							</h3>
							{publication.myRole && (
								<span className='px-2 py-0.5 bg-primary/10 text-main text-[10px] font-bold rounded-full uppercase tracking-wider'>
									{publication.myRole}
								</span>
							)}
						</div>
						{publication.displayDescription && (
							<p className='text-sm text-subtle line-clamp-1'>
								{publication.displayDescription}
							</p>
						)}
						<p className='text-xs text-muted flex items-center gap-2'>
							<span className='font-medium text-main'>{publication.followersCount}</span>{' '}
							followers
							{publication.isMember && (
								<span className='text-green-500 font-bold'>· Member</span>
							)}
						</p>
					</div>
					<div className='p-2 rounded-full hover:bg-secondary text-muted hover:text-main transition-all'>
						<ChevronRight size={24} />
					</div>
				</div>
			</Link>
		</Card>
	)
}
