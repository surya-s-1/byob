import Card from '@/components/ui/Card'
import { ChevronRight, Calendar } from 'lucide-react'
import Link from 'next/link'

interface PublicationSeriesProps {
	series: any[]
	publicationSlug: string
}

export default function PublicationSeries({ series, publicationSlug }: PublicationSeriesProps) {
	if (series.length === 0) {
		return (
			<div className='rounded-3xl border border-dashed border-border/50 bg-secondary/20 py-20 text-center'>
				<Calendar size={48} className='mx-auto mb-4 text-muted/20' />
				<p className='font-medium text-muted'>No series created yet.</p>
			</div>
		)
	}

	return (
		<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
			{series.map((s) => (
				<Link key={s.id} href={`/publication/${publicationSlug}/series/${s.slug}`}>
					<Card className='group flex h-full flex-col justify-between p-5 transition-all hover:bg-secondary'>
						<div className='space-y-2'>
							<h3 className='text-lg font-bold text-main group-hover:text-main'>
								{s.displayName}
							</h3>
							<p className='line-clamp-2 text-sm text-subtle'>
								{s.displayDescription || 'Collection of related articles.'}
							</p>
						</div>
						<div className='flex items-center justify-between pt-4 text-xs font-bold tracking-wider text-muted uppercase'>
							<span>{s.articleCount} Articles</span>
							<ChevronRight
								size={16}
								className='transition-transform group-hover:translate-x-1'
							/>
						</div>
					</Card>
				</Link>
			))}
		</div>
	)
}
