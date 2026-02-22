import { Publication } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Globe, Users, Shield, PlusCircle } from 'lucide-react'

interface PublicationAboutProps {
	publication: Publication
	followersCount: number
	canManage: boolean
	onInviteClick?: () => void
}

export default function PublicationAbout({
	publication,
	followersCount,
	canManage,
	onInviteClick,
}: PublicationAboutProps) {
	return (
		<Card className='sticky top-24 space-y-6 p-6'>
			<div className='space-y-4'>
				<h4 className='text-xs font-bold tracking-widest text-muted uppercase'>About</h4>
				<div className='space-y-3'>
					<div className='flex items-center justify-between text-sm'>
						<span className='flex items-center gap-2 text-subtle'>
							<Globe size={16} /> Visibility
						</span>
						<span className='font-bold text-main capitalize'>
							{publication.visibility.toLowerCase()}
						</span>
					</div>
					<div className='flex items-center justify-between text-sm'>
						<span className='flex items-center gap-2 text-subtle'>
							<Users size={16} /> Followers
						</span>
						<span className='font-bold text-main'>{followersCount}</span>
					</div>
					<div className='flex items-center justify-between text-sm'>
						<span className='flex items-center gap-2 text-subtle'>
							<Shield size={16} /> Members
						</span>
						<span className='font-bold text-main'>{publication.memberCount || 0}</span>
					</div>
				</div>
			</div>

			{canManage && (
				<div className='space-y-3 border-t border-border pt-6'>
					<Button onClick={onInviteClick} className='btn-brand flex w-full items-center justify-center gap-2'>
						<PlusCircle size={16} />
						Invite Member
					</Button>
				</div>
			)}
		</Card>
	)
}
