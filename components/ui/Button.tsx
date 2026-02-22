import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function Button({ children, className, isLoading, disabled, ...props }: any) {
	return (
		<button
			className={cn(
				'px-lg py-sm rounded-md bg-brand text-inverse text-sm font-medium shadow-sm hover:bg-brand-hover transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex gap-2 items-center justify-center cursor-pointer',
				className
			)}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
			{children}
		</button>
	)
}
