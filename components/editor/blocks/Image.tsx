'use client'

import { useState } from 'react'
import { AlignLeft, AlignCenter, AlignRight, CornerDownLeft } from 'lucide-react'

export default function Image({ block, update, readOnly }: any) {
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
					className='w-full rounded-lg border border-border shadow-sm'
					alt='Article media'
				/>
			</div>
		)
	}

	if (!block.src) {
		return (
			<div className='rounded-lg border border-dashed border-border p-4 outline-none'>
				<div className='mb-3 flex items-center gap-4 px-2 text-sm'>
					<span className='font-semibold'>Image</span>
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
							value={tempUrl}
							onChange={(e) => setTempUrl(e.target.value)}
							placeholder='Paste image URL...'
							className='flex-1 rounded-md border border-border bg-transparent px-3 py-1.5 text-sm text-main transition-all outline-none'
							onKeyDown={(e) => {
								e.stopPropagation()
								if (e.key === 'Enter' && tempUrl) update({ src: tempUrl })
							}}
						/>
						<button
							onClick={() => {
								if (tempUrl) update({ src: tempUrl })
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

	const ResizeHandle = ({ position, cursor, onDrag }: any) => (
		<div
			className={`absolute ${position} h-4 w-4 ${cursor} z-10 opacity-0 transition-opacity group-hover:opacity-100`}
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
		<div className='relative inline-block' style={{ width: block.w || 700, maxWidth: '100%' }}>
			<img
				src={block.src}
				className='block w-full rounded-lg border border-border shadow-sm'
				alt='Content'
			/>

			<div className='absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 items-center overflow-hidden rounded-md border border-border bg-elevated opacity-0 shadow-md transition-opacity group-hover:opacity-100'>
				<button
					onClick={() => update({ align: 'left' })}
					className={`border-r border-border p-1.5 transition-colors hover:bg-secondary ${block.align === 'left' ? 'text-brand' : 'text-subtle'}`}
					title='Align Left'
				>
					<AlignLeft size={14} />
				</button>
				<button
					onClick={() => update({ align: 'center' })}
					className={`border-r border-border p-1.5 transition-colors hover:bg-secondary ${block.align === 'center' ? 'text-brand' : 'text-subtle'}`}
					title='Align Center'
				>
					<AlignCenter size={14} />
				</button>
				<button
					onClick={() => update({ align: 'right' })}
					className={`p-1.5 transition-colors hover:bg-secondary ${block.align === 'right' ? 'text-brand' : 'text-subtle'}`}
					title='Align Right'
				>
					<AlignRight size={14} />
				</button>
			</div>

			<ResizeHandle
				position='-top-2 -left-2'
				cursor='cursor-nwse-resize'
				onDrag={(sw: any, sx: any, cx: any) => update({ w: Math.max(200, sw - (cx - sx)) })}
			/>
			<ResizeHandle
				position='-top-2 -right-2'
				cursor='cursor-nesw-resize'
				onDrag={(sw: any, sx: any, cx: any) => update({ w: Math.max(200, sw + (cx - sx)) })}
			/>
			<ResizeHandle
				position='-bottom-2 -left-2'
				cursor='cursor-nesw-resize'
				onDrag={(sw: any, sx: any, cx: any) => update({ w: Math.max(200, sw - (cx - sx)) })}
			/>
			<ResizeHandle
				position='-bottom-2 -right-2'
				cursor='cursor-nwse-resize'
				onDrag={(sw: any, sx: any, cx: any) => update({ w: Math.max(200, sw + (cx - sx)) })}
			/>
		</div>
	)
}
