import Link from 'next/link'
import Image from 'next/image'
import Card from './Card'
import { Draft } from '@/types'
import { Trash2 } from 'lucide-react'
import Button from './Button'

interface ArticleCardProps {
	draft: Draft
	variant?: 'full' | 'compact'
	onDelete?: (id: string, e: React.MouseEvent) => void
}

export default function DraftCard({ draft, variant = 'full', onDelete }: ArticleCardProps) {
	if (variant === 'compact') {
		return (
			<Link href={`/draft/${draft.id}`} className='group relative block'>
				<Card className='flex items-center justify-between gap-lg p-md transition-all hover:bg-secondary'>
					<div className='flex min-w-0 items-center gap-md'>
						<div className='relative h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary sm:h-12 sm:w-12'>
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
							<div className='flex items-center gap-sm text-[10px] text-muted sm:text-xs'>
								<span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
							</div>
						</div>
					</div>
					{onDelete && (
						<Button
							variant='ghost'
							size='sm'
							className='h-8 w-8 p-0 text-muted hover:text-red-500'
							onClick={(e: React.MouseEvent) => {
								e.preventDefault()
								e.stopPropagation()
								onDelete(draft.id, e)
							}}
						>
							<Trash2 size={16} />
						</Button>
					)}
				</Card>
			</Link>
		)
	}

	return (
		<Link href={`/draft/${draft.id}`} className='group relative block'>
			<Card className='group overflow-hidden p-lg transition-all hover:border-main sm:p-xl'>
				{onDelete && (
					<Button
						variant='ghost'
						size='sm'
						className='absolute top-lg right-lg z-10 h-10 w-10 p-0 text-muted opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100'
						onClick={(e: React.MouseEvent) => {
							e.preventDefault()
							e.stopPropagation()
							onDelete(draft.id, e)
						}}
					>
						<Trash2 size={18} />
					</Button>
				)}
				<div className='flex flex-col-reverse gap-lg sm:flex-row sm:gap-2xl'>
					<div className='min-w-0 flex-1 space-y-sm'>
						<div className='line-clamp-2 flex items-center justify-between text-lg font-bold text-main transition-colors sm:text-xl'>
							<span>{draft.title}</span>
							<span className='mr-5xl text-xs text-muted sm:mr-0'>
								{new Date(draft.updatedAt).toLocaleDateString()}
							</span>
						</div>
						{draft.subtitle && (
							<p className='text-sm font-medium text-subtle'>{draft.subtitle}</p>
						)}
						{draft.excerpt && (
							<p className='line-clamp-2 text-sm leading-relaxed text-subtle'>
								{draft.excerpt}
							</p>
						)}
						{draft.lockedBy && (
							<div className='flex items-center gap-sm text-xs font-semibold text-amber-500'>
								<span className='flex h-2 w-2 rounded-full bg-amber-500'></span>
								{draft.lockedBy.name} is editing right now
							</div>
						)}
						{draft.authors && draft.authors.length > 0 && (
							<div className='flex items-center gap-sm pt-sm'>
								<div className='flex -space-x-sm'>
									{draft.authors.slice(0, 5).map((author, i) => (
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
									{draft.authors.length === 1
										? draft.authors[0].name
										: draft.authors.slice(0, 5).map(a => a.name).join(', ') + (draft.authors.length > 5 ? ` + ${draft.authors.length - 5} more` : '')}
								</span>
							</div>
						)}
					</div>
					{draft.cover && (
						<div className='relative h-40 w-full shrink-0 overflow-hidden rounded-md bg-secondary sm:h-32 sm:w-32 lg:h-28 lg:w-40'>
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
