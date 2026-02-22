import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function Button({ children, className, isLoading, disabled, ...props }: any) {
	return (
		<button
			className={cn(
				'hover:bg-brand-hover duration-fast flex cursor-pointer items-center justify-center gap-2 rounded-md bg-brand px-lg py-sm text-sm font-medium whitespace-nowrap text-inverse shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
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
