import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/utils'

export default async function Home() {
	const user = await getCurrentUser(await headers())
	if (user) redirect('/dashboard')
	else redirect('/login')
}
