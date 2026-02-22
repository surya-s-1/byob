'use client'

import { useState } from 'react'
import { AlignLeft, AlignCenter, AlignRight, Edit2, AlertTriangle } from 'lucide-react'

export default function Iframe({ block, update, readOnly, isFocused }: any) {
	const [showEditUrl, setShowEditUrl] = useState(false)
	const [tempUrl, setTempUrl] = useState(block.src)
	const [isResizing, setIsResizing] = useState(false)

	const settings = block.settings || {
		autoplay: false,
		fullscreen: false,
		sensors: false,
		pip: false,
	}

	const getEmbedUrl = (url: string) => {
		if (!url) return ''
		if (!url.startsWith('https://')) return 'UNSUPPORTED_INSECURE'

		let finalUrl = url

		if (finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be')) {
			const separator = finalUrl.includes('?') ? '&' : '?'
			if (settings.autoplay && !finalUrl.includes('autoplay=')) {
				finalUrl += `${separator}autoplay=1&mute=1`
			}

			if (!finalUrl.includes('rel=')) {
				const relSeparator = finalUrl.includes('?') ? '&' : '?'
				finalUrl += `${relSeparator}rel=0`
			}
		}
		return finalUrl
	}

	const embedUrl = getEmbedUrl(block.src)
	const isInsecure = embedUrl === 'UNSUPPORTED_INSECURE'
	const alignClass =
		block.align === 'left' ? 'mr-auto' : block.align === 'right' ? 'ml-auto' : 'mx-auto'

	const getAllowString = () => {
		const allow = []
		if (settings.autoplay) allow.push('autoplay')
		if (settings.sensors) allow.push('accelerometer', 'gyroscope')
		if (settings.pip) allow.push('picture-in-picture')
		allow.push('clipboard-write', 'encrypted-media', 'web-share')
		return allow.join('; ')
	}

	if (readOnly) {
		return (
			<div
				className={`my-8 block ${alignClass}`}
				style={{ width: block.w || 600, height: block.h || 400, maxWidth: '100%' }}
			>
				{isInsecure ? (
					<div className='flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-secondary p-4 text-center text-sm text-subtle'>
						<div className='rounded-full bg-error/10 p-2 text-error'>
							<AlertTriangle size={20} />
						</div>
						<span className='font-bold text-main'>Unsupported Content</span>
						Only secure (https) links are allowed for embedding.
					</div>
				) : (
					<iframe
						src={embedUrl}
						className='h-full w-full rounded-lg border border-border bg-secondary shadow-sm'
						allowFullScreen={settings.fullscreen}
						title='Embedded content'
						loading='lazy'
						referrerPolicy='no-referrer-when-downgrade'
						allow={getAllowString()}
					/>
				)}
			</div>
		)
	}

	const ResizeHandle = ({ position, cursor, onDrag }: any) => (
		<div
			className={`absolute ${position} h-4 w-4 ${cursor} z-30 opacity-0 transition-opacity group-hover:opacity-100`}
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
			className='ring-brand group relative inline-block rounded-lg transition-all duration-200 hover:px-4 hover:ring-1'
			style={{ width: block.w || 600, height: block.h || 400, maxWidth: '100%' }}
		>
			{isInsecure ? (
				<div className='flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-secondary p-4 text-center text-sm text-subtle'>
					<div className='rounded-full bg-error/10 p-2 text-error'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='20'
							height='20'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
							<line x1='12' y1='9' x2='12' y2='13' />
							<line x1='12' y1='17' x2='12.01' y2='17' />
						</svg>
					</div>
					<span className='font-bold text-main'>Unsupported Content</span>
					Only secure (https) links are allowed for embedding.
				</div>
			) : (
				<iframe
					src={embedUrl}
					className='block h-full w-full rounded-lg border border-border bg-secondary shadow-sm'
					title='Embedded content'
					loading='lazy'
					referrerPolicy='no-referrer-when-downgrade'
					allow={getAllowString()}
				/>
			)}

			<div
				className='absolute inset-0 z-10'
				style={{ pointerEvents: isResizing || !isFocused ? 'auto' : 'none' }}
			/>

			<div className='absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 items-center overflow-hidden rounded-lg border border-border bg-elevated opacity-0 shadow-md transition-opacity group-hover:opacity-100'>
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
					className={`border-r border-border p-1.5 transition-colors hover:bg-secondary ${block.align === 'right' ? 'text-brand' : 'text-subtle'}`}
					title='Align Right'
				>
					<AlignRight size={14} />
				</button>
				<button
					onClick={() => {
						setTempUrl(block.src)
						setShowEditUrl(true)
					}}
					className='flex items-center gap-1 p-1.5 px-2 text-xs font-medium text-subtle transition-colors hover:bg-secondary'
					title='Settings'
				>
					<Edit2 size={14} />
				</button>
			</div>

			{showEditUrl && (
				<div className='animate-in fade-in zoom-in absolute top-1/2 left-1/2 z-30 flex w-[90%] max-w-[400px] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border border-border bg-elevated p-4 shadow-xl duration-200'>
					<div className='flex flex-col gap-1.5'>
						<label className='text-[10px] font-bold tracking-wider text-muted uppercase'>
							Source URL
						</label>
						<div className='flex gap-2'>
							<input
								autoFocus
								value={tempUrl}
								onChange={(e) => setTempUrl(e.target.value)}
								className='focus:border-brand ring-brand flex-1 rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-main transition-all outline-none focus:ring-1'
								onKeyDown={(e) => {
									e.stopPropagation()
									if (e.key === 'Enter') {
										update({ src: tempUrl })
										setShowEditUrl(false)
									}
								}}
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<label className='group flex cursor-pointer items-center gap-2'>
							<input
								type='checkbox'
								checked={settings.autoplay}
								onChange={(e) =>
									update({
										settings: { ...settings, autoplay: e.target.checked },
									})
								}
								className='text-brand focus:ring-brand h-4 w-4 rounded border-border bg-secondary transition-all'
							/>
							<span className='text-xs font-medium text-subtle transition-colors group-hover:text-main'>
								Autoplay
							</span>
						</label>
						<label className='group flex cursor-pointer items-center gap-2'>
							<input
								type='checkbox'
								checked={settings.fullscreen}
								onChange={(e) =>
									update({
										settings: { ...settings, fullscreen: e.target.checked },
									})
								}
								className='text-brand focus:ring-brand h-4 w-4 rounded border-border bg-secondary transition-all'
							/>
							<span className='text-xs font-medium text-subtle transition-colors group-hover:text-main'>
								Fullscreen
							</span>
						</label>
						<label className='group flex cursor-pointer items-center gap-2'>
							<input
								type='checkbox'
								checked={settings.sensors}
								onChange={(e) =>
									update({ settings: { ...settings, sensors: e.target.checked } })
								}
								className='text-brand focus:ring-brand h-4 w-4 rounded border-border bg-secondary transition-all'
							/>
							<span className='text-xs font-medium text-subtle transition-colors group-hover:text-main'>
								Sensors
							</span>
						</label>
						<label className='group flex cursor-pointer items-center gap-2'>
							<input
								type='checkbox'
								checked={settings.pip}
								onChange={(e) =>
									update({ settings: { ...settings, pip: e.target.checked } })
								}
								className='text-brand focus:ring-brand h-4 w-4 rounded border-border bg-secondary transition-all'
							/>
							<span className='text-xs font-medium text-subtle transition-colors group-hover:text-main'>
								Picture-in-Picture
							</span>
						</label>
					</div>

					<button
						onClick={() => {
							update({ src: tempUrl })
							setShowEditUrl(false)
						}}
						className='w-full rounded-md bg-main py-2 text-sm font-semibold text-inverse transition-opacity hover:opacity-90'
					>
						Done
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
