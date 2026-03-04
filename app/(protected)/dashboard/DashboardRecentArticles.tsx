import { Article } from '@/types'
import { FileText } from 'lucide-react'
import ArticleCard from '@/components/ui/ArticleCard'
import Card from '@/components/ui/Card'
import Link from 'next/link'

interface DashboardRecentArticlesProps {
	articles: Article[]
	username: string
}

export default function DashboardRecentArticles({
	articles,
	username,
}: DashboardRecentArticlesProps) {
	return (
		<section className='space-y-lg'>
			<div className='flex items-center justify-between px-xs'>
				<h2 className='flex items-center gap-sm text-xl font-bold text-main'>
					<FileText size={22} className='text-main' />
					Your Recent Articles
				</h2>
				<Link
					href={`/profile/${username}?tab=articles`}
					className='text-xs font-semibold text-main hover:underline sm:text-sm'
				>
					View All
				</Link>
			</div>
			<div className='grid grid-cols-1 gap-md'>
				{articles.length > 0 ? (
					articles
						.slice(0, 5)
						.map((article) => (
							<ArticleCard key={article.id} article={article} variant='compact' />
						))
				) : (
					<Card className='rounded-3xl border-2 border-dashed bg-primary/5 p-5xl text-center text-muted'>
						<div className='flex flex-col items-center gap-md'>
							<FileText size={48} className='text-muted/30' />
							<p>You haven't published any articles yet.</p>
						</div>
					</Card>
				)}
			</div>
		</section>
	)
}
