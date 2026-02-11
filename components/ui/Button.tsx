import { cn } from '@/lib/utils'

export default function Button({ children, className, ...props }: any) {
	return (
		<button
			className={cn(
				'px-lg py-sm rounded-md bg-brand text-inverse text-sm font-medium shadow-sm hover:bg-brand-hover transition-colors duration-fast disabled:opacity-50',
				className
			)}
			{...props}
		>
			{children}
		</button>
	)
}