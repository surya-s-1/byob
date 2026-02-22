'use client'

import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!isOpen || !mounted) return null

    return createPortal(
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm'>
            <div className='relative flex min-h-[200px] w-full max-w-4xl flex-col rounded-3xl border border-border/50 bg-transparent shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-300 md:w-[70vw] lg:w-[50vw]'>
                <button
                    onClick={onClose}
                    className='fixed right-4 top-4 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 sm:absolute sm:-right-14 sm:top-0 sm:h-12 sm:w-12'
                    aria-label='Close'
                >
                    <X size={24} />
                </button>

                <div className='border-b border-border/50 rounded-t-3xl bg-primary px-8 py-5'>
                    <h2 className='text-xl font-extrabold text-main'>{title}</h2>
                </div>
                <div className='flex-1 overflow-y-auto bg-primary p-8 rounded-b-3xl'>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}
