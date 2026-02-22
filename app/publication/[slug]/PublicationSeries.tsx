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
            <div className='py-20 text-center rounded-3xl bg-secondary/20 border border-dashed border-border/50'>
                <Calendar size={48} className='text-muted/20 mx-auto mb-4' />
                <p className='text-muted font-medium'>No series created yet.</p>
            </div>
        )
    }

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {series.map((s) => (
                <Link
                    key={s.id}
                    href={`/publication/${publicationSlug}/series/${s.slug}`}
                >
                    <Card className='p-5 hover:bg-secondary transition-all h-full flex flex-col justify-between group'>
                        <div className='space-y-2'>
                            <h3 className='font-bold text-lg text-main group-hover:text-main'>
                                {s.displayName}
                            </h3>
                            <p className='text-sm text-subtle line-clamp-2'>
                                {s.displayDescription || 'Collection of related articles.'}
                            </p>
                        </div>
                        <div className='pt-4 flex items-center justify-between text-xs text-muted font-bold uppercase tracking-wider'>
                            <span>{s.articleCount} Articles</span>
                            <ChevronRight
                                size={16}
                                className='group-hover:translate-x-1 transition-transform'
                            />
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
