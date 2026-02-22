import Link from 'next/link'
import Image from 'next/image'
import Card from './Card'
import { Article } from '@/types'

interface ArticleCardProps {
	article: Article
	variant?: 'full' | 'compact'
}

export default function ArticleCard({ article, variant = 'full' }: ArticleCardProps) {
	if (variant === 'compact') {
		return (
			<Link href={`/article/${article.slug}`} className='block group'>
				<Card className='p-3 hover:bg-secondary transition-all flex items-center justify-between gap-4'>
					<div className='flex items-center gap-3 min-w-0'>
						<div className='h-10 w-10 sm:h-12 sm:w-12 bg-secondary rounded overflow-hidden relative flex-shrink-0'>
							{article.cover ? (
								<Image
									src={article.cover}
									alt={article.title}
									fill
									className='object-cover group-hover:scale-105 transition-transform'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center text-muted text-xs'>
									No Cover
								</div>
							)}
						</div>
						<div className='min-w-0'>
							<h4 className='font-bold text-main text-sm sm:text-base truncate group-hover:text-main transition-colors'>
								{article.title}
							</h4>
							<div className='flex items-center gap-2 text-[10px] sm:text-xs text-muted'>
								<span>{new Date(article.publishedAt).toLocaleDateString()}</span>
								<span>·</span>
								<span>{article.readTime} min read</span>
							</div>
						</div>
					</div>
				</Card>
			</Link>
		)
	}

	return (
		<Link href={`/article/${article.slug}`} className='block group'>
			<Card className='p-4 sm:p-5 hover:border-primary/50 transition-all group overflow-hidden'>
				<div className='flex flex-col-reverse sm:flex-row gap-4 sm:gap-6'>
					<div className='flex-1 space-y-2 min-w-0'>
						<div className='flex items-center gap-2 text-xs text-muted'>
							{article.publication && (
								<>
									<Link
										href={`/publication/${article.publication.slug}`}
										className='text-main font-bold hover:underline'
										onClick={(e) => e.stopPropagation()}
									>
										{article.publication.displayName}
									</Link>
									<span>·</span>
								</>
							)}
							<span>{new Date(article.publishedAt).toLocaleDateString()}</span>
							<span>·</span>
							<span>{article.readTime} min read</span>
						</div>
						<h3 className='text-lg sm:text-xl font-bold text-main group-hover:text-main transition-colors line-clamp-2'>
							{article.title}
						</h3>
						{article.excerpt && (
							<p className='text-subtle line-clamp-2 text-sm leading-relaxed'>
								{article.excerpt}
							</p>
						)}
						{article.authors && (
							<div className='flex items-center gap-2 pt-2'>
								<div className='flex -space-x-2'>
									{article.authors.slice(0, 3).map((author, i) => (
										<div
											key={i}
											className='h-6 w-6 rounded-full border-2 border-primary overflow-hidden bg-secondary relative'
										>
											{author.image ? (
												<Image
													src={author.image}
													alt={author.name}
													fill
													className='object-cover'
												/>
											) : (
												<div className='w-full h-full flex items-center justify-center bg-secondary text-[8px]'>
													{author.name[0]}
												</div>
											)}
										</div>
									))}
								</div>
								<span className='text-xs text-muted'>
									{article.authors[0].name}{' '}
									{article.authors.length > 1 &&
										`+ ${article.authors.length - 1} more`}
								</span>
							</div>
						)}
					</div>
					{article.cover && (
						<div className='w-full sm:w-32 lg:w-40 h-40 sm:h-32 lg:h-28 rounded-md overflow-hidden bg-secondary relative flex-shrink-0'>
							<Image
								src={article.cover}
								alt={article.title}
								fill
								className='object-cover group-hover:scale-105 transition-transform duration-500'
							/>
						</div>
					)}
				</div>
			</Card>
		</Link>
	)
}
