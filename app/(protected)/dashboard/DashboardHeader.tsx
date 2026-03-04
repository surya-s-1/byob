import Button from '@/components/ui/Button'
import Link from 'next/link'

interface DashboardHeaderProps {
	userName: string
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
	return (
		<div className='flex flex-col justify-between gap-lg text-center sm:flex-row sm:items-center sm:gap-2xl sm:text-left'>
			<div className='mx-auto space-y-xs sm:mx-0'>
				<h1 className='text-2xl font-extrabold tracking-tight text-main sm:text-3xl'>
					Welcome, {userName}.
				</h1>
				<p className='text-sm text-subtle sm:text-base'>
					Here's a snapshot of your content and community.
				</p>
			</div>
			<div className='hidden flex-col gap-md xs:flex-row lg:flex'>
				<Link href='/publications/new' className='w-full xs:w-auto'>
					<Button variant='brand' className='w-full'>Create Publication</Button>
				</Link>
			</div>
		</div>
	)
}
