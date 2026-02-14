'use client'

import { useState } from 'react'
import { AlignLeft, AlignCenter, AlignRight, Edit2 } from 'lucide-react'

export default function Iframe({ block, update, removeBlock, readOnly }: any) {
	const [showEditUrl, setShowEditUrl] = useState(false)
	const [tempUrl, setTempUrl] = useState(block.src)
	const [isResizing, setIsResizing] = useState(false)

	const alignClass =
		block.align === 'left' ? 'mr-auto' : block.align === 'right' ? 'ml-auto' : 'mx-auto'

	if (readOnly) {
		return (
			<div
				className={`my-8 block ${alignClass}`}
				style={{ width: block.w || 600, height: block.h || 400, maxWidth: '100%' }}
			>
				<iframe
					src={block.src}
					className='w-full h-full rounded-md border border-border shadow-sm bg-secondary'
					allowFullScreen
				/>
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
		<div className='my-8 flex flex-col relative'>
			<div
				className={`relative group inline-block ${alignClass}`}
				style={{ width: block.w || 600, height: block.h || 400, maxWidth: '100%' }}
			>
				<iframe
					src={block.src}
					className='w-full h-full rounded-md border border-border shadow-sm bg-secondary'
				/>

				{/* Overlay to catch events and prevent iframe interaction during resize/hover */}
				<div
					className={`absolute inset-0 z-10 ${isResizing ? 'bg-transparent' : 'bg-transparent pointer-events-none'}`}
					style={{ pointerEvents: isResizing ? 'auto' : 'none' }}
				/>

				<div className='absolute top-4 left-1/2 -translate-x-1/2 bg-elevated border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md flex gap-1 p-1 z-20'>
					<button
						onClick={() => update({ align: 'left' })}
						className={`p-1.5 rounded hover:bg-secondary ${block.align === 'left' ? 'text-brand' : 'text-subtle'}`}
					>
						<AlignLeft size={16} />
					</button>
					<button
						onClick={() => update({ align: 'center' })}
						className={`p-1.5 rounded hover:bg-secondary ${block.align === 'center' ? 'text-brand' : 'text-subtle'}`}
					>
						<AlignCenter size={16} />
					</button>
					<button
						onClick={() => update({ align: 'right' })}
						className={`p-1.5 rounded hover:bg-secondary ${block.align === 'right' ? 'text-brand' : 'text-subtle'}`}
					>
						<AlignRight size={16} />
					</button>
					<div className='w-px bg-border mx-1'></div>
					<button
						onClick={() => {
							setTempUrl(block.src)
							setShowEditUrl(true)
						}}
						className='p-1.5 rounded hover:bg-secondary text-subtle'
					>
						<Edit2 size={16} />
					</button>
				</div>

				{showEditUrl && (
					<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-elevated border border-border p-3 rounded-md shadow-xl z-30 flex gap-2 items-center w-[90%] max-w-[400px]'>
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
		</div>
	)
}

