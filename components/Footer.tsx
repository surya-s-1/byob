import { SquareArrowOutUpRight } from 'lucide-react'
import React from 'react'

export default function Footer() {
    return (
        <footer className='py-xl px-xl mt-auto border-t border-border bg-secondary'>
            <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-md'>
                <div className='flex items-center gap-1 text-subtle text-sm italic'>
                    <span>Running Head | Made by </span>
                    <a 
                        href='https://github.com/surya-s-1' 
                        target='_blank' 
                        className='flex items-center gap-1 font-bold underline bg-[image:var(--brand-primary)] bg-clip-text text-transparent'
                    >
                        Surya S
                        <SquareArrowOutUpRight color='indigo' size={16} />
                    </a>
                </div>
                <div className='flex gap-xl text-sm text-subtle'>
                    <a href='/about' className='hover:text-main transition-colors'>
                        About
                    </a>
                    <a href='/terms' className='hover:text-main transition-colors'>
                        Terms
                    </a>
                </div>
            </div>
        </footer>
    )
}
