'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { Trash2 } from 'lucide-react'

export default function Mermaid({ id, content, update, onFocus, insertBlock }: any) {
	const ref = useRef<HTMLDivElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const [error, setError] = useState('')

	const getRawMarkdown = () => `\`\`\`mermaid\n${content}\n\`\`\``

	useEffect(() => {
		mermaid.initialize({ startOnLoad: false, theme: 'default' })

		let isCancelled = false
		const renderDiagram = async () => {
			if (!ref.current || !content.trim()) return

			const diagramId = 'mermaid-' + Math.random().toString(36).substring(2)

			try {
				await mermaid.parse(content)
				const { svg } = await mermaid.render(diagramId, content)
				if (!isCancelled && ref.current) {
					ref.current.innerHTML = svg
					setError('')
				}
			} catch (e: any) {
				if (!isCancelled) {
					setError('Syntax error in Mermaid diagram.')
					const errorSvg = document.getElementById(diagramId)
					if (errorSvg) errorSvg.remove()
					const fallbackErrorSvg = document.getElementById(`d${diagramId}`)
					if (fallbackErrorSvg) fallbackErrorSvg.remove()
				}
			}
		}

		const timeoutId = setTimeout(renderDiagram, 500)
		return () => {
			isCancelled = true
			clearTimeout(timeoutId)
		}
	}, [content])

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto'
			textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
		}
	}, [content])

	const handleWrapperKeyDown = (e: React.KeyboardEvent) => {
		if (e.target !== e.currentTarget) return

		if (e.key === 'Backspace' || e.key === 'Delete') {
			e.preventDefault()
			update(null)
		} else if (e.key === 'Enter') {
			e.preventDefault()
			insertBlock({ type: 'text', content: '' })
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
			e.preventDefault()
			navigator.clipboard.writeText(getRawMarkdown())
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
			e.preventDefault()
			navigator.clipboard.writeText(getRawMarkdown())
			update(null)
		}
	}

	const handleWrapperPaste = (e: React.ClipboardEvent) => {
		if (e.target === e.currentTarget) {
			e.preventDefault()
			const text = e.clipboardData.getData('text/plain')
			if (text) insertBlock({ type: 'text', content: text.trim() })
		}
	}

	return (
		<div
			id={id}
			tabIndex={0}
			onFocus={onFocus}
			onKeyDown={handleWrapperKeyDown}
			onPaste={handleWrapperPaste}
			className='my-xl flex flex-col outline-none focus-within:ring-1 ring-brand focus-within:border-brand rounded-lg border border-border bg-elevated shadow-sm transition-all'
		>
			<div className='border-b border-border flex justify-between items-center bg-secondary'>
				<div className='text-xs text-subtle font-bold px-4 py-2'>Mermaid Editor</div>
				<button
					onClick={() => update(null)}
					className='p-2 text-subtle hover:text-error transition-colors'
					title='Delete Diagram'
				>
					<Trash2 size={16} />
				</button>
			</div>
			<textarea
				ref={textareaRef}
				value={content}
				onChange={(e) => update({ content: e.target.value })}
				className='w-full bg-transparent text-main p-4 font-mono text-sm outline-none resize-none min-h-30'
				spellCheck={false}
			/>
			<div className='bg-primary p-6 flex items-center justify-center min-h-50 overflow-auto border-t border-border'>
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
