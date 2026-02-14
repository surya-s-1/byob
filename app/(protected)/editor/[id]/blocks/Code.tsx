'use client'

import { useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'

const LANGUAGES = [
	{ label: 'Plain Text', value: 'text' },
	{ label: 'Python', value: 'python' },
	{ label: 'JavaScript', value: 'javascript' },
	{ label: 'Markdown', value: 'markdown' },
	{ label: 'C', value: 'c' },
	{ label: 'C#', value: 'csharp' },
	{ label: 'C++', value: 'cpp' },
	{ label: 'Java', value: 'java' },
	{ label: 'Groovy', value: 'groovy' },
]

export default function Code({ id, content, lang, update, onFocus, raw, insertBlock }: any) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)

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
			insertBlock('<br>')
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
			e.preventDefault()
			navigator.clipboard.writeText(raw)
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
			e.preventDefault()
			navigator.clipboard.writeText(raw)
			update(null)
		}
	}

	const handleWrapperPaste = (e: React.ClipboardEvent) => {
		if (e.target === e.currentTarget) {
			e.preventDefault()
			const text = e.clipboardData.getData('text/plain')
			if (text) insertBlock(text.trim())
		}
	}

	return (
		<div
			id={id}
			tabIndex={0}
			onFocus={onFocus}
			onKeyDown={handleWrapperKeyDown}
			onPaste={handleWrapperPaste}
			className='my-xl rounded-md outline-none overflow-hidden border border-border shadow-sm focus-within:ring-1 ring-brand focus-within:border-brand transition-all bg-elevated'
		>
			<div className='bg-secondary px-4 py-2 flex items-center justify-between border-b border-border'>
				<select
					value={LANGUAGES.find((l) => l.value === lang) ? lang : 'text'}
					onChange={(e) => update('```' + e.target.value + '\n' + content + '\n```')}
					className='text-sm bg-elevated text-main border border-border rounded-sm px-2 py-1 outline-none focus:border-main min-w-35 shadow-sm cursor-pointer'
				>
					{LANGUAGES.map((l) => (
						<option key={l.value} value={l.value}>
							{l.label}
						</option>
					))}
				</select>

				<button
					onClick={() => update(null)}
					className='p-1 text-subtle hover:text-error transition-colors'
					title='Delete Code Block'
				>
					<Trash2 size={16} />
				</button>
			</div>
			<textarea
				ref={textareaRef}
				value={content}
				onChange={(e) => update('```' + (lang || 'text') + '\n' + e.target.value + '\n```')}
				className='w-full bg-transparent text-main p-4 font-mono text-sm outline-none resize-none block leading-relaxed'
				spellCheck={false}
			/>
		</div>
	)
}
