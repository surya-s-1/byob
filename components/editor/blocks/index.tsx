'use client'

import { useRef, useEffect, useState } from 'react'
import Text from './Text'
import Image from './Image'
import Iframe from './Iframe'
import Code from './Code'
import Mermaid from './Mermaid'
import { blocksToMarkdown, generateId } from '../utils'
import { Copy, Scissors, Trash2, Check } from 'lucide-react'

export default function Block({
	block,
	index,
	updateBlock,
	insertBlock,
	removeBlock,
	isFocused,
	setFocusId,
}: any) {
	const [copied, setCopied] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (isFocused && ref.current) {
			setTimeout(() => {
				if (ref.current) {
					ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
					if (block.type !== 'text') ref.current.focus()
				}
			}, 100)
		}
	}, [isFocused, block.type])

	const copyBlock = () => {
		const md = blocksToMarkdown([block])
		const data = JSON.stringify({ type: 'byob-block', data: block })
		// Use a marked string in plain text to ensure browser compatibility
		const clipboardText = `BYOB_BLOCK:${data}`
		navigator.clipboard.writeText(clipboardText).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		})
	}

	const cutBlock = () => {
		copyBlock()
		removeBlock(index)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (block.type === 'text') return
		if ((e.target as HTMLElement).tagName === 'INPUT') return
		if ((e.target as HTMLElement).tagName === 'TEXTAREA') return

		if (e.key === 'Backspace' || e.key === 'Delete') {
			e.preventDefault()
			removeBlock(index)
		} else if (e.key === 'Enter') {
			e.preventDefault()
			insertBlock(index + 1, { type: 'text', content: '' })
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
			e.preventDefault()
			copyBlock()
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
			e.preventDefault()
			cutBlock()
		}
	}

	const innerProps = {
		block,
		update: (data: any) => updateBlock(index, data),
		isFocused,
		setFocusId: () => setFocusId(block.id),
		insertBlock: (data: any) => insertBlock(index + 1, data),
		removeBlock: () => removeBlock(index),
	}

	if (block.type === 'text') {
		return (
			<div ref={ref} onClick={() => setFocusId(block.id)}>
				<Text {...innerProps} />
			</div>
		)
	}

	const alignClass =
		block.align === 'left' ? 'mr-auto' : block.align === 'right' ? 'ml-auto' : 'mx-auto'
	const isFullWidth =
		['code', 'mermaid'].includes(block.type) || (block.type === 'image' && !block.src)

	return (
		<div
			ref={ref}
			tabIndex={0}
			onClick={() => setFocusId(block.id)}
			onKeyDown={handleKeyDown}
			className={`group ring-brand relative my-8 rounded-lg leading-none transition-all outline-none focus-within:ring-1 focus:ring-1 ${isFullWidth ? 'w-full' : 'w-fit ' + alignClass}`}
		>
			<div className='absolute -top-3 right-2 z-40 flex items-center overflow-hidden rounded-md border border-border bg-elevated opacity-0 shadow-md transition-opacity group-hover:opacity-100'>
				<button
					onClick={(e) => {
						e.stopPropagation()
						copyBlock()
					}}
					className={`border-r border-border p-1.5 transition-colors hover:bg-secondary ${copied ? 'text-green-500' : 'text-subtle hover:text-main'}`}
					title='Copy Block'
				>
					{copied ? (
						<Check size={14} className='animate-in fade-in zoom-in duration-200' />
					) : (
						<Copy size={14} />
					)}
				</button>
				<button
					onClick={(e) => {
						e.stopPropagation()
						cutBlock()
					}}
					className='border-r border-border p-1.5 text-subtle transition-colors hover:bg-secondary hover:text-main'
					title='Cut Block'
				>
					<Scissors size={14} />
				</button>
				<button
					onClick={(e) => {
						e.stopPropagation()
						removeBlock(index)
					}}
					className='p-1.5 text-subtle transition-colors hover:bg-error/10 hover:text-error'
					title='Delete Block'
				>
					<Trash2 size={14} />
				</button>
			</div>

			{block.type === 'image' && <Image {...innerProps} />}
			{block.type === 'iframe' && <Iframe {...innerProps} />}
			{block.type === 'code' && <Code {...innerProps} />}
			{block.type === 'mermaid' && <Mermaid {...innerProps} />}
		</div>
	)
}
