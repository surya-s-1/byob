'use client'

import { useState } from 'react'
import { User, Article, Publication } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import ArticleCard from '@/components/ui/ArticleCard'
import PublicationCard from '@/components/ui/PublicationCard'
import InvitationCard from '@/components/ui/InvitationCard'
import FloatingActions from '@/components/ui/FloatingActions'
import { Plus, BookOpen, FileText, Mail, Users } from 'lucide-react'
import Link from 'next/link'

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
		<div className='max-w-6xl mx-auto px-4 py-8 space-y-8'>
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
			<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6'>
				<div className='space-y-1'>
					<h1 className='text-2xl sm:text-3xl font-extrabold text-main tracking-tight'>
						Welcome back, {user.name.split(' ')[0]} 👋
					</h1>
					<p className='text-sm sm:text-base text-subtle'>
						Here's a snapshot of your content and community.
					</p>
				</div>
				<div className='hidden lg:flex flex-col xs:flex-row gap-3'>
					<Link href='/publications/new' className='w-full xs:w-auto'>
						<Button className='btn-brand w-full'>Create Publication</Button>
					</Link>
				</div>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
				<StatCard
					title='Published Articles'
					value={articles.length.toString()}
					icon={<FileText className='text-main' size={20} />}
				/>
				<StatCard
					title='Active Publications'
					value={publications.length.toString()}
					icon={<BookOpen className='text-main' size={20} />}
				/>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				<div className='lg:col-span-2 space-y-12 order-2 lg:order-1'>
					<section className='space-y-4'>
						<div className='flex items-center justify-between px-1'>
							<h2 className='text-xl font-bold text-main flex items-center gap-2'>
								<FileText size={22} className='text-main' />
								Your Recent Articles
							</h2>
							<Link
								href={`/profile/${user.username}?tab=articles`}
								className='text-xs sm:text-sm font-semibold text-main hover:underline'
							>
								View All
							</Link>
						</div>
						<div className='grid grid-cols-1 gap-3'>
							{articles.length > 0 ? (
								articles
									.slice(0, 5)
									.map((article) => (
										<ArticleCard
											key={article.id}
											article={article}
											variant='compact'
										/>
									))
							) : (
								<Card className='p-12 text-center text-muted bg-primary/5 border-dashed border-2'>
									<div className='flex flex-col items-center gap-3'>
										<FileText size={48} className='text-muted/30' />
										<p>You haven't published any articles yet.</p>
									</div>
								</Card>
							)}
						</div>
					</section>

					<section className='space-y-4'>
						<div className='flex items-center justify-between px-1'>
							<h2 className='text-xl font-bold text-main flex items-center gap-2'>
								<BookOpen size={22} className='text-main' />
								Your Publications
							</h2>
							<Link
								href={`/profile/${user.username}?tab=publications`}
								className='text-xs sm:text-sm font-semibold text-main hover:underline'
							>
								Manage All
							</Link>
						</div>
						<div className='grid grid-cols-1 gap-4'>
							{publications.length > 0 ? (
								publications
									.slice(0, 3)
									.map((pub) => <PublicationCard key={pub.id} publication={pub} />)
							) : (
								<Card className='p-12 text-center text-muted bg-primary/5 border-dashed border-2 rounded-3xl'>
									<div className='flex flex-col items-center gap-3'>
										<BookOpen size={48} className='text-muted/30' />
										<p>You haven't joined or created any publications yet.</p>
										<Link href='/publications/new'>
											<Button className='btn-brand btn-sm'>
												Create First Publication
											</Button>
										</Link>
									</div>
								</Card>
							)}
						</div>
					</section>
				</div>

				<div className='space-y-8 order-1 lg:order-2'>
					<section className='space-y-4'>
						<h2 className='text-xl font-bold text-main flex items-center gap-2'>
							<Mail size={22} className='text-main' />
							Invitations
						</h2>
						{invitations.length > 0 ? (
							<div className='space-y-4'>
								{invitations.map((invitation: any) => (
									<InvitationCard
										key={invitation.id}
										invitation={invitation}
										onAccept={handleAcceptInvitation}
										onReject={handleRejectInvitation}
										isLoading={actionLoadingIds.has(invitation.id)}
									/>
								))}
							</div>
						) : (
							<Card className='p-12 text-center text-muted bg-primary/5 border-dashed border-2 rounded-3xl'>
								<div className='flex flex-col items-center gap-3'>
									<Mail size={48} className='text-muted/30' />
									<p>No pending invitations.</p>
								</div>
							</Card>
						)}
					</section>
				</div>
			</div>
		</div>
	)
}
