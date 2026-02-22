'use client'

import React, { useState } from 'react'
import { Publication, Article, NavItem } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ArticleCard from '@/components/ui/ArticleCard'
import DraftCard from '@/components/ui/DraftCard'
import Tabs from '@/components/ui/Tabs'
import FloatingActions from '@/components/ui/FloatingActions'
import Image from 'next/image'
import Link from 'next/link'
import {
	Users,
	BookOpen,
	Shield,
	Globe,
	Lock,
	Share2,
	PlusCircle,
	Calendar,
	Mail,
	ChevronRight,
	Clock,
	CheckCircle2,
	XCircle,
	Check,
	FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface PublicationClientProps {
	publication: Publication
	currentUser: any | null
	initialArticles: Article[]
	series: any[]
	invitations: any[]
	drafts: any[]
}

type TabType = 'articles' | 'series' | 'invitations' | 'drafts'

export default function PublicationClient({
	publication,
	currentUser,
	initialArticles,
	series,
	invitations,
	drafts,
}: PublicationClientProps) {
	const router = useRouter()
	const [activeTab, setActiveTab] = useState<TabType>('articles')
	const [isFollowing, setIsFollowing] = useState(publication.isFollowing)
	const [followersCount, setFollowersCount] = useState(publication.followersCount)
	const [isLoading, setIsLoading] = useState(false)
	const [localInvitations, setLocalInvitations] = useState(invitations)
	const [reinvitingIds, setReinvitingIds] = useState<Set<string>>(new Set())

	const handleFollow = async () => {
		if (!currentUser) {
			window.location.href = '/login'
			return
		}

		if (isLoading) return

		setIsLoading(true)
		const action = isFollowing ? 'unfollow' : 'follow'
		try {
			const res = await fetch(`/api/publications/id/${publication.id}/${action}`, {
				method: 'POST',
			})
			if (res.ok) {
				setIsFollowing(!isFollowing)
				setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1))
			}
		} catch (error) {
			console.error(`Error ${action}ing publication:`, error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleReinvite = async (userId: string) => {
		if (reinvitingIds.has(userId)) return

		setReinvitingIds((prev) => new Set(prev).add(userId))
		try {
			const res = await fetch(`/api/publications/id/${publication.id}/members/reinvite`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId }),
			})

			if (res.ok) {
				setLocalInvitations((prev) =>
					prev.map((inv) =>
						inv.user.id === userId
							? { ...inv, status: 'pending', invitedAt: new Date().toISOString() }
							: inv
					)
				)
			}
		} catch (error) {
			console.error('Error reinviting user:', error)
		} finally {
			setReinvitingIds((prev) => {
				const next = new Set(prev)
				next.delete(userId)
				return next
			})
		}
	}

	const handleWriteArticle = async () => {
		try {
			const res = await fetch('/api/drafts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ publicationId: publication.id }),
			})
			if (res.ok) {
				const data = await res.json()
				if (data.draftId) {
					router.push(`/draft/${data.draftId}`)
				}
			}
		} catch (error) {
			console.error('Error creating draft:', error)
		}
	}

	const canManage = publication.myRole === 'OWNER' || publication.myRole === 'ADMIN'

	return (
		<div className='max-w-6xl mx-auto px-4 py-8 lg:py-12 space-y-12'>
			{canManage && (
				<FloatingActions
					actions={[
						{
							icon: <PlusCircle size={20} />,
							label: 'Write Article',
							onClick: handleWriteArticle,
							variant: 'brand',
						},
					]}
				/>
			)}

			{/* Publication Header */}
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
								onClick={handleFollow}
								isLoading={isLoading}
								className={cn(
									'rounded-full px-6',
									isFollowing ? 'btn-secondary' : 'btn-brand'
								)}
							>
								{isFollowing ? 'Unsubscribe' : 'Subscribe'}
							</Button>
						)}
						{canManage && (
							<Button onClick={handleWriteArticle} className='hidden md:flex rounded-full px-6 btn-brand items-center gap-2'>
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

			<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
				<div className='lg:col-span-1 space-y-6 lg:order-2'>
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
				</div>

				<div className='lg:col-span-3 space-y-8 lg:order-1'>
					{/* Tabs */}
					<div className='-mx-4 sm:mx-0 mb-6'>
						<Tabs
							tabs={[
								{ id: 'articles', label: 'Articles' },
								{ id: 'drafts', label: 'Drafts' },
								{ id: 'series', label: 'Series' },
								...(canManage ? [{ id: 'invitations', label: 'Invitations' }] : []),
							]}
							activeTab={activeTab}
							onChange={(id) => setActiveTab(id as TabType)}
							className='border-b-0'
						/>
						<div className='h-px bg-border w-full mt-0' />
					</div>

					{/* Tab Content */}
					<div className='space-y-6'>
						{activeTab === 'articles' && (
							<>
								{initialArticles.length > 0 ? (
									initialArticles.map((article) => (
										<ArticleCard key={article.id} article={article} />
									))
								) : (
									<div className='py-20 text-center rounded-3xl bg-secondary/20 border border-dashed border-border/50'>
										<BookOpen size={48} className='text-muted/20 mx-auto mb-4' />
										<p className='text-muted font-medium'>
											No articles published yet.
										</p>
									</div>
								)}
							</>
						)}

						{activeTab === 'drafts' && (
							<>
								{drafts.length > 0 ? (
									drafts.map((draft) => (
										<DraftCard key={draft.id} draft={draft} />
									))
								) : (
									<div className='py-20 text-center rounded-3xl bg-secondary/20 border border-dashed border-border/50'>
										<FileText size={48} className='text-muted/20 mx-auto mb-4' />
										<p className='text-muted font-medium'>
											No drafts published yet.
										</p>
									</div>
								)}
							</>
						)}

						{activeTab === 'series' && (
							<>
								{series.length > 0 ? (
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										{series.map((s) => (
											<Link
												key={s.id}
												href={`/publication/${publication.slug}/series/${s.slug}`}
											>
												<Card className='p-5 hover:bg-secondary transition-all h-full flex flex-col justify-between group'>
													<div className='space-y-2'>
														<h3 className='font-bold text-lg text-main group-hover:text-main'>
															{s.displayName}
														</h3>
														<p className='text-sm text-subtle line-clamp-2'>
															{s.displayDescription ||
																'Collection of related articles.'}
														</p>
													</div>
													<div className='pt-4 flex items-center justify-between text-xs text-muted font-bold uppercase tracking-wider'>
														<span>{s.articleCount} Articles</span>
														<ChevronRight
															size={16}
															className='group-hover:translate-x-1 transition-transform'
														/>
													</div>
												</Card>
											</Link>
										))}
									</div>
								) : (
									<div className='py-20 text-center rounded-3xl bg-secondary/20 border border-dashed border-border/50'>
										<Calendar
											size={48}
											className='text-muted/20 mx-auto mb-4'
										/>
										<p className='text-muted font-medium'>
											No series created yet.
										</p>
									</div>
								)}
							</>
						)}

						{activeTab === 'invitations' && (
							<Card className='overflow-hidden border-border'>
								<div className='overflow-x-auto'>
									<table className='w-full text-left border-collapse'>
										<thead className='bg-secondary/50'>
											<tr>
												<th className='px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted'>
													User
												</th>
												<th className='px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted'>
													Role
												</th>
												<th className='px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted'>
													Status
												</th>
												<th className='px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right'>
													Actions
												</th>
											</tr>
										</thead>
										<tbody className='divide-y divide-border'>
											{localInvitations.length > 0 ? (
												localInvitations.map((inv) => (
													<tr
														key={inv.user.id}
														className='hover:bg-secondary/30 transition-colors'
													>
														<td className='px-6 py-4'>
															<div className='flex items-center gap-3'>
																<div className='relative w-8 h-8 rounded-full overflow-hidden bg-secondary'>
																	{inv.user.image ? (
																		<img
																			src={inv.user.image}
																			alt={inv.user.name}
																			className='object-cover w-full h-full'
																		/>
																	) : (
																		<Users
																			size={14}
																			className='m-auto h-full w-full p-2'
																		/>
																	)}
																</div>
																<div>
																	<div className='text-sm font-bold text-main'>
																		{inv.user.name}
																	</div>
																	<div className='text-xs text-muted'>
																		@{inv.user.username}
																	</div>
																</div>
															</div>
														</td>
														<td className='px-6 py-4'>
															<span className='px-2 py-1 bg-primary/10 text-main text-[10px] font-bold rounded-md uppercase'>
																{inv.role}
															</span>
														</td>
														<td className='px-6 py-4'>
															<div className='flex items-center gap-2'>
																{inv.status === 'accepted' && (
																	<>
																		<CheckCircle2
																			size={14}
																			className='text-green-500'
																		/>
																		<span className='text-xs font-bold text-green-600 capitalize'>
																			Accepted
																		</span>
																	</>
																)}
																{inv.status === 'rejected' && (
																	<>
																		<XCircle
																			size={14}
																			className='text-error'
																		/>
																		<span className='text-xs font-bold text-error capitalize'>
																			Rejected
																		</span>
																	</>
																)}
																{inv.status === 'pending' && (
																	<>
																		<Clock
																			size={14}
																			className='text-amber-500'
																		/>
																		<span className='text-xs font-bold text-amber-600 capitalize'>
																			Pending
																		</span>
																	</>
																)}
															</div>
														</td>
														<td className='px-6 py-4 text-right'>
															{inv.status === 'rejected' ? (
																<Button
																	onClick={() =>
																		handleReinvite(inv.user.id)
																	}
																	isLoading={reinvitingIds.has(
																		inv.user.id
																	)}
																	className='btn-brand btn-xs px-3 py-1 text-[10px]'
																>
																	Reinvite
																</Button>
															) : (
																<div className='text-xs text-subtle font-medium'>
																	{new Date(
																		inv.acceptedAt ||
																		inv.rejectedAt ||
																		inv.invitedAt
																	).toLocaleDateString(
																		undefined,
																		{
																			month: 'short',
																			day: 'numeric',
																			year: 'numeric',
																		}
																	)}
																</div>
															)}
														</td>
													</tr>
												))
											) : (
												<tr>
													<td
														colSpan={5}
														className='px-6 py-12 text-center text-muted text-sm'
													>
														No invitation history found.
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</Card>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
