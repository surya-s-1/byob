'use client'

import { useState } from 'react'
import { Publication, Article } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ArticleCard from '@/components/ui/ArticleCard'
import DraftCard from '@/components/ui/DraftCard'
import Tabs from '@/components/ui/Tabs'
import FloatingActions from '@/components/ui/FloatingActions'
import { PlusCircle, BookOpen, FileText, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PublicationHeader from './PublicationHeader'
import PublicationAbout from './PublicationAbout'
import PublicationSeries from './PublicationSeries'
import PublicationInvitations from './PublicationInvitations'
import InviteMemberModal from './InviteMemberModal'
import Modal from '@/components/ui/Modal'

interface PublicationClientProps {
	publication: Publication
	currentUser: any | null
	initialArticles: Article[]
	series: any[]
	invitations: any[]
	drafts: any[]
}

type TabType = 'articles' | 'series' | 'invitations' | 'drafts' | 'danger'

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
	const [localInvitations, setLocalInvitations] = useState(invitations || [])
	const [localDrafts, setLocalDrafts] = useState(drafts || [])
	const [reinvitingIds, setReinvitingIds] = useState<Set<string>>(new Set())
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set())

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

	const handleDeleteDraft = async (id: string) => {
		if (!confirm('Are you sure you want to delete this draft?')) return

		try {
			const res = await fetch(`/api/drafts/${id}`, {
				method: 'DELETE',
			})
			if (res.ok) {
				setLocalDrafts((prev) => prev.filter((d) => d.id !== id))
			} else {
				const data = await res.json()
				alert(data.error || 'Failed to delete draft')
			}
		} catch (error) {
			console.error('Error deleting draft:', error)
			alert('An error occurred while deleting the draft.')
		}
	}

	const handleDeletePublication = async () => {
		setIsDeleting(true)
		try {
			const res = await fetch(`/api/publications/id/${publication.id}`, {
				method: 'DELETE',
			})

			if (res.ok) {
				router.push('/dashboard')
			} else {
				const data = await res.json()
				alert(data.error || 'Failed to delete publication')
			}
		} catch (error) {
			console.error('Error deleting publication:', error)
			alert('An error occurred while deleting the publication.')
		} finally {
			setIsDeleting(false)
			setIsDeleteModalOpen(false)
		}
	}

	const handleInviteMember = async (user: any, role: string) => {
		try {
			const res = await fetch(`/api/publications/id/${publication.id}/members/invite`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: user.id, role }),
			});
			if (res.ok) {
				const newInvite = {
					user: {
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image
					},
					role,
					status: 'pending',
					invitedAt: new Date().toISOString()
				}
				setLocalInvitations(prev => [newInvite, ...prev.filter(inv => inv.user.id !== user.id)])
			}
		} catch (error) {
			console.error('Error inviting member:', error)
		}
	}

	const handleCancelInvite = async (userId: string) => {
		if (cancellingIds.has(userId)) return
		setCancellingIds((prev) => new Set(prev).add(userId))
		try {
			const res = await fetch(`/api/publications/id/${publication.id}/members/cancel-invite`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId }),
			});
			if (res.ok) {
				setLocalInvitations(prev => prev.filter(inv => inv.user.id !== userId))
			}
		} catch (error) {
			console.error('Error canceling invite:', error)
		} finally {
			setCancellingIds((prev) => {
				const next = new Set(prev)
				next.delete(userId)
				return next
			})
		}
	}

	const canManage = publication.myRole === 'OWNER' || publication.myRole === 'ADMIN'

	return (
		<div className='mx-auto max-w-6xl space-y-5xl px-lg py-3xl lg:py-5xl'>
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
			<PublicationHeader
				publication={publication}
				canManage={canManage}
				isFollowing={isFollowing}
				isLoadingFollow={isLoading}
				onFollow={handleFollow}
				onWriteArticle={handleWriteArticle}
			/>

			<div className='grid grid-cols-1 gap-3xl lg:grid-cols-4'>
				<div className='space-y-2xl lg:order-2 lg:col-span-1'>
					<PublicationAbout
						publication={publication}
						followersCount={followersCount}
						canManage={canManage}
						onInviteClick={() => setIsInviteModalOpen(true)}
					/>
				</div>

				<div className='space-y-3xl lg:order-1 lg:col-span-3'>
					{/* Tabs */}
					<div className='-mx-lg mb-2xl sm:mx-0'>
						<Tabs
							tabs={[
								{ id: 'articles', label: 'Articles' },
								...(publication.myRole ? [{ id: 'drafts', label: 'Drafts' }] : []),
								{ id: 'series', label: 'Series' },
								...(canManage ? [{ id: 'invitations', label: 'Invitations' }] : []),
								...(publication.myRole === 'OWNER' ? [{ id: 'danger', label: 'Danger', variant: 'danger' } as const] : []),
							]}
							activeTab={activeTab}
							onChange={(id) => setActiveTab(id as TabType)}
							className='border-b-0'
						/>
						<div className='mt-0 h-px w-full bg-border' />
					</div>

					{/* Tab Content */}
					<div className='space-y-2xl'>
						{activeTab === 'articles' && (
							<>
								{initialArticles.length > 0 ? (
									initialArticles.map((article) => (
										<ArticleCard
											key={article.id}
											article={article}
											currentUser={currentUser}
											canManagePub={canManage}
										/>
									))
								) : (
									<div className='rounded-3xl border border-dashed border-border/50 bg-secondary/20 py-7xl text-center'>
										<BookOpen
											size={48}
											className='mx-auto mb-lg text-muted/20'
										/>
										<p className='font-medium text-muted'>
											No articles published yet.
										</p>
									</div>
								)}
							</>
						)}

						{activeTab === 'drafts' && publication.myRole && (
							<>
								{localDrafts.length > 0 ? (
									localDrafts.map((draft) => (
										<DraftCard
											key={draft.id}
											draft={draft}
											onDelete={handleDeleteDraft}
										/>
									))
								) : (
									<div className='rounded-3xl border border-dashed border-border/50 bg-secondary/20 py-7xl text-center'>
										<FileText
											size={48}
											className='mx-auto mb-lg text-muted/20'
										/>
										<p className='font-medium text-muted'>
											No drafts published yet.
										</p>
									</div>
								)}
							</>
						)}

						{activeTab === 'series' && (
							<PublicationSeries series={series} publicationSlug={publication.slug} />
						)}

						{activeTab === 'invitations' && canManage && (
							<PublicationInvitations
								invitations={localInvitations}
								reinvitingIds={reinvitingIds}
								cancellingIds={cancellingIds}
								onReinvite={handleReinvite}
								onCancelInvite={handleCancelInvite}
							/>
						)}

						{activeTab === 'danger' && publication.myRole === 'OWNER' && (
							<div className='animate-in fade-in slide-in-from-top-2 duration-300'>
								<Card className='border-red-500/20 bg-red-500/5 p-3xl'>
									<div className='flex flex-col items-center gap-2xl text-center'>
										<div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500'>
											<Trash2 size={32} />
										</div>
										<div className='space-y-sm'>
											<h3 className='text-xl font-bold text-main'>Delete Publication</h3>
											<p className='max-w-[90%] text-sm text-subtle'>
												Permanently delete this publication and all its content.
												This action cannot be undone. All articles and drafts will be lost.
											</p>
										</div>
										<Button
											onClick={() => setIsDeleteModalOpen(true)}
											variant='danger'
											size='lg'
										>
											Delete {publication.displayName}
										</Button>
									</div>
								</Card>
							</div>
						)}
					</div>
				</div>
			</div>

			{canManage && (
				<InviteMemberModal
					isOpen={isInviteModalOpen}
					onClose={() => setIsInviteModalOpen(false)}
					publicationId={publication.id}
					localInvitations={localInvitations}
					onInvite={handleInviteMember}
					onCancelInvite={handleCancelInvite}
				/>
			)}

			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title='Delete Publication'
			>
				<div className='space-y-2xl'>
					<p className='text-sm leading-relaxed text-subtle'>
						Are you sure you want to delete <span className='font-bold text-main'>{publication.displayName}</span>?
						This action is permanent and will delete all associated articles, series, and drafts.
					</p>

					<div className='flex items-center gap-md'>
						<Button
							onClick={() => setIsDeleteModalOpen(false)}
							variant='secondary'
							className='flex-1'
						>
							Cancel
						</Button>
						<Button
							onClick={handleDeletePublication}
							isLoading={isDeleting}
							variant='danger'
							className='flex-1'
						>
							Delete
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	)
}
