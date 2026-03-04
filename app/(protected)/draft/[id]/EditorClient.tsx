'use client'

import React, { useState } from 'react'
import Head from '@/components/editor/Head'
import Content from '@/components/editor/Content'
import EditorSidebar from '@/components/editor/EditorSidebar'
import Button from '@/components/ui/Button'
import { Draft, User } from '@/types'
import { Settings, ChevronRight, Check, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

import Modal from '@/components/ui/Modal'

interface EditorClientProps {
    draft: Draft
    currentUser: any
    userRole?: string
}

export default function EditorClient({ draft: initialDraft, currentUser, userRole }: EditorClientProps) {
    const router = useRouter()
    const [draft, setDraft] = useState(initialDraft)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved')
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const isPrimaryAuthor = draft.authors.find((a) => a.id === currentUser?.id)?.isPrimary || false
    const canManagePrimary = userRole === 'OWNER' || userRole === 'ADMIN' || isPrimaryAuthor

    const handleSaveAuthors = async (authorsData: { userId: string; isPrimary: boolean }[]) => {
        setSaveState('saving')
        try {
            const res = await fetch(`/api/drafts/${draft.id}/authors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authors: authorsData }),
            })
            if (res.ok) {
                setSaveState('saved')
            } else {
                setSaveState('error')
            }
        } catch (error) {
            console.error('Error saving authors:', error)
            setSaveState('error')
        }
    }

    const handleSaveSettings = async (settings: Partial<Draft>) => {
        // Prevent empty saves if values didn't actually change
        let hasChanges = false
        for (const key in settings) {
            if ((settings as any)[key] !== (draft as any)[key]) {
                hasChanges = true
                break
            }
        }
        if (!hasChanges) return

        setSaveState('saving')

        let authorsToUpdate = null
        // If current user is making an edit and isn't an author, add them
        if (currentUser && !draft.authors.some((a) => a.id === currentUser.id)) {
            const newAuthors = [
                ...draft.authors,
                {
                    id: currentUser.id,
                    name: currentUser.name,
                    image: currentUser.image,
                    isPrimary: draft.authors.length === 0, // If first author, make primary
                },
            ]
            authorsToUpdate = newAuthors

            // Save authors via the dedicated endpoint
            await handleSaveAuthors(newAuthors.map((a) => ({ userId: a.id, isPrimary: a.isPrimary })))
        }

        try {
            const res = await fetch(`/api/drafts/${draft.id}/save`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })
            if (res.ok) {
                setDraft(
                    (prev) =>
                    ({
                        ...prev,
                        ...settings,
                        ...(authorsToUpdate ? { authors: authorsToUpdate } : {}),
                    } as Draft)
                )
                setSaveState('saved')
            } else {
                setSaveState('error')
            }
        } catch (error) {
            console.error('Error saving draft settings:', error)
            setSaveState('error')
        }
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
        <div className='flex h-screen overflow-hidden bg-primary text-main'>
            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} title='Delete Draft'>
                <div className='space-y-6'>
                    <p className='text-subtle'>
                        Are you sure you want to delete this draft? This action cannot be undone and will permanently
                        remove the content from the publication.
                    </p>
                    <div className='flex justify-end gap-3'>
                        <Button variant='ghost' onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant='danger' onClick={handleDelete}>
                            Delete Permanently
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Main Editor Area */}
            <div className='flex flex-1 flex-col overflow-y-auto no-scrollbar'>
                {/* Top Bar / Header */}
                <header className='sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-primary/80 px-4 backdrop-blur-md'>
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => router.push(`/publication/${draft.publication?.slug}`)}
                            className='text-xs font-bold text-subtle hover:text-main'
                        >
                            Back to {draft.publication?.displayName}
                        </Button>
                        <span className='h-4 w-px bg-border'></span>
                        <p
                            className={cn(
                                'text-[10px] font-medium uppercase tracking-widest transition-colors',
                                saveState === 'error' ? 'text-red-500' : 'text-muted'
                            )}
                        >
                            {saveState === 'saving'
                                ? 'Saving...'
                                : saveState === 'saved'
                                    ? 'All changes saved'
                                    : saveState === 'error'
                                        ? 'Error saving'
                                        : 'Unsaved changes'}
                        </p>
                    </div>

                    <div className='flex items-center gap-2'>
                        <Button
                            variant={isSidebarOpen ? 'secondary' : 'ghost'}
                            size='sm'
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={cn(
                                'h-8 w-8 p-0 transition-all duration-200',
                                isSidebarOpen && 'bg-brand/10 text-brand hover:bg-brand/20'
                            )}
                        >
                            <Settings size={18} />
                        </Button>
                    </div>
                </header>

                <div className='mx-auto w-full max-w-4xl flex-1 px-6 py-12 lg:px-12'>
                    <Head draft={draft} onSave={(data: any) => handleSaveSettings(data)} />
                    <Content initialMarkdown={draft.content || ''} onSave={(data: any) => handleSaveSettings(data)} />
                </div>
            </div>

            {/* Sidebar Area */}
            <aside
                className={cn(
                    'fixed right-0 top-0 bottom-0 z-40 w-full max-w-[320px] transition-transform duration-300 lg:relative lg:translate-x-0',
                    !isSidebarOpen && 'translate-x-full lg:hidden'
                )}
            >
                <EditorSidebar
                    draft={draft}
                    onSaveSettings={handleSaveSettings}
                    onSaveAuthors={handleSaveAuthors}
                    onPublish={handlePublish}
                    onDelete={() => setIsDeleteDialogOpen(true)}
                    userRole={userRole}
                    isPrimaryAuthor={isPrimaryAuthor}
                />

                {/* Mobile Close Handle */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className='absolute -left-10 top-20 flex h-10 w-10 items-center justify-center rounded-l-xl bg-brand text-white shadow-xl lg:hidden'
                    >
                        <Settings size={20} />
                    </button>
                )}
            </aside>
        </div>
    )
}

