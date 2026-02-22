'use client'

import { useState } from 'react'
import { User, Article, Publication } from '@/types'
import FloatingActions from '@/components/ui/FloatingActions'
import { BookOpen } from 'lucide-react'
import DashboardHeader from './DashboardHeader'
import DashboardStats from './DashboardStats'
import DashboardRecentArticles from './DashboardRecentArticles'
import DashboardPublications from './DashboardPublications'
import DashboardInvitations from './DashboardInvitations'

interface DashboardClientProps {
	user: User
	articles: Article[]
	publications: Publication[]
	invitations: any[]
}

export default function DashboardClient({
	user,
	articles,
	publications,
	invitations: initialInvitations,
}: DashboardClientProps) {
	const [invitations, setInvitations] = useState(initialInvitations || [])
	const [actionLoadingIds, setActionLoadingIds] = useState<Set<string>>(new Set())

	const handleAcceptInvitation = async (id: string) => {
		if (actionLoadingIds.has(id)) return

		setActionLoadingIds((prev) => {
			const next = new Set(prev)
			next.add(id)
			return next
		})
		try {
			const res = await fetch(`/api/invitations/${id}/accept`, { method: 'POST' })
			if (res.ok) {
				setInvitations((prev: any[]) => prev.filter((i) => i.id !== id))
				window.location.reload()
			}
		} catch (error) {
			console.error('Error accepting invitation:', error)
		} finally {
			setActionLoadingIds((prev) => {
				const next = new Set(prev)
				next.delete(id)
				return next
			})
		}
	}

	const handleRejectInvitation = async (id: string) => {
		if (actionLoadingIds.has(id)) return

		setActionLoadingIds((prev) => {
			const next = new Set(prev)
			next.add(id)
			return next
		})
		try {
			const res = await fetch(`/api/invitations/${id}/reject`, { method: 'POST' })
			if (res.ok) {
				setInvitations((prev: any[]) => prev.filter((i) => i.id !== id))
			}
		} catch (error) {
			console.error('Error rejecting invitation:', error)
		} finally {
			setActionLoadingIds((prev) => {
				const next = new Set(prev)
				next.delete(id)
				return next
			})
		}
	}

	return (
		<div className='mx-auto max-w-6xl space-y-8 px-4 py-8'>
			<FloatingActions
				actions={[
					{
						icon: <BookOpen size={20} />,
						label: 'New Pub',
						link: '/publications/new',
						variant: 'brand',
					},
				]}
			/>
			<DashboardHeader userName={user.name.split(' ')[0]} />

			<DashboardStats
				articlesCount={articles.length}
				publicationsCount={publications.length}
			/>

			<div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
				<div className='order-2 space-y-12 lg:order-1 lg:col-span-2'>
					<DashboardRecentArticles articles={articles} username={user.username} />
					<DashboardPublications publications={publications} username={user.username} />
				</div>

				<div className='order-1 space-y-8 lg:order-2'>
					<DashboardInvitations
						invitations={invitations}
						actionLoadingIds={actionLoadingIds}
						onAccept={handleAcceptInvitation}
						onReject={handleRejectInvitation}
					/>
				</div>
			</div>
		</div>
	)
}
