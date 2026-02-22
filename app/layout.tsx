import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import Header from '@/components/header'
import Footer from '@/components/Footer'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'My Own Blog',
	description: 'My own blog!',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} m-0 p-0 antialiased min-h-screen bg-primary flex flex-col`}
			>
				<Header />
				<div className='flex-1'>{children}</div>
				<Footer />
			</body>
		</html>
	)
}
