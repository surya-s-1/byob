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
		<div className='fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50 lg:hidden animate-in fade-in slide-in-from-bottom-5 duration-500'>
			{actions.map((action, index) => {
				const content = (
					<button
						key={index}
						onClick={action.onClick}
						className={cn(
							'flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all active:scale-95 text-sm font-bold group',
							action.variant === 'brand' && 'btn-brand text-white px-6 py-4',
							action.variant === 'secondary' &&
								'bg-elevated/80 backdrop-blur-md text-main border border-border hover:bg-secondary',
							(!action.variant || action.variant === 'primary') &&
								'bg-primary text-white border border-primary/20 hover:opacity-90'
						)}
					>
						<span className='group-hover:scale-110 transition-transform'>
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
