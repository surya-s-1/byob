import ReadOnlyRenderer from '@/components/article/ArticleRenderer'

async function getArticle(id: string) {
	return {
		title: 'My Awesome Article',
		subtitle: 'A deep dive into custom markdown',
		cover: 'https://placehold.co/1200x600',
		content: '',
	}
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
	const article = await getArticle(params.id)

	return (
		<article className='min-h-screen bg-primary text-main pb-32'>
			<div className='max-w-4xl mx-auto px-6 py-16'>
				{article.cover && (
					<div className='w-full aspect-2/1 overflow-hidden rounded-lg bg-secondary border border-border mb-12'>
						<img
							src={article.cover}
							alt='Cover'
							className='w-full h-full object-cover'
						/>
					</div>
				)}
				<h1 className='text-[48px] font-bold leading-tight mb-4'>{article.title}</h1>
				{article.subtitle && (
					<h2 className='text-xl text-subtle mb-12'>{article.subtitle}</h2>
				)}
				<ReadOnlyRenderer markdown={article.content} />
			</div>
		</article>
	)
}
