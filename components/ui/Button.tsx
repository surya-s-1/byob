import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function Button({
	children,
	className,
	isLoading,
	disabled,
	variant = 'brand',
	size = 'md',
	...props
}: any) {
	const variants = {
		brand: 'bg-brand text-inverse hover:opacity-90 shadow-md',
		secondary: 'bg-secondary text-main border border-border hover:bg-border/20 shadow-sm',
		ghost: 'bg-transparent text-main hover:bg-secondary',
		danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md',
	}

	const sizes = {
		sm: 'px-4 py-2 text-xs',
		md: 'px-6 py-2.5 text-sm',
		lg: 'px-8 py-3 text-base',
	}

	return (
		<button
			className={cn(
				'duration-fast flex cursor-pointer items-center justify-center gap-2 rounded-xl font-bold whitespace-nowrap transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
				variants[variant as keyof typeof variants] || variants.brand,
				sizes[size as keyof typeof sizes] || sizes.md,
				className
			)}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
			{children}
		</button>
	)
}
