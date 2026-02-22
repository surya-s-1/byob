'use client'

import React from 'react'
import { SidebarProvider } from '@/context/SidebarContext'
import SidebarLayout from '@/components/layout/SidebarLayout'
import Footer from '@/components/Footer'

interface ClientLayoutProps {
	user: any
	children: React.ReactNode
}

export default function ClientLayout({ user, children }: ClientLayoutProps) {
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
