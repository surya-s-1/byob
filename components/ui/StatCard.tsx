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
				'p-4 flex flex-col justify-between min-h-[112px] border-l-4 border-l-primary w-full transition-all hover:shadow-md',
				className
			)}
		>
			<div className='flex justify-between items-start gap-4'>
				<span className='text-sm font-medium text-subtle truncate'>{title}</span>
				<div className='flex-shrink-0'>{icon}</div>
			</div>
			<div className='flex items-end justify-between flex-wrap gap-2 mt-2'>
				<span className='text-2xl font-bold text-main'>{value}</span>
				{change && (
					<span className='text-xs font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded whitespace-nowrap'>
						{change}
					</span>
				)}
			</div>
		</Card>
	)
}
