'use client'

import { useEffect, useState } from 'react'
import Modal from './Modal'
import UserCard from './UserCard'
import { Users } from 'lucide-react'

interface UsersListModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    endpoint: string
    currentUser: any | null
    emptyMessage: string
    isMembersModal?: boolean
}

export default function UsersListModal({
    isOpen,
    onClose,
    title,
    endpoint,
    currentUser,
    emptyMessage,
    isMembersModal = false,
}: UsersListModalProps) {
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) return

        const fetchUsers = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const res = await fetch(endpoint)
                if (!res.ok) {
                    throw new Error('Failed to fetch users')
                }
                const data = await res.json()
                let usersList = []

                if (data.followers) {
                    usersList = data.followers
                } else if (data.following) {
                    usersList = data.following
                } else if (data.members) {
                    // For members, format the data properly
                    usersList = data.members.map((member: any) => ({
                        ...member.user,
                        role: member.role,
                        joinedAt: member.joinedAt,
                    }))
                }

                setUsers(usersList)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
                setUsers([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchUsers()
    }, [isOpen, endpoint])

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'OWNER':
                return 'text-yellow-500'
            case 'ADMIN':
                return 'text-red-500'
            case 'EDITOR':
                return 'text-blue-500'
            case 'REVIEWER':
                return 'text-green-500'
            default:
                return 'text-subtle'
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className='space-y-lg'>
                {!currentUser ? (
                    <div className='space-y-lg rounded-2xl border border-dashed border-border/50 bg-secondary/20 py-5xl text-center'>
                        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50'>
                            <Users size={32} className='text-muted/30' />
                        </div>
                        <div>
                            <p className='font-medium text-subtle'>Please log in to view</p>
                            <p className='text-sm text-muted'>Sign in to see the full list of people</p>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className='space-y-lg'>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className='h-20 animate-pulse rounded-2xl bg-secondary/50' />
                        ))}
                    </div>
                ) : error ? (
                    <div className='space-y-lg rounded-2xl border border-dashed border-border/50 bg-secondary/20 py-5xl text-center'>
                        <p className='font-medium text-error'>{error}</p>
                    </div>
                ) : users.length > 0 ? (
                    users.map((user: any) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            currentUser={currentUser}
                            metadata={
                                isMembersModal && user.role
                                    ? {
                                        label: user.role,
                                        className: getRoleColor(user.role),
                                    }
                                    : undefined
                            }
                            hideFollowButton={isMembersModal}
                        />
                    ))
                ) : (
                    <div className='space-y-lg rounded-2xl border border-dashed border-border/50 bg-secondary/20 py-5xl text-center'>
                        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50'>
                            <Users size={32} className='text-muted/30' />
                        </div>
                        <p className='font-medium text-muted'>{emptyMessage}</p>
                    </div>
                )}
            </div>
        </Modal>
    )
}
