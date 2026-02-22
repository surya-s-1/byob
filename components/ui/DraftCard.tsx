import Link from 'next/link'
import Image from 'next/image'
import Card from './Card'
import { Draft } from '@/types'

interface ArticleCardProps {
	draft: Draft
	variant?: 'full' | 'compact'
}

export default function DraftCard({ draft, variant = 'full' }: ArticleCardProps) {
	if (variant === 'compact') {
		return (
			<Link href={`/draft/${draft.id}`} className='group block'>
				<Card className='flex items-center justify-between gap-4 p-3 transition-all hover:bg-secondary'>
					<div className='flex min-w-0 items-center gap-3'>
						<div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-secondary sm:h-12 sm:w-12'>
							{draft.cover ? (
								<Image
									src={draft.cover}
									alt={draft.title}
									fill
									className='object-cover transition-transform group-hover:scale-105'
								/>
							) : (
								<div className='flex h-full w-full items-center justify-center text-xs text-muted'>
									No Cover
								</div>
							)}
						</div>
						<div className='min-w-0'>
							<h4 className='truncate text-sm font-bold text-main transition-colors group-hover:text-main sm:text-base'>
								{draft.title}
							</h4>
							<div className='flex items-center gap-2 text-[10px] text-muted sm:text-xs'>
								<span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
							</div>
						</div>
					</div>
				</Card>
			</Link>
		)
	}

	return (
		<Link href={`/draft/${draft.id}`} className='group block'>
			<Card className='group overflow-hidden p-4 transition-all hover:border-main sm:p-5'>
				<div className='flex flex-col-reverse gap-4 sm:flex-row sm:gap-6'>
					<div className='min-w-0 flex-1 space-y-2'>
						<div className='line-clamp-2 flex items-center justify-between text-lg font-bold text-main transition-colors sm:text-xl'>
							<span>{draft.title}</span>
							<span className='text-xs text-muted'>
								{new Date(draft.updatedAt).toLocaleDateString()}
							</span>
						</div>
						{draft.excerpt && (
							<p className='line-clamp-2 text-sm leading-relaxed text-subtle'>
								{draft.excerpt}
							</p>
						)}
						{draft.authors && draft.authors.length > 0 && (
							<div className='flex items-center gap-2 pt-2'>
								<div className='flex -space-x-2'>
									{draft.authors.slice(0, 3).map((author, i) => (
										<div
											key={i}
											className='relative h-6 w-6 overflow-hidden rounded-full border-2 border-primary bg-secondary'
										>
											{author.image ? (
												<Image
													src={author.image}
													alt={author.name}
													fill
													className='object-cover'
												/>
											) : (
												<div className='flex h-full w-full items-center justify-center bg-secondary text-[8px]'>
													{author.name[0]}
												</div>
											)}
										</div>
									))}
								</div>
								<span className='text-xs text-muted'>
									{draft.authors[0].name}{' '}
									{draft.authors.length > 1 &&
										`+ ${draft.authors.length - 1} more`}
								</span>
							</div>
						)}
					</div>
					{draft.cover && (
						<div className='relative h-40 w-full flex-shrink-0 overflow-hidden rounded-md bg-secondary sm:h-32 sm:w-32 lg:h-28 lg:w-40'>
							<Image
								src={draft.cover}
								alt={draft.title}
								fill
								className='object-cover transition-transform duration-500 group-hover:scale-105'
							/>
						</div>
					)}
				</div>
			</Card>
		</Link>
	)
}
