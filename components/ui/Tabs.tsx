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
				'flex border-b border-border overflow-x-auto thin-scrollbar whitespace-nowrap scroll-smooth',
				className
			)}
		>
			{tabs.map((tab) => (
				<button
					key={tab.id}
					onClick={() => onChange(tab.id)}
					className={cn(
						'px-6 py-3 transition-all relative text-sm sm:text-base outline-none',
						activeTab === tab.id
							? 'text-main font-bold'
							: 'text-muted hover:text-subtle font-semibold'
					)}
				>
					{tab.label}
					<div
						className={cn(
							'absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform duration-300 origin-left',
							activeTab === tab.id ? 'scale-x-100' : 'scale-x-0'
						)}
					/>
				</button>
			))}
		</div>
	)
}
