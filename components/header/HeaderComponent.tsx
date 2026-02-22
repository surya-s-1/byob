'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { LayoutDashboard, User, Settings, LogOut, Moon, Sun } from 'lucide-react'

import Card from '@/components/ui/Card'
import { usePathname } from 'next/navigation'

export default function HeaderComponent({ user }: { user: any }) {
	const [open, setOpen] = useState(false)
	const [isDark, setIsDark] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const pathname = usePathname()

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemDark)

		if (shouldBeDark) {
			setIsDark(true)
			document.documentElement.classList.add('dark')
		}
	}, [])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setOpen(false)
			}
		}
		if (open) document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [open])

	const toggleTheme = () => {
		const newDark = !isDark
		setIsDark(newDark)
		document.documentElement.classList.toggle('dark', newDark)
		localStorage.setItem('theme', newDark ? 'dark' : 'light')
	}

	const logout = async () => {
		await fetch('/api/auth/signout', { method: 'POST' })
		window.location.href = '/login'
	}

	return (
		<div className='flex items-center justify-between w-full'>
			<Image
				src={isDark ? '/logo-dark.png' : '/logo-light.png'}
				alt='Logo'
				width={120}
				height={120}
				priority
			/>

			{user ? (
				<div className='relative' ref={dropdownRef}>
					<button
						onClick={() => setOpen(!open)}
						className='w-12 h-12 rounded-full overflow-hidden border border-border focus:outline-none cursor-pointer'
					>
						{user?.image ? (
							<Image
								src={user.image}
								alt='User'
								width={48}
								height={48}
								className='w-full h-full object-cover'
							/>
						) : (
							<div className='w-full h-full bg-secondary flex items-center justify-center text-subtle'>
								<User size={20} />
							</div>
						)}
					</button>

					{open && (
						<Card className='absolute right-0 w-48 mt-sm z-50 p-md'>
							<button
								onClick={toggleTheme}
								className='flex items-center gap-sm px-md py-sm rounded-md hover:bg-secondary w-full text-left transition-colors'
							>
								{isDark ? <Sun size={16} /> : <Moon size={16} />}
								<span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
							</button>

							<div className='my-sm border-t border-border' />

							<a
								href='/dashboard'
								className='flex items-center gap-sm px-md py-sm rounded-md hover:bg-secondary'
							>
								<LayoutDashboard size={16} /> Dashboard
							</a>
							<a
								href='/settings'
								className='flex items-center gap-sm px-md py-sm rounded-md hover:bg-secondary'
							>
								<Settings size={16} /> Settings
							</a>

							<button
								onClick={logout}
								className='flex items-center gap-sm px-md py-sm rounded-md text-error hover:bg-secondary w-full text-left mt-sm'
							>
								<LogOut size={16} /> Logout
							</button>
						</Card>
					)}
				</div>
			) : pathname !== '/login' && (
				<a
					href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
					className='px-md py-sm rounded-full text-xl btn-brand text-white cursor-pointer'
				>
					Join Now
				</a>
			)}
		</div>
	)
}
