export interface User {
	id: string
	username: string
	email: string
	name: string
	bio: string | null
	dob: string | null
	image: string | null
	followersCount: number
	followingCount: number
	isFollowing: boolean
}

export interface Publication {
	id: string
	slug: string
	displayName: string
	displayDescription: string | null
	cover: string | null
	visibility: 'PUBLIC' | 'HIDDEN' | 'LOCKED'
	followersCount: number
	isFollowing: boolean
	isMember: boolean
	myRole: 'OWNER' | 'EDITOR' | 'REVIEWER' | 'ADMIN' | null
}

export interface Article {
	id: string
	slug: string
	title: string
	subtitle: string | null
	cover: string | null
	content: string
	excerpt: string | null
	readTime: number
	publishedAt: string
	visibility: 'PUBLIC' | 'HIDDEN' | 'LOCKED'
	authors: { id: string; name: string; image: string; isPrimary: boolean }[]
	publication: { id: string; slug: string; displayName: string } | null
	series: { id: string; slug: string; displayName: string; sortOrder: number } | null
}
