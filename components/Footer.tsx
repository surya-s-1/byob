import { SquareArrowOutUpRight } from 'lucide-react'
import React from 'react'

export default function Footer() {
	return (
		<footer className='w-full mt-auto border-t border-border bg-secondary px-xl py-xl'>
			<div className='flex flex-col items-center justify-between gap-md md:flex-row'>
				<div className='flex items-center gap-xs text-sm text-subtle italic'>
					<span>Running Head | Made by </span>
					<a
						href='https://github.com/surya-s-1'
						target='_blank'
						className='flex items-center gap-xs bg-brand bg-clip-text font-bold text-transparent underline'
					>
						Surya S
						<SquareArrowOutUpRight color='indigo' size={16} />
					</a>
				</div>
				<div className='flex gap-xl text-sm text-subtle'>
					<a href='/about' className='transition-colors hover:text-main'>
						About
					</a>
					<a href='/terms' className='transition-colors hover:text-main'>
						Terms
					</a>
				</div>
			</div>
		</footer>
	)
}
