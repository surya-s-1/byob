'use client'

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
	invitations,
}: DashboardClientProps) {
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
					title='Followers'
					value={user.followersCount.toString()}
					icon={<Users className='text-primary' size={20} />}
				/>
				<StatCard
					title='Following'
					value={user.followingCount.toString()}
					icon={<Users className='text-primary' size={20} />}
				/>
				<StatCard
					title='Published Articles'
					value={articles.length.toString()}
					icon={<FileText className='text-primary' size={20} />}
				/>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				<div className='lg:col-span-2 space-y-8 order-2 lg:order-1'>
					<section className='space-y-4'>
						<div className='flex items-center justify-between px-1'>
							<h2 className='text-xl font-bold text-main flex items-center gap-2'>
								<FileText size={22} className='text-primary' />
								Your Recent Articles
							</h2>
							<Link
								href={`/profile/${user.username}?tab=articles`}
								className='text-xs sm:text-sm font-semibold text-primary hover:underline'
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
				</div>

				<div className='space-y-8 order-1 lg:order-2'>
					{invitations.length > 0 && (
						<section className='space-y-4'>
							<h2 className='text-xl font-bold text-main flex items-center gap-2'>
								<Mail size={22} className='text-primary' />
								Invitations
							</h2>
							<div className='space-y-4'>
								{invitations.map((invitation) => (
									<InvitationCard key={invitation.id} invitation={invitation} />
								))}
							</div>
						</section>
					)}

					<section className='space-y-4'>
						<div className='flex items-center justify-between px-1'>
							<h2 className='text-xl font-bold text-main flex items-center gap-2'>
								<BookOpen size={22} className='text-primary' />
								Publications
							</h2>
							<Link
								href={`/profile/${user.username}?tab=publications`}
								className='text-xs sm:text-sm font-semibold text-primary hover:underline'
							>
								Manage
							</Link>
						</div>
						<div className='space-y-3'>
							{publications.length > 0 ? (
								publications
									.slice(0, 4)
									.map((pub) => (
										<PublicationCard
											key={pub.id}
											publication={pub}
											variant='mini'
										/>
									))
							) : (
								<Card className='p-6 text-center text-sm text-muted bg-secondary'>
									Not part of any publications yet.
								</Card>
							)}
							{publications.length > 4 && (
								<Link
									href={`/profile/${user.username}?tab=publications`}
									className='block text-center text-xs font-bold text-primary hover:text-primary/80 transition-colors py-2'
								>
									View All {publications.length} Publications
								</Link>
							)}
						</div>
					</section>
				</div>
			</div>
		</div>
	)
}
