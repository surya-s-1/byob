import ReadOnlyRenderer from '@/components/article/ArticleRenderer'

async function getArticle(slug: string) {
	return {
		title: '',
		subtitle: '',
		cover: '',
		content: '',
	}
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const article = await getArticle(slug)

	return (
		<article className='bg-primary pb-[128px] text-main'>
			<div className='mx-auto max-w-4xl px-2xl py-6xl'>
				{article.cover && (
					<div className='mb-5xl aspect-2/1 w-full overflow-hidden rounded-lg border border-border bg-secondary'>
						<img
							src={article.cover}
							alt='Cover'
							className='h-full w-full object-cover'
						/>
					</div>
				)}
				<h1 className='mb-lg text-[48px] leading-tight font-bold'>{article.title}</h1>
				{article.subtitle && (
					<h2 className='mb-5xl text-xl text-subtle'>{article.subtitle}</h2>
				)}
				<ReadOnlyRenderer markdown={article.content} />
			</div>
		</article>
	)
}
