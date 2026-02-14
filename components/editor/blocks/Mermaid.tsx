'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { Trash2 } from 'lucide-react'

if (typeof window !== 'undefined') {
	mermaid.initialize({
		startOnLoad: false,
		theme: 'default',
		securityLevel: 'loose',
		fontFamily: 'inherit',
	})
}

export default function Mermaid({ block, update, removeBlock, readOnly }: any) {
	const ref = useRef<HTMLDivElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const [error, setError] = useState('')

	useEffect(() => {
		let isCancelled = false
		const renderDiagram = async () => {
			if (!ref.current || !block.content?.trim()) return

			const diagramId = 'mermaid-render-' + Math.random().toString(36).substring(2, 9)

			try {
				const content = block.content.trim()
				await mermaid.parse(content)
				const { svg } = await mermaid.render(diagramId, content)

				if (!isCancelled && ref.current) {
					ref.current.innerHTML = svg
					setError('')
				}
			} catch (e: any) {
				console.error('Mermaid Render Error:', e)
				if (!isCancelled) {
					setError('Syntax error in Mermaid diagram.')
					const svgEl = document.getElementById(diagramId)
					if (svgEl) svgEl.remove()
				}
			}
		}

		renderDiagram()
		return () => {
			isCancelled = true
		}
	}, [block.content])

	useEffect(() => {
		if (textareaRef.current && !readOnly) {
			textareaRef.current.style.height = 'auto'
			textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
		}
	}, [block.content, readOnly])

	if (readOnly) {
		return (
			<div className='my-8 bg-primary p-6 rounded-lg border border-border flex items-center justify-center overflow-auto shadow-sm'>
				<div ref={ref} className='mermaid-preview text-main' />
			</div>
		)
	}

	return (
		<div className='my-8 flex flex-col border border-border bg-elevated shadow-sm rounded-lg overflow-hidden'>
			<div className='border-b border-border flex justify-between items-center bg-secondary'>
				<div className='text-xs text-subtle font-bold px-4 py-2'>Mermaid Editor</div>
				<button
					onClick={removeBlock}
					className='p-2 text-subtle hover:text-error transition-colors'
					title='Delete Diagram'
				>
					<Trash2 size={16} />
				</button>
			</div>
			<textarea
				ref={textareaRef}
				value={block.content}
				onChange={(e) => update({ content: e.target.value })}
				className='w-full bg-transparent text-main p-4 font-mono text-sm outline-none resize-none min-h-[120px]'
				spellCheck={false}
				onKeyDown={(e) => e.stopPropagation()}
			/>
			<div className='bg-primary p-6 flex items-center justify-center min-h-[200px] overflow-auto border-t border-border'>
				{error ? (
					<div className='text-error text-sm font-mono whitespace-pre-wrap'>{error}</div>
				) : (
					<div
						ref={ref}
						className='w-full flex justify-center mermaid-preview text-main'
					/>
				)}
			</div>
		</div>
	)
}
