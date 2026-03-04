import { Publication } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Globe, Users, Shield, PlusCircle } from 'lucide-react'

interface PublicationAboutProps {
	publication: Publication
	followersCount: number
	canManage: boolean
	onInviteClick?: () => void
	onFollowersClick?: () => void
	onMembersClick?: () => void
}

export default function PublicationAbout({
	publication,
	followersCount,
	canManage,
	onInviteClick,
	onFollowersClick,
	onMembersClick,
}: PublicationAboutProps) {
	return (
		<Card className='sticky top-24 space-y-2xl p-2xl'>
			<div className='space-y-lg'>
				<h4 className='text-xs font-bold tracking-widest text-muted uppercase'>About</h4>
				<div className='space-y-md'>
					<div className='flex items-center justify-between text-sm'>
						<span className='flex items-center gap-sm text-subtle'>
							<Globe size={16} /> Visibility
						</span>
						<span className='font-bold text-main capitalize'>
							{publication.visibility.toLowerCase()}
						</span>
					</div>
					<div
						onClick={onFollowersClick ? onFollowersClick : () => {}}
						className='flex items-center justify-between text-sm cursor-pointer hover:underline'
					>
						<span className='flex items-center gap-sm text-subtle'>
							<Users size={16} /> Followers
						</span>
						<span className='font-bold text-main'>{followersCount}</span>
					</div>
					<div
						onClick={onMembersClick ? onMembersClick : ()=>{}}
						className='flex items-center justify-between text-sm cursor-pointer hover:underline'
					>
						<span className='flex items-center gap-sm text-subtle'>
							<Shield size={16} /> Members
						</span>
						<span className='font-bold text-main'>{publication.memberCount || 0}</span>
					</div>
				</div>
			</div>

			{canManage && (
				<div className='space-y-md border-t border-border pt-2xl'>
					<Button onClick={onInviteClick} variant='brand' className='w-full gap-sm'>
						<PlusCircle size={16} />
						Invite Member
					</Button>
				</div>
			)}
		</Card>
	)
}
