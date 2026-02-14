'use client'

import { useState } from 'react'
import { AlignLeft, AlignCenter, AlignRight, Edit2 } from 'lucide-react'

export default function Iframe({ block, update, readOnly, isFocused }: any) {
	const [showEditUrl, setShowEditUrl] = useState(false)
	const [tempUrl, setTempUrl] = useState(block.src)
	const [isResizing, setIsResizing] = useState(false)

	const getEmbedUrl = (url: string) => {
		if (!url) return ''
		if (!url.startsWith('https://')) return 'UNSUPPORTED_INSECURE'
		return url
	}

	const embedUrl = getEmbedUrl(block.src)
	const isInsecure = embedUrl === 'UNSUPPORTED_INSECURE'
	const alignClass =
		block.align === 'left' ? 'mr-auto' : block.align === 'right' ? 'ml-auto' : 'mx-auto'

	if (readOnly) {
		return (
			<div
				className={`my-8 block ${alignClass}`}
				style={{ width: block.w || 600, height: block.h || 400, maxWidth: '100%' }}
			>
				{isInsecure ? (
					<div className='w-full h-full rounded-lg border border-border bg-secondary flex flex-col items-center justify-center text-subtle text-sm gap-2 p-4 text-center'>
						<div className='bg-error/10 text-error p-2 rounded-full'>
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
						</div>
						<span className='font-bold text-main'>Unsupported Content</span>
						Only secure (https) links are allowed for embedding.
					</div>
				) : (
					<iframe
						src={embedUrl}
						className='w-full h-full rounded-lg border border-border shadow-sm bg-secondary'
						allowFullScreen
					/>
				)}
			</div>
		)
	}

	const ResizeHandle = ({ position, cursor, onDrag }: any) => (
		<div
			className={`absolute ${position} w-4 h-4 ${cursor} z-30 opacity-0 group-hover:opacity-100 transition-opacity`}
			onMouseDown={(e) => {
				e.preventDefault()
				setIsResizing(true)
				const startX = e.clientX
				const startY = e.clientY
				const startW = block.w || 600
				const startH = block.h || 400
				const move = (ev: MouseEvent) =>
					onDrag(startW, startH, startX, startY, ev.clientX, ev.clientY)
				const up = () => {
					setIsResizing(false)
					window.removeEventListener('mousemove', move)
					window.removeEventListener('mouseup', up)
				}
				window.addEventListener('mousemove', move)
				window.addEventListener('mouseup', up)
			}}
		/>
	)

	return (
		<div
			className="relative inline-block rounded-lg hover:px-8 hover:ring-1 ring-brand transition-all duration-200 group"
			style={{ width: block.w || 600, height: block.h || 400, maxWidth: '100%' }}
		>
			{isInsecure ? (
				<div className='w-full h-full rounded-lg border border-border bg-secondary flex flex-col items-center justify-center text-subtle text-sm gap-2 p-4 text-center'>
					<div className='bg-error/10 text-error p-2 rounded-full'>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
					</div>
					<span className='font-bold text-main'>Unsupported Content</span>
					Only secure (https) links are allowed for embedding.
				</div>
			) : (
				<iframe
					src={embedUrl}
					className='w-full h-full rounded-lg border border-border shadow-sm bg-secondary block'
				/>
			)}

			<div
				className="absolute inset-0 z-10"
				style={{ pointerEvents: (isResizing || !isFocused) ? 'auto' : 'none' }}
			/>

			<div className='absolute -top-3 left-1/2 -translate-x-1/2 bg-elevated border border-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md flex items-center z-20 overflow-hidden'>
				<button
					onClick={() => update({ align: 'left' })}
					className={`p-1.5 hover:bg-secondary transition-colors border-r border-border ${block.align === 'left' ? 'text-brand' : 'text-subtle'}`}
					title='Align Left'
				>
					<AlignLeft size={14} />
				</button>
				<button
					onClick={() => update({ align: 'center' })}
					className={`p-1.5 hover:bg-secondary transition-colors border-r border-border ${block.align === 'center' ? 'text-brand' : 'text-subtle'}`}
					title='Align Center'
				>
					<AlignCenter size={14} />
				</button>
				<button
					onClick={() => update({ align: 'right' })}
					className={`p-1.5 hover:bg-secondary transition-colors border-r border-border ${block.align === 'right' ? 'text-brand' : 'text-subtle'}`}
					title='Align Right'
				>
					<AlignRight size={14} />
				</button>
				<button
					onClick={() => {
						setTempUrl(block.src)
						setShowEditUrl(true)
					}}
					className='p-1.5 hover:bg-secondary transition-colors text-subtle'
					title='Edit URL'
				>
					<Edit2 size={16} />
				</button>
			</div>

			{showEditUrl && (
				<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-elevated border border-border p-3 rounded-lg shadow-xl z-30 flex gap-2 items-center w-[90%] max-w-[400px]'>
					<input
						autoFocus
						value={tempUrl}
						onChange={(e) => setTempUrl(e.target.value)}
						className='flex-1 bg-secondary text-main border border-border px-3 py-1.5 rounded-sm outline-none focus:border-brand focus:ring-1 ring-brand text-sm transition-all'
						onKeyDown={(e) => {
							e.stopPropagation()
							if (e.key === 'Enter') {
								update({ src: tempUrl })
								setShowEditUrl(false)
							}
						}}
					/>
					<button
						onClick={() => {
							update({ src: tempUrl })
							setShowEditUrl(false)
						}}
						className='bg-main text-inverse px-3 py-1.5 rounded-sm text-sm'
					>
						Save
					</button>
				</div>
			)}

			<ResizeHandle
				position='-top-2 -left-2'
				cursor='cursor-nwse-resize'
				onDrag={(sw: any, sh: any, sx: any, sy: any, cx: any, cy: any) =>
					update({
						w: Math.max(300, sw - (cx - sx)),
						h: Math.max(200, sh - (cy - sy)),
					})
				}
			/>
			<ResizeHandle
				position='-top-2 -right-2'
				cursor='cursor-nesw-resize'
				onDrag={(sw: any, sh: any, sx: any, sy: any, cx: any, cy: any) =>
					update({
						w: Math.max(300, sw + (cx - sx)),
						h: Math.max(200, sh - (cy - sy)),
					})
				}
			/>
			<ResizeHandle
				position='-bottom-2 -left-2'
				cursor='cursor-nesw-resize'
				onDrag={(sw: any, sh: any, sx: any, sy: any, cx: any, cy: any) =>
					update({
						w: Math.max(300, sw - (cx - sx)),
						h: Math.max(200, sh + (cy - sy)),
					})
				}
			/>
			<ResizeHandle
				position='-bottom-2 -right-2'
				cursor='cursor-nwse-resize'
				onDrag={(sw: any, sh: any, sx: any, sy: any, cx: any, cy: any) =>
					update({
						w: Math.max(300, sw + (cx - sx)),
						h: Math.max(200, sh + (cy - sy)),
					})
				}
			/>
		</div>
	)
}

