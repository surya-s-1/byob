'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { LayoutDashboard, User, Settings, LogOut, Moon, Sun } from 'lucide-react'
import Card from './ui/Card'

export default function Header({ user }: any) {
	const [open, setOpen] = useState(false)
	const [isDark, setIsDark] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setOpen(false)
			}
		}

		if (open) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [open])

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

		if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
			setIsDark(true)
			document.documentElement.classList.add('dark')
		}
	}, [])

	const toggleTheme = () => {
		const newDark = !isDark
		setIsDark(newDark)

		if (newDark) {
			document.documentElement.classList.add('dark')
			localStorage.setItem('theme', 'dark')
		} else {
			document.documentElement.classList.remove('dark')
			localStorage.setItem('theme', 'light')
		}
	}

	const logout = async () => {
		await fetch('/api/auth/signout', {
			method: 'POST',
		})
		window.location.href = '/login'
	}

	return (
		<header className='sticky top-0 flex items-center justify-between px-xl py-md bg-transparent z-50'>
			<Image
				src={isDark ? '/logo-dark.png' : '/logo-light.png'}
				alt='Logo'
				width={120}
				height={120}
				// className='w-full h-full object-cover'
				priority
			/>

			<div className='relative' ref={dropdownRef}>
				<button
					onClick={() => setOpen(!open)}
					className='w-12 h-12 rounded-full overflow-hidden border border-border transition-all focus:outline-none cursor-pointer'
				>
					{user?.image ? (
						<Image
							src={user.image}
							alt={user.name || 'User'}
							width={48}
							height={48}
							className='w-full h-full object-cover'
							priority
						/>
					) : (
						<div className='w-full h-full bg-secondary flex items-center justify-center text-subtle font-semibold'>
							{user?.name?.[0] || <User size={20} />}
						</div>
					)}
				</button>

				{open && (
					<Card className='absolute right-0 w-fit mt-sm z-50 p-md'>
						<button
							onClick={toggleTheme}
							className='flex items-center gap-sm px-md py-sm rounded-md text-subtle hover:text-main hover:bg-secondary w-full text-left whitespace-nowrap cursor-pointer'
						>
							{isDark ? (
								<span>
									<Sun size={16} />
								</span>
							) : (
								<span>
									<Moon size={16} />
								</span>
							)}
							{isDark ? <span>Light Mode</span> : <span>Dark Mode</span>}
						</button>

						<div className='my-sm border-t border-border' />

						<a
							href='/dashboard'
							className='flex items-center gap-sm px-md py-sm rounded-md text-subtle hover:text-main hover:bg-secondary transition-colors'
						>
							<LayoutDashboard size={16} /> Dashboard
						</a>

						<a
							href='/profile'
							className='flex items-center gap-sm px-md py-sm rounded-md text-subtle hover:text-main hover:bg-secondary transition-colors'
						>
							<User size={16} /> Profile
						</a>

						<a
							href='/settings'
							className='flex items-center gap-sm px-md py-sm rounded-md text-subtle hover:text-main hover:bg-secondary transition-colors'
						>
							<Settings size={16} /> Settings
						</a>

						<button
							onClick={logout}
							className='flex items-center gap-sm px-md py-sm rounded-md text-error hover:bg-secondary w-full text-left transition-colors cursor-pointer'
						>
							<LogOut size={16} /> Logout
						</button>
					</Card>
				)}
			</div>
		</header>
	)
}
