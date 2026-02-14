'use client'

import { useRef, useEffect } from 'react'
import Text from './Text'
import Image from './Image'
import Iframe from './Iframe'
import Code from './Code'
import Mermaid from './Mermaid'
import { blocksToMarkdown } from '../utils'

export default function Block({
	block,
	index,
	updateBlock,
	insertBlock,
	removeBlock,
	isFocused,
	setFocusId,
}: any) {
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
			navigator.clipboard.writeText(blocksToMarkdown([block]))
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
			e.preventDefault()
			navigator.clipboard.writeText(blocksToMarkdown([block]))
			removeBlock(index)
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

	return (
		<div
			ref={ref}
			tabIndex={0}
			onClick={() => setFocusId(block.id)}
			onKeyDown={handleKeyDown}
			className='relative group outline-none focus-within:ring-1 focus:ring-1 ring-brand rounded-lg transition-all'
		>
			{block.type === 'image' && <Image {...innerProps} />}
			{block.type === 'iframe' && <Iframe {...innerProps} />}
			{block.type === 'code' && <Code {...innerProps} />}
			{block.type === 'mermaid' && <Mermaid {...innerProps} />}
		</div>
	)
}
