import { cn } from '@/lib/utils'

export default function Card({ children, className }: any) {
	return (
		<div className={cn('rounded-lg border border-border bg-elevated shadow-sm', className)}>
			{children}
		</div>
	)
}
