import { Publication } from '@/types'
import { BookOpen } from 'lucide-react'
import PublicationCard from '@/components/ui/PublicationCard'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'

interface DashboardPublicationsProps {
    publications: Publication[]
    username: string
}

export default function DashboardPublications({
    publications,
    username,
}: DashboardPublicationsProps) {
    return (
        <section className='space-y-4'>
            <div className='flex items-center justify-between px-1'>
                <h2 className='text-xl font-bold text-main flex items-center gap-2'>
                    <BookOpen size={22} className='text-main' />
                    Your Publications
                </h2>
                <Link
                    href={`/profile/${username}?tab=publications`}
                    className='text-xs sm:text-sm font-semibold text-main hover:underline'
                >
                    Manage All
                </Link>
            </div>
            <div className='grid grid-cols-1 gap-4'>
                {publications.length > 0 ? (
                    publications
                        .slice(0, 3)
                        .map((pub) => <PublicationCard key={pub.id} publication={pub} />)
                ) : (
                    <Card className='p-12 text-center text-muted bg-primary/5 border-dashed border-2 rounded-3xl'>
                        <div className='flex flex-col items-center gap-3'>
                            <BookOpen size={48} className='text-muted/30' />
                            <p>You haven't joined or created any publications yet.</p>
                            <Link href='/publications/new'>
                                <Button className='btn-brand btn-sm'>
                                    Create First Publication
                                </Button>
                            </Link>
                        </div>
                    </Card>
                )}
            </div>
        </section>
    )
}
