'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import DesktopSidebar from './DesktopSidebar'
import MobileHeader from './MobileHeader'
import { useSidebar } from '@/context/SidebarContext'
import { cn } from '@/lib/utils'

interface SidebarLayoutProps {
	user: any
	children: React.ReactNode
}

export default function SidebarLayout({ user, children }: SidebarLayoutProps) {
	const { isExpanded, side, navItems } = useSidebar()

	return (
		<div className='min-h-screen flex flex-col md:flex-row'>
			<MobileHeader user={user} navItems={navItems} />

			<div className='hidden md:block'>
				<DesktopSidebar user={user} navItems={navItems} />
				{!isExpanded && (
					<div
						className={cn(
							'fixed top-4 z-[40] transition-all duration-300 animate-in fade-in',
							side === 'left' ? 'left-24' : 'right-24'
						)}
					>
						<Link href='/'>
							<div className='relative w-24 h-24'>
								<Image
									src='/logo-light.png'
									alt='Logo'
									fill
									className='object-contain dark:hidden'
								/>
								<Image
									src='/logo-dark.png'
									alt='Logo'
									fill
									className='object-contain hidden dark:block'
								/>
							</div>
						</Link>
					</div>
				)}
			</div>

			<main
				className={cn(
					'flex-1 transition-all duration-300 min-h-screen',
					'pt-16 md:pt-0',
					side === 'left' && (isExpanded ? 'md:ml-64' : 'md:ml-20'),
					side === 'right' && (isExpanded ? 'md:mr-64' : 'md:mr-20')
				)}
			>
				{children}
			</main>
		</div>
	)
}
