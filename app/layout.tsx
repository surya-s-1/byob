import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/utils'
import ClientLayout from './ClientLayout'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Running Head',
	description: 'Create your own publication!',
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const user = await getCurrentUser(await headers())

	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} m-0 min-h-screen bg-primary p-0 antialiased`}
			>
				<ClientLayout user={user}>{children}</ClientLayout>
			</body>
		</html>
	)
}
