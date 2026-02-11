import { cn } from '@/lib/utils'

export default function Card({ children, className }: any) {
	return (
		<div
			className={cn(
				'bg-elevated border border-border rounded-lg shadow-sm p-xl',
				className
			)}
		>
			{children}
		</div>
	)
}
