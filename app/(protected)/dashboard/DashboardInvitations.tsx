import { Mail } from 'lucide-react'
import InvitationCard from '@/components/ui/InvitationCard'
import Card from '@/components/ui/Card'

interface DashboardInvitationsProps {
    invitations: any[]
    actionLoadingIds: Set<string>
    onAccept: (id: string) => void
    onReject: (id: string) => void
}

export default function DashboardInvitations({
    invitations,
    actionLoadingIds,
    onAccept,
    onReject,
}: DashboardInvitationsProps) {
    return (
        <section className='space-y-4'>
            <h2 className='text-xl font-bold text-main flex items-center gap-2'>
                <Mail size={22} className='text-main' />
                Invitations
            </h2>
            {invitations.length > 0 ? (
                <div className='space-y-4'>
                    {invitations.map((invitation: any) => (
                        <InvitationCard
                            key={invitation.id}
                            invitation={invitation}
                            onAccept={onAccept}
                            onReject={onReject}
                            isLoading={actionLoadingIds.has(invitation.id)}
                        />
                    ))}
                </div>
            ) : (
                <Card className='p-12 text-center text-muted bg-primary/5 border-dashed border-2 rounded-3xl'>
                    <div className='flex flex-col items-center gap-3'>
                        <Mail size={48} className='text-muted/30' />
                        <p>No pending invitations.</p>
                    </div>
                </Card>
            )}
        </section>
    )
}
