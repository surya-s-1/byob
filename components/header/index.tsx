import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/utils'

import HeaderClient from './HeaderClient'

export default async function Header() {
	const user = await getCurrentUser(await headers())

	return (
		<header className='sticky top-0 px-xl py-md z-50'>
			<HeaderClient user={user} />
		</header>
	)
}
