'use client'

import { useState } from 'react'

export default function Header({ user }: any) {
	const [open, setOpen] = useState(false)

	const logout = async () => {
		await fetch('/api/auth/logout', { method: 'POST' })
		window.location.href = '/login'
	}

	return (
		<header
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				padding: '12px 20px',
				borderBottom: '1px solid #eee',
			}}
		>
			<h3>MyApp</h3>

			<div style={{ position: 'relative' }}>
				<img
					src={user.avatar || 'https://placehold.co/40'}
					width={36}
					height={36}
					style={{ borderRadius: '50%', cursor: 'pointer' }}
					onClick={() => setOpen(!open)}
				/>

				{open && (
					<div
						style={{
							position: 'absolute',
							right: 0,
							top: 45,
							background: '#fff',
							border: '1px solid #ddd',
							padding: 10,
							width: 150,
						}}
					>
						<a href='/profile'>Profile</a>
						<br />
						<a href='/settings'>Settings</a>
						<br />
						<br />
						<button onClick={logout}>Logout</button>
					</div>
				)}
			</div>
		</header>
	)
}
