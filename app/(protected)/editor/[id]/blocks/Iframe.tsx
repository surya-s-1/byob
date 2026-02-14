'use client'

import { useState } from 'react'
import { AlignLeft, AlignCenter, AlignRight, Trash2, Edit2, Maximize } from 'lucide-react'

export default function Iframe({
	id,
	src,
	w,
	h,
	align = 'center',
	update,
	onFocus,
	raw,
	insertBlock,
}: any) {
	const [width, setWidth] = useState(Number(w) || 600)
	const [height, setHeight] = useState(Number(h) || 400)
	const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>(align)
	const [isResizing, setIsResizing] = useState(false)
	const [showEditUrl, setShowEditUrl] = useState(false)
	const [tempUrl, setTempUrl] = useState(src)

	const updateBlock = (newW: number, newH: number, newAlign: string, newSrc: string) => {
		update(`::iframe[${newW}x${newH}|${newAlign}](${newSrc})`)
	}

	const alignClass =
		alignment === 'left' ? 'mr-auto' : alignment === 'right' ? 'ml-auto' : 'mx-auto'

	const handleWrapperKeyDown = (e: React.KeyboardEvent) => {
		if (e.target !== e.currentTarget || showEditUrl) return

		if (e.key === 'Backspace' || e.key === 'Delete') {
			e.preventDefault()
			update(null)
		} else if (e.key === 'Enter') {
			e.preventDefault()
			insertBlock('<br>')
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

	return (
		<div id={id} className='my-xl flex flex-col relative'>
			<div
				tabIndex={0}
				onFocus={onFocus}
				onKeyDown={handleWrapperKeyDown}
				onPaste={handleWrapperPaste}
				className={`relative group inline-block ${alignClass} outline-none focus:ring-1 ring-brand rounded-lg`}
				style={{ width, height, maxWidth: '100%' }}
			>
				<iframe
					src={src}
					className={`w-full h-full rounded-md border border-border shadow-sm bg-secondary ${isResizing ? 'pointer-events-none' : ''}`}
				/>

				<div className='absolute top-4 left-1/2 -translate-x-1/2 bg-elevated border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md flex gap-1 p-1 z-20'>
					<button
						onClick={() => {
							setAlignment('left')
							updateBlock(width, height, 'left', src)
						}}
						className={`p-1.5 rounded hover:bg-secondary ${alignment === 'left' ? 'text-brand' : 'text-subtle'}`}
						title='Align Left'
					>
						<AlignLeft size={16} />
					</button>
					<button
						onClick={() => {
							setAlignment('center')
							updateBlock(width, height, 'center', src)
						}}
						className={`p-1.5 rounded hover:bg-secondary ${alignment === 'center' ? 'text-brand' : 'text-subtle'}`}
						title='Align Center'
					>
						<AlignCenter size={16} />
					</button>
					<button
						onClick={() => {
							setAlignment('right')
							updateBlock(width, height, 'right', src)
						}}
						className={`p-1.5 rounded hover:bg-secondary ${alignment === 'right' ? 'text-brand' : 'text-subtle'}`}
						title='Align Right'
					>
						<AlignRight size={16} />
					</button>
					<div className='w-px bg-border mx-1'></div>
					<button
						onClick={() => {
							setTempUrl(src)
							setShowEditUrl(true)
						}}
						className='p-1.5 rounded hover:bg-secondary text-subtle'
						title='Edit URL'
					>
						<Edit2 size={16} />
					</button>
					<div className='w-px bg-border mx-1'></div>
					<button
						onClick={() => update(null)}
						className='p-1.5 rounded hover:bg-error/10 text-error'
						title='Remove Iframe'
					>
						<Trash2 size={16} />
					</button>
				</div>

				{showEditUrl && (
					<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-elevated border border-border p-3 rounded-md shadow-xl z-30 flex gap-2 items-center w-[90%] max-w-100'>
						<input
							autoFocus
							value={tempUrl}
							onChange={(e) => setTempUrl(e.target.value)}
							className='flex-1 bg-secondary text-main border border-border px-3 py-1.5 rounded-sm outline-none focus:border-brand focus:ring-1 ring-brand text-sm transition-all'
							placeholder='Enter iframe URL...'
							onKeyDown={(e) => {
								e.stopPropagation()
								if (e.key === 'Enter' && tempUrl) {
									updateBlock(width, height, alignment, tempUrl)
									setShowEditUrl(false)
								}
								if (e.key === 'Escape') setShowEditUrl(false)
							}}
						/>
						<button
							onClick={() => {
								updateBlock(width, height, alignment, tempUrl)
								setShowEditUrl(false)
							}}
							className='bg-main text-inverse px-3 py-1.5 rounded-sm text-sm'
						>
							Save
						</button>
						<button
							onClick={() => setShowEditUrl(false)}
							className='text-subtle text-sm px-2 hover:text-main'
						>
							Cancel
						</button>
					</div>
				)}

				<div
					className='absolute right-0 bottom-0 w-6 h-6 bg-main text-inverse flex items-center justify-center cursor-se-resize rounded-tl-lg rounded-br-md opacity-0 group-hover:opacity-100 transition-opacity z-10'
					onMouseDown={(e) => {
						e.preventDefault()
						setIsResizing(true)
						const startX = e.clientX
						const startY = e.clientY
						const startW = width
						const startH = height

						const move = (ev: MouseEvent) => {
							setWidth(Math.max(300, startW + (ev.clientX - startX)))
							setHeight(Math.max(200, startH + (ev.clientY - startY)))
						}
						const up = () => {
							setIsResizing(false)
							window.removeEventListener('mousemove', move)
							window.removeEventListener('mouseup', up)
							updateBlock(width, height, alignment, src)
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
