'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MoreHorizontal, Edit, EyeOff, Trash2, Loader2 } from 'lucide-react'
import Card from './Card'
import Modal from './Modal'
import Button from './Button'
import { Article } from '@/types'

interface ArticleCardProps {
	article: Article
	variant?: 'full' | 'compact'
	currentUser?: any
	canManagePub?: boolean
}

export default function ArticleCard({ article, variant = 'full', currentUser, canManagePub }: ArticleCardProps) {
	const router = useRouter()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)
	const [actionModal, setActionModal] = useState<'delete' | 'unpublish' | null>(null)

	const isPrimaryAuthor = article.authors?.some((a) => a.id === currentUser?.id && a.isPrimary)
	const canManage = canManagePub || isPrimaryAuthor

	// Auto close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = () => setIsMenuOpen(false)
		if (typeof window !== 'undefined') {
			window.addEventListener('click', handleClickOutside)
			return () => window.removeEventListener('click', handleClickOutside)
		}
	}, [])

	const handleAction = async (action: 'unpublish' | 'edit' | 'delete', e: React.MouseEvent) => {
		e.stopPropagation()
		e.preventDefault()
		setIsMenuOpen(false)

		if (action === 'edit') {
			setIsProcessing(true)
			try {
				const res = await fetch(`/api/articles/id/${article.id}/edit`, { method: 'POST' })
				if (res.ok) {
					const data = await res.json()
					if (data.draftId) router.push(`/draft/${data.draftId}`)
				} else {
					alert('Failed to initiate edit')
				}
			} catch {
				alert('Error starting edit process')
			} finally {
				setIsProcessing(false)
			}
			return
		}

		if (action === 'delete') {
			setActionModal('delete')
			return
		}

		if (action === 'unpublish') {
			setActionModal('unpublish')
			return
		}
	}

	const confirmAction = async () => {
		if (!actionModal) return
		setIsProcessing(true)
		const currentAction = actionModal
		setActionModal(null)

		try {
			if (currentAction === 'delete') {
				const res = await fetch(`/api/articles/id/${article.id}`, { method: 'DELETE' })
				if (res.ok) router.refresh()
				else alert('Failed to delete article')
			} else if (currentAction === 'unpublish') {
				const res = await fetch(`/api/articles/id/${article.id}/unpublish`, { method: 'POST' })
				if (res.ok) router.refresh()
				else alert('Failed to unpublish article')
			}
		} catch {
			alert(`Error ${currentAction}ing article`)
		} finally {
			setIsProcessing(false)
		}
	}

	if (variant === 'compact') {
		return (
			<div
				onClick={() => router.push(`/article/${article.slug}`)}
				className='group block cursor-pointer'
			>
				<Card className='flex items-center justify-between gap-lg p-md transition-all duration-300 hover:bg-secondary/50 hover:shadow-md border-border/80'>
					<div className='flex min-w-0 items-center gap-md'>
						<div className='relative h-4xl w-4xl shrink-0 overflow-hidden rounded bg-secondary sm:h-5xl sm:w-5xl'>
							{article.cover ? (
								<Image
									src={article.cover}
									alt={article.title}
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
								{article.title}
							</h4>
							<div className='flex items-center gap-sm text-[10px] text-muted sm:text-xs'>
								<span>{new Date(article.publishedAt).toLocaleDateString()}</span>
								<span>·</span>
								<span>{article.readTime} min read</span>
							</div>
						</div>
					</div>
				</Card>
			</div>
		)
	}

	return (
		<div
			onClick={() => router.push(`/article/${article.slug}`)}
			className='group block relative cursor-pointer'
		>
			<Card className='group p-lg transition-all duration-300 hover:border-primary/50 sm:p-xl relative hover:shadow-md bg-elevated/50 hover:bg-elevated border-border/80'>
				<div className='flex flex-col gap-lg sm:flex-row sm:gap-2xl relative'>
					{article.cover && (
						<div className='relative h-[160px] w-full shrink-0 overflow-hidden rounded-md bg-secondary sm:h-[128px] sm:w-[128px] lg:h-[112px] lg:w-[160px]'>
							<Image
								src={article.cover}
								alt={article.title}
								fill
								className='object-cover transition-transform duration-500 group-hover:scale-105'
							/>
						</div>
					)}
					<div className='min-w-0 flex-1 space-y-sm relative z-10'>
						<div className='flex justify-between items-start gap-lg'>
							<div className='flex flex-wrap items-center gap-sm text-xs text-muted'>
								{article.publication && (
									<>
										<Link
											href={`/publication/${article.publication.slug}`}
											className='font-bold text-main hover:underline'
											onClick={(e) => e.stopPropagation()}
										>
											{article.publication.displayName}
										</Link>
										<span>·</span>
									</>
								)}
								<span>{new Date(article.publishedAt).toLocaleDateString()}</span>
								<span>·</span>
								<span>{article.readTime} min read</span>
							</div>

							{/* Actions Menu */}
							{(canManage || isProcessing) && (
								<div className='relative ml-auto' onClick={(e) => e.stopPropagation()}>
									<button
										onClick={(e) => {
											e.stopPropagation()
											setIsMenuOpen(!isMenuOpen)
										}}
										disabled={isProcessing}
										className='flex h-fit w-fit items-center justify-center rounded-lg text-subtle/50 transition-colors hover:bg-secondary hover:text-main'
									>
										{isProcessing ? <Loader2 size={16} className='animate-spin text-brand' /> : <MoreHorizontal color='black' size={16} />}
									</button>

									{isMenuOpen && (
										<>
											<div
												className='fixed inset-0 z-40'
												onClick={(e) => {
													e.stopPropagation()
													setIsMenuOpen(false)
												}}
											/>
											<div className='absolute right-0 top-full z-50 mt-xs w-40 rounded-xl border border-border bg-elevated p-xs shadow-md animate-in fade-in slide-in-from-top-2'>
												<Button
													variant='ghost'
													size='sm'
													onClick={(e: React.MouseEvent) => handleAction('edit', e)}
													className='w-full justify-start gap-sm px-md py-sm'
												>
													<Edit size={14} />
													Edit
												</Button>
												<Button
													variant='ghost'
													size='sm'
													onClick={(e: React.MouseEvent) => handleAction('unpublish', e)}
													className='w-full justify-start gap-sm px-md py-sm text-amber-500 hover:text-amber-600 hover:bg-amber-500/10'
												>
													<EyeOff size={14} />
													Unpublish
												</Button>
												<div className='my-xs h-px w-full bg-border/50' />
												<Button
													variant='ghost'
													size='sm'
													onClick={(e: React.MouseEvent) => handleAction('delete', e)}
													className='w-full justify-start gap-sm px-md py-sm text-red-500 hover:text-red-600 hover:bg-red-500/10'
												>
													<Trash2 size={14} />
													Delete
												</Button>
											</div>
										</>
									)}
								</div>
							)}
						</div>
						<h2 className='line-clamp-2 text-lg font-bold text-main transition-colors group-hover:text-main'>
							{article.title}
						</h2>
						<h3 className='line-clamp-2 text-main transition-colors group-hover:text-main'>
							{article.subtitle}
						</h3>
						{article.excerpt && (
							<p className='line-clamp-2 text-sm leading-relaxed text-subtle'>
								{article.excerpt}
							</p>
						)}
						{article.authors && (
							<div className='flex items-center gap-sm pt-sm'>
								<div className='flex -space-x-sm'>
									{article.authors.slice(0, 3).map((author, i) => (
										<div
											key={i}
											className='relative h-2xl w-2xl overflow-hidden rounded-full border-2 border-primary bg-secondary'
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
									{article.authors[0].name}{' '}
									{article.authors.length > 1 &&
										`+ ${article.authors.length - 1} more`}
								</span>
							</div>
						)}
					</div>
				</div>
			</Card>

			{/* Action Confirmation Modal */}
			{actionModal && (
				<div onClick={(e) => e.stopPropagation()}>
					<Modal
						isOpen={!!actionModal}
						onClose={() => setActionModal(null)}
						title={actionModal === 'delete' ? 'Delete Article' : 'Unpublish Article'}
					>
						<div className='space-y-2xl'>
							<p className='text-subtle'>
								{actionModal === 'delete'
									? 'Are you sure you want to permanently delete this article? This action cannot be undone.'
									: 'Are you sure you want to unpublish this article? It will be moved back to your drafts.'}
							</p>
							<div className='flex flex-col md:flex-row-reverse gap-md'>
								<Button
									variant={'danger'}
									onClick={confirmAction}
									isLoading={isProcessing}
									className='gap-sm'
								>
									{actionModal === 'delete' ? 'Delete Permanently' : 'Unpublish Article'}
								</Button>
								<Button
									variant='ghost'
									onClick={() => setActionModal(null)}
									className='text-subtle hover:text-main'
								>
									Cancel
								</Button>
							</div>
						</div>
					</Modal>
				</div>
			)}
		</div>
	)
}
