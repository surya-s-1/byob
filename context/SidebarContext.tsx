'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { NavItem } from '@/types'
import { LayoutDashboard, PlusCircle } from 'lucide-react'

type SidebarSide = 'left' | 'right'

interface SidebarContextType {
	isExpanded: boolean
	setIsExpanded: (expanded: boolean) => void
	side: SidebarSide
	setSide: (side: SidebarSide) => void
	toggleSidebar: () => void
	navItems: NavItem[]
	setNavItems: (items: NavItem[]) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const DEFAULT_NAV_ITEMS: NavItem[] = [
	{
		label: 'Dashboard',
		href: '/dashboard',
		icon: <LayoutDashboard size={20} />,
	},
	{
		label: 'New Publication',
		href: '/publications/new',
		icon: <PlusCircle size={20} />,
		brand: true,
	},
]

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const [isExpanded, setIsExpanded] = useState(true)
	const [side, setSide] = useState<SidebarSide>('left')
	const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV_ITEMS)

	useEffect(() => {
		const savedSide = localStorage.getItem('sidebar-side') as SidebarSide
		if (savedSide) setSide(savedSide)

		// Check for tablet/mobile on initial load
		if (window.innerWidth < 1024) {
			setIsExpanded(false)
		}
	}, [])

	useEffect(() => {
		localStorage.setItem('sidebar-side', side)
	}, [side])

	useEffect(() => {
		const isArticleOrDraft =
			pathname.startsWith('/article/') ||
			pathname.includes('/editor/') ||
			pathname.includes('/draft/')
		setIsExpanded(!isArticleOrDraft)

		// Reset to default items on navigation if desired,
		// but usually we want the page to control this via a hook.
		// For now, let's keep it simple.
		setNavItems(DEFAULT_NAV_ITEMS)
	}, [pathname])

	const toggleSidebar = () => setIsExpanded(!isExpanded)

	return (
		<SidebarContext.Provider
			value={{
				isExpanded,
				setIsExpanded,
				side,
				setSide,
				toggleSidebar,
				navItems,
				setNavItems,
			}}
		>
			{children}
		</SidebarContext.Provider>
	)
}

export function useSidebar() {
	const context = useContext(SidebarContext)
	if (context === undefined) {
		throw new Error('useSidebar must be used within a SidebarProvider')
	}
	return context
}
