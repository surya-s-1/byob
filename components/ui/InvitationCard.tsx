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
		<Card className='space-y-4 border-primary/20 bg-primary/5 p-4 transition-all hover:shadow-md'>
			<div className='flex items-start gap-4'>
				<div className='flex h-10 w-10 flex-shrink-0 animate-pulse items-center justify-center rounded-full bg-primary/20 text-main'>
					<Mail size={20} />
				</div>
				<div className='min-w-0 space-y-1'>
					<h4 className='text-sm font-bold text-main'>Action Required</h4>
					<p className='overflow-hidden text-xs leading-relaxed text-subtle'>
						You've been invited to join{' '}
						<strong className='inline-block max-w-[120px] truncate align-bottom text-main'>
							{invitation.displayName}
						</strong>{' '}
						as an{' '}
						<strong className='flex items-center gap-1 font-bold text-main'>
							<Shield size={10} />
							{invitation.role || 'Member'}
						</strong>
						.
					</p>
				</div>
			</div>
			<div className='flex flex-col gap-2 xs:flex-row'>
				<Button
					onClick={() => onAccept?.(invitation.id)}
					isLoading={isLoading}
					className='btn-brand h-9 flex-1 px-4 py-2 text-xs font-bold'
				>
					Accept Invitation
				</Button>
				<Button
					onClick={() => onReject?.(invitation.id)}
					isLoading={isLoading}
					className='h-9 flex-1 border border-border bg-secondary px-4 py-2 text-xs font-bold text-main transition-colors hover:bg-border'
				>
					Decline
				</Button>
			</div>
		</Card>
	)
}
