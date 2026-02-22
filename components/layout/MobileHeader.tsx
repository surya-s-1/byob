'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
	User as UserIcon,
	Settings as SettingsIcon,
	LogOut,
	Moon,
	Sun,
	Menu,
	X,
	ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavItem } from '@/types'

interface MobileHeaderProps {
	user: any
	navItems: NavItem[]
}

export default function MobileHeader({ user, navItems }: MobileHeaderProps) {
	const pathname = usePathname()
	const [isOpen, setIsOpen] = useState(false)
	const [isDark, setIsDark] = useState(false)
	const [userMenuOpen, setUserMenuOpen] = useState(false)

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemDark)
		setIsDark(shouldBeDark)
	}, [])

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
		<header className='fixed top-0 right-0 left-0 z-[100] h-16 border-b border-border bg-primary/80 backdrop-blur-lg md:hidden'>
			<div className='mx-auto flex h-full max-w-7xl items-center justify-between'>
				<Link href='/' className='flex items-center gap-2 px-4'>
					<div className='relative h-24 w-24'>
						<Image
							src={isDark ? '/logo-dark.png' : '/logo-light.png'}
							alt='Logo'
							fill
							className='object-contain'
						/>
					</div>
				</Link>

				<button
					onClick={() => setIsOpen(!isOpen)}
					className='rounded-lg p-2 text-main transition-colors hover:bg-secondary'
				>
					{isOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
			</div>

			{isOpen && (
				<div className='animate-in slide-in-from-top absolute top-full right-0 left-0 max-h-[calc(100vh-64px)] overflow-y-auto border-b border-border bg-primary shadow-2xl duration-300'>
					<nav className='space-y-2 p-4'>
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setIsOpen(false)}
								className={cn(
									'flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-bold transition-all',
									pathname === item.href
										? item.brand
											? 'btn-brand text-white shadow-md'
											: 'bg-secondary text-main'
										: 'text-subtle hover:bg-secondary hover:text-main'
								)}
							>
								<span>{item.icon}</span>
								<span>{item.label}</span>
							</Link>
						))}

						<div className='my-2 border-t border-border/50' />

						<div className='space-y-1'>
							<button
								onClick={() => setUserMenuOpen(!userMenuOpen)}
								className='flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-base font-bold text-subtle transition-all hover:bg-secondary hover:text-main'
							>
								<div className='h-8 w-8 overflow-hidden rounded-full bg-secondary'>
									{user?.image ? (
										<img
											src={user.image}
											alt={user.name}
											className='h-full w-full object-cover'
										/>
									) : (
										<UserIcon size={18} className='m-auto' />
									)}
								</div>
								<span className='flex-1 text-left'>{user?.name || 'Account'}</span>
								<ChevronDown
									size={18}
									className={cn(
										'opacity-50 transition-transform',
										userMenuOpen && 'rotate-180'
									)}
								/>
							</button>

							{userMenuOpen && (
								<div className='animate-in slide-in-from-top-1 ml-8 space-y-1 border-l border-border/50 pl-8 duration-200'>
									<Link
										href={`/profile/${user?.username}`}
										onClick={() => setIsOpen(false)}
										className='flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-semibold text-subtle transition-all hover:text-main'
									>
										<UserIcon size={16} />
										Profile
									</Link>
									<Link
										href='/settings'
										onClick={() => setIsOpen(false)}
										className='flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-semibold text-subtle transition-all hover:text-main'
									>
										<SettingsIcon size={16} />
										Settings
									</Link>
								</div>
							)}
						</div>

						<div className='my-2 border-t border-border/50' />

						<div className='flex gap-2 p-1'>
							<button
								onClick={toggleTheme}
								className='flex flex-1 items-center justify-center gap-3 rounded-xl border border-border/50 py-3.5 text-base font-bold text-subtle transition-all hover:bg-secondary hover:text-main'
							>
								{isDark ? <Sun size={20} /> : <Moon size={20} />}
								<span>{isDark ? 'Light' : 'Dark'}</span>
							</button>
							<button
								onClick={logout}
								className='flex flex-1 items-center justify-center gap-3 rounded-xl border border-error/20 py-3.5 text-base font-bold text-error/80 transition-all hover:bg-error/10 hover:text-error'
							>
								<LogOut size={20} />
								<span>Logout</span>
							</button>
						</div>
					</nav>
				</div>
			)}
		</header>
	)
}
