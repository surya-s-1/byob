'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

import Button from './Button'

export interface FloatingAction {
	icon: ReactNode
	label: string
	link?: string
	onClick?: () => void
	variant?: 'primary' | 'secondary' | 'brand' | 'danger'
}

interface FloatingActionsProps {
	actions: FloatingAction[]
}

export default function FloatingActions({ actions }: FloatingActionsProps) {
	if (!actions || actions.length === 0) return null

	return (
		<div className='animate-in fade-in slide-in-from-bottom-5 fixed right-md bottom-md z-50 flex flex-col items-end gap-md duration-500 lg:hidden'>
			{actions.map((action, index) => {
				const buttonVariant = action.variant === 'primary' ? 'brand' : (action.variant || 'brand') as any

				const content = (
					<Button
						key={index}
						onClick={action.onClick}
						variant={buttonVariant}
						className={cn(
							'group rounded-full shadow-lg h-fit w-fit gap-sm',
							action.variant === 'secondary' && 'bg-elevated/80 backdrop-blur-md'
						)}
						size={action.variant === 'brand' ? 'lg' : 'md'}
					>
						<span className='transition-transform group-hover:scale-110'>
							{action.icon}
						</span>
						<span>{action.label}</span>
					</Button>
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
