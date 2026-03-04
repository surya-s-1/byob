import { cn } from '@/lib/utils'

export default function Card({ children, className }: any) {
	return (
		<div className={cn('rounded-lg border border-gray-200 bg-elevated shadow-sm', className)}>
			{children}
		</div>
	)
}
