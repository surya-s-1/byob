'use client'

import { useState, useEffect, useRef } from 'react'
import Toolbar from './Toolbar'
import Block from './blocks'
import { parseToBlocks, blocksToMarkdown, generateId } from './utils'

export default function Content({ initialMarkdown }: any) {
	const [blocks, setBlocks] = useState<any[]>(() => parseToBlocks(initialMarkdown))
	const [focusId, setFocusId] = useState<string | null>(null)

	const [savedMarkdown, setSavedMarkdown] = useState<string>(initialMarkdown)
	const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved')

	const blocksRef = useRef(blocks)
	useEffect(() => {
		blocksRef.current = blocks
	}, [blocks])

	useEffect(() => {
		const intervalId = setInterval(() => {
			const currentMarkdown = blocksToMarkdown(blocksRef.current)

			setSavedMarkdown((prev) => {
				if (prev !== currentMarkdown) {
					setSaveStatus('saving')
					setTimeout(() => setSaveStatus('saved'), 800)
					return currentMarkdown
				}
				return prev
			})
		}, 10000)
		return () => clearInterval(intervalId)
	}, [])

	useEffect(() => {
		if (saveStatus === 'saved' && blocksToMarkdown(blocks) !== savedMarkdown) {
			setSaveStatus('idle')
		}
	}, [blocks, savedMarkdown, saveStatus])

	const updateBlock = (index: number, data: any) => {
		setBlocks((prev) => {
			const arr = [...prev]
			arr[index] = { ...arr[index], ...data }
			return arr
		})
	}

	const insertBlock = (index: number, blockData: any) => {
		const newBlock = { ...blockData, id: generateId() }
		setBlocks((prev) => {
			const arr = [...prev]
			arr.splice(index, 0, newBlock)
			return arr
		})
		setFocusId(newBlock.id)
	}

	const removeBlock = (index: number) => {
		setBlocks((prev) => {
			if (prev.length === 1) return [{ id: generateId(), type: 'text', content: '' }]
			const arr = [...prev]
			arr.splice(index, 1)
			if (index > 0) setFocusId(arr[index - 1].id)
			return arr
		})
	}

	const handleContainerClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			setFocusId(blocks[blocks.length - 1].id)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		// Shortcuts handled in child blocks mostly
	}

	return (
		<div
			onKeyDown={handleKeyDown}
			onPaste={async (e) => {
				const text = e.clipboardData.getData('text/plain')

				if (text && text.startsWith('BYOB_BLOCK:')) {
					e.preventDefault()
					try {
						const jsonStr = text.substring(11)
						const parsed = JSON.parse(jsonStr)
						if (parsed.type === 'byob-block') {
							const currentIndex = blocks.findIndex((b) => b.id === focusId)
							const insertAt = currentIndex === -1 ? blocks.length : currentIndex + 1
							insertBlock(insertAt, parsed.data)
							return
						}
					} catch (err) { }
				}

				// If it's markdown-like text, we might want to prevent it from pasting raw into a text block
				// but only if we are not focused on an input/textarea
				const target = e.target as HTMLElement
				if (target.getAttribute('contenteditable') === 'true' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
					// Let it happen naturally for text blocks
					return
				}

				// If we are focused on the container itself but not a block, insert as blocks
				if (text && (text.includes('![') || text.includes('```') || text.includes('::iframe'))) {
					e.preventDefault()
					const newBlocks = parseToBlocks(text)
					const currentIndex = blocks.findIndex((b) => b.id === focusId)
					const insertAt = currentIndex === -1 ? blocks.length : currentIndex + 1

					setBlocks((prev) => {
						const arr = [...prev]
						arr.splice(insertAt, 0, ...newBlocks.map(b => ({ ...b, id: generateId() })))
						return arr
					})
				}
			}}
			className='relative min-h-[60vh] pb-32 cursor-text'
			id='editor-content'
			onClick={handleContainerClick}
		>
			<Toolbar
				insert={(data: any) =>
					insertBlock(
						blocks.findIndex((b) => b.id === focusId) + 1 || blocks.length,
						data
					)
				}
				saveStatus={saveStatus}
			/>
			<div className='space-y-4'>
				{blocks.map((block, index) => (
					<Block
						key={block.id}
						index={index}
						block={block}
						isFocused={focusId === block.id}
						setFocusId={setFocusId}
						updateBlock={updateBlock}
						insertBlock={insertBlock}
						removeBlock={removeBlock}
					/>
				))}
			</div>
		</div>
	)
}
