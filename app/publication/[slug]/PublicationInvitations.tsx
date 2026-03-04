import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react'

interface PublicationInvitationsProps {
	invitations: any[]
	reinvitingIds: Set<string>
	cancellingIds?: Set<string>
	onReinvite: (userId: string) => void
	onCancelInvite: (userId: string) => void
}

export default function PublicationInvitations({
	invitations,
	reinvitingIds,
	cancellingIds = new Set(),
	onReinvite,
	onCancelInvite,
}: PublicationInvitationsProps) {
	return (
		<Card className='overflow-hidden border-border'>
			<div className='overflow-x-auto'>
				<table className='w-full border-collapse text-left'>
					<thead className='bg-secondary/50'>
						<tr>
							<th className='px-2xl py-lg text-xs font-bold tracking-wider text-muted uppercase'>
								User
							</th>
							<th className='px-2xl py-lg text-xs font-bold tracking-wider text-muted uppercase'>
								Role
							</th>
							<th className='px-2xl py-lg text-xs font-bold tracking-wider text-muted uppercase'>
								Status
							</th>
							<th className='px-2xl py-lg text-right text-xs font-bold tracking-wider text-muted uppercase'>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-border'>
						{invitations.length > 0 ? (
							invitations.map((inv) => (
								<tr
									key={inv.user.id}
									className='transition-colors hover:bg-secondary/30'
								>
									<td className='px-2xl py-lg'>
										<div className='flex items-center gap-md'>
											<div className='relative h-8 w-8 overflow-hidden rounded-full bg-secondary'>
												{inv.user.image ? (
													<img
														src={inv.user.image}
														alt={inv.user.name}
														className='h-full w-full object-cover'
													/>
												) : (
													<Users
														size={14}
														className='m-auto h-full w-full p-sm'
													/>
												)}
											</div>
											<div>
												<div className='text-sm font-bold text-main'>
													{inv.user.name}
												</div>
												<div className='text-xs text-muted'>
													@{inv.user.username}
												</div>
											</div>
										</div>
									</td>
									<td className='px-2xl py-lg'>
										<span className='rounded-sm bg-primary/10 px-sm py-2xs text-[10px] font-bold text-main uppercase'>
											{inv.role}
										</span>
									</td>
									<td className='px-2xl py-lg'>
										<div className='flex items-center gap-sm'>
											{inv.status === 'accepted' && (
												<>
													<CheckCircle2
														size={14}
														className='text-green-500'
													/>
													<span className='text-xs font-bold text-green-600 capitalize'>
														Accepted
													</span>
												</>
											)}
											{inv.status === 'rejected' && (
												<>
													<XCircle size={14} className='text-error' />
													<span className='text-xs font-bold text-error capitalize'>
														Rejected
													</span>
												</>
											)}
											{inv.status === 'pending' && (
												<>
													<Clock size={14} className='text-amber-500' />
													<span className='text-xs font-bold text-amber-600 capitalize'>
														Pending
													</span>
												</>
											)}
										</div>
									</td>
									<td className='px-2xl py-lg text-right'>
										<div className='flex items-center justify-end gap-md'>
											{inv.status === 'rejected' ? (
												<Button
													onClick={() => onReinvite(inv.user.id)}
													isLoading={reinvitingIds.has(inv.user.id)}
													variant='brand'
													size='xs'
												>
													Reinvite
												</Button>
											) : inv.status === 'pending' ? (
												<Button
													onClick={() => onCancelInvite(inv.user.id)}
													isLoading={cancellingIds.has(inv.user.id)}
													variant='secondary'
													size='xs'
												>
													Cancel
												</Button>
											) : (
												<div className='text-xs font-medium text-subtle'>
													{new Date(
														inv.acceptedAt ||
														inv.rejectedAt ||
														inv.invitedAt
													).toLocaleDateString(undefined, {
														month: 'short',
														day: 'numeric',
														year: 'numeric',
													})}
												</div>
											)}
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={5}
									className='px-2xl py-5xl text-center text-sm text-muted'
								>
									No invitation history found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</Card>
	)
}
