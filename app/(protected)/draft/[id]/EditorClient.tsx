'use client'

import React, { useState, useEffect } from 'react'
import Head from '@/components/editor/Head'
import Content from '@/components/editor/Content'
import EditorSidebar from '@/components/editor/EditorSidebar'
import Button from '@/components/ui/Button'
import { Draft, User } from '@/types'
import { ArrowLeft, Check, Loader2, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/context/SidebarContext'

import Modal from '@/components/ui/Modal'

interface EditorClientProps {
    draft: Draft
    currentUser: any
    userRole?: string
}

export default function EditorClient({ draft: initialDraft, currentUser, userRole }: EditorClientProps) {
    const router = useRouter()
    const [draft, setDraft] = useState(initialDraft)
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved')
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    const { setSecondarySidebar, setSecondaryIcon } = useSidebar()

    const isPrimaryAuthor = draft.authors.find((a) => a.id === currentUser?.id)?.isPrimary || false

    // Confirmation on leave
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges || saveState === 'saving') {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges, saveState])

    // Autosave logic (15s inactivity)
    useEffect(() => {
        if (!hasUnsavedChanges) return

        const timeoutId = setTimeout(() => {
            handleActualSave()
        }, 15000)

        return () => clearTimeout(timeoutId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasUnsavedChanges, draft])

    const handleActualSave = async () => {
        if (!hasUnsavedChanges) return
        setSaveState('saving')
        setHasUnsavedChanges(false)

        try {
            const res = await fetch(`/api/drafts/${draft.id}/save`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: draft.title,
                    subtitle: draft.subtitle,
                    content: draft.content,
                    cover: draft.cover,
                }),
            })
            if (res.ok) {
                setSaveState('saved')
            } else {
                setSaveState('error')
                setHasUnsavedChanges(true) // Retry later
            }
        } catch (error) {
            console.error('Error saving draft settings:', error)
            setSaveState('error')
            setHasUnsavedChanges(true)
        }
    }

    // Update the sidebar whenever draft or saveState changes
    useEffect(() => {
        setSecondarySidebar(
            <EditorSidebar
                draft={draft}
                onSaveSettings={handleSaveSidebarSettings}
                onSaveAuthors={handleSaveAuthors}
                onPublish={handlePublish}
                onDelete={() => setIsDeleteDialogOpen(true)}
                userRole={userRole}
                isPrimaryAuthor={isPrimaryAuthor}
            />
        )
        setSecondaryIcon(<Settings size={20} />)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft, userRole, isPrimaryAuthor])

    const handleSaveAuthors = async (authorsData: { userId: string; isPrimary: boolean }[], newAuthorsList?: any[]) => {
        if (newAuthorsList) {
            setDraft((prev) => ({ ...prev, authors: newAuthorsList }))
        }

        const res = await fetch(`/api/drafts/${draft.id}/authors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authors: authorsData }),
        })
        if (!res.ok) {
            throw new Error('Failed to save authors')
        }
    }

    const handleSaveSidebarSettings = async (settings: Partial<Draft>) => {
        setDraft((prev) => ({ ...prev, ...settings } as Draft))
        const res = await fetch(`/api/drafts/${draft.id}/save`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        })
        if (!res.ok) {
            throw new Error('Failed to save sidebar settings')
        }
    }

    const handleSaveSettings = async (settings: Partial<Draft>) => {
        // Update local state immediately
        setDraft((prev) => ({ ...prev, ...settings } as Draft))
        setHasUnsavedChanges(true)
        setSaveState('idle')
    }

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/drafts/${draft.id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                router.push(`/publication/${draft.publication?.slug}`)
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to delete draft')
            }
        } catch (error) {
            console.error('Error deleting draft:', error)
            alert('An error occurred while deleting the draft.')
        }
    }

    const handlePublish = async () => {
        // If there are unsaved changes, save them first
        if (hasUnsavedChanges) {
            await handleActualSave()
        }

        // Validation: check for at least one primary author
        const hasPrimary = draft.authors.some((a) => a.isPrimary)
        if (!hasPrimary) {
            alert('Please mark at least one author as Primary before publishing.')
            return
        }

        try {
            const res = await fetch(`/api/drafts/${draft.id}/publish`, {
                method: 'POST',
            })
            if (res.ok) {
                const data = await res.json()
                if (data.status === 'PUBLISHED') {
                    router.push(`/publication/${draft.publication?.slug}`)
                } else {
                    // Scheduled
                    router.push(`/publication/${draft.publication?.slug}?tab=drafts`)
                }
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to publish')
            }
        } catch (error) {
            console.error('Error publishing:', error)
            alert('An error occurred while publishing.')
        }
    }

    return (
        <div className='flex flex-col bg-primary text-main w-full h-full md:w-[90%] lg:w-[70%]'>
            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} title='Delete Draft'>
                <div className='space-y-2xl'>
                    <p className='text-subtle'>
                        Are you sure you want to delete this draft? This action cannot be undone and will permanently
                        remove the content from the publication.
                    </p>
                    <div className='flex flex-col items-center md:flex-row-reverse gap-md'>
                        <Button variant='danger' onClick={handleDelete}>
                            Delete Permanently
                        </Button>
                        <Button variant='ghost' onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Main Editor Area */}
            <div className='flex flex-1 flex-col overflow-y-auto no-scrollbar'>
                <header className='sticky top-0 z-30 border-b border-border bg-primary/80 backdrop-blur-md'>
                    <div className='flex h-14 w-full items-center justify-between px-2xl lg:px-5xl'>
                        <div className='flex items-center justify-start'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => router.push(`/publication/${draft.publication?.slug}`)}
                                className='-ml-md flex items-center gap-sm text-sm font-bold text-subtle hover:text-main'
                            >
                                <ArrowLeft size={16} />
                                <span className='hidden sm:inline'>Back to </span>
                                <span className='truncate max-w-[120px] md:max-w-none'>
                                    {draft.publication?.displayName}
                                </span>
                            </Button>
                        </div>

                        <div className='flex items-center justify-end gap-lg'>
                            <div
                                className={cn(
                                    'flex items-center gap-sm text-[10px] font-bold uppercase tracking-widest transition-colors',
                                    saveState === 'error' ? 'text-red-500' : 'text-muted'
                                )}
                            >
                                {(saveState === 'saving' || hasUnsavedChanges || saveState === 'idle') && <Loader2 size={12} className='animate-spin' />}
                                {saveState === 'saved' && !hasUnsavedChanges && <Check size={12} className='text-brand' />}
                                {saveState === 'saving'
                                    ? 'Saving...'
                                    : hasUnsavedChanges || saveState === 'idle'
                                        ? 'Unsaved changes'
                                        : saveState === 'error'
                                            ? 'Error saving'
                                            : 'Changes saved'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className='mx-auto w-full flex-1 px-2xl py-5xl lg:px-5xl'>
                    <Head draft={draft} onSave={(data: any) => handleSaveSettings(data)} />
                    <Content
                        initialMarkdown={draft.content || ''}
                        onSave={(data: any) => handleSaveSettings(data)}
                        saveStatus={saveState}
                    />
                </div>
            </div >
        </div >
    )
}
