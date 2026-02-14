'use client'

import { useState } from 'react'
import { AlignLeft, AlignCenter, AlignRight, Trash2, Maximize, CornerDownLeft } from 'lucide-react'

export default function Image({
	id,
	w,
	align = 'center',
	src,
	update,
	onFocus,
	raw,
	insertBlock,
}: any) {
	const [width, setWidth] = useState(Number(w) || 700)
	const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>(align)
	const [tab, setTab] = useState<'url' | 'upload'>('url')
	const [tempUrl, setTempUrl] = useState('')

	const updateBlock = (newW: number, newAlign: string) => {
		update(`![${newW}|${newAlign}](${src})`)
	}

	const handleWrapperKeyDown = (e: React.KeyboardEvent) => {
		if (e.target !== e.currentTarget) return

		if (e.key === 'Backspace' || e.key === 'Delete') {
			e.preventDefault()
			update(null)
		} else if (e.key === 'Enter') {
			e.preventDefault()
			insertBlock('<br>') // Inserts text block below
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
			e.preventDefault()
			navigator.clipboard.writeText(raw)
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
			e.preventDefault()
			navigator.clipboard.writeText(raw)
			update(null)
		}
	}

	const handleWrapperPaste = (e: React.ClipboardEvent) => {
		if (e.target === e.currentTarget) {
			e.preventDefault()
			const text = e.clipboardData.getData('text/plain')
			if (text) insertBlock(text.trim())
		}
	}

	if (!src) {
		return (
			<div
				id={id}
				tabIndex={0}
				onFocus={onFocus}
				onKeyDown={handleWrapperKeyDown}
				onPaste={handleWrapperPaste}
				className='my-xl border border-border rounded-lg p-md outline-none focus:border-brand focus:ring-1 ring-brand transition-all'
			>
				<div className='flex gap-4 mb-3 text-sm items-center'>
					<button
						onClick={() => setTab('url')}
						className={`transition-colors font-medium ${tab === 'url' ? 'text-brand' : 'text-subtle hover:text-main'}`}
					>
						Image URL
					</button>
					<button
						onClick={() => setTab('upload')}
						className={`transition-colors font-medium ${tab === 'upload' ? 'text-brand' : 'text-subtle hover:text-main'}`}
					>
						Upload
					</button>
					<button
						onClick={() => update(null)}
						className='ml-auto text-subtle hover:text-error transition-colors p-1'
						title='Cancel'
					>
						<Trash2 size={16} />
					</button>
				</div>
				{tab === 'url' && (
					<div className='flex gap-3'>
						<input
							value={tempUrl}
							onChange={(e) => setTempUrl(e.target.value)}
							placeholder='Paste image URL...'
							className='flex-1 border border-border bg-transparent text-main rounded-md px-3 py-1.5 text-sm outline-none focus:outline-none transition-all'
							onKeyDown={(e) => {
								e.stopPropagation()
								if (e.key === 'Enter' && tempUrl)
									update(`![${width}|${alignment}](${tempUrl})`)
							}}
						/>
						<button
							onClick={() => {
								if (tempUrl) update(`![${width}|${alignment}](${tempUrl})`)
							}}
							className='px-4 py-1.5 bg-main text-inverse rounded-md text-sm font-medium hover:opacity-80 transition-opacity'
						>
							Add
						</button>
					</div>
				)}
				{tab === 'upload' && (
					<div className='text-sm text-muted py-2'>Upload not available right now.</div>
				)}
			</div>
		)
	}

	const alignClass =
		alignment === 'left' ? 'mr-auto' : alignment === 'right' ? 'ml-auto' : 'mx-auto'

	return (
		<div id={id} className='my-xl flex flex-col'>
			<div
				tabIndex={0}
				onFocus={onFocus}
				onKeyDown={handleWrapperKeyDown}
				onPaste={handleWrapperPaste}
				className={`relative inline-block group ${alignClass} outline-none focus:ring-1 ring-brand rounded-lg`}
				style={{ width, maxWidth: '100%' }}
			>
				<img
					src={src}
					className='w-full rounded-lg shadow-sm border border-border block'
					alt='Content'
				/>

				<div className='absolute top-4 left-1/2 -translate-x-1/2 bg-elevated border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md flex gap-1 p-1 z-20'>
					<button
						onClick={() => {
							setAlignment('left')
							updateBlock(width, 'left')
						}}
						className={`p-1.5 rounded hover:bg-secondary ${alignment === 'left' ? 'text-brand' : 'text-subtle'}`}
						title='Align Left'
					>
						<AlignLeft size={16} />
					</button>
					<button
						onClick={() => {
							setAlignment('center')
							updateBlock(width, 'center')
						}}
						className={`p-1.5 rounded hover:bg-secondary ${alignment === 'center' ? 'text-brand' : 'text-subtle'}`}
						title='Align Center'
					>
						<AlignCenter size={16} />
					</button>
					<button
						onClick={() => {
							setAlignment('right')
							updateBlock(width, 'right')
						}}
						className={`p-1.5 rounded hover:bg-secondary ${alignment === 'right' ? 'text-brand' : 'text-subtle'}`}
						title='Align Right'
					>
						<AlignRight size={16} />
					</button>
					<div className='w-px bg-border mx-1'></div>
					<button
						onClick={() => update(null)}
						className='p-1.5 rounded hover:bg-error/10 text-error'
						title='Remove Image'
					>
						<Trash2 size={16} />
					</button>
				</div>

				<div
					className='absolute right-0 bottom-0 w-6 h-6 bg-main text-inverse flex items-center justify-center cursor-se-resize rounded-tl-lg rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity z-10'
					onMouseDown={(e) => {
						e.preventDefault()
						const startX = e.clientX
						const startW = width
						const move = (ev: MouseEvent) =>
							setWidth(Math.max(200, startW + (ev.clientX - startX)))
						const up = () => {
							window.removeEventListener('mousemove', move)
							window.removeEventListener('mouseup', up)
							updateBlock(width, alignment)
						}
						window.addEventListener('mousemove', move)
						window.addEventListener('mouseup', up)
					}}
				>
					<Maximize size={12} className='rotate-90' />
				</div>
			</div>
		</div>
	)
}
