'use client'

import { useState, useRef, useEffect } from 'react'
import Cover from './Cover'

export default function Head({ draft, readOnly }: any) {
	const [cover, setCover] = useState(draft.cover || '')
	const [title, setTitle] = useState(draft.title || '')
	const [subtitle, setSubtitle] = useState(draft.subtitle || '')

	const titleRef = useRef<HTMLTextAreaElement>(null)
	const subtitleRef = useRef<HTMLTextAreaElement>(null)

	const autoResize = (el: HTMLTextAreaElement | null) => {
		if (!el) return
		el.style.height = 'auto'
		el.style.height = el.scrollHeight + 'px'
	}

	useEffect(() => {
		if (!readOnly) {
			autoResize(titleRef.current)
			autoResize(subtitleRef.current)
		}
	}, [title, subtitle, readOnly])

	if (readOnly) {
		return (
			<div className='mb-12'>
				<Cover cover={cover} readOnly={true} />
				<h1 className='mt-4 text-[48px] leading-tight font-bold text-main'>{title}</h1>
				{subtitle && <h2 className='mt-2 text-xl text-subtle'>{subtitle}</h2>}
			</div>
		)
	}

	return (
		<div className='mb-lg'>
			<Cover cover={cover} setCover={setCover} />
			<textarea
				ref={titleRef}
				placeholder='Article Title'
				maxLength={180}
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				className='mt-md w-full resize-none overflow-hidden bg-transparent text-[48px] leading-tight font-bold text-main outline-none'
				rows={1}
			/>
			<textarea
				ref={subtitleRef}
				placeholder='Add a subtitle...'
				maxLength={300}
				value={subtitle}
				onChange={(e) => setSubtitle(e.target.value)}
				className='mt-sm w-full resize-none overflow-hidden bg-transparent text-xl text-subtle outline-none'
				rows={1}
			/>
		</div>
	)
}
