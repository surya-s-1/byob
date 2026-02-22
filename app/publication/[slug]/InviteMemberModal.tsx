import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { User, Search, User as UserIcon } from 'lucide-react'
import Image from 'next/image'

interface InviteMemberModalProps {
    isOpen: boolean
    onClose: () => void
    publicationId: string
    localInvitations: any[]
    onInvite: (userId: string) => Promise<void>
    onCancelInvite: (userId: string) => Promise<void>
}

export default function InviteMemberModal({
    isOpen,
    onClose,
    publicationId,
    localInvitations,
    onInvite,
    onCancelInvite,
}: InviteMemberModalProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [users, setUsers] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [actionLoadingIds, setActionLoadingIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.length < 6) {
                setUsers([])
                return
            }
            setIsSearching(true)
            try {
                const res = await fetch(`/api/user/search?q=${encodeURIComponent(searchQuery)}`)
                if (res.ok) {
                    const data = await res.json()
                    setUsers(data.users || [])
                }
            } catch (error) {
                console.error('Error searching users:', error)
            } finally {
                setIsSearching(false)
            }
        }

        const timeoutId = setTimeout(searchUsers, 500)
        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    const handleInvite = async (userId: string) => {
        if (actionLoadingIds.has(userId)) return
        setActionLoadingIds((prev) => new Set(prev).add(userId))
        await onInvite(userId)
        setActionLoadingIds((prev) => {
            const next = new Set(prev)
            next.delete(userId)
            return next
        })
    }

    const handleCancel = async (userId: string) => {
        if (actionLoadingIds.has(userId)) return
        setActionLoadingIds((prev) => new Set(prev).add(userId))
        await onCancelInvite(userId)
        setActionLoadingIds((prev) => {
            const next = new Set(prev)
            next.delete(userId)
            return next
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title='Invite Member'>
            <div className='space-y-4'>
                <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted' size={18} />
                    <input
                        type='text'
                        placeholder='Search username (min 6 chars)...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full rounded-xl border border-border bg-secondary/50 py-3 pl-10 pr-4 text-sm text-main placeholder-muted outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand'
                    />
                </div>

                <div className='min-h-[200px]'>
                    {searchQuery.length > 0 && searchQuery.length < 6 ? (
                        <p className='text-center text-sm text-muted mt-8'>
                            Type at least 6 characters to search
                        </p>
                    ) : isSearching ? (
                        <div className='flex justify-center mt-8'>
                            <div className='h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent' />
                        </div>
                    ) : users.length > 0 ? (
                        <div className='space-y-3 mt-4 max-h-[300px] overflow-y-auto thin-scrollbar pr-2'>
                            {users.map((user) => {
                                const existingInvite = localInvitations.find((inv) => inv.user.id === user.id)
                                const isInvited = existingInvite && existingInvite.status === 'pending'
                                return (
                                    <div
                                        key={user.id}
                                        className='flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-secondary/20 p-3'
                                    >
                                        <div className='flex items-center gap-3 overflow-hidden'>
                                            <div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-secondary'>
                                                {user.image ? (
                                                    <Image
                                                        src={user.image}
                                                        alt={user.name}
                                                        fill
                                                        className='object-cover'
                                                    />
                                                ) : (
                                                    <UserIcon size={20} className='m-auto h-full w-full p-2' />
                                                )}
                                            </div>
                                            <div className='min-w-0'>
                                                <p className='truncate text-sm font-bold text-main'>{user.name}</p>
                                                <p className='truncate text-xs text-muted'>@{user.username}</p>
                                            </div>
                                        </div>
                                        <div className='flex-shrink-0'>
                                            {isInvited ? (
                                                <Button
                                                    onClick={() => handleCancel(user.id)}
                                                    isLoading={actionLoadingIds.has(user.id)}
                                                    variant='secondary'
                                                    size='sm'
                                                    className='px-4'
                                                >
                                                    Cancel
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleInvite(user.id)}
                                                    isLoading={actionLoadingIds.has(user.id)}
                                                    variant='brand'
                                                    size='sm'
                                                    className='px-4'
                                                >
                                                    Invite
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : searchQuery.length >= 6 ? (
                        <p className='text-center text-sm text-muted mt-8'>No users found.</p>
                    ) : (
                        <p className='text-center text-sm text-muted mt-8'>
                            Search for users to invite them to your publication.
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    )
}
