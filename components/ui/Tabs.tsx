'use client'

import { cn } from '@/lib/utils'

interface Tab {
	id: string
	label: string
}

interface TabsProps {
	tabs: Tab[]
	activeTab: string
	onChange: (id: string) => void
	className?: string
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
	return (
		<div
			className={cn(
				'thin-scrollbar flex w-full overflow-x-auto scroll-smooth border-b border-border whitespace-nowrap',
				className
			)}
		>
			{tabs.map((tab) => (
				<button
					key={tab.id}
					onClick={() => onChange(tab.id)}
					className={cn(
						'relative flex-1 px-4 py-3 text-center text-sm transition-all outline-none sm:flex-none sm:px-6 sm:text-base',
						activeTab === tab.id
							? 'font-bold text-main'
							: 'font-semibold text-muted hover:text-subtle'
					)}
				>
					{tab.label}
					<div
						className={cn(
							'absolute bottom-0 left-0 h-0.5 w-full origin-left bg-primary transition-transform duration-300',
							activeTab === tab.id ? 'scale-x-100' : 'scale-x-0'
						)}
					/>
				</button>
			))}
		</div>
	)
}
