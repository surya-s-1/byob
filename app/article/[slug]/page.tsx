import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReadOnlyRenderer from '@/components/article/ArticleRenderer'
import { Article } from '@/types'

async function getArticle(slug: string, headerList: Headers): Promise<Article | null> {
	const res = await fetch(
		`${process.env.BETTER_AUTH_URL}/api/articles/slug/${slug}`,
		{ headers: headerList, cache: 'no-store' }
	)
	if (!res.ok) return null
	const { article } = await res.json()
	return article
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const headerList = await headers()
	const article = await getArticle(slug, headerList)

	if (!article) notFound()

	return (
		<article className='w-full lg:max-w-[70%] bg-primary pb-[128px] text-main flex flex-col items-center'>
			<div className='w-full px-lg md:px-2xl py-6xl'>
				{article.cover && (
					<div className='mb-5xl aspect-2/1 w-full overflow-hidden rounded-lg border border-border bg-secondary'>
						<img
							src={article.cover}
							alt='Cover'
							className='h-full w-full object-cover'
						/>
					</div>
				)}

				{/* metadata */}
				<div className='mb-lg flex flex-wrap items-center gap-sm text-xs text-muted'>
					{article.publication && (
						<>
							<Link
								href={`/publication/${article.publication.slug}`}
								className='font-bold hover:underline'
							>
								{article.publication.displayName}
							</Link>
							<span>·</span>
						</>
					)}
					{article.series && (
						<>
							<Link
								href={`/series/${article.series.slug}`}
								className='hover:underline'
							>
								{article.series.displayName}
							</Link>
							<span>·</span>
						</>
					)}
					<span>{new Date(article.publishedAt).toLocaleDateString()}</span>
					<span>·</span>
					<span>{article.readTime} min read</span>
				</div>

				{article.authors && article.authors.length > 0 && (
					<p className='mb-5xl text-sm text-muted'>
						By{' '}
						{article.authors.map((a, idx) => (
							<span key={a.id}>
								<Link href={`/profile/${a.username}`} className='font-medium hover:underline'>
									{a.name}
								</Link>
								{idx < article.authors.length - 1 ? ', ' : ''}
							</span>
						))}
					</p>
				)}

				<h1 className='mb-lg text-4xl md:text-5xl lg:text-[56px] leading-tight font-bold break-words'>{article.title}</h1>
				{article.subtitle && (
					<h2 className='mb-5xl text-xl text-subtle'>{article.subtitle}</h2>
				)}
				<ReadOnlyRenderer markdown={article.content} />
			</div>
		</article>
	)
}
