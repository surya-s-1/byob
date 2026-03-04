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
		<section className='space-y-lg'>
			<div className='flex items-center justify-between px-xs'>
				<h2 className='flex items-center gap-sm text-xl font-bold text-main'>
					<BookOpen size={22} className='text-main' />
					Your Publications
				</h2>
				<Link
					href={`/profile/${username}?tab=publications`}
					className='text-xs font-semibold text-main hover:underline sm:text-sm'
				>
					Manage All
				</Link>
			</div>
			<div className='grid grid-cols-1 gap-lg'>
				{publications.length > 0 ? (
					publications
						.slice(0, 3)
						.map((pub) => <PublicationCard key={pub.id} publication={pub} />)
				) : (
					<Card className='rounded-3xl border-2 border-dashed bg-primary/5 p-5xl text-center text-muted'>
						<div className='flex flex-col items-center gap-md'>
							<BookOpen size={48} className='text-muted/30' />
							<p>You haven't joined or created any publications yet.</p>
							<Link href='/publications/new'>
								<Button variant='brand' size='sm'>
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
