import { cn } from '@/lib/utils'

interface BadgeProps {
	children: React.ReactNode
	className?: string
	variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'error'
}

export default function Badge({ children, className, variant = 'primary' }: BadgeProps) {
	const variants = {
		primary: 'bg-primary/10 text-main border-transparent',
		secondary: 'bg-secondary text-subtle border-transparent',
		outline: 'bg-transparent text-subtle border-border',
		success: 'bg-green-500/10 text-green-600 border-transparent',
		error: 'bg-error/10 text-error border-transparent',
	}

	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors',
				variants[variant],
				className
			)}
		>
			{children}
		</span>
	)
}
