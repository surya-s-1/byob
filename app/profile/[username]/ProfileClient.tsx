'use client'

import { useState } from 'react'
import { User, Article, Publication } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ArticleCard from '@/components/ui/ArticleCard'
import PublicationCard from '@/components/ui/PublicationCard'
import InvitationCard from '@/components/ui/InvitationCard'
import Tabs from '@/components/ui/Tabs'
import FloatingActions from '@/components/ui/FloatingActions'
import { Plus, BookOpen, User as UserIcon, Settings, Calendar, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ProfileClientProps {
	user: User
	currentUser: any | null
	initialArticles: Article[]
	initialPublications: Publication[]
}

export default function ProfileClient({
	user,
	currentUser,
	initialArticles,
	initialPublications,
}: ProfileClientProps) {
	const [activeTab, setActiveTab] = useState('articles')
	const isOwnProfile = currentUser?.id === user.id
	const [isFollowing, setIsFollowing] = useState(user.isFollowing)
	const [followersCount, setFollowersCount] = useState(user.followersCount)
	const [isLoadingFollow, setIsLoadingFollow] = useState(false)

	const profileTabs = [
		{ id: 'articles', label: 'Articles' },
		{ id: 'publications', label: 'Publications' },
	]

	const handleFollow = async () => {
		if (!currentUser) {
			window.location.href = '/login'
			return
		}

		if (isLoadingFollow) return

		setIsLoadingFollow(true)
		const action = isFollowing ? 'unfollow' : 'follow'
		try {
			const res = await fetch(`/api/user/id/${user.id}/${action}`, {
				method: 'POST',
			})
			if (res.ok) {
				setIsFollowing(!isFollowing)
				setFollowersCount((prev: number) => (isFollowing ? prev - 1 : prev + 1))
			}
		} catch (error) {
			console.error(`Error ${action}ing user:`, error)
		} finally {
			setIsLoadingFollow(false)
		}
	}

	return (
		<div className='max-w-5xl mx-auto px-4 py-8 space-y-8'>
			{isOwnProfile && (
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
			)}
			<div className='relative pt-4 sm:pt-8'>
				<div className='flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 sm:px-8 px-4 text-center sm:text-left'>
					<div className='relative h-24 w-24 sm:h-32 sm:w-32 rounded-3xl border-4 border-primary overflow-hidden bg-elevated shadow-xl z-10 mx-auto sm:mx-0'>
						{user.image ? (
							<Image src={user.image} alt={user.name} fill className='object-cover' />
						) : (
							<div className='h-full w-full flex items-center justify-center bg-secondary'>
								<UserIcon size={48} className='text-muted' />
							</div>
						)}
					</div>

					<div className='flex-1 pb-2'>
						<h1 className='text-2xl sm:text-3xl font-extrabold text-main tracking-tight'>
							{user.name}
						</h1>
						<p className='text-sm sm:text-base text-subtle font-medium'>
							@{user.username}
						</p>
					</div>

					<div className='flex justify-center gap-3 pb-2 w-full sm:w-auto'>
						{isOwnProfile ? (
							<Link href='/settings' className='w-full'>
								<Button className='flex items-center justify-center gap-2 w-full btn-brand'>
									<Settings size={18} />
									Edit Profile
								</Button>
							</Link>
						) : (
							<Button
								onClick={handleFollow}
								isLoading={isLoadingFollow}
								className='w-fit btn-brand sm:px-8 shadow-lg'
							>
								{isFollowing ? 'Unfollow' : 'Follow'}
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-4 gap-8 mt-4'>
				<div className='md:col-span-1 space-y-6 order-1'>
					<div className='space-y-6 bg-secondary/30 p-5 rounded-2xl border border-border/50'>
						<div className='space-y-4'>
							<h3 className='text-sm font-bold uppercase tracking-wider text-muted'>
								Bio
							</h3>
							<p className='text-main leading-relaxed text-sm'>
								{user.bio || 'This user prefers to keep their story a mystery.'}
							</p>
						</div>

						<div className='space-y-3 pt-4 border-t border-border/50'>
							{isOwnProfile && user.dob && (
								<div className='flex items-center gap-3 text-xs sm:text-sm text-subtle'>
									<Calendar size={16} className='text-main' />
									<span>Born {new Date(user.dob).toLocaleDateString()}</span>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className='md:col-span-3 space-y-6 order-2'>
					<Tabs tabs={profileTabs} activeTab={activeTab} onChange={setActiveTab} />

					<div className='min-h-[400px]'>
						{activeTab === 'articles' && (
							<div className='space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300'>
								{initialArticles.length > 0 ? (
									initialArticles.map((article) => (
										<ArticleCard key={article.id} article={article} />
									))
								) : (
									<div className='py-20 text-center'>
										<div className='bg-secondary/50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4'>
											<UserIcon size={32} className='text-muted/30' />
										</div>
										<p className='text-muted font-medium'>
											No articles published yet.
										</p>
									</div>
								)}
							</div>
						)}

						{activeTab === 'publications' && (
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300'>
								{initialPublications.length > 0 ? (
									initialPublications.map((pub) => (
										<PublicationCard key={pub.id} publication={pub} />
									))
								) : (
									<div className='col-span-full py-20 text-center'>
										<p className='text-muted font-medium'>
											No publications found.
										</p>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
