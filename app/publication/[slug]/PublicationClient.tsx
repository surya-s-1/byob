'use client'

import React, { useState } from 'react'
import { Publication, Article, NavItem } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ArticleCard from '@/components/ui/ArticleCard'
import DraftCard from '@/components/ui/DraftCard'
import Tabs from '@/components/ui/Tabs'
import FloatingActions from '@/components/ui/FloatingActions'
import Link from 'next/link'
import { PlusCircle, BookOpen, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import PublicationHeader from './PublicationHeader'
import PublicationAbout from './PublicationAbout'
import PublicationSeries from './PublicationSeries'
import PublicationInvitations from './PublicationInvitations'

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
			<PublicationHeader
				publication={publication}
				canManage={canManage}
				isFollowing={isFollowing}
				isLoadingFollow={isLoading}
				onFollow={handleFollow}
				onWriteArticle={handleWriteArticle}
			/>

			<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
				<div className='lg:col-span-1 space-y-6 lg:order-2'>
					<PublicationAbout
						publication={publication}
						followersCount={followersCount}
						canManage={canManage}
					/>
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
							<PublicationSeries series={series} publicationSlug={publication.slug} />
						)}

						{activeTab === 'invitations' && canManage && (
							<PublicationInvitations
								invitations={localInvitations}
								reinvitingIds={reinvitingIds}
								onReinvite={handleReinvite}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
