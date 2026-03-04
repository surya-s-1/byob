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
		brand: 'btn-brand',
		secondary: 'bg-secondary text-main border border-border hover:bg-border/20 shadow-sm',
		ghost: 'bg-transparent text-main hover:bg-secondary',
		danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md',
	}

	const sizes = {
		xs: 'px-sm py-2xs text-[10px]',
		sm: 'px-lg py-sm text-xs',
		md: 'px-2xl py-md text-sm',
		lg: 'px-3xl py-md text-base',
	}

	return (
		<button
			className={cn(
				'duration-fast flex cursor-pointer items-center justify-center gap-sm rounded-xl font-bold whitespace-nowrap transition-all disabled:cursor-not-allowed disabled:opacity-50',
				variants[variant as keyof typeof variants] || variants.brand,
				sizes[size as keyof typeof sizes] || sizes.md,
				className
			)}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading && <Loader2 className='h-lg w-lg animate-spin' />}
			{children}
		</button>
	)
}
