'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { SidebarProvider, useSidebar } from '@/context/SidebarContext'
import SidebarLayout from '@/components/layout/SidebarLayout'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'

interface ClientLayoutProps {
	user: any
	children: React.ReactNode
}

export default function ClientLayout({ user, children }: ClientLayoutProps) {
	const pathname = usePathname()

	if (pathname === '/login') {
		return (
			<div className='relative flex min-h-screen flex-col'>
				<div className='absolute left-lg top-lg z-50 md:left-3xl md:top-3xl'>
					<Link href='/'>
						<div className='relative h-16 w-16 lg:h-20 lg:w-20'>
							<Image
								src='/logo-light.png'
								alt='Logo'
								fill
								className='object-contain dark:hidden'
								priority
							/>
							<Image
								src='/logo-dark.png'
								alt='Logo'
								fill
								className='hidden object-contain dark:block'
								priority
							/>
						</div>
					</Link>
				</div>
				<div className='flex flex-1 items-center justify-center p-lg'>
					{children}
				</div>
				<Footer />
			</div>
		)
	}

	return (
		<SidebarProvider>
			<ClientLayoutWithSidebar user={user}>{children}</ClientLayoutWithSidebar>
		</SidebarProvider>
	)
}

function ClientLayoutWithSidebar({ user, children }: { user: any; children: React.ReactNode }) {
	const { secondarySidebar, secondaryIcon, isSecondaryOpen } = useSidebar()

	return (
		<SidebarLayout
			user={user}
			secondarySidebar={secondarySidebar}
			secondarySidebarOpen={isSecondaryOpen}
			secondaryIcon={secondaryIcon}
		>
			<div className='w-full min-h-screen flex flex-col items-center'>
				<div className='w-full flex-1 flex flex-col items-center'>{children}</div>
				<Footer />
			</div>
		</SidebarLayout>
	)
}
