import Card from './Card'
import Button from './Button'
import { Mail, Shield } from 'lucide-react'

interface InvitationCardProps {
	invitation: {
		id: string
		displayName: string
		role?: string
		slug: string
	}
	onAccept?: (id: string) => void
	onReject?: (id: string) => void
	isLoading?: boolean
}

export default function InvitationCard({
	invitation,
	onAccept,
	onReject,
	isLoading,
}: InvitationCardProps) {
	return (
		<Card className='p-4 border-primary/20 bg-primary/5 space-y-4 hover:shadow-md transition-all'>
			<div className='flex items-start gap-4'>
				<div className='h-10 w-10 bg-primary/20 text-main rounded-full flex items-center justify-center flex-shrink-0 animate-pulse'>
					<Mail size={20} />
				</div>
				<div className='space-y-1 min-w-0'>
					<h4 className='font-bold text-main text-sm'>Action Required</h4>
					<p className='text-xs text-subtle leading-relaxed overflow-hidden'>
						You've been invited to join{' '}
						<strong className='text-main truncate inline-block max-w-[120px] align-bottom'>
							{invitation.displayName}
						</strong>{' '}
						as an{' '}
						<strong className='flex items-center gap-1 text-main font-bold'>
							<Shield size={10} />
							{invitation.role || 'Member'}
						</strong>
						.
					</p>
				</div>
			</div>
			<div className='flex flex-col xs:flex-row gap-2'>
				<Button
					onClick={() => onAccept?.(invitation.id)}
					isLoading={isLoading}
					className='btn-brand py-2 px-4 text-xs flex-1 font-bold h-9'
				>
					Accept Invitation
				</Button>
				<Button
					onClick={() => onReject?.(invitation.id)}
					isLoading={isLoading}
					className='bg-secondary text-main border border-border py-2 px-4 text-xs flex-1 font-bold h-9 hover:bg-border transition-colors'
				>
					Decline
				</Button>
			</div>
		</Card>
	)
}
