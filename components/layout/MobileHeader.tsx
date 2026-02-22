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
		<header className='md:hidden fixed top-0 left-0 right-0 z-[100] bg-primary/80 backdrop-blur-lg border-b border-border h-16'>
			<div className='flex items-center justify-between h-full max-w-7xl mx-auto'>
				<Link href='/' className='flex items-center gap-2 px-4'>
					<div className='relative w-24 h-24'>
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
					className='p-2 rounded-lg hover:bg-secondary text-main transition-colors'
				>
					{isOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
			</div>

			{isOpen && (
				<div className='absolute top-full left-0 right-0 bg-primary border-b border-border shadow-2xl animate-in slide-in-from-top duration-300 overflow-y-auto max-h-[calc(100vh-64px)]'>
					<nav className='p-4 space-y-2'>
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setIsOpen(false)}
								className={cn(
									'flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all text-base',
									pathname === item.href
										? item.brand
											? 'btn-brand shadow-md text-white'
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
								className='w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-subtle hover:bg-secondary hover:text-main font-bold text-base transition-all'
							>
								<div className='w-8 h-8 rounded-full overflow-hidden bg-secondary'>
									{user?.image ? (
										<img
											src={user.image}
											alt={user.name}
											className='w-full h-full object-cover'
										/>
									) : (
										<UserIcon size={18} className='m-auto' />
									)}
								</div>
								<span className='flex-1 text-left'>{user?.name || 'Account'}</span>
								<ChevronDown
									size={18}
									className={cn(
										'transition-transform opacity-50',
										userMenuOpen && 'rotate-180'
									)}
								/>
							</button>

							{userMenuOpen && (
								<div className='pl-8 space-y-1 animate-in slide-in-from-top-1 duration-200 border-l border-border/50 ml-8'>
									<Link
										href={`/profile/${user?.username}`}
										onClick={() => setIsOpen(false)}
										className='flex items-center gap-4 px-4 py-3 rounded-lg text-sm text-subtle hover:text-main transition-all font-semibold'
									>
										<UserIcon size={16} />
										Profile
									</Link>
									<Link
										href='/settings'
										onClick={() => setIsOpen(false)}
										className='flex items-center gap-4 px-4 py-3 rounded-lg text-sm text-subtle hover:text-main transition-all font-semibold'
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
								className='flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl text-subtle hover:bg-secondary hover:text-main font-bold text-base transition-all border border-border/50'
							>
								{isDark ? <Sun size={20} /> : <Moon size={20} />}
								<span>{isDark ? 'Light' : 'Dark'}</span>
							</button>
							<button
								onClick={logout}
								className='flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl text-error/80 hover:bg-error/10 hover:text-error font-bold text-base transition-all border border-error/20'
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
