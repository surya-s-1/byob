'use client'

import { useState } from 'react'
import { Publication, Article } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ArticleCard from '@/components/ui/ArticleCard'
import Image from 'next/image'
import Link from 'next/link'
import { Users, BookOpen, Shield, Globe, Lock, Share2 } from 'lucide-react'

interface PublicationClientProps {
	publication: Publication
	currentUser: any | null
	initialArticles: Article[]
}

export default function PublicationClient({
	publication,
	currentUser,
	initialArticles,
}: PublicationClientProps) {
	const [isFollowing, setIsFollowing] = useState(publication.isFollowing)
	const [followersCount, setFollowersCount] = useState(publication.followersCount)
	const [isLoading, setIsLoading] = useState(false)

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

	return (
		<div className='max-w-5xl mx-auto px-4 py-12 space-y-12'>
			<div className='relative w-full aspect-3/1 sm:aspect-4/1 rounded-3xl overflow-hidden bg-secondary border border-border shadow-2xl'>
				{publication.cover ? (
					<Image
						src={publication.cover}
						alt={publication.displayName}
						fill
						className='object-cover'
					/>
				) : (
					<div className='absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/40' />
				)}
				<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 sm:p-10'>
					<h1 className='text-3xl sm:text-5xl font-extrabold text-white tracking-tight'>
						{publication.displayName}
					</h1>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
				<div className='lg:col-span-1 space-y-6'>
					<Card className='p-6 space-y-6'>
						<div className='space-y-4'>
							<h4 className='text-sm font-bold uppercase tracking-widest text-muted'>
								About
							</h4>
							<p className='text-main text-sm leading-relaxed'>
								{publication.displayDescription || 'No description provided.'}
							</p>
						</div>

						<div className='space-y-3 pt-6 border-t border-border'>
							<div className='flex items-center gap-3 text-sm text-subtle'>
								{publication.visibility === 'PUBLIC' && (
									<Globe size={18} className='text-main' />
								)}
								{publication.visibility === 'HIDDEN' && (
									<Shield size={18} className='text-main' />
								)}
								{publication.visibility === 'LOCKED' && (
									<Lock size={18} className='text-main' />
								)}
								<span className='capitalize'>
									{publication.visibility.toLowerCase()} Publication
								</span>
							</div>
							<div className='flex items-center gap-3 text-sm text-subtle'>
								<Users size={18} className='text-main' />
								<span>
									<strong className='text-main font-bold'>
										{followersCount}
									</strong>{' '}
									Followers
								</span>
							</div>
						</div>

						<div className='pt-4 space-y-3'>
							{!publication.isMember && (
								<Button
									onClick={handleFollow}
									isLoading={isLoading}
									className={
										isFollowing
											? 'btn-brand-outline w-full'
											: 'btn-brand w-full shadow-lg'
									}
								>
									{isFollowing ? 'Unfollow' : 'Follow Publication'}
								</Button>
							)}
							<Button className='w-full bg-secondary text-main border border-border flex items-center justify-center gap-2'>
								<Share2 size={16} />
								Share
							</Button>
						</div>
					</Card>
				</div>

				<div className='lg:col-span-3 space-y-8'>
					<div className='flex items-center justify-between px-2'>
						<h2 className='text-2xl font-bold text-main flex items-center gap-3'>
							<BookOpen className='text-main' />
							Latest Stories
						</h2>
					</div>

					<div className='space-y-6'>
						{initialArticles.length > 0 ? (
							initialArticles.map((article) => (
								<ArticleCard key={article.id} article={article} />
							))
						) : (
							<div className='py-32 text-center rounded-3xl bg-secondary/20 border border-dashed border-border/50'>
								<BookOpen size={48} className='text-muted/20 mx-auto mb-4' />
								<p className='text-muted font-medium'>
									No stories published in this space yet.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
