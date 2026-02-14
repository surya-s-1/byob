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
				<h1 className='text-[48px] font-bold leading-tight mt-4 text-main'>{title}</h1>
				{subtitle && <h2 className='text-xl text-subtle mt-2'>{subtitle}</h2>}
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
				className='w-full bg-transparent text-main outline-none resize-none text-[48px] font-bold leading-tight mt-md overflow-hidden'
				rows={1}
			/>
			<textarea
				ref={subtitleRef}
				placeholder='Add a subtitle...'
				maxLength={300}
				value={subtitle}
				onChange={(e) => setSubtitle(e.target.value)}
				className='w-full bg-transparent text-subtle outline-none resize-none text-xl mt-sm overflow-hidden'
				rows={1}
			/>
		</div>
	)
}
