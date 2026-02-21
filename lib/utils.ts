export function cn(...classes: any[]) {
	return classes.filter(Boolean).join(' ')
}

export async function getSession(headers?: Headers) {
	const baseURL = process.env.BETTER_AUTH_URL!

	try {
		const res = await fetch(`${baseURL}/api/auth/session`, {
			method: 'GET',
			headers: headers || {},
		})

		if (!res.ok) return null

		return await res.json()
	} catch (error) {
		console.error('Failed to fetch session:', error)
		return null
	}
}

export async function getCurrentUser(headers?: Headers) {
	const session = await getSession(headers)
	return session?.user || null
}

export function slugify(text: string) {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w-]+/g, '') // Remove all non-word chars
		.replace(/--+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, '') // Trim - from end of text
}
