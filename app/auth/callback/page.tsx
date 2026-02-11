'use client'

import { useEffect } from 'react'

export default function Callback() {
	useEffect(() => {
		const hash = window.location.hash.substring(1)
		const params = new URLSearchParams(hash)

		const access_token = params.get('access_token')

		if (!access_token) {
			window.location.href = '/login'
			return
		}

		fetch('/api/auth/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ access_token }),
		}).then(() => {
			window.location.href = '/dashboard'
		})
	}, [])

	return <p>Signing in...</p>
}
