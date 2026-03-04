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
		<Card className='space-y-lg border-primary/20 bg-primary/5 p-lg transition-all hover:shadow-md'>
			<div className='flex items-start gap-lg'>
				<div className='flex h-4xl w-4xl shrink-0 animate-pulse items-center justify-center rounded-full bg-primary/20 text-main'>
					<Mail size={20} />
				</div>
				<div className='min-w-0 space-y-xs'>
					<h4 className='text-sm font-bold text-main'>Action Required</h4>
					<p className='overflow-hidden text-xs leading-relaxed text-subtle'>
						You've been invited to join{' '}
						<strong className='inline-block max-w-[120px] truncate align-bottom text-main'>
							{invitation.displayName}
						</strong>{' '}
						as an{' '}
						<strong className='flex items-center gap-xs font-bold text-main'>
							<Shield size={10} />
							{invitation.role || 'Member'}
						</strong>
						.
					</p>
				</div>
			</div>
			<div className='flex flex-col gap-sm xs:flex-row'>
				<Button
					onClick={() => onAccept?.(invitation.id)}
					isLoading={isLoading}
					variant='brand'
					size='sm'
					className='h-[36px] flex-1'
				>
					Accept Invitation
				</Button>
				<Button
					onClick={() => onReject?.(invitation.id)}
					isLoading={isLoading}
					variant='secondary'
					size='sm'
					className='h-[36px] flex-1'
				>
					Decline
				</Button>
			</div>
		</Card>
	)
}
