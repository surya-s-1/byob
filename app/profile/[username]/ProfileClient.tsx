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
import { BookOpen, User as UserIcon } from 'lucide-react'
import ProfileHeader from './ProfileHeader'
import ProfileBio from './ProfileBio'

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
		<div className='mx-auto max-w-5xl space-y-8 px-4 py-8'>
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
			<ProfileHeader
				user={user}
				isOwnProfile={isOwnProfile}
				isFollowing={isFollowing}
				isLoadingFollow={isLoadingFollow}
				onFollow={handleFollow}
			/>

			<div className='mt-4 grid grid-cols-1 gap-8 md:grid-cols-4'>
				<div className='order-1 space-y-6 md:col-span-1'>
					<ProfileBio user={user} isOwnProfile={isOwnProfile} />
				</div>

				<div className='order-2 space-y-6 md:col-span-3'>
					<Tabs tabs={profileTabs} activeTab={activeTab} onChange={setActiveTab} />

					<div className='min-h-[400px]'>
						{activeTab === 'articles' && (
							<div className='animate-in fade-in slide-in-from-bottom-2 space-y-4 duration-300'>
								{initialArticles.length > 0 ? (
									initialArticles.map((article) => (
										<ArticleCard key={article.id} article={article} />
									))
								) : (
									<div className='py-20 text-center'>
										<div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50'>
											<UserIcon size={32} className='text-muted/30' />
										</div>
										<p className='font-medium text-muted'>
											No articles published yet.
										</p>
									</div>
								)}
							</div>
						)}

						{activeTab === 'publications' && (
							<div className='animate-in fade-in slide-in-from-bottom-2 grid grid-cols-1 gap-4 duration-300 sm:grid-cols-2'>
								{initialPublications.length > 0 ? (
									initialPublications.map((pub) => (
										<PublicationCard key={pub.id} publication={pub} />
									))
								) : (
									<div className='col-span-full py-20 text-center'>
										<p className='font-medium text-muted'>
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
