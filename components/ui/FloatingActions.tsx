'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface FloatingAction {
	icon: ReactNode
	label: string
	link?: string
	onClick?: () => void
	variant?: 'primary' | 'secondary' | 'brand'
}

interface FloatingActionsProps {
	actions: FloatingAction[]
}

export default function FloatingActions({ actions }: FloatingActionsProps) {
	if (!actions || actions.length === 0) return null

	return (
		<div className='animate-in fade-in slide-in-from-bottom-5 fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3 duration-500 lg:hidden'>
			{actions.map((action, index) => {
				const content = (
					<button
						key={index}
						onClick={action.onClick}
						className={cn(
							'group flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold shadow-lg transition-all active:scale-95',
							action.variant === 'brand' && 'btn-brand px-6 py-4 text-white',
							action.variant === 'secondary' &&
								'border border-border bg-elevated/80 text-main backdrop-blur-md hover:bg-secondary',
							(!action.variant || action.variant === 'primary') &&
								'border border-primary/20 bg-primary text-white hover:opacity-90'
						)}
					>
						<span className='transition-transform group-hover:scale-110'>
							{action.icon}
						</span>
						<span>{action.label}</span>
					</button>
				)

				if (action.link) {
					return (
						<Link key={index} href={action.link} className='no-underline'>
							{content}
						</Link>
					)
				}

				return content
			})}
		</div>
	)
}
