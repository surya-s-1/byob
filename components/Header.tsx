'use client'
import { useState, useEffect } from 'react'
import { LayoutDashboard, User, Settings, LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function Header({ user }: any) {
	const [open, setOpen] = useState(false)

	const [isDark, setIsDark] = useState(false)

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
		await fetch('/api/auth/logout', { method: 'POST' })
		window.location.href = '/login'
	}

	return (
		<header className='flex items-center justify-between px-xl py-md border-b border-border bg-elevated'>
			<div className='flex items-center gap-sm'>
				<div className='w-8 h-8 bg-brand rounded-md' />
				<h2 className='font-semibold text-main'>MultiBlog</h2>
			</div>

			<div className='relative'>
				<img src={user?.avatar} className='w-9 h-9 rounded-full' onClick={() => setOpen(!open)} />

				{open && (
					<div className='absolute right-0 mt-sm w-52 bg-elevated border border-border rounded-lg shadow-md p-sm z-50'>
						<button
							onClick={toggleTheme}
							className='flex items-center gap-sm px-md py-sm rounded-md text-subtle hover:text-main hover:bg-secondary w-full text-left'
						>
							{isDark ? <Sun size={16} /> : <Moon size={16} />}
							{isDark ? 'Light Mode' : 'Dark Mode'}
						</button>

						<div className='my-sm border-t border-border' />

						<a href='/dashboard' className='flex items-center gap-sm px-md py-sm rounded-md text-subtle hover:text-main hover:bg-secondary transition-colors'>
							<LayoutDashboard size={16} /> Dashboard
						</a>
						
						<a href='/profile' className='flex items-center gap-sm px-md py-sm rounded-md text-subtle hover:text-main hover:bg-secondary transition-colors'>
							<User size={16} /> Profile
						</a>
						
						<a href='/settings' className='flex items-center gap-sm px-md py-sm rounded-md text-subtle hover:text-main hover:bg-secondary transition-colors'>
							<Settings size={16} /> Settings
						</a>

						<button onClick={logout} className='flex items-center gap-sm px-md py-sm rounded-md text-error hover:bg-secondary w-full text-left transition-colors'>
							<LogOut size={16} /> Logout
						</button>
					</div>
				)}
			</div>
		</header>
	)
}
