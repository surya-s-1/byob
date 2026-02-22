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
        <section className='space-y-4'>
            <div className='flex items-center justify-between px-1'>
                <h2 className='text-xl font-bold text-main flex items-center gap-2'>
                    <FileText size={22} className='text-main' />
                    Your Recent Articles
                </h2>
                <Link
                    href={`/profile/${username}?tab=articles`}
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
                    <Card className='p-12 text-center text-muted bg-primary/5 border-dashed border-2 rounded-3xl'>
                        <div className='flex flex-col items-center gap-3'>
                            <FileText size={48} className='text-muted/30' />
                            <p>You haven't published any articles yet.</p>
                        </div>
                    </Card>
                )}
            </div>
        </section>
    )
}
