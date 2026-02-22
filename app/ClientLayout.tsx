'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { SidebarProvider } from '@/context/SidebarContext'
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
				<div className='absolute left-4 top-4 z-50 md:left-8 md:top-8'>
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
				<div className='flex flex-1 items-center justify-center p-4'>
					{children}
				</div>
				<Footer />
			</div>
		)
	}

	return (
		<SidebarProvider>
			<SidebarLayout user={user}>
				<div className='flex min-h-screen flex-col'>
					<div className='flex-1'>{children}</div>
					<Footer />
				</div>
			</SidebarLayout>
		</SidebarProvider>
	)
}
