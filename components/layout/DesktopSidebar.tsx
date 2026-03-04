'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
	User as UserIcon,
	Settings as SettingsIcon,
	LogOut,
	Moon,
	Sun,
	ChevronRight,
	PanelLeftClose,
	PanelLeftOpen,
	PanelRightClose,
	PanelRightOpen,
	ArrowLeftRight,
} from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'
import { cn } from '@/lib/utils'
import { NavItem } from '@/types'

interface DesktopSidebarProps {
	user: any
	navItems: NavItem[]
}

export default function DesktopSidebar({ user, navItems }: DesktopSidebarProps) {
	const pathname = usePathname()
	const router = useRouter()
	const { isExpanded, toggleSidebar, side, setSide } = useSidebar()
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const [isDark, setIsDark] = useState(false)

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemDark)
		setIsDark(shouldBeDark)
		if (shouldBeDark) document.documentElement.classList.add('dark')
	}, [])

	const toggleTheme = () => {
		const newTheme = !isDark
		setIsDark(newTheme)
		if (newTheme) {
			document.documentElement.classList.add('dark')
			localStorage.setItem('theme', 'dark')
		} else {
			document.documentElement.classList.remove('dark')
			localStorage.setItem('theme', 'light')
		}
	}

	const logout = async () => {
		await fetch('/api/auth/signout', { method: 'POST' })
		window.location.href = '/login'
	}

	const toggleSide = () => {
		setSide(side === 'left' ? 'right' : 'left')
	}

	return (
		<aside
			className={cn(
				'fixed top-0 bottom-0 z-50 flex flex-col border-border bg-primary transition-all duration-300',
				side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
				isExpanded ? 'w-64' : 'w-20'
			)}
		>
			<div
				className={cn(
					'sticky top-xs z-10 flex h-6xl items-center bg-primary/50 px-lg backdrop-blur-sm',
					isExpanded ? 'justify-between' : 'h-auto flex-col justify-center gap-sm py-lg'
				)}
			>
				<Link href='/' className='flex items-center gap-md px-sm'>
					{isExpanded ? (

						<div className='relative h-6xl w-6xl flex-shrink-0'>
							<Image
								src={isDark ? '/logo-dark.png' : '/logo-light.png'}
								alt='Logo'
								fill
								className='object-contain'
								priority
							/>
						</div>
					) : (
						<div className='hidden md:block lg:hidden relative h-3xl w-3xl flex-shrink-0'>
							<Image
								src={isDark ? '/logo-dark.png' : '/logo-light.png'}
								alt='Logo'
								fill
								className='object-contain'
								priority
							/>
						</div>
					)}
				</Link>

				<button
					onClick={toggleSidebar}
					className={cn(
						'rounded-lg p-sm text-subtle transition-colors hover:bg-secondary',
						!isExpanded && 'mt-sm'
					)}
				>
					{side === 'left' ? (
						isExpanded ? (
							<PanelLeftClose size={20} />
						) : (
							<PanelLeftOpen size={20} />
						)
					) : isExpanded ? (
						<PanelRightClose size={20} />
					) : (
						<PanelRightOpen size={20} />
					)}
				</button>
			</div>

			<nav className='flex-1 space-y-sm overflow-y-auto px-md py-2xl'>
				{navItems.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							'flex items-center gap-lg rounded-xl px-md py-md text-base font-semibold transition-all',
							item.brand
								? 'btn-brand w-full'
								: pathname === item.href
									? 'bg-secondary text-main'
									: 'text-subtle hover:bg-secondary hover:text-main',
							!isExpanded && 'justify-center px-sm'
						)}
						title={!isExpanded ? item.label : ''}
					>
						<span>{item.icon}</span>
						{isExpanded && <span className='truncate'>{item.label}</span>}
					</Link>
				))}
			</nav>

			<div className='space-y-md border-t border-border p-md'>
				<div className={cn('flex gap-xs', !isExpanded && 'flex-col')}>
					<button
						onClick={toggleSide}
						className='flex flex-1 items-center justify-center rounded-xl p-sm text-subtle transition-all hover:bg-secondary hover:text-main'
						title='Move Sidebar'
					>
						<ArrowLeftRight size={20} />
					</button>
					<button
						onClick={toggleTheme}
						className='flex flex-1 items-center justify-center rounded-xl p-sm text-subtle transition-all hover:bg-secondary hover:text-main'
						title='Toggle Theme'
					>
						{isDark ? <Sun size={20} /> : <Moon size={20} />}
					</button>
				</div>

				<div className='relative'>
					<button
						onClick={() =>
							isExpanded
								? setUserMenuOpen(!userMenuOpen)
								: router.push(`/profile/${user?.username}`)
						}
						className={cn(
							'flex w-full items-center gap-lg rounded-xl p-sm text-base font-semibold transition-all',
							userMenuOpen
								? 'bg-secondary text-main'
								: 'text-subtle hover:bg-secondary hover:text-main',
							!isExpanded && 'justify-center'
						)}
						title={!isExpanded ? 'Profile' : ''}
					>
						<div className='h-3xl w-3xl flex-shrink-0 overflow-hidden rounded-full bg-secondary'>
							{user?.image ? (
								<img
									src={user.image}
									alt={user.name}
									className='h-full w-full object-cover'
								/>
							) : (
								<div className='flex h-full w-full items-center justify-center'>
									<UserIcon size={18} />
								</div>
							)}
						</div>
						{isExpanded && (
							<>
								<span className='flex-1 truncate text-left'>
									{user?.name?.split(' ')[0] || 'User'}
								</span>
								<ChevronRight
									size={18}
									className={cn(
										'opacity-50 transition-transform',
										userMenuOpen && 'rotate-90'
									)}
								/>
							</>
						)}
					</button>

					{isExpanded && userMenuOpen && (
						<div className='animate-in slide-in-from-bottom-1 mt-xs space-y-xs duration-200'>
							<Link
								href={`/profile/${user?.username}`}
								className='flex items-center gap-lg rounded-lg px-lg py-sm text-sm text-subtle transition-all hover:bg-secondary hover:text-main'
							>
								<UserIcon size={16} />
								Profile
							</Link>
							<Link
								href='/settings'
								className='flex items-center gap-lg rounded-lg px-lg py-sm text-sm text-subtle transition-all hover:bg-secondary hover:text-main'
							>
								<SettingsIcon size={16} />
								Settings
							</Link>
						</div>
					)}
				</div>

				<button
					onClick={logout}
					className={cn(
						'flex w-full items-center gap-lg rounded-xl p-sm text-base font-semibold text-error/80 transition-all hover:bg-error/10 hover:text-error',
						!isExpanded && 'justify-center'
					)}
					title={!isExpanded ? 'Logout' : ''}
				>
					<LogOut size={20} />
					{isExpanded && <span>Logout</span>}
				</button>
			</div>
		</aside>
	)
}
