'use client'

import { useState } from 'react'
import { Trash2, CornerDownLeft } from 'lucide-react'

export default function Cover({ cover, setCover, readOnly }: any) {
	const [tab, setTab] = useState<'url' | 'upload'>('url')
	const [url, setUrl] = useState('')

	if (cover) {
		return (
			<div className='relative mb-xl group'>
				<div className='w-full aspect-[2/1] overflow-hidden rounded-lg bg-secondary border border-border'>
					<img src={cover} alt='Cover' className='w-full h-full object-cover' />
				</div>
				{!readOnly && (
					<button
						onClick={() => setCover('')}
						className='absolute bottom-4 right-4 bg-elevated/90 text-main border border-border text-sm px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-secondary flex items-center gap-2'
					>
						<Trash2 size={16} /> Remove
					</button>
				)}
			</div>
		)
	}

	if (readOnly) return null

	return (
		<div className='mb-xl border border-border rounded-lg p-md'>
			<div className='flex gap-4 px-2 mb-3 text-sm'>
				<button
					onClick={() => setTab('url')}
					className={`transition-colors font-medium ${tab === 'url' ? 'text-brand' : 'text-subtle hover:text-main'}`}
				>
					URL
				</button>
				<button
					onClick={() => setTab('upload')}
					className={`transition-colors font-medium ${tab === 'upload' ? 'text-brand' : 'text-subtle hover:text-main'}`}
				>
					Upload
				</button>
			</div>

			{tab === 'url' && (
				<div className='flex gap-3'>
					<input
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder='Paste image URL...'
						className='flex-1 border border-border bg-transparent text-main rounded-md px-3 py-1.5 text-sm outline-none transition-all'
						onKeyDown={(e) => {
							e.stopPropagation()
							if (e.key === 'Enter' && url.trim()) setCover(url.trim())
						}}
					/>
					<button
						onClick={() => {
							if (url.trim()) setCover(url.trim())
						}}
						className='px-4 py-1.5 bg-main text-inverse rounded-md text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-1'
					>
						<CornerDownLeft size={16} />
					</button>
				</div>
			)}
			{tab === 'upload' && (
				<div className='text-sm text-muted p-2'>Upload not available right now.</div>
			)}
		</div>
	)
}
