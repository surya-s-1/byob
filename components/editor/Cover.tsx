'use client'

import { useState } from 'react'
import { Trash2, CornerDownLeft } from 'lucide-react'

export default function Cover({ cover, setCover, readOnly }: any) {
	const [tab, setTab] = useState<'url' | 'upload'>('url')
	const [url, setUrl] = useState('')

	if (cover) {
		return (
			<div className='group relative mb-xl'>
				<div className='aspect-[2/1] w-full overflow-hidden rounded-lg border border-border bg-secondary'>
					<img src={cover} alt='Cover' className='h-full w-full object-cover' />
				</div>
				{!readOnly && (
					<button
						onClick={() => {
							setUrl('')
							setCover('')
						}}
						className='absolute right-4 bottom-4 rounded-md bg-elevated/50 p-1.5 text-subtle opacity-0 shadow-md transition-colors transition-opacity group-hover:opacity-100 hover:text-error'
					>
						<Trash2 size={16} />
					</button>
				)}
			</div>
		)
	}

	if (readOnly) return null

	return (
		<div className='mb-xl rounded-lg border border-border p-md'>
			<div className='mb-3 flex gap-4 px-2 text-sm'>
				<span className='font-semibold'>Cover Image</span>
				<button
					onClick={() => setTab('url')}
					className={`font-medium transition-colors ${tab === 'url' ? 'text-brand' : 'text-subtle hover:text-main'}`}
				>
					URL
				</button>
				<button
					onClick={() => setTab('upload')}
					className={`font-medium transition-colors ${tab === 'upload' ? 'text-brand' : 'text-subtle hover:text-main'}`}
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
						className='flex-1 rounded-md border border-border bg-transparent px-3 py-1.5 text-sm text-main transition-all outline-none'
						onKeyDown={(e) => {
							e.stopPropagation()
							if (e.key === 'Enter' && url.trim()) setCover(url.trim())
						}}
					/>
					<button
						onClick={() => {
							if (url.trim()) setCover(url.trim())
						}}
						className='flex items-center gap-1 rounded-md bg-main px-4 py-1.5 text-sm font-medium text-inverse transition-opacity hover:opacity-80'
					>
						<CornerDownLeft size={16} />
					</button>
				</div>
			)}
			{tab === 'upload' && (
				<div className='p-2 text-sm text-muted'>Upload not available right now.</div>
			)}
		</div>
	)
}
