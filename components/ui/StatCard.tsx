import Card from './Card'
import { cn } from '@/lib/utils'

interface StatCardProps {
	title: string
	value: string
	change?: string
	icon: React.ReactNode
	className?: string
}

export default function StatCard({ title, value, change, icon, className }: StatCardProps) {
	return (
		<Card
			className={cn(
				'flex min-h-[112px] w-full flex-col justify-between border-l-4 border-l-primary p-4 transition-all hover:shadow-md',
				className
			)}
		>
			<div className='flex items-start justify-between gap-4'>
				<span className='truncate text-sm font-medium text-subtle'>{title}</span>
				<div className='flex-shrink-0'>{icon}</div>
			</div>
			<div className='mt-2 flex flex-wrap items-end justify-between gap-2'>
				<span className='text-2xl font-bold text-main'>{value}</span>
				{change && (
					<span className='rounded bg-green-500/10 px-1.5 py-0.5 text-xs font-bold whitespace-nowrap text-green-500'>
						{change}
					</span>
				)}
			</div>
		</Card>
	)
}
