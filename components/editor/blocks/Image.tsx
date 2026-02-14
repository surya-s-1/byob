'use client'

import { useState } from 'react'
import { AlignLeft, AlignCenter, AlignRight, Trash2, CornerDownLeft } from 'lucide-react'

export default function Image({ block, update, removeBlock, readOnly }: any) {
	const [tab, setTab] = useState<'url' | 'upload'>('url')
	const [tempUrl, setTempUrl] = useState('')

	const alignClass =
		block.align === 'left' ? 'mr-auto' : block.align === 'right' ? 'ml-auto' : 'mx-auto'

	if (readOnly) {
		return (
			<div
				className={`my-8 block ${alignClass}`}
				style={{ width: block.w || 700, maxWidth: '100%' }}
			>
				<img
					src={block.src}
					className='w-full rounded-lg shadow-sm border border-border'
					alt='Article media'
				/>
			</div>
		)
	}

	if (!block.src) {
		return (
			<div className='my-8 border border-dashed border-border rounded-lg p-4 outline-none'>
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
						onClick={removeBlock}
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
							className='flex-1 border border-border bg-transparent text-main rounded-md px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 ring-brand transition-all'
							onKeyDown={(e) => {
								e.stopPropagation()
								if (e.key === 'Enter' && tempUrl) update({ src: tempUrl })
							}}
						/>
						<button
							onClick={() => {
								if (tempUrl) update({ src: tempUrl })
							}}
							className='px-4 py-1.5 bg-main text-inverse rounded-md text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-1'
						>
							<CornerDownLeft size={16} /> Add
						</button>
					</div>
				)}
			</div>
		)
	}

	const ResizeHandle = ({ position, cursor, onDrag }: any) => (
		<div
			className={`absolute ${position} w-4 h-4 ${cursor} z-10 opacity-0 group-hover:opacity-100 transition-opacity`}
			onMouseDown={(e) => {
				e.preventDefault()
				const startX = e.clientX
				const startW = block.w || 700
				const move = (ev: MouseEvent) => onDrag(startW, startX, ev.clientX)
				const up = () => {
					window.removeEventListener('mousemove', move)
					window.removeEventListener('mouseup', up)
				}
				window.addEventListener('mousemove', move)
				window.addEventListener('mouseup', up)
			}}
		/>
	)

	return (
		<div className='my-8 flex flex-col'>
			<div
				className={`relative inline-block group ${alignClass}`}
				style={{ width: block.w || 700, maxWidth: '100%' }}
			>
				<img
					src={block.src}
					className='w-full rounded-lg shadow-sm border border-border block'
					alt='Content'
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
						onClick={removeBlock}
						className='p-1.5 rounded hover:bg-error/10 text-error'
					>
						<Trash2 size={16} />
					</button>
				</div>

				<ResizeHandle
					position='-top-2 -left-2'
					cursor='cursor-nwse-resize'
					onDrag={(sw: any, sx: any, cx: any) =>
						update({ w: Math.max(200, sw - (cx - sx)) })
					}
				/>
				<ResizeHandle
					position='-top-2 -right-2'
					cursor='cursor-nesw-resize'
					onDrag={(sw: any, sx: any, cx: any) =>
						update({ w: Math.max(200, sw + (cx - sx)) })
					}
				/>
				<ResizeHandle
					position='-bottom-2 -left-2'
					cursor='cursor-nesw-resize'
					onDrag={(sw: any, sx: any, cx: any) =>
						update({ w: Math.max(200, sw - (cx - sx)) })
					}
				/>
				<ResizeHandle
					position='-bottom-2 -right-2'
					cursor='cursor-nwse-resize'
					onDrag={(sw: any, sx: any, cx: any) =>
						update({ w: Math.max(200, sw + (cx - sx)) })
					}
				/>
			</div>
		</div>
	)
}
