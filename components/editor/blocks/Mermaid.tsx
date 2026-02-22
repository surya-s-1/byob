import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

if (typeof window !== 'undefined') {
	mermaid.initialize({
		startOnLoad: false,
		theme: 'default',
		securityLevel: 'loose',
		fontFamily: 'inherit',
	})
}

export default function Mermaid({ block, update, readOnly }: any) {
	const ref = useRef<HTMLDivElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const [error, setError] = useState('')

	useEffect(() => {
		let isCancelled = false
		const renderDiagram = async () => {
			if (!ref.current) return

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
				if (!isCancelled) {
					setError('Syntax Error')
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
			<div className='my-8 flex w-full items-center justify-center overflow-auto rounded-lg border border-border bg-primary p-6 shadow-sm'>
				<div ref={ref} className='mermaid-preview text-main' />
			</div>
		)
	}

	return (
		<div className='flex w-full flex-col overflow-hidden rounded-lg border border-border bg-elevated shadow-sm'>
			<div className='flex items-center justify-between border-b border-border bg-secondary'>
				<div className='px-4 py-2 text-xs font-bold text-subtle'>Mermaid Editor</div>
			</div>
			<textarea
				ref={textareaRef}
				value={block.content}
				onChange={(e) => update({ content: e.target.value })}
				className='min-h-[120px] w-full resize-none bg-transparent p-4 font-mono text-sm text-main outline-none'
				spellCheck={false}
				onKeyDown={(e) => e.stopPropagation()}
			/>
			<div className='flex min-h-[200px] flex-col items-center justify-center overflow-auto border-t border-border bg-primary p-6'>
				{error && (
					<div className='mb-4 font-mono text-sm whitespace-pre-wrap text-error'>
						{error}
					</div>
				)}
				<div
					ref={ref}
					className={`mermaid-preview flex w-full justify-center text-main ${error ? 'hidden' : 'block'}`}
				/>
			</div>
		</div>
	)
}
