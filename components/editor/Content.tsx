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

	useEffect(() => {
		console.log(savedMarkdown)
	}, [savedMarkdown])

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

	return (
		<div
			id='editor-content'
			className='relative min-h-[60vh] pb-32 cursor-text'
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
