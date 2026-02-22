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
				'fixed top-0 bottom-0 z-50 bg-primary border-border flex flex-col transition-all duration-300',
				side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
				isExpanded ? 'w-64' : 'w-20'
			)}
		>
			<div
				className={cn(
					'flex items-center h-16 px-4 bg-primary/50 backdrop-blur-sm sticky top-2 z-10',
					isExpanded ? 'justify-between' : 'flex-col justify-center gap-2 py-4 h-auto'
				)}
			>
				{isExpanded && (
					<Link href='/' className='flex items-center gap-3 px-2'>
						<div className='relative w-16 h-16 flex-shrink-0'>
							<Image
								src={isDark ? '/logo-dark.png' : '/logo-light.png'}
								alt='Logo'
								fill
								className='object-contain'
								priority
							/>
						</div>
					</Link>
				)}

				<button
					onClick={toggleSidebar}
					className={cn(
						'p-1.5 rounded-lg hover:bg-secondary text-subtle transition-colors',
						!isExpanded && 'mt-2'
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

			<nav className='flex-1 px-3 py-6 space-y-2 overflow-y-auto'>
				{navItems.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							'flex items-center gap-4 px-3 py-3 rounded-xl transition-all text-base font-semibold',
							item.brand
								? 'btn-brand text-white shadow-md hover:opacity-90'
								: pathname === item.href
									? 'bg-secondary text-main'
									: 'text-subtle hover:bg-secondary hover:text-main',
							!isExpanded && 'justify-center px-2'
						)}
						title={!isExpanded ? item.label : ''}
					>
						<span>{item.icon}</span>
						{isExpanded && <span className='truncate'>{item.label}</span>}
					</Link>
				))}
			</nav>

			<div className='p-3 border-t border-border space-y-3'>
				<div className={cn('flex gap-1', !isExpanded && 'flex-col')}>
					<button
						onClick={toggleTheme}
						className='flex-1 flex items-center justify-center p-2.5 rounded-xl hover:bg-secondary text-subtle hover:text-main transition-all'
						title='Toggle Theme'
					>
						{isDark ? <Sun size={20} /> : <Moon size={20} />}
					</button>
					<button
						onClick={toggleSide}
						className='flex-1 flex items-center justify-center p-2.5 rounded-xl hover:bg-secondary text-subtle hover:text-main transition-all'
						title='Move Sidebar'
					>
						<ArrowLeftRight size={20} />
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
							'w-full flex items-center gap-4 p-2.5 rounded-xl transition-all text-base font-semibold',
							userMenuOpen
								? 'bg-secondary text-main'
								: 'text-subtle hover:bg-secondary hover:text-main',
							!isExpanded && 'justify-center'
						)}
						title={!isExpanded ? 'Profile' : ''}
					>
						<div className='w-8 h-8 rounded-full overflow-hidden bg-secondary flex-shrink-0'>
							{user?.image ? (
								<img
									src={user.image}
									alt={user.name}
									className='w-full h-full object-cover'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center'>
									<UserIcon size={18} />
								</div>
							)}
						</div>
						{isExpanded && (
							<>
								<span className='flex-1 text-left truncate'>
									{user?.name?.split(' ')[0] || 'User'}
								</span>
								<ChevronRight
									size={18}
									className={cn(
										'transition-transform opacity-50',
										userMenuOpen && 'rotate-90'
									)}
								/>
							</>
						)}
					</button>

					{isExpanded && userMenuOpen && (
						<div className='mt-1 space-y-1 animate-in slide-in-from-bottom-1 duration-200'>
							<Link
								href={`/profile/${user?.username}`}
								className='flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm text-subtle hover:bg-secondary hover:text-main transition-all'
							>
								<UserIcon size={16} />
								Profile
							</Link>
							<Link
								href='/settings'
								className='flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm text-subtle hover:bg-secondary hover:text-main transition-all'
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
						'w-full flex items-center gap-4 p-2.5 rounded-xl text-error/80 hover:bg-error/10 hover:text-error transition-all text-base font-semibold',
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
