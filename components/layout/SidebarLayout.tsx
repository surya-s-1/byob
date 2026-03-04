'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import DesktopSidebar from './DesktopSidebar'
import MobileHeader from './MobileHeader'
import { useSidebar } from '@/context/SidebarContext'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface SidebarLayoutProps {
	user: any
	children: React.ReactNode
	secondarySidebar?: React.ReactNode
	secondarySidebarOpen?: boolean
	secondaryIcon?: React.ReactNode
}

export default function SidebarLayout({
	user,
	children,
	secondarySidebar,
	secondarySidebarOpen,
	secondaryIcon,
}: SidebarLayoutProps) {
	const { isExpanded, side, navItems, setIsSecondaryOpen } = useSidebar()
	const secondarySide = side === 'left' ? 'right' : 'left'

	return (
		<div className='flex min-h-screen flex-col md:flex-row'>
			<MobileHeader user={user} navItems={navItems} />

			<div className='hidden md:block'>
				<DesktopSidebar user={user} navItems={navItems} />
				{!isExpanded && !secondarySidebar && (
					<div
						className={cn(
							'animate-in fade-in fixed top-lg z-[40] transition-all duration-300',
							side === 'left' ? 'left-8xl' : 'right-8xl'
						)}
					>
						<Link href='/'>
							<div className='relative hidden h-24 w-24 lg:block'>
								<Image src='/logo-light.png' alt='Logo' fill className='object-contain dark:hidden' />
								<Image src='/logo-dark.png' alt='Logo' fill className='hidden object-contain dark:block' />
							</div>
						</Link>
					</div>
				)}
			</div>

			<main
				className={cn(
					'min-h-screen flex-1 transition-all duration-300',
					'pt-6xl md:pt-0',
					side === 'left' && (isExpanded ? 'md:ml-64' : 'md:ml-7xl'),
					side === 'right' && (isExpanded ? 'md:mr-64' : 'md:mr-7xl'),
					secondarySidebar &&
					secondarySidebarOpen &&
					(secondarySide === 'left' ? 'md:ml-[320px]' : 'md:mr-[320px]')
				)}
			>
				{children}
			</main>

			{secondarySidebar && (
				<>
					{/* Mobile Overlay */}
					<div
						className={cn(
							'fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden',
							secondarySidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
						)}
						onClick={() => setIsSecondaryOpen(false)}
					/>

					<aside
						className={cn(
							'fixed bottom-0 top-0 z-[110] w-full max-w-[320px] bg-primary transition-transform duration-300 md:duration-500',
							secondarySide === 'left' ? 'left-0 border-r border-border' : 'right-0 border-l border-border',
							!secondarySidebarOpen && (secondarySide === 'left' ? '-translate-x-full' : 'translate-x-full'),
							'flex flex-col'
						)}
					>
						{/* Mobile Close Button */}
						<button
							onClick={() => setIsSecondaryOpen(false)}
							className='absolute top-lg right-lg z-50 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50 text-main backdrop-blur-md md:hidden'
						>
							<X size={20} />
						</button>

						<div className='flex-1 overflow-y-auto thin-scrollbar'>{secondarySidebar}</div>
					</aside>

					{/* Desktop Toggle Handle (Border Toggle) */}
					<button
						onClick={() => setIsSecondaryOpen(!secondarySidebarOpen)}
						className={cn(
							'fixed top-1/2 z-[120] hidden -translate-y-1/2 items-center justify-center rounded-full bg-primary border border-border text-main transition-all duration-300 shadow-lg hover:bg-secondary hover:scale-110 md:flex',
							secondaryIcon ? 'h-10 w-10' : 'h-24 w-4',
							secondarySide === 'left'
								? secondarySidebarOpen ? 'left-[320px] -translate-x-1/2' : 'left-lg'
								: secondarySidebarOpen ? 'right-[320px] translate-x-1/2' : 'right-lg'
						)}
						title={secondarySidebarOpen ? 'Close Panel' : 'Open Panel'}
					>
						{secondaryIcon ? (
							secondaryIcon
						) : (
							<div className='flex flex-col gap-xs'>
								<div className='h-1 w-1 rounded-full bg-current' />
								<div className='h-1 w-1 rounded-full bg-current' />
								<div className='h-1 w-1 rounded-full bg-current' />
							</div>
						)}
					</button>
				</>
			)}
		</div>
	)
}

