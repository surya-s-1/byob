import React from 'react'

export default function Footer() {
    return (
        <footer className='py-xl px-xl mt-auto border-t border-border bg-secondary'>
            <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-md'>
                <div className='text-subtle text-sm italic'>
                    Running Head | Made by <a href='https://github.com/surya-s-1' target='_blank' className='font-bold underline'>Surya S</a>
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
