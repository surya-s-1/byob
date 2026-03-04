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

import { useSidebar } from '@/context/SidebarContext'

interface MobileHeaderProps {
	user: any
	navItems: NavItem[]
}

export default function MobileHeader({ user, navItems }: MobileHeaderProps) {
	const pathname = usePathname()
	const [isOpen, setIsOpen] = useState(false)
	const [isDark, setIsDark] = useState(false)
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const { secondarySidebar, secondaryIcon, isSecondaryOpen, setIsSecondaryOpen } = useSidebar()

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
		<header className='fixed top-0 right-0 left-0 z-50 h-6xl border-b border-border bg-primary/80 backdrop-blur-lg md:hidden'>
			<div className='flex h-full items-center justify-between'>
				<Link href='/' className='flex items-center gap-sm px-lg'>
					<div className='relative h-8xl w-8xl'>
						<Image
							src={isDark ? '/logo-dark.png' : '/logo-light.png'}
							alt='Logo'
							fill
							className='object-contain'
						/>
					</div>
				</Link>

				<div className='flex items-center gap-xs px-lg'>
					{secondarySidebar && (
						<button
							onClick={() => setIsSecondaryOpen(!isSecondaryOpen)}
							className={cn(
								'rounded-lg p-sm transition-colors',
								isSecondaryOpen ? 'bg-brand/10 text-brand' : 'text-main hover:bg-secondary'
							)}
						>
							{secondaryIcon || <SettingsIcon size={22} />}
						</button>
					)}
					<button
						onClick={() => setIsOpen(!isOpen)}
						className='rounded-lg p-sm text-main transition-colors hover:bg-secondary'
					>
						{isOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			{isOpen && (
				<div className='animate-in slide-in-from-top absolute top-full right-0 left-0 max-h-[calc(100vh-64px)] overflow-y-auto border-b border-border bg-primary shadow-2xl duration-300'>
					<nav className='space-y-sm p-lg'>
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setIsOpen(false)}
								className={cn(
									'flex items-center gap-lg rounded-xl px-lg py-md text-base font-bold transition-all',
									pathname === item.href
										? item.brand
											? 'relative overflow-hidden bg-brand text-inverse shadow-md after:absolute after:top-0 after:-left-[75%] after:block after:h-full after:w-1/2 after:bg-linear-to-r after:from-transparent after:via-white/30 after:to-transparent after:skew-x-[-25deg] hover:after:animate-shine'
											: 'bg-secondary text-main'
										: 'text-subtle hover:bg-secondary hover:text-main'
								)}
							>
								<span>{item.icon}</span>
								<span>{item.label}</span>
							</Link>
						))}

						<div className='my-sm border-t border-border/50' />

						<div className='space-y-xs'>
							<button
								onClick={() => setUserMenuOpen(!userMenuOpen)}
								className='flex w-full items-center gap-lg rounded-xl px-lg py-md text-base font-bold text-subtle transition-all hover:bg-secondary hover:text-main'
							>
								<div className='h-3xl w-3xl overflow-hidden rounded-full bg-secondary'>
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
								<div className='animate-in slide-in-from-top-1 ml-3xl space-y-xs border-l border-border/50 pl-3xl duration-200'>
									<Link
										href={`/profile/${user?.username}`}
										onClick={() => setIsOpen(false)}
										className='flex items-center gap-lg rounded-lg px-lg py-sm text-sm font-semibold text-subtle transition-all hover:text-main'
									>
										<UserIcon size={16} />
										Profile
									</Link>
									<Link
										href='/settings'
										onClick={() => setIsOpen(false)}
										className='flex items-center gap-lg rounded-lg px-lg py-sm text-sm font-semibold text-subtle transition-all hover:text-main'
									>
										<SettingsIcon size={16} />
										Settings
									</Link>
								</div>
							)}
						</div>

						<div className='my-sm border-t border-border/50' />

						<div className='flex gap-sm p-xs'>
							<button
								onClick={toggleTheme}
								className='flex flex-1 items-center justify-center gap-md rounded-xl border border-border/50 py-md text-base font-bold text-subtle transition-all hover:bg-secondary hover:text-main'
							>
								{isDark ? <Sun size={20} /> : <Moon size={20} />}
								<span>{isDark ? 'Light' : 'Dark'}</span>
							</button>
							<button
								onClick={logout}
								className='flex flex-1 items-center justify-center gap-md rounded-xl border border-error/20 py-md text-base font-bold text-error/80 transition-all hover:bg-error/10 hover:text-error'
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
