'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, Eye, Lock, Globe, Search, X, Shield, Plus, Check, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Draft, User } from '@/types'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface EditorSidebarProps {
    draft: Draft
    onSaveSettings: (settings: Partial<Draft>) => Promise<void>
    onSaveAuthors: (authors: { userId: string; isPrimary: boolean }[], fullList?: any[]) => Promise<void>
    onPublish: () => Promise<void>
    onDelete: () => void
    userRole?: string
    isPrimaryAuthor?: boolean
}

export default function EditorSidebar({
    draft,
    onSaveSettings,
    onSaveAuthors,
    onPublish,
    onDelete,
    userRole,
    isPrimaryAuthor,
}: EditorSidebarProps) {
    const [visibility, setVisibility] = useState(draft.articleVisibility)
    const [scheduledAt, setScheduledAt] = useState(
        draft.scheduledAt ? new Date(draft.scheduledAt).toISOString().slice(0, 16) : ''
    )
    const [authors, setAuthors] = useState(draft.authors || [])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [sidebarStatus, setSidebarStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved')

    const canManagePrimary = userRole === 'OWNER' || userRole === 'ADMIN' || isPrimaryAuthor

    // Debounced search for authors
    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.length < 3) {
                setSearchResults([])
                return
            }
            setIsSearching(true)
            try {
                const res = await fetch(
                    `/api/user/search?q=${encodeURIComponent(searchQuery)}&publicationId=${draft.publication?.id}`
                )
                if (res.ok) {
                    const data = await res.json()
                    setSearchResults(data.users || [])
                }
            } catch (error) {
                console.error('Error searching users:', error)
            } finally {
                setIsSearching(false)
            }
        }

        const timeoutId = setTimeout(searchUsers, 500)
        return () => clearTimeout(timeoutId)
    }, [searchQuery, draft.publication?.id])

    const handleSaveSettings = async (newVisibility: typeof visibility, newScheduledAt: string) => {
        setSidebarStatus('saving')
        try {
            await onSaveSettings({
                articleVisibility: newVisibility,
                scheduledAt: newScheduledAt ? new Date(newScheduledAt) : null,
            })
            setSidebarStatus('saved')
        } catch (error) {
            console.error('Error saving sidebar settings:', error)
            setSidebarStatus('error')
        }
    }

    const togglePrimaryAuthor = async (userId: string) => {
        if (!canManagePrimary) {
            alert('Only a Primary Author or Admin/Owner can manage primary author status.')
            return
        }

        const newAuthors = authors.map((a) => (a.id === userId ? { ...a, isPrimary: !a.isPrimary } : a))
        setAuthors(newAuthors)
        setSidebarStatus('saving')
        try {
            await onSaveAuthors(newAuthors.map((a) => ({ userId: a.id, isPrimary: a.isPrimary })), newAuthors)
            setSidebarStatus('saved')
        } catch {
            setSidebarStatus('error')
        }
    }

    const removeAuthor = async (userId: string) => {
        const newAuthors = authors.filter((a) => a.id !== userId)
        setAuthors(newAuthors)
        setSidebarStatus('saving')
        try {
            await onSaveAuthors(newAuthors.map((a) => ({ userId: a.id, isPrimary: a.isPrimary })), newAuthors)
            setSidebarStatus('saved')
        } catch {
            setSidebarStatus('error')
        }
    }

    const addAuthor = async (user: User) => {
        if (authors.some((a) => a.id === user.id)) return
        const isFirst = authors.length === 0
        const newAuthor = { id: user.id, name: user.name, image: user.image, isPrimary: isFirst }
        const newAuthors = [...authors, newAuthor]
        setAuthors(newAuthors)
        setSearchQuery('')
        setSearchResults([])
        setSidebarStatus('saving')
        try {
            await onSaveAuthors(newAuthors.map((a) => ({ userId: a.id, isPrimary: a.isPrimary })), newAuthors)
            setSidebarStatus('saved')
        } catch {
            setSidebarStatus('error')
        }
    }

    const handleDelete = async () => {
        if (!canManagePrimary) {
            alert('Only a Primary Author or Admin/Owner can delete this draft.')
            return
        }
        setIsDeleting(true)
        try {
            await onDelete()
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className='flex h-full flex-col overflow-y-auto bg-primary/50 backdrop-blur-sm thin-scrollbar'>
            {/* Header / Save Status */}
            <div className='flex items-center justify-between px-2xl py-lg'>
                <h2 className='text-sm font-bold text-main uppercase tracking-wider'>Settings</h2>
                <div className={cn(
                    'flex items-center gap-xs text-[10px] font-bold uppercase transition-colors',
                    sidebarStatus === 'error' ? 'text-red-500' : 'text-brand'
                )}>
                    {(sidebarStatus === 'saving' || sidebarStatus === 'idle') && <Loader2 size={10} className='animate-spin' />}
                    {sidebarStatus === 'saved' && <Check size={10} />}
                    {sidebarStatus === 'saving' ? 'Saving' : sidebarStatus === 'saved' ? 'Saved' : sidebarStatus === 'error' ? 'Error' : 'Unsaved'}
                </div>
            </div>

            <div className='flex-1 space-y-3xl p-2xl'>

                {/* Visibility Section */}
                <div className='space-y-lg'>
                    <h3 className='flex items-center gap-sm text-xs font-bold uppercase tracking-wider text-subtle'>
                        <Eye size={14} />
                        Visibility
                    </h3>
                    <div className='grid grid-cols-1 gap-sm'>
                        {[
                            { id: 'PUBLIC', icon: Globe, label: 'Public', desc: 'Anyone can read' },
                            { id: 'HIDDEN', icon: Eye, label: 'Hidden', desc: 'Only via link' },
                            { id: 'LOCKED', icon: Lock, label: 'Locked', desc: 'Members only' },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => {
                                    setVisibility(opt.id as any)
                                    handleSaveSettings(opt.id as any, scheduledAt)
                                }}
                                className={cn(
                                    'flex items-center gap-md rounded-xl border p-md text-left transition-all',
                                    visibility === opt.id
                                        ? 'border-brand bg-brand/5 ring-1 ring-brand'
                                        : 'border-border bg-secondary/20 hover:border-muted'
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-lg',
                                        visibility === opt.id ? 'bg-brand text-white' : 'bg-secondary text-subtle'
                                    )}
                                >
                                    <opt.icon size={16} />
                                </div>
                                <div className='min-w-0 flex-1'>
                                    <p className='text-sm font-bold text-main'>{opt.label}</p>
                                    <p className='truncate text-[10px] text-muted'>{opt.desc}</p>
                                </div>
                                {visibility === opt.id && (
                                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white'>
                                        <Check size={12} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scheduling Section */}
                <div className='space-y-lg'>
                    <h3 className='flex items-center gap-sm text-xs font-bold uppercase tracking-wider text-subtle'>
                        <Calendar size={14} />
                        Schedule Publish
                    </h3>
                    <div className='space-y-sm'>
                        <input
                            type='datetime-local'
                            value={scheduledAt}
                            onChange={(e) => {
                                setScheduledAt(e.target.value)
                                handleSaveSettings(visibility, e.target.value)
                            }}
                            className='w-full rounded-xl border border-border bg-secondary/30 p-md text-sm text-main outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand'
                        />
                        <p className='text-[10px] text-muted italic'>
                            Leave empty to publish immediately.
                        </p>
                    </div>
                </div>

                {/* Authors Section */}
                <div className='space-y-lg pt-lg border-t border-border/50'>
                    {draft.createdBy && (
                        <div className='flex items-center justify-between pb-sm'>
                            <h3 className='flex items-center gap-sm text-[10px] font-bold uppercase tracking-wider text-subtle'>
                                Created by
                            </h3>
                            <div className='flex items-center gap-sm'>
                                <div className='relative h-6 w-6 overflow-hidden rounded-full bg-secondary'>
                                    {draft.createdBy.image ? (
                                        <Image src={draft.createdBy.image} alt={draft.createdBy.name} fill className='object-cover' />
                                    ) : (
                                        <div className='flex h-full w-full items-center justify-center text-[10px]'>
                                            {draft.createdBy.name[0]}
                                        </div>
                                    )}
                                </div>
                                <span className='text-xs font-bold text-main'>{draft.createdBy.name}</span>
                            </div>
                        </div>
                    )}

                    <h3 className='flex items-center gap-sm text-xs font-bold uppercase tracking-wider text-subtle'>
                        <Users size={14} />
                        Authors
                    </h3>

                    {/* Current Authors */}
                    <div className='space-y-sm'>
                        {authors.map((author) => (
                            <div
                                key={author.id}
                                className='group flex items-center justify-between gap-md rounded-xl border border-border/50 bg-secondary/10 p-sm pr-md'
                            >
                                <div className='flex min-w-0 items-center gap-sm'>
                                    <div className='relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-secondary'>
                                        {author.image ? (
                                            <Image src={author.image} alt={author.name} fill className='object-cover' />
                                        ) : (
                                            <div className='flex h-full w-full items-center justify-center text-xs'>
                                                {author.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className='min-w-0'>
                                        <p className='truncate text-xs font-bold text-main'>{author.name}</p>
                                        {author.isPrimary && (
                                            <span className='rounded bg-brand/10 px-xs py-2xs text-[8px] font-bold text-brand'>
                                                PRIMARY
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className='flex items-center gap-xs transition-opacity'>
                                    <button
                                        onClick={() => togglePrimaryAuthor(author.id)}
                                        title={!canManagePrimary ? 'Insufficient permissions' : author.isPrimary ? 'Primary Author' : 'Set as Primary'}
                                        className={cn(
                                            'h-7 w-7 flex items-center justify-center rounded-lg transition-colors font-bold text-[10px]',
                                            author.isPrimary ? 'bg-brand text-white border-brand' : 'text-subtle hover:bg-secondary border border-border/50',
                                            !canManagePrimary && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        P
                                    </button>
                                    <button
                                        onClick={() => removeAuthor(author.id)}
                                        className='h-7 w-7 flex items-center justify-center rounded-lg text-subtle hover:bg-red-500/10 hover:text-red-500 border border-border/50'
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Author Search */}
                    <div className='relative'>
                        <div className='relative'>
                            <Search className='absolute left-md top-1/2 -translate-y-1/2 text-muted' size={14} />
                            <input
                                type='text'
                                placeholder='Add author by username...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full rounded-xl border border-border bg-secondary/30 py-sm pl-[36px] pr-lg text-xs text-main outline-none focus:border-brand focus:ring-1 focus:ring-brand'
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        {(searchQuery.length >= 3 || isSearching) && (
                            <div className='absolute bottom-full left-0 right-0 z-50 mb-sm max-h-[200px] overflow-y-auto rounded-xl border border-border bg-elevated p-sm shadow-2xl thin-scrollbar'>
                                {isSearching ? (
                                    <div className='flex justify-center p-lg'>
                                        <Loader2 size={16} className='animate-spin text-brand' />
                                    </div>
                                ) : searchResults.filter(u => !authors.some(a => a.id === u.id)).length > 0 ? (
                                    searchResults.filter(u => !authors.some(a => a.id === u.id)).map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => addAuthor(user)}
                                            className='flex w-full items-center gap-md rounded-lg p-sm text-left hover:bg-secondary transition-colors'
                                        >
                                            <div className='relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-secondary'>
                                                {user.image ? (
                                                    <Image src={user.image} alt={user.name} fill className='object-cover' />
                                                ) : (
                                                    <div className='flex h-full w-full items-center justify-center text-xs'>
                                                        {user.name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className='min-w-0'>
                                                <p className='truncate text-xs font-bold text-main'>{user.name}</p>
                                                <p className='truncate text-[10px] text-muted'>@{user.username}</p>
                                            </div>
                                            <Plus size={14} className='ml-auto text-brand' />
                                        </button>
                                    ))
                                ) : (
                                    <p className='p-lg text-center text-xs text-muted'>No authors found in this publication.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Action Section */}
            <div className='mt-auto border-t border-border p-2xl bg-secondary/5 space-y-md'>
                <Button
                    onClick={async () => {
                        setIsPublishing(true)
                        try {
                            await onPublish()
                        } finally {
                            setIsPublishing(false)
                        }
                    }}
                    isLoading={isPublishing}
                    variant='brand'
                    className='w-full py-4 text-base font-bold'
                >
                    {scheduledAt && new Date(scheduledAt) > new Date() ? 'Schedule Post' : 'Publish Article'}
                </Button>

                {canManagePrimary && (
                    <Button
                        onClick={handleDelete}
                        isLoading={isDeleting}
                        variant='ghost'
                        className='w-full py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 hover:text-red-500'
                    >
                        Delete Draft
                    </Button>
                )}

                {isSaving && (
                    <p className='flex items-center justify-center gap-2 text-center text-[10px] text-brand font-medium'>
                        <Loader2 size={10} className='animate-spin' />
                        Saving changes...
                    </p>
                )}
            </div>
        </div>
    )
}
