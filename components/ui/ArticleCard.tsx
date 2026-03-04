'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MoreHorizontal, Edit, EyeOff, Trash2, Loader2 } from 'lucide-react'
import Card from './Card'
import Modal from './Modal'
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
				<Card className='flex items-center justify-between gap-4 p-3 transition-all duration-300 hover:bg-secondary/50 hover:shadow-md border-border/80'>
					<div className='flex min-w-0 items-center gap-3'>
						<div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-secondary sm:h-12 sm:w-12'>
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
							<div className='flex items-center gap-2 text-[10px] text-muted sm:text-xs'>
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
			<Card className='group p-4 transition-all duration-300 hover:border-primary/50 sm:p-5 relative hover:shadow-md bg-elevated/50 hover:bg-elevated border-border/80'>
				<div className='flex flex-col-reverse gap-4 sm:flex-row sm:gap-6 relative'>
					<div className='min-w-0 flex-1 space-y-2 relative z-10'>
						<div className='flex justify-between items-start gap-4'>
							<div className='flex flex-wrap items-center gap-2 text-xs text-muted'>
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
										className='flex h-8 w-8 items-center justify-center rounded-lg text-subtle/50 transition-colors hover:bg-secondary hover:text-main'
									>
										{isProcessing ? <Loader2 size={16} className='animate-spin text-brand' /> : <MoreHorizontal size={16} />}
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
											<div className='absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-border bg-elevated p-1.5 shadow-md animate-in fade-in slide-in-from-top-2'>
												<button
													onClick={(e) => handleAction('edit', e)}
													className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-main hover:bg-secondary'
												>
													<Edit size={14} />
													Edit
												</button>
												<button
													onClick={(e) => handleAction('unpublish', e)}
													className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-amber-500 hover:bg-amber-500/10'
												>
													<EyeOff size={14} />
													Unpublish
												</button>
												<div className='my-1 h-px w-full bg-border/50' />
												<button
													onClick={(e) => handleAction('delete', e)}
													className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10'
												>
													<Trash2 size={14} />
													Delete
												</button>
											</div>
										</>
									)}
								</div>
							)}
						</div>
						<h3 className='line-clamp-2 text-lg font-bold text-main transition-colors group-hover:text-main sm:text-xl'>
							{article.title}
						</h3>
						{article.excerpt && (
							<p className='line-clamp-2 text-sm leading-relaxed text-subtle'>
								{article.excerpt}
							</p>
						)}
						{article.authors && (
							<div className='flex items-center gap-2 pt-2'>
								<div className='flex -space-x-2'>
									{article.authors.slice(0, 3).map((author, i) => (
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
									{article.authors[0].name}{' '}
									{article.authors.length > 1 &&
										`+ ${article.authors.length - 1} more`}
								</span>
							</div>
						)}
					</div>
					{article.cover && (
						<div className='relative h-40 w-full flex-shrink-0 overflow-hidden rounded-md bg-secondary sm:h-32 sm:w-32 lg:h-28 lg:w-40'>
							<Image
								src={article.cover}
								alt={article.title}
								fill
								className='object-cover transition-transform duration-500 group-hover:scale-105'
							/>
						</div>
					)}
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
						<div className='space-y-6'>
							<p className='text-subtle'>
								{actionModal === 'delete'
									? 'Are you sure you want to permanently delete this article? This action cannot be undone.'
									: 'Are you sure you want to unpublish this article? It will be moved back to your drafts.'}
							</p>
							<div className='flex justify-end gap-3'>
								<button
									onClick={() => setActionModal(null)}
									className='rounded-lg px-4 py-2 text-sm font-medium text-subtle transition-colors hover:bg-secondary hover:text-main'
								>
									Cancel
								</button>
								<button
									onClick={confirmAction}
									disabled={isProcessing}
									className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all ${actionModal === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}
								>
									{isProcessing && <Loader2 size={14} className='animate-spin' />}
									{actionModal === 'delete' ? 'Delete Permanently' : 'Unpublish Article'}
								</button>
							</div>
						</div>
					</Modal>
				</div>
			)}
		</div>
	)
}
