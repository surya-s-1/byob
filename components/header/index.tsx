import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/utils'

import HeaderComponent from './HeaderComponent'

export default async function Header() {
	const user = await getCurrentUser(await headers())

	return (
		<header className='sticky top-0 px-xl py-md z-50'>
			<HeaderComponent user={user} />
		</header>
	)
}
