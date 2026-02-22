import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/utils'
import SettingsClient from './SettingsClient'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
	const user = await getCurrentUser(await headers())

	if (!user) {
		redirect('/login')
	}

	return <SettingsClient user={user} />
}
