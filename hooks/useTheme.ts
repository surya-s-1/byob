'use client'

import { useEffect, useState } from 'react'

export function useTheme() {
	const [theme, setTheme] = useState<'light' | 'dark'>('light')

	useEffect(() => {
		const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
		const initial = saved || 'light'

		if (initial === 'dark') {
			document.documentElement.classList.add('dark')
		}

		setTheme(initial)
	}, [])

	const toggle = () => {
		const newTheme = theme === 'dark' ? 'light' : 'dark'

		if (newTheme === 'dark') {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}

		localStorage.setItem('theme', newTheme)
		setTheme(newTheme)
	}

	return { theme, toggle }
}
